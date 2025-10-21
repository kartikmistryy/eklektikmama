export const eventForms = {
  cinemaMorning: {
    title: "Cinema Morning",
    fields: [
      // Mother's Details
      { name: "motherName", label: "Mother's Full Name", type: "text", required: true },
      { name: "motherPhone", label: "Phone Number", type: "tel", required: true },
      { name: "motherEmail", label: "Email Address", type: "email", required: true },
      { name: "emergencyName", label: "Emergency Contact Name", type: "text", required: true },
      { name: "emergencyPhone", label: "Emergency Contact Number", type: "tel", required: true },

      // Child's Details
      { name: "childName", label: "Child's Full Name", type: "text", required: true },
      { name: "childDob", label: "Child's Date of Birth", type: "date", required: true },
      { name: "childAge", label: "Child's Age", type: "number" },

      // Allergies
      {
        name: "allergies",
        label: "Medical & Allergy Information",
        type: "checkboxGroup",
        options: [
          "Peanuts",
          "Tree nuts",
          "Dairy",
          "Eggs",
          "Gluten / Wheat",
          "Soy",
          "Fish",
          "Shellfish",
          "Sesame",
          "Other",
        ],
      },
      { name: "notes", label: "Additional Notes", type: "textarea" },

      // Friends & Family Discount Section
      {
        name: "applyFriendsFamilyDiscount",
        label: "Apply Friends & Family Discount",
        type: "checkbox",
        text: "Get 10% off when you bring family members! Each ticket you purchase will include 1 family member (e.g., 2 tickets = 2 family members). You pay for both your ticket + family member ticket, then get 10% discount on the total."
      },
      {
        name: "familyMemberNames",
        label: "Family Member Names",
        type: "dynamicInputs",
        required: false, // Will be made required conditionally
        text: "Enter the names of your family members. Number of inputs will match your number of tickets."
      },
      {
        name: "familyMemberContacts",
        label: "Family Member Contacts (optional)",
        type: "dynamicInputs",
        required: false,
        text: "Enter contact information for your family members (optional but useful for verification)."
      },
      {
        name: "familyDiscountTerms",
        label: "I understand that I will pay for both my ticket and family member tickets, then receive 10% discount on the total amount.",
        type: "checkbox",
        required: false // Will be made required conditionally
      },
    ],
    waiver: `
I, the undersigned parent/guardian, understand that participation in Eklektik Mama events involves certain risks. 
I accept full responsibility for my child's safety and well-being during the event. 
I release and hold harmless Eklektik Mama, its organizers, staff, and partners from any liability for injuries, 
illnesses, or accidents that may occur.

I also confirm that the information provided above is accurate and that I will inform event organizers of 
any changes to my child's health or allergies.
    `,
  },

  mamaBreakfast: {
    title: "Mama Breakfast",
    fields: [
      // Mother's Details
      { name: "motherName", label: "Mother's Full Name", type: "text", required: true },
      { name: "motherPhone", label: "Phone Number", type: "tel", required: true },
      { name: "motherEmail", label: "Email Address", type: "email", required: true },
      { name: "emergencyName", label: "Emergency Contact Name", type: "text", required: true },
      { name: "emergencyPhone", label: "Emergency Contact Number", type: "tel", required: true },

      // Child's Details
      { name: "childName", label: "Child's Full Name", type: "text", required: true },
      { name: "childDob", label: "Child's Date of Birth", type: "date", required: true },
      { name: "childAge", label: "Child's Age", type: "number" },

      // Allergies
      {
        name: "allergies",
        label: "Medical & Allergy Information",
        type: "checkboxGroup",
        options: [
          "Peanuts",
          "Tree nuts",
          "Dairy",
          "Eggs",
          "Gluten / Wheat",
          "Soy",
          "Fish",
          "Shellfish",
          "Sesame",
          "Other",
        ],
      },
      { name: "notes", label: "Additional Notes", type: "textarea" },

      // Breakfast Choices
      {
        name: "choiceI",
        label: "Main Course Selection",
        type: "select",
        options: [
          "Egg & Truffle Toast",
          "Sour Dough Tuna",
          "French Toast with Ice cream",
          "Avocado Croissant",
          "Omlette Turkey Ham and Cheese",
          "Peach and Almond Salad"
        ],
        required: true
      },
      {
        name: "beverageNote",
        label: "Beverages",
        type: "info",
        text: "2 Beverage at your choice"
      },

      // Friends & Family Discount Section
      {
        name: "applyFriendsFamilyDiscount",
        label: "Apply Friends & Family Discount",
        type: "checkbox",
        text: "Get 10% off when you bring family members! Each ticket you purchase will include 1 family member (e.g., 2 tickets = 2 family members). You pay for both your ticket + family member ticket, then get 10% discount on the total."
      },
      {
        name: "familyMemberNames",
        label: "Family Member Names",
        type: "dynamicInputs",
        required: false, // Will be made required conditionally
        text: "Enter the names of your family members. Number of inputs will match your number of tickets."
      },
      {
        name: "familyMemberContacts",
        label: "Family Member Contacts (optional)",
        type: "dynamicInputs",
        required: false,
        text: "Enter contact information for your family members (optional but useful for verification)."
      },
      {
        name: "familyDiscountTerms",
        label: "I understand that I will pay for both my ticket and family member tickets, then receive 10% discount on the total amount.",
        type: "checkbox",
        required: false // Will be made required conditionally
      },
    ],
    waiver: `
I confirm that I am solely responsible for my child/children during the event, even where sitters are present, and release Eklektik Mama from liability for injury, illness, or loss except where caused by gross negligence or wilful misconduct. I also acknowledge that photography/filming may take place and consent to the use of such images in marketing, unless I notify the organisers in advance or on arrival that I do not wish to be included.
    `,
  },

  mamaFit: {
    title: "MamaFit",
    fields: [
      // Mother's Details
      { name: "motherName", label: "Mother's Full Name", type: "text", required: true },
      { name: "motherPhone", label: "Phone Number", type: "tel", required: true },
      { name: "motherEmail", label: "Email Address", type: "email", required: true },
      { name: "emergencyName", label: "Emergency Contact Name", type: "text", required: true },
      { name: "emergencyPhone", label: "Emergency Contact Number", type: "tel", required: true },

      // Child's Details
      { name: "childName", label: "Child's Full Name", type: "text", required: true },
      { name: "childDob", label: "Child's Date of Birth", type: "date", required: true },
      { name: "childAge", label: "Child's Age", type: "number" },

      // Additional Notes
      { name: "notes", label: "Additional Notes", type: "textarea" },

      // Mother's Medical Info
      {
        name: "medicalClearance",
        label: "Are you currently cleared to exercise postpartum by a medical professional?",
        type: "radio",
        options: ["Yes", "No"],
      },
      {
        name: "medicalConditions",
        label: "Do you have any existing medical conditions?",
        type: "radio",
        options: ["Yes", "No"],
      },
      { name: "conditionDetails", label: "If yes, please specify", type: "textarea" },

      // Friends & Family Discount Section
      {
        name: "applyFriendsFamilyDiscount",
        label: "Apply Friends & Family Discount",
        type: "checkbox",
        text: "Get 10% off when you bring family members! Each ticket you purchase will include 1 family member (e.g., 2 tickets = 2 family members). You pay for both your ticket + family member ticket, then get 10% discount on the total."
      },
      {
        name: "familyMemberNames",
        label: "Family Member Names",
        type: "dynamicInputs",
        required: false, // Will be made required conditionally
        text: "Enter the names of your family members. Number of inputs will match your number of tickets."
      },
      {
        name: "familyMemberContacts",
        label: "Family Member Contacts (optional)",
        type: "dynamicInputs",
        required: false,
        text: "Enter contact information for your family members (optional but useful for verification)."
      },
      {
        name: "familyDiscountTerms",
        label: "I understand that I will pay for both my ticket and family member tickets, then receive 10% discount on the total amount.",
        type: "checkbox",
        required: false // Will be made required conditionally
      },
    ],
    waiver: `
Important: If you are less than 6 months postpartum, please ensure your doctor has confirmed that you are safe to begin exercising again.


General Waiver:
I, the undersigned parent/guardian, understand that participation in Eklektik Mama events involves certain risks. 
I accept full responsibility for my child's safety and well-being during the event. 
I release and hold harmless Eklektik Mama, its organizers, staff, and partners from any liability for injuries, 
illnesses, or accidents that may occur.

MamaFit Waiver:
I acknowledge that participating in MamaFit sessions involves physical activity which may carry risks, including injury or complications. 
I affirm that I am voluntarily participating and take full responsibility for my health and safety. 
I understand that if I am postpartum, it is my responsibility to provide accurate medical information and, if required, a doctor's clearance before attending. 
I release and discharge Eklektik Mama, its instructors, and event partners from any claims, liabilities, or demands that may arise in connection with my participation.
    `,
  },

  eklektikEdit: {
    title: "Eklektik Edit",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "contact", label: "Contact Number", type: "tel", required: true },

      // Friends & Family Discount Section
      {
        name: "applyFriendsFamilyDiscount",
        label: "Apply Friends & Family Discount",
        type: "checkbox",
        text: "Get 10% off when you bring family members! Each ticket you purchase will include 1 family member (e.g., 2 tickets = 2 family members). You pay for both your ticket + family member ticket, then get 10% discount on the total."
      },
      {
        name: "familyMemberNames",
        label: "Family Member Names",
        type: "dynamicInputs",
        required: false, // Will be made required conditionally
        text: "Enter the names of your family members. Number of inputs will match your number of tickets."
      },
      {
        name: "familyMemberContacts",
        label: "Family Member Contacts (optional)",
        type: "dynamicInputs",
        required: false,
        text: "Enter contact information for your family members (optional but useful for verification)."
      },
      {
        name: "familyDiscountTerms",
        label: "I understand that I will pay for both my ticket and family member tickets, then receive 10% discount on the total amount.",
        type: "checkbox",
        required: false // Will be made required conditionally
      },
    ],
    waiver: `
I agree that my contact details may be used for Eklektik Edit communications.
    `,
  },

  helloChef: {
    title: "Hello Chef",
    fields: [
      // Mother's Details
      { name: "motherName", label: "Mother's Full Name", type: "text", required: true },
      { name: "motherPhone", label: "Phone Number", type: "tel", required: true },
      { name: "motherEmail", label: "Email Address", type: "email", required: true },
      { name: "emergencyName", label: "Emergency Contact Name", type: "text", required: true },
      { name: "emergencyPhone", label: "Emergency Contact Number", type: "tel", required: true },

      // Child's Details
      { name: "childName", label: "Child's Full Name", type: "text", required: true },
      { name: "childDob", label: "Child's Date of Birth", type: "date", required: true },
      { name: "childAge", label: "Child's Age", type: "number" },

      // Cooking Preferences
      { name: "cookingExperience", label: "Child's Cooking Experience Level", type: "radio", options: ["Beginner", "Intermediate", "Advanced"], required: true },
      { name: "foodAllergies", label: "Food Allergies or Restrictions", type: "textarea" },
      { name: "favoriteFoods", label: "Child's Favorite Foods", type: "textarea" },

      // Additional Notes
      { name: "notes", label: "Additional Notes", type: "textarea" },

      // Friends & Family Discount Section
      {
        name: "applyFriendsFamilyDiscount",
        label: "Apply Friends & Family Discount",
        type: "checkbox",
        text: "Get 10% off when you bring family members! Each ticket you purchase will include 1 family member (e.g., 2 tickets = 2 family members). You pay for both your ticket + family member ticket, then get 10% discount on the total."
      },
      {
        name: "familyMemberNames",
        label: "Family Member Names",
        type: "dynamicInputs",
        required: false, // Will be made required conditionally
        text: "Enter the names of your family members. Number of inputs will match your number of tickets."
      },
      {
        name: "familyMemberContacts",
        label: "Family Member Contacts (optional)",
        type: "dynamicInputs",
        required: false,
        text: "Enter contact information for your family members (optional but useful for verification)."
      },
      {
        name: "familyDiscountTerms",
        label: "I understand that I will pay for both my ticket and family member tickets, then receive 10% discount on the total amount.",
        type: "checkbox",
        required: false // Will be made required conditionally
      },
    ],
    waiver: `
I, the undersigned parent/guardian, understand that participation in Hello Chef cooking events involves certain risks including but not limited to:
- Use of kitchen equipment and utensils
- Exposure to heat and cooking surfaces
- Food preparation and handling

I accept full responsibility for my child's safety and well-being during the event. I release and hold harmless Eklektik Mama, its organizers, staff, and partners from any liability for injuries, illnesses, or accidents that may occur.

I also confirm that the information provided above is accurate and that I will inform event organizers of any changes to my child's health, allergies, or cooking experience level.
    `,
  },

  familyDay: {
    title: "Family Day",
    fields: [
      // Parent/Guardian Details
      { name: "parent1Name", label: "Parent/Guardian 1 Full Name", type: "text", required: true },
      { name: "parent2Name", label: "Parent/Guardian 2 Full Name (if attending)", type: "text", required: false },
      { name: "parent1Phone", label: "Parent/Guardian 1 Mobile Number", type: "tel", required: true },
      { name: "parent2Phone", label: "Parent/Guardian 2 Mobile Number (if attending)", type: "tel", required: false },
      { name: "parentEmail", label: "Email Address", type: "email", required: true },

      // Number of Children Selection
      { 
        name: "numberOfChildren", 
        label: "Number of Children Attending", 
        type: "select", 
        options: [
          "2 children - 270 AED",
          "3 children - 405 AED", 
          "4 children - 540 AED"
        ],
        required: true 
      },

      // Children Details
      { name: "child1Name", label: "Child 1 Full Name", type: "text", required: true },
      { name: "child1Age", label: "Child 1 Age", type: "number", required: true },
      { name: "child2Name", label: "Child 2 Full Name", type: "text", required: false },
      { name: "child2Age", label: "Child 2 Age", type: "number", required: false },
      { name: "child3Name", label: "Child 3 Full Name", type: "text", required: false },
      { name: "child3Age", label: "Child 3 Age", type: "number", required: false },
      { name: "child4Name", label: "Child 4 Full Name", type: "text", required: false },
      { name: "child4Age", label: "Child 4 Age", type: "number", required: false },

      // Emergency Contact
      { name: "emergencyName", label: "Emergency Contact Name (not attending)", type: "text", required: true },
      { name: "emergencyPhone", label: "Emergency Contact Phone Number", type: "tel", required: true },

      // Medical Information
      { name: "medicalInfo", label: "Medical Information (allergies, conditions, relevant notes)", type: "textarea", required: false },

      // Marketing Information
      { name: "howDidYouHear", label: "How did you hear about us?", type: "text", required: false },

      // Consent Checkboxes
      {
        name: "waiverConsent",
        label: "Waiver & Consent",
        type: "checkbox",
        text: "I understand that participation in the Eklektik Mama Family Day at Bounce involves physical activity and inherent risks. I confirm that I am responsible for myself and my children at all times. I acknowledge that each parent/guardian must also complete Bounce's own waiver on arrival and that all liability for injuries, accidents, or incidents rests with Bounce under their public liability insurance. Eklektik Mama is not responsible for any injury, accident, illness, or loss arising during the event. I confirm the information I provide is accurate and agree to follow all venue rules and instructions from event staff.",
        required: true
      },
      {
        name: "photographyConsent",
        label: "Photography/Video Consent",
        type: "checkbox",
        text: "I consent to photography and video being taken at the event for Eklektik Mama community and marketing purposes. I will notify the organisers before the event if I do not wish myself or my child to be included.",
        required: true
      },

      // Friends & Family Discount Section
      {
        name: "applyFriendsFamilyDiscount",
        label: "Apply Friends & Family Discount",
        type: "checkbox",
        text: "Get 10% off when you bring family members! Each ticket you purchase will include 1 family member (e.g., 2 tickets = 2 family members). You pay for both your ticket + family member ticket, then get 10% discount on the total."
      },
      {
        name: "familyMemberNames",
        label: "Family Member Names",
        type: "dynamicInputs",
        required: false, // Will be made required conditionally
        text: "Enter the names of your family members. Number of inputs will match your number of tickets."
      },
      {
        name: "familyMemberContacts",
        label: "Family Member Contacts (optional)",
        type: "dynamicInputs",
        required: false,
        text: "Enter contact information for your family members (optional but useful for verification)."
      },
      {
        name: "familyDiscountTerms",
        label: "I understand that I will pay for both my ticket and family member tickets, then receive 10% discount on the total amount.",
        type: "checkbox",
        required: false // Will be made required conditionally
      }
    ],
    waiver: `
Waiver & Consent

☑ I understand that participation in the Eklektik Mama Family Day at Bounce involves physical activity and inherent risks. I confirm that I am responsible for myself and my children at all times.

☑ I acknowledge that each parent/guardian must also complete Bounce's own waiver on arrival and that all liability for injuries, accidents, or incidents rests with Bounce under their public liability insurance. Eklektik Mama is not responsible for any injury, accident, illness, or loss arising during the event.

☑ I consent to photography and video being taken at the event for Eklektik Mama community and marketing purposes. I will notify the organisers before the event if I do not wish myself or my child to be included.

☑ I confirm the information I provide is accurate and agree to follow all venue rules and instructions from event staff.
    `,
  },

  // Coffee Meetup Form (Members Only)
  coffeeMeetup: {
    title: "Coffee Meetup Registration",
    description: "Join us for a casual coffee meetup - members only! This is a free event.",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      { name: "phone", label: "Contact Number", type: "tel", required: true },
      { name: "email", label: "Email Address", type: "email", required: true },
      { name: "childName", label: "Name of Child", type: "text", required: true },
      { name: "childAge", label: "Age of Child", type: "number", required: true },
    ],
    consentText: `
☑ I confirm I am an active Eklektik AF member and understand this is a members-only event.

☑ I consent to photography and video being taken at the event for Eklektik Mama community and marketing purposes. I will notify the organisers before the event if I do not wish to be included.

☑ I confirm the information I provide is accurate and agree to follow all venue rules and instructions from event staff.
    `,
  },
};

