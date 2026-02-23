/**
 * Eligibility Engine - Core Brain of the Application 🧠
 * 
 * This service evaluates user profiles against scheme rules
 * and returns a scored match percentage for each scheme.
 * 
 * Handles schema mismatches:
 * - Rule field names (snake_case) vs User model (camelCase): marital_status → maritalStatus
 * - disability: User has enum ['None','Physical',...], rules use boolean
 * - education: "PhD" aliases to "Doctorate"
 * - in/not in: type coercion for number/string mismatches from AI
 */

// Rule field → User model field mapping (snake_case rules use camelCase in User)
const RULE_TO_USER_FIELD = {
  marital_status: 'maritalStatus',
  age: 'age',
  income: 'income',
  category: 'category',
  education: 'education',
  state: 'state',
  gender: 'gender',
  disability: 'disability',
  occupation: 'occupation',
};

// Education aliases (AI may output "PhD", User has "Doctorate")
const EDUCATION_ALIASES = { PhD: 'Doctorate', Doctorate: 'Doctorate' };

class EligibilityEngine {
  /**
   * Get user value for a rule field (handles field name mapping)
   */
  getUserValue(userProfile, ruleField) {
    const userField = RULE_TO_USER_FIELD[ruleField] || ruleField;
    return userProfile[userField];
  }

  /**
   * Normalize value for comparison (handles disability boolean vs enum, education aliases)
   */
  normalizeForComparison(userValue, ruleField, ruleValue) {
    // disability: User has enum ['None','Physical',...], rules often use boolean
    if (ruleField === 'disability' && typeof ruleValue === 'boolean') {
      const isPwD = userValue && String(userValue).toLowerCase() !== 'none' && userValue !== '';
      return isPwD;
    }
    // education: "PhD" → "Doctorate"
    if (ruleField === 'education' && typeof userValue === 'string') {
      return EDUCATION_ALIASES[userValue] || userValue;
    }
    return userValue;
  }

  /**
   * Normalize rule value for comparison (education aliases)
   */
  normalizeRuleValue(ruleValue, ruleField) {
    if (ruleField === 'education') {
      if (typeof ruleValue === 'string') {
        return EDUCATION_ALIASES[ruleValue] || ruleValue;
      }
      if (Array.isArray(ruleValue)) {
        return ruleValue.map((v) => (typeof v === 'string' ? EDUCATION_ALIASES[v] || v : v));
      }
    }
    return ruleValue;
  }

  /**
   * Loose equality for in/not in (handles number vs string from AI)
   */
  valueInArray(userValue, arr, ruleField) {
    if (!Array.isArray(arr)) return false;
    const normUser = ruleField === 'education' && typeof userValue === 'string'
      ? (EDUCATION_ALIASES[userValue] || userValue)
      : userValue;
    return arr.some((rv) => {
      const normRv = ruleField === 'education' && typeof rv === 'string'
        ? (EDUCATION_ALIASES[rv] || rv)
        : rv;
      return normUser == normRv;
    });
  }

  /**
   * Evaluate a single rule against user data
   * @param {Object} userProfile - Full user profile (for field mapping)
   * @param {Object} rule - Rule with field, operator, value
   * @returns {Boolean} - Whether the rule matches
   */
  evaluateRule(userProfile, rule) {
    const { field, operator, value: ruleValue } = rule;
    let userValue = this.getUserValue(userProfile, field);

    // Handle undefined or null user values
    if (userValue === undefined || userValue === null) {
      return false;
    }

    // Normalize for comparison
    userValue = this.normalizeForComparison(userValue, field, ruleValue);
    const normalizedRuleValue = this.normalizeRuleValue(ruleValue, field);

    switch (operator) {
      case '==':
        return userValue == normalizedRuleValue;

      case '!=':
        return userValue != normalizedRuleValue;

      case '<':
        return Number(userValue) < Number(normalizedRuleValue);

      case '<=':
        return Number(userValue) <= Number(normalizedRuleValue);

      case '>':
        return Number(userValue) > Number(normalizedRuleValue);

      case '>=':
        return Number(userValue) >= Number(normalizedRuleValue);

      case 'in':
        if (!Array.isArray(normalizedRuleValue)) {
          console.warn(`Rule operator 'in' requires an array value, but got ${typeof ruleValue}. Rule will not match.`);
          return false;
        }
        return this.valueInArray(userValue, normalizedRuleValue, field);

      case 'not in':
        if (!Array.isArray(normalizedRuleValue)) {
          console.warn(`Rule operator 'not in' requires an array value, but got ${typeof ruleValue}. Rule will not match.`);
          return false;
        }
        return !this.valueInArray(userValue, normalizedRuleValue, field);

      default:
        return false;
    }
  }

  /**
   * Calculate match percentage for a single scheme
   * @param {Object} userProfile - User's profile data
   * @param {Object} scheme - Scheme with rules
   * @returns {Number} - Match percentage (0-100)
   */
  calculateMatch(userProfile, scheme) {
    if (!scheme.rules || scheme.rules.length === 0) {
      return 0;
    }

    let totalWeight = 0;
    let matchedWeight = 0;

    scheme.rules.forEach(rule => {
      totalWeight += rule.weight;

      const isMatch = this.evaluateRule(userProfile, rule);

      if (isMatch) {
        matchedWeight += rule.weight;
      }
    });

    // Calculate percentage
    const matchPercentage = totalWeight > 0 
      ? Math.round((matchedWeight / totalWeight) * 100) 
      : 0;

    return matchPercentage;
  }

  /**
   * Find all eligible schemes for a user
   * @param {Object} userProfile - User's profile data
   * @param {Array} schemes - Array of approved and active schemes
   * @returns {Array} - Sorted array of schemes with match percentages
   */
  findEligibleSchemes(userProfile, schemes) {
    const results = schemes.map(scheme => {
      const matchPercentage = this.calculateMatch(userProfile, scheme);
      
      return {
        scheme: {
          _id: scheme._id,
          name: scheme.name,
          description: scheme.description,
          benefits: scheme.benefits,
          ministry: scheme.ministry
        },
        matchPercentage,
        matchedRules: this.getMatchedRules(userProfile, scheme)
      };
    });

    // Sort by match percentage (highest first)
    return results.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  /**
   * Get details of which rules matched
   * @param {Object} userProfile - User's profile data
   * @param {Object} scheme - Scheme with rules
   * @returns {Array} - Array of matched rule details
   */
  getMatchedRules(userProfile, scheme) {
    if (!scheme.rules) return [];

    return scheme.rules
      .filter(rule => this.evaluateRule(userProfile, rule))
      .map(rule => ({
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        weight: rule.weight
      }));
  }
}

export default new EligibilityEngine();
