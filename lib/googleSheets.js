import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Initialize Google Sheets connection
const getGoogleSheet = async (spreadsheetId = null) => {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  // Use provided spreadsheet ID or default to membership spreadsheet
  const targetSpreadsheet = spreadsheetId || process.env.MEMBERSHIP_SPREADSHEET;
  const doc = new GoogleSpreadsheet(targetSpreadsheet, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
};

// Get or create the members sheet
const getMembersSheet = async () => {
  const doc = await getGoogleSheet();
  
  // Try to get existing sheet
  let sheet = doc.sheetsByTitle['Members'];
  
  if (!sheet) {
    // Create new sheet if it doesn't exist
    sheet = await doc.addSheet({
      title: 'Members',
      headerValues: [
        'Row ID',
        'Email',
        'First Name',
        'Last Name',
        'Phone',
        'Plan Type', // Monthly/Annual
        'Status', // Active/Past Due/Cancelled/Expired
        'Date of Joining',
        'Current Period Start',
        'Current Period End',
        'Next Payment Date',
        'Stripe Customer ID',
        'Stripe Subscription ID',
        'Total Savings (AED)',
        'Payment Method',
        'Payment Reference',
        'Notes',
        'Last Updated'
      ]
    });
  }
  
  return sheet;
};

// Add a new member to Google Sheets
export const addMemberToSheet = async (membershipData) => {
  try {
    const sheet = await getMembersSheet();
    
    // Get the next row ID
    const rows = await sheet.getRows();
    const nextRowId = rows.length + 1;
    
    const rowData = {
      'Row ID': nextRowId,
      'Email': membershipData.email,
      'First Name': membershipData.firstName,
      'Last Name': membershipData.lastName,
      'Phone': membershipData.phone || '',
      'Plan Type': membershipData.membershipType, // Monthly/Annual
      'Status': membershipData.status, // Active/Past Due/Cancelled/Expired
      'Date of Joining': membershipData.signupDate ? membershipData.signupDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      'Current Period Start': membershipData.currentPeriodStart ? membershipData.currentPeriodStart.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      'Current Period End': membershipData.currentPeriodEnd ? membershipData.currentPeriodEnd.toISOString().split('T')[0] : '',
      'Next Payment Date': membershipData.nextPaymentDate?.toISOString().split('T')[0] || '',
      'Stripe Customer ID': membershipData.stripeCustomerId || '',
      'Stripe Subscription ID': membershipData.stripeSubscriptionId || '',
      'Total Savings (AED)': membershipData.totalSavings || 0,
      'Payment Method': membershipData.paymentMethod || '',
      'Payment Reference': membershipData.paymentReference || '',
      'Notes': membershipData.notes || '',
      'Last Updated': new Date().toISOString()
    };
    
    await sheet.addRow(rowData);
    
    return nextRowId;
  } catch (error) {
    console.error('Error adding member to Google Sheets:', error);
    throw error;
  }
};

// Update member information in Google Sheets
export const updateMemberInSheet = async (email, updateData) => {
  try {
    const sheet = await getMembersSheet();
    const rows = await sheet.getRows();
    
    // Find the row with matching email
    const memberRow = rows.find(row => row.get('Email') === email);
    
    if (!memberRow) {
      throw new Error(`Member with email ${email} not found in Google Sheets`);
    }
    
    // Update the row data
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        memberRow.set(key, updateData[key]);
      }
    });
    
    memberRow.set('Last Updated', new Date().toISOString());
    await memberRow.save();
    
    return true;
  } catch (error) {
    console.error('Error updating member in Google Sheets:', error);
    throw error;
  }
};

// Get member from Google Sheets by email
export const getMemberFromSheet = async (email) => {
  try {
    const sheet = await getMembersSheet();
    const rows = await sheet.getRows();
    
    const memberRow = rows.find(row => row.get('Email') === email);
    
    if (!memberRow) {
      return null;
    }
    
    return {
      rowId: memberRow.get('Row ID'),
      email: memberRow.get('Email'),
      firstName: memberRow.get('First Name'),
      lastName: memberRow.get('Last Name'),
      phone: memberRow.get('Phone'),
      membershipType: memberRow.get('Membership Type'),
      status: memberRow.get('Status'),
      signupDate: memberRow.get('Signup Date'),
      currentPeriodStart: memberRow.get('Current Period Start'),
      currentPeriodEnd: memberRow.get('Current Period End'),
      nextPaymentDate: memberRow.get('Next Payment Date'),
      stripeCustomerId: memberRow.get('Stripe Customer ID'),
      stripeSubscriptionId: memberRow.get('Stripe Subscription ID'),
      totalSavings: memberRow.get('Total Savings'),
      notes: memberRow.get('Notes'),
      lastUpdated: memberRow.get('Last Updated')
    };
  } catch (error) {
    console.error('Error getting member from Google Sheets:', error);
    throw error;
  }
};

