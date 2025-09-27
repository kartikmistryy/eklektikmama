import mongoose from "mongoose";

const MembershipSchema = new mongoose.Schema({
  // User Information
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  
  // Membership Details
  membershipType: { 
    type: String, 
    enum: ["monthly", "annual"], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "active", "cancelled", "expired", "past_due"], 
    default: "pending" 
  },
  
  // Stripe Information
  stripeCustomerId: { type: String, required: true },
  stripeSubscriptionId: { type: String },
  stripePriceId: { type: String, required: true },
  
  // Payment Information
  currentPeriodStart: { type: Date },
  currentPeriodEnd: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  cancelledAt: Date,
  
  // Google Sheets Integration
  googleSheetsRowId: Number, // Row number in Google Sheets
  
  // Membership Benefits
  discountPercentage: { type: Number, default: 10 },
  totalSavings: { type: Number, default: 0 }, // Track total savings from discounts
  
  // Metadata
  signupDate: { type: Date, default: Date.now },
  lastPaymentDate: Date,
  nextPaymentDate: Date,
  
  // Additional Information
  notes: String,
  source: { type: String, default: "website" }, // How they signed up
  
  // Email Notifications
  lastReminderSent: Date, // Track when last renewal reminder was sent
  
  // Cancellation Code (for 6-digit verification)
  cancellationCode: String,
  cancellationCodeExpires: Date,
  
}, { timestamps: true });

// Indexes for efficient queries
MembershipSchema.index({ email: 1 });
MembershipSchema.index({ stripeCustomerId: 1 });
MembershipSchema.index({ stripeSubscriptionId: 1 });
MembershipSchema.index({ status: 1 });
MembershipSchema.index({ currentPeriodEnd: 1 });

// Composite unique index to ensure only one active membership per email
MembershipSchema.index(
  { email: 1, status: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { 
      status: { $in: ['active', 'past_due'] } 
    } 
  }
);

// Virtual for full name
MembershipSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for membership duration
MembershipSchema.virtual('membershipDuration').get(function() {
  const now = new Date();
  const start = this.signupDate;
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to check if membership is active
MembershipSchema.methods.isActive = function() {
  return this.status === 'active' && this.currentPeriodEnd > new Date();
};

// Method to check if membership has expired
MembershipSchema.methods.hasExpired = function() {
  return this.status === 'active' && this.currentPeriodEnd <= new Date();
};

// Method to automatically expire membership if needed
MembershipSchema.methods.checkAndExpire = async function() {
  if (this.hasExpired() && this.status === 'active') {
    this.status = 'expired';
    await this.save();
    console.log(`Membership expired for ${this.email}`);
    return true; // Membership was expired
  }
  return false; // Membership was not expired
};

// Method to check if membership expires soon (within 7 days)
MembershipSchema.methods.expiresSoon = function() {
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  return this.currentPeriodEnd <= sevenDaysFromNow && this.isActive();
};

export default mongoose.models.Membership || mongoose.model("Membership", MembershipSchema);
