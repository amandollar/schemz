/**
 * Check if user profile has enough data for scheme matching
 * @param {Object} user - User object from context
 * @returns {boolean} - True if profile has sufficient data
 */
export const isProfileComplete = (user) => {
  if (!user || !user.name) return false;

  // Key fields that are important for scheme matching
  const keyFields = ['age', 'income', 'category', 'gender', 'state', 'education', 'maritalStatus'];
  
  // Count how many key fields are filled
  const filledFields = keyFields.filter(field => {
    const value = user[field];
    // Check for valid values (not undefined, null, or empty string)
    if (value === undefined || value === null || value === '') {
      return false;
    }
    // For numbers, 0 is a valid value
    if (typeof value === 'number') {
      return true;
    }
    // For strings, check if not empty
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return true;
  });
  
  // Profile is considered complete if:
  // 1. At least 2 key demographic fields are filled (very lenient), OR
  // 2. User has filled most fields (4+ out of 7 key fields)
  // This ensures users who fill out their profile see it as complete
  const hasMinimumFields = filledFields.length >= 2;
  const hasMostFields = filledFields.length >= 4;
  
  return hasMinimumFields || hasMostFields;
};

/**
 * Get profile completion percentage
 * @param {Object} user - User object from context
 * @returns {number} - Percentage of profile completion (0-100)
 */
export const getProfileCompletionPercentage = (user) => {
  if (!user) return 0;

  const allFields = [
    'name', 'age', 'income', 'category', 'gender', 'state', 
    'district', 'pinCode', 'education', 'maritalStatus', 
    'religion', 'occupation', 'phone', 'dateOfBirth'
  ];

  const filledFields = allFields.filter(field => {
    const value = user[field];
    return value !== undefined && value !== null && value !== '';
  });

  return Math.round((filledFields.length / allFields.length) * 100);
};

/**
 * Get list of missing required fields for profile completion
 * @param {Object} user - User object from context
 * @returns {Array<string>} - Array of field names that are missing
 */
export const getMissingFields = (user) => {
  if (!user) return [];

  const keyFields = ['age', 'income', 'category', 'gender', 'state', 'education'];
  const missingFields = keyFields.filter(field => {
    const value = user[field];
    return value === undefined || value === null || value === '';
  });

  return missingFields;
};
