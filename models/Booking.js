import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  guardianName: String,
  childName: String,
  userEmail: String,
  phone: String,
  numberOfTickets: { type: Number, default: 1 },
  transactionId: String,
  ticketNumber: { type: Number, default: null }, // Ticket number based on Google Sheets row position
  ticketNumbers: [{ type: Number }], // Array of ticket numbers for multiple tickets
  paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
  photographyConsent: { type: String, enum: ["Yes", "No"], default: "No" },
  
  // Additional form data fields
  additionalData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Common additional fields
  emergencyName: String,
  emergencyPhone: String,
  childAge: String,
  childGender: String,
  childDob: String,
  dietaryRequirements: String,
  foodAllergies: String,
  allergies: String,
  medicalConditions: String,
  conditionDetails: String,
  medicalInfo: String,
  specialRequests: String,
  tablePreferences: String,
  additionalNotes: String,
  notes: String,
  
  // Family Day specific fields
  parent1Name: String,
  parent2Name: String,
  parent1Phone: String,
  parent2Phone: String,
  child1Name: String,
  child1Age: String,
  child2Name: String,
  child2Age: String,
  child3Name: String,
  child3Age: String,
  child4Name: String,
  child4Age: String,
  numberOfChildren: String,
  medicalInfo: String,
  howDidYouHear: String,
  waiverConsent: String,
  
  // MamaFit specific fields
  fitnessLevel: String,
  medicalClearance: String,
  
  // Hello Chef specific fields
  cookingExperience: String,
  favoriteFoods: String,
  
  // Event segment for reference
  eventSegment: String,
  
  // Member information
  isMember: { type: Boolean, default: false },
  memberSavings: { type: Number, default: 0 },
  
  // Friends & Family Discount fields
  applyFriendsFamilyDiscount: { type: Boolean, default: false },
  familyMemberNames: String, // Newline-separated list of family member names
  familyMemberContacts: String, // Newline-separated list of family member contacts
  familyDiscountTerms: { type: Boolean, default: false },
  totalTickets: { type: Number, default: 1 }, // Total tickets including family members
  
  // Choice fields for dropdowns
  choiceI: String,
  choiceII: String,
  choiceIII: String,
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
