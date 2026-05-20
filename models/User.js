// p2pbackend/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema for MLM P2P System
 * Stores user information, authentication details, and role
 */
const userSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    sponsorId: {
      type: String,
      trim: true,
    },
    sponsorName: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    contactNo: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    dateOfBirth: {
      type: Date,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    transactionPassword: {
      type: String,
      minlength: 6,
      select: false,
    },
    aadharNo: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    address: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    joiningPackage: {
      type: String,
      trim: true,
    },
    epin: {
      type: String,
      trim: true,
    },
    joiningLevel: {
      type: Number,
      default: 1,
    },
    unlockLevel: {
      type: Number,
      default: 1,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    accountStatus: {
      type: String,
      enum: ['ACTIVE', 'IN-ACTIVE'],
      default: 'ACTIVE',
    },
    acceptedTerms: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    panNo: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    bankDetails: {
      bankName: {
        type: String,
        trim: true,
      },
      holderName: {
        type: String,
        trim: true,
      },
      accountNo: {
        type: String,
        trim: true,
      },
      ifsc: {
        type: String,
        trim: true,
      },
      bankBranch: {
        type: String,
        trim: true,
      },
      panNo: {
        type: String,
        trim: true,
      },
    },
    paymentDetails: {
      googlePay: {
        type: String,
        trim: true,
      },
      phonePe: {
        type: String,
        trim: true,
      },
      payTm: {
        type: String,
        trim: true,
      },
      upiId: {
        type: String,
        trim: true,
      },
    },
    kycStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    kycDetails: {
      bankName: {
        type: String,
        trim: true,
      },
      bankBranch: {
        type: String,
        trim: true,
      },
      accountHolderName: {
        type: String,
        trim: true,
      },
      bankAccountNumber: {
        type: String,
        trim: true,
      },
      ifscCode: {
        type: String,
        trim: true,
      },
      googlePayNumber: {
        type: String,
        trim: true,
      },
      phonePeNumber: {
        type: String,
        trim: true,
      },
      paytmNumber: {
        type: String,
        trim: true,
      },
      upiId: {
        type: String,
        trim: true,
      },
      aadharCardNumber: {
        type: String,
        trim: true,
      },
      panNo: {
        type: String,
        trim: true,
      },
      aadharFrontImage: {
        type: String,
      },
      aadharBackImage: {
        type: String,
      },
    },
    kycSubmittedAt: {
      type: Date,
    },
    kycReviewedAt: {
      type: Date,
    },
    kycReviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    kycRemarks: {
      type: String,
      trim: true,
    },
    nomineeDetails: {
      nomineeName: {
        type: String,
        trim: true,
      },
      nomineeRelation: {
        type: String,
        trim: true,
      },
      nomineeAge: {
        type: String,
        trim: true,
      },
      nomineeMobile: {
        type: String,
        trim: true,
      },
    },
    rank: {
      type: String,
      trim: true,
      default: '---',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware to generate member ID and hash password
 * Generates unique member ID with format: EL + 8 random digits
 */
userSchema.pre('save', async function (next) {
  // Generate member ID if not present
  if (!this.memberId) {
    let memberId;
    let isUnique = false;
    
    while (!isUnique) {
      // Generate random 8-digit number
      const randomNum = Math.floor(10000000 + Math.random() * 90000000);
      memberId = `EL${randomNum}`;
      
      // Check if member ID is unique
      const existing = await mongoose.model('User').findOne({ memberId });
      if (!existing) {
        isUnique = true;
        this.memberId = memberId;
      }
    }
  }

  if (!this.isModified('password')) {
    if (!this.isModified('transactionPassword')) {
      return next();
    }
  }

  try {
    if (this.isModified('password') && this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified('transactionPassword') && this.transactionPassword) {
      const salt = await bcrypt.genSalt(10);
      this.transactionPassword = await bcrypt.hash(this.transactionPassword, salt);
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance method to compare entered password with stored hashed password
 * @param {string} enteredPassword - Password entered by user
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.matchTransactionPassword = async function (enteredPassword) {
  if (!this.transactionPassword) {
    return false;
  }

  return await bcrypt.compare(enteredPassword, this.transactionPassword);
};

module.exports = mongoose.model('User', userSchema);
