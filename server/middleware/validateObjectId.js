import mongoose from 'mongoose';

/**
 * Middleware to validate MongoDB ObjectId in route parameters
 * @param {...string} paramNames - Names of parameters to validate (default: 'id')
 */
export const validateObjectId = (...paramNames) => {
  return (req, res, next) => {
    // Default to 'id' if no parameter names provided
    const paramsToValidate = paramNames.length > 0 ? paramNames : ['id'];
    
    for (const paramName of paramsToValidate) {
      const paramValue = req.params[paramName];
      
      if (paramValue && !mongoose.Types.ObjectId.isValid(paramValue)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${paramName} format`
        });
      }
    }
    
    next();
  };
};

/**
 * Middleware to validate a single ObjectId parameter (convenience function)
 * @param {string} paramName - Name of the parameter to validate
 */
export const validateObjectIdParam = (paramName = 'id') => {
  return validateObjectId(paramName);
};
