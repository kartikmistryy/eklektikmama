import mongoose from "mongoose";

const VerificationTokenSchema = new mongoose.Schema({
  token: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  membershipId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Membership',
    required: true 
  },
  type: { 
    type: String, 
    enum: ['cancellation', 'reactivation', 'other'],
    default: 'cancellation' 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  },
  used: { 
    type: Boolean, 
    default: false 
  },
  usedAt: Date,
  metadata: {
    membershipType: String,
    currentPeriodEnd: Date
  }
}, { 
  timestamps: true 
});

// Index for efficient queries
VerificationTokenSchema.index({ email: 1, type: 1 });
VerificationTokenSchema.index({ token: 1, used: 1 });

// Method to check if token is valid
VerificationTokenSchema.methods.isValid = function() {
  return !this.used && this.expiresAt > new Date();
};

// Method to mark token as used
VerificationTokenSchema.methods.markAsUsed = function() {
  this.used = true;
  this.usedAt = new Date();
  return this.save();
};

// Static method to create a new verification token
VerificationTokenSchema.statics.createToken = async function(email, membershipId, type = 'cancellation', metadata = {}) {
  const crypto = await import('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Remove any existing tokens for this email and type
  await this.deleteMany({ email, type, used: false });

  const verificationToken = new this({
    token,
    email,
    membershipId,
    type,
    expiresAt,
    metadata
  });

  await verificationToken.save();
  return verificationToken;
};

// Static method to find and validate a token
VerificationTokenSchema.statics.findAndValidate = async function(token) {
  const verificationToken = await this.findOne({ 
    token, 
    used: false,
    expiresAt: { $gt: new Date() }
  }).populate('membershipId');

  if (!verificationToken) {
    return null;
  }

  return verificationToken;
};

export default mongoose.models.VerificationToken || mongoose.model("VerificationToken", VerificationTokenSchema);
