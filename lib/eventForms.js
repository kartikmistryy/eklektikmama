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
        label: "Choice I - Bread Selection",
        type: "select",
        options: [
          "BAGUETTE - Classic French style crusty bread",
          "PAIN DE MIE ROLL - Soft, buttery white pull apart bread",
          "CROISSANT - Made daily, buttery classic croissant",
          "GREEN SALAD - Lettuce, mixed fresh vegetables, citrus vinaigrette"
        ],
        required: true
      },
      {
        name: "choiceII",
        label: "Choice II - Main Course",
        type: "select",
        options: [
          "EGGS YOUR WAY - Two organic eggs to order",
          "OMELETTE AU FROMAGE - Two organic eggs filled with cheese",
          "POMME DARPHIN - Crispy potato hash",
          "AVOCADO - Half Hass avocado",
          "MUSHROOMS - Butter grilled button mushrooms"
        ],
        required: true
      },
      {
        name: "choiceIII",
        label: "Choice III - Protein Selection",
        type: "select",
        options: [
          "SAUSAGE - Chicken & beef mix, herbs",
          "IBERICO BEEF - Spanish style cured beef",
          "BEEF BACON - Lightly smoked, crispy fried",
          "CHORIZO - Spicy premium Spanish cured beef",
          "VEAL HAM - French style veal cold cut",
          "SCOTTISH SALMON - Taparelle dill cured salmon"
        ],
        required: true
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
        name: "pregnant",
        label: "Are you currently pregnant?",
        type: "radio",
        options: ["Yes", "No"],
      },
      {
        name: "postpartum",
        label: "Have you given birth in the last 12 months?",
        type: "radio",
        options: ["Yes", "No"],
      },
      { name: "postpartumDuration", label: "If yes, how many weeks/months postpartum are you?", type: "text" },
      {
        name: "medicalConditions",
        label: "Do you have any existing medical conditions?",
        type: "radio",
        options: ["Yes", "No"],
      },
      { name: "conditionDetails", label: "If yes, please specify", type: "textarea" },
    ],
    waiver: `
Important: If you are less than 6 months postpartum, participation in MamaFit sessions requires a doctor's certificate confirming you are medically cleared for physical activity. 
Please carry this certificate with you to the venue.

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
};

// Spreadsheet IDs for each event segment
export const spreadsheetIds = {
  cinemaMorning: process.env.CINEMA_MORNING_SPREADSHEET_ID,
  mamaBreakfast: process.env.MAMA_BREAKFAST_SPREADSHEET_ID,
  mamaFit: process.env.MAMAFIT_SPREADSHEET_ID,
  eklektikEdit: process.env.EKLEKTIK_EDIT_SPREADSHEET_ID,
  helloChef: process.env.CINEMA_MORNING_SPREADSHEET_ID, // Using the same spreadsheet since Hello Chef is in the same file
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
  }
  
  // Default fallback
  return eventForms.cinemaMorning;
};
