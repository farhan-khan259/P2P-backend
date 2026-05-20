const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        memberId: user.memberId,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        dateOfBirth: user.dateOfBirth,
        aadharNo: user.aadharNo,
        address: user.address,
        country: user.country,
        state: user.state,
        district: user.district,
        city: user.city,
        pincode: user.pincode,
        sponsorId: user.sponsorId,
        sponsorName: user.sponsorName,
        joiningPackage: user.joiningPackage,
        epin: user.epin,
        createdAt: user.createdAt,
        bankDetails: user.bankDetails,
        paymentDetails: user.paymentDetails,
        accountStatus: user.accountStatus,
        joiningLevel: user.joiningLevel,
        unlockLevel: user.unlockLevel,
        walletBalance: user.walletBalance,
        kycStatus: user.kycStatus,
        kycDetails: user.kycDetails,
        kycSubmittedAt: user.kycSubmittedAt,
        nomineeDetails: user.nomineeDetails,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile/update
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, contactNo, dateOfBirth, address, city, state, country, pincode, aadharNo } = req.body;

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // ========== STRICT DUPLICATE VALIDATION ==========
    
    // Check if new mobile number already exists for another user
    if (contactNo && contactNo !== currentUser.contactNo) {
      const mobileExists = await User.findOne({ 
        contactNo,
        _id: { $ne: req.user.id } 
      });
      if (mobileExists) {
        return res.status(409).json({
          success: false,
          message: 'Mobile number already registered to another user',
          code: 'MOBILE_DUPLICATE',
        });
      }
    }

    // Check if new Aadhaar number already exists for another user
    if (aadharNo && aadharNo !== currentUser.aadharNo) {
      const aadharExists = await User.findOne({ 
        aadharNo,
        _id: { $ne: req.user.id } 
      });
      if (aadharExists) {
        return res.status(409).json({
          success: false,
          message: 'Aadhaar number already used by another user',
          code: 'AADHAAR_DUPLICATE',
        });
      }
    }

    // ========== VALIDATION PASSED - UPDATE PROFILE ==========

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        contactNo,
        dateOfBirth,
        address,
        city,
        state,
        country,
        pincode,
        aadharNo,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldMessages = {
        contactNo: 'Mobile number already registered to another user',
        aadharNo: 'Aadhaar number already used by another user',
      };
      
      return res.status(409).json({
        success: false,
        message: fieldMessages[field] || `${field} already exists`,
        code: `${field.toUpperCase()}_DUPLICATE`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// @desc    Update bank details
// @route   PUT /api/profile/bank-details
// @access  Private
exports.updateBankDetails = async (req, res) => {
  try {
    const { bankName, holderName, accountNo, ifsc, bankBranch, panNo } = req.body;

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // ========== STRICT DUPLICATE VALIDATION ==========
    
    // Check if new PAN number already exists for another user
    if (panNo && panNo !== currentUser.panNo) {
      const panExists = await User.findOne({ 
        panNo,
        _id: { $ne: req.user.id } 
      });
      if (panExists) {
        return res.status(409).json({
          success: false,
          message: 'PAN card already registered to another user',
          code: 'PAN_DUPLICATE',
        });
      }
    }

    // ========== VALIDATION PASSED - UPDATE BANK DETAILS ==========

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        panNo,
        bankDetails: {
          bankName,
          holderName,
          accountNo,
          ifsc,
          bankBranch,
          panNo,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Bank details updated successfully',
      data: user,
    });
  } catch (error) {
    // Handle unique constraint violations
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldMessages = {
        panNo: 'PAN card already registered to another user',
      };
      
      return res.status(409).json({
        success: false,
        message: fieldMessages[field] || `${field} already exists`,
        code: `${field.toUpperCase()}_DUPLICATE`,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating bank details',
      error: error.message,
    });
  }
};

// @desc    Update payment details (UPI, PayTM, etc.)
// @route   PUT /api/profile/payment-details
// @access  Private
exports.updatePaymentDetails = async (req, res) => {
  try {
    const { googlePay, phonePe, payTm, upiId } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        paymentDetails: {
          googlePay,
          phonePe,
          payTm,
          upiId,
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment details updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment details',
      error: error.message,
    });
  }
};

// @desc    Submit or update user KYC request
// @route   PUT /api/profile/kyc-request
// @access  Private
exports.updateKycRequest = async (req, res) => {
  try {
    const {
      bankName,
      bankBranch,
      accountHolderName,
      bankAccountNumber,
      ifscCode,
      googlePayNumber,
      phonePeNumber,
      paytmNumber,
      upiId,
      aadharCardNumber,
      panNo,
      aadharFrontImage,
      aadharBackImage,
    } = req.body;

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        panNo: panNo || currentUser.panNo,
        aadharNo: aadharCardNumber || currentUser.aadharNo,
        bankDetails: {
          bankName,
          bankBranch,
          holderName: accountHolderName,
          accountNo: bankAccountNumber,
          ifsc: ifscCode,
          panNo: panNo || currentUser.panNo,
        },
        paymentDetails: {
          googlePay: googlePayNumber,
          phonePe: phonePeNumber,
          payTm: paytmNumber,
          upiId,
        },
        kycStatus: 'PENDING',
        kycSubmittedAt: new Date(),
        kycDetails: {
          bankName,
          bankBranch,
          accountHolderName,
          bankAccountNumber,
          ifscCode,
          googlePayNumber,
          phonePeNumber,
          paytmNumber,
          upiId,
          aadharCardNumber,
          panNo: panNo || currentUser.panNo,
          aadharFrontImage,
          aadharBackImage,
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'KYC request submitted successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting KYC request',
      error: error.message,
    });
  }
};

// @desc    Update transaction password
// @route   PUT /api/profile/transaction-password
// @access  Private
exports.updateTransactionPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match',
      });
    }

    const user = await User.findById(req.user.id).select('+password +transactionPassword');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const hasTransactionPassword = Boolean(user.transactionPassword);
    const isCurrentPasswordValid = hasTransactionPassword
      ? await user.matchTransactionPassword(currentPassword)
      : await user.matchPassword(currentPassword);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: hasTransactionPassword
          ? 'Current transaction password is incorrect'
          : 'Current password is incorrect',
      });
    }

    user.transactionPassword = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Transaction password updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating transaction password',
      error: error.message,
    });
  }
};

// @desc    Update nominee details
// @route   PUT /api/profile/nominee-details
// @access  Private
exports.updateNomineeDetails = async (req, res) => {
  try {
    const { nomineeName, nomineeRelation, nomineeAge, nomineeMobile } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        nomineeDetails: {
          nomineeName,
          nomineeRelation,
          nomineeAge,
          nomineeMobile,
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Nominee details updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating nominee details',
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/profile/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match',
      });
    }

    // Get user with password field
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if current password matches
    const isPasswordMatch = await user.matchPassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message,
    });
  }
};