// Get all members from Google Sheets
export const getAllMembersFromSheet = async () => {
  try {
    const sheet = await getMembersSheet();
    const rows = await sheet.getRows();
    
    return rows.map(row => ({
      rowId: row.get('Row ID'),
      email: row.get('Email'),
      firstName: row.get('First Name'),
      lastName: row.get('Last Name'),
      phone: row.get('Phone'),
      membershipType: row.get('Membership Type'),
      status: row.get('Status'),
      signupDate: row.get('Signup Date'),
      currentPeriodStart: row.get('Current Period Start'),
      currentPeriodEnd: row.get('Current Period End'),
      nextPaymentDate: row.get('Next Payment Date'),
      stripeCustomerId: row.get('Stripe Customer ID'),
      stripeSubscriptionId: row.get('Stripe Subscription ID'),
      totalSavings: row.get('Total Savings'),
      notes: row.get('Notes'),
      lastUpdated: row.get('Last Updated')
    }));
  } catch (error) {
    console.error('Error getting all members from Google Sheets:', error);
    throw error;
  }
};

// Update member's total savings
export const updateMemberSavings = async (email, additionalSavings) => {
  try {
    const member = await getMemberFromSheet(email);
    if (!member) {
      throw new Error(`Member with email ${email} not found`);
    }
    
    const newTotalSavings = (member.totalSavings || 0) + additionalSavings;
    
    await updateMemberInSheet(email, {
      'Total Savings': newTotalSavings
    });
    
    return newTotalSavings;
  } catch (error) {
    console.error('Error updating member savings:', error);
    throw error;
  }
};

// Get or create the contact forms sheet
const getContactFormsSheet = async () => {
  // Use the contact forms spreadsheet ID from environment variable
  const contactFormsSpreadsheetId = process.env.CONTACT_FORMS_SPREADSHEET_ID || '1Rit0t17nPVMwnOenC66-FfYnDDON1z9kDlikD2AWEpA';
  const doc = await getGoogleSheet(contactFormsSpreadsheetId);
  
  // Try to get existing sheet
  let sheet = doc.sheetsByTitle['Contact Forms'];
  
  if (!sheet) {
    // Create new sheet if it doesn't exist
    sheet = await doc.addSheet({
      title: 'Contact Forms',
      headerValues: [
        'Timestamp',
        'Source',
        'Name',
        'Email',
        'Website',
        'Is Brand',
        'Interested in Franchise',
        'Partnership Type',
        'Other Details',
        'Note/Message'
      ]
    });
  }
  
  return sheet;
};

// Add contact form submission to Google Sheets
export const addContactFormToSheet = async (formData, source) => {
  try {
    console.log('Starting contact form submission to Google Sheets...');
    console.log('Form data:', formData);
    console.log('Source:', source);
    
    const sheet = await getContactFormsSheet();
    console.log('Successfully connected to Google Sheets');
    
    const rowData = {
      'Timestamp': new Date().toISOString(),
      'Source': source, // 'partnershipProgram' or 'contactUs'
      'Name': formData.name || '',
      'Email': formData.email || '',
      'Website': formData.website || '',
      'Is Brand': formData.isBrand || '',
      'Interested in Franchise': formData.interestedInFranchise || '',
      'Partnership Type': formData.partnershipType || '',
      'Other Details': formData.otherDetails || '',
      'Note/Message': formData.note || ''
    };
    
    console.log('Row data to be added:', rowData);
    
    const result = await sheet.addRow(rowData);
    console.log('Row added successfully:', result);
    
    console.log(`Contact form submission added to Google Sheets from ${source}:`, formData.email);
    return true;
  } catch (error) {
    console.error('Error adding contact form to Google Sheets:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};
