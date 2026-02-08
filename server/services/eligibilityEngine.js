/**
 * Eligibility Engine - Core Brain of the Application 🧠
 * 
 * This service evaluates user profiles against scheme rules
 * and returns a scored match percentage for each scheme.
 */

class EligibilityEngine {
  /**
   * Evaluate a single rule against user data
   * @param {*} userValue - The value from user profile
   * @param {String} operator - Comparison operator
   * @param {*} ruleValue - The value to compare against
   * @returns {Boolean} - Whether the rule matches
   */
  evaluateRule(userValue, operator, ruleValue) {
    // Handle undefined or null user values
    if (userValue === undefined || userValue === null) {
      return false;
    }

    switch (operator) {
      case '==':
        return userValue == ruleValue;
      
      case '!=':
        return userValue != ruleValue;
      
      case '<':
        return Number(userValue) < Number(ruleValue);
      
      case '<=':
        return Number(userValue) <= Number(ruleValue);
      
      case '>':
        return Number(userValue) > Number(ruleValue);
      
      case '>=':
        return Number(userValue) >= Number(ruleValue);
      
      case 'in':
        // ruleValue should be an array
        return Array.isArray(ruleValue) && ruleValue.includes(userValue);
      
      case 'not in':
        // ruleValue should be an array
        return Array.isArray(ruleValue) && !ruleValue.includes(userValue);
      
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
      
      const userValue = userProfile[rule.field];
      const isMatch = this.evaluateRule(userValue, rule.operator, rule.value);
      
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
      .filter(rule => {
        const userValue = userProfile[rule.field];
        return this.evaluateRule(userValue, rule.operator, rule.value);
      })
      .map(rule => ({
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        weight: rule.weight
      }));
  }
}

export default new EligibilityEngine();