// Spreadsheet IDs for each event segment
export const spreadsheetIds = {
  cinemaMorning: process.env.CINEMA_MORNING_SPREADSHEET_ID,
  mamaBreakfast: process.env.MAMA_BREAKFAST_SPREADSHEET_ID,
  mamaFit: process.env.MAMAFIT_SPREADSHEET_ID,
  eklektikEdit: process.env.EKLEKTIK_EDIT_SPREADSHEET_ID,
  helloChef: process.env.CINEMA_MORNING_SPREADSHEET_ID, // Using the same spreadsheet since Hello Chef is in the same file
  familyDay: process.env.FAMILY_DAY_SPREADSHEET_ID,
  coffeeMeetup: process.env.RSVP_SPREADSHEET_ID,
};

// Helper function to get form by segment
export const getFormBySegment = (segment) => {
  const segmentKey = segment?.toLowerCase()?.replace(/\s+/g, '') || '';
  
  if (segmentKey.includes('cinema') || segmentKey.includes('morning')) {
    return eventForms.cinemaMorning;
  } else if (segmentKey.includes('breakfast')) {
    return eventForms.mamaBreakfast;
  } else if (segmentKey.includes('fit')) {
    return eventForms.mamaFit;
  } else if (segmentKey.includes('edit')) {
    return eventForms.eklektikEdit;
  } else if (segmentKey.includes('chef') || segmentKey.includes('hello')) {
    return eventForms.helloChef;
  } else if (segmentKey.includes('family') || segmentKey.includes('day')) {
    return eventForms.familyDay;
  } else if (segmentKey.includes('coffee') || segmentKey.includes('meetup')) {
    return eventForms.coffeeMeetup;
  }
  
  // Default fallback
  return eventForms.cinemaMorning;
};
