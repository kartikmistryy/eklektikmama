import mongoose from "mongoose";

const DiscountCodeSchema = new mongoose.Schema({
  // Discount code details
  code: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  
  // Member information
  memberId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Membership', 
    required: true 
  },
  memberEmail: { 
    type: String, 
    required: true 
  },
  
  // Discount details
  discountPercentage: { 
    type: Number, 
    default: 10 
  },
  
  // Security and validation
  isUsed: { 
    type: Boolean, 
    default: false 
  },
  usedAt: Date,
  usedBy: String, // IP address or session ID
  
  // Expiration
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  
  // Creation tracking
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // Security
  ipAddress: String,
  userAgent: String,
  
}, { timestamps: true });

// Index for efficient queries
DiscountCodeSchema.index({ code: 1, isUsed: 1 });
DiscountCodeSchema.index({ memberId: 1, isUsed: 1 });
DiscountCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if code is valid
DiscountCodeSchema.methods.isValid = function() {
  return !this.isUsed && this.expiresAt > new Date();
};

// Method to mark as used
DiscountCodeSchema.methods.markAsUsed = function(usedBy, ipAddress) {
  this.isUsed = true;
  this.usedAt = new Date();
  this.usedBy = usedBy;
  this.ipAddress = ipAddress;
  return this.save();
};

// Static method to create a new discount code
DiscountCodeSchema.statics.createForMember = async function(memberId, memberEmail, options = {}) {
  // Generate a secure random code
  const crypto = require('crypto');
  const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
  const code = `MEMBER${randomBytes}`;
  
  // Set expiration (default 1 hour)
  const expiresAt = new Date(Date.now() + (options.expiresIn || 60 * 60 * 1000));
  
  const discountCode = new this({
    code,
    memberId,
    memberEmail,
    discountPercentage: options.discountPercentage || 10,
    expiresAt,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent
  });
  
  return await discountCode.save();
};

// Static method to validate a discount code
DiscountCodeSchema.statics.validateCode = async function(code, memberEmail) {
  const discountCode = await this.findOne({
    code,
    memberEmail: memberEmail.toLowerCase().trim(),
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).populate('memberId');
  
  if (!discountCode) {
    return { valid: false, message: 'Invalid or expired discount code' };
  }
  
  // Check if the associated membership is still active
  const membership = discountCode.memberId;
  if (!membership || membership.status !== 'active') {
    return { valid: false, message: 'Membership is not active' };
  }
  
  return { 
    valid: true, 
    discountCode, 
    discountPercentage: discountCode.discountPercentage 
  };
};

export default mongoose.models.DiscountCode || mongoose.model("DiscountCode", DiscountCodeSchema);

