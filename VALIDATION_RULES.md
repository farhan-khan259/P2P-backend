/**
 * User Registration & Profile Validation Rules
 * "ONE PERSON, ONE ID POLICY"
 * 
 * This file documents the strict validation rules implemented
 * to prevent duplicate registrations and enforce identity uniqueness
 */

// ============================================================================
// REGISTRATION VALIDATION - Before User Creation
// ============================================================================

// 1. EMAIL VALIDATION
//    - Must be unique across all users
//    - Error: "Email already registered"
//    - HTTP Status: 409 Conflict
//    - Code: EMAIL_DUPLICATE

// 2. MOBILE NUMBER VALIDATION
//    - Must be unique across all users
//    - Error: "Mobile number already registered"
//    - HTTP Status: 409 Conflict
//    - Code: MOBILE_DUPLICATE

// 3. AADHAAR NUMBER VALIDATION
//    - Must be unique across all users
//    - Error: "Aadhaar number already used"
//    - HTTP Status: 409 Conflict
//    - Code: AADHAAR_DUPLICATE

// 4. PAN CARD VALIDATION
//    - Must be unique across all users
//    - Error: "PAN card already exists"
//    - HTTP Status: 409 Conflict
//    - Code: PAN_DUPLICATE

// ============================================================================
// PROFILE UPDATE VALIDATION - When User Updates Profile
// ============================================================================

// 1. MOBILE NUMBER UPDATE
//    - Cannot be changed to a number already used by another user
//    - Error: "Mobile number already registered to another user"
//    - HTTP Status: 409 Conflict
//    - Code: MOBILE_DUPLICATE

// 2. AADHAAR NUMBER UPDATE
//    - Cannot be changed to a number already used by another user
//    - Error: "Aadhaar number already used by another user"
//    - HTTP Status: 409 Conflict
//    - Code: AADHAAR_DUPLICATE

// 3. PAN CARD UPDATE
//    - Cannot be changed to a PAN already used by another user
//    - Error: "PAN card already registered to another user"
//    - HTTP Status: 409 Conflict
//    - Code: PAN_DUPLICATE

// ============================================================================
// IMPLEMENTATION DETAILS
// ============================================================================

/**
 * VALIDATION FLOW:
 * 
 * REGISTRATION:
 * 1. Receive registration data
 * 2. Check email uniqueness
 * 3. Check mobile uniqueness
 * 4. Check Aadhaar uniqueness
 * 5. Check PAN uniqueness
 * 6. If all pass → Create user
 * 7. If any fails → Return 409 error with specific message
 * 
 * PROFILE UPDATE:
 * 1. Receive update data
 * 2. Get current user from database
 * 3. For each field being updated:
 *    - If new value == current value → Skip validation (no change)
 *    - If new value != current value → Check for duplicates in other users
 * 4. If all pass → Update user
 * 5. If any fails → Return 409 error with specific message
 */

// ============================================================================
// DATABASE SCHEMA CONSTRAINTS
// ============================================================================

/**
 * User Schema Fields with Unique Constraints:
 * 
 * {
 *   memberId: { unique: true, sparse: true },      // Generated on creation
 *   email: { unique: true },                         // Email address
 *   contactNo: { unique: true, sparse: true },      // Mobile number
 *   aadharNo: { unique: true, sparse: true },       // Aadhaar number
 *   panNo: { unique: true, sparse: true },          // PAN card number
 * }
 * 
 * Note: sparse: true allows null values but enforces uniqueness on non-null values
 */

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * MongoDB Duplicate Key Error Handler:
 * 
 * If a unique constraint is violated, MongoDB returns error code 11000
 * The controller catches this and maps it to the correct field message
 * 
 * Example:
 * {
 *   code: 11000,
 *   keyPattern: { email: 1 },
 *   message: "duplicate key error"
 * }
 * 
 * Is caught and converted to:
 * {
 *   success: false,
 *   message: "Email already registered",
 *   code: "EMAIL_DUPLICATE"
 * }
 */

// ============================================================================
// VALIDATION ENDPOINTS
// ============================================================================

/**
 * POST /api/auth/register
 * Validates: email, contactNo, aadharNo, panNo
 * Returns: 409 if any duplicate found
 * 
 * PUT /api/profile/update
 * Validates: contactNo, aadharNo
 * Returns: 409 if any duplicate found in other users
 * 
 * PUT /api/profile/bank-details
 * Validates: panNo
 * Returns: 409 if PAN already registered to another user
 */

module.exports = {
  validationRules: {
    EMAIL: 'Must be unique across all users',
    MOBILE: 'Must be unique across all users',
    AADHAAR: 'Must be unique across all users',
    PAN: 'Must be unique across all users',
    MEMBER_ID: 'Auto-generated, unique per user',
  },
  
  errorCodes: {
    EMAIL_DUPLICATE: 'Email already registered',
    MOBILE_DUPLICATE: 'Mobile number already registered',
    AADHAAR_DUPLICATE: 'Aadhaar number already used',
    PAN_DUPLICATE: 'PAN card already exists',
  },
  
  httpStatus: {
    CONFLICT: 409, // Used for all duplicate errors
  }
};
