import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { google } from 'googleapis';

// Initialize Google Sheets connection
export const getGoogleSheet = async (spreadsheetId = null) => {
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

// Event-specific Google Sheets integration
export const createEventSheet = async (eventData) => {
  try {
    console.log('Creating event-specific sheet for:', eventData.title);
    console.log('Event segment:', eventData.segment);
    
    // Get the appropriate spreadsheet based on event segment
    const { spreadsheetIds } = await import('./eventForms.js');
    console.log('Available spreadsheet IDs:', spreadsheetIds);
    const spreadsheetId = spreadsheetIds[eventData.segment];
    console.log('Selected spreadsheet ID for', eventData.segment, ':', spreadsheetId);
    
    if (!spreadsheetId) {
      console.warn(`No spreadsheet configured for segment: ${eventData.segment}. Event will be created without Google Sheet.`);
      return {
        sheetId: null,
        sheetName: null,
        spreadsheetId: null,
        warning: `No spreadsheet configured for segment: ${eventData.segment}`
      };
    }
    
    const doc = await getGoogleSheet(spreadsheetId);
    
    // Create a unique sheet name based on event date, title, and ID
    const eventDate = new Date(eventData.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    
    // Create a more unique sheet name to prevent collisions
    const titleSlug = eventData.title
      .substring(0, 20)
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    
    const sheetName = `${eventDate}_${titleSlug}_${eventData._id.toString().slice(-6)}`;
    
    // Check if sheet already exists
    let sheet = doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      // Create new sheet with event-specific headers
      const headers = [
        'Booking Date/Time',
        'Event Title',
        'Event Date',
        'Guardian Name',
        'Child Name',
        'Email',
        'Phone',
        'Number of Tickets',
        'Transaction ID',
        'Payment Status',
        'Timestamp'
      ];
      
      // Add segment-specific headers
      if (eventData.segment === 'cinemaMorning') {
        headers.push(
          'Child Age',
          'Child Gender',
          'Dietary Requirements',
          'Emergency Contact',
          'Emergency Phone',
          'Medical Conditions',
          'Photography Consent'
        );
      } else if (eventData.segment === 'mamaBreakfast') {
        headers.push(
          'Child Age',
          'Child Gender',
          'Dietary Requirements',
          'Emergency Contact',
          'Emergency Phone',
          'Medical Conditions',
          'Photography Consent',
          'Special Requests',
          'Table Preferences',
          'Additional Notes'
        );
      } else if (eventData.segment === 'mamaFit') {
        headers.push(
          'Fitness Level',
          'Medical Conditions',
          'Emergency Contact',
          'Emergency Phone',
          'Photography Consent'
        );
      } else if (eventData.segment === 'eklektikEdit') {
        headers.push(
          'Photography Consent',
          'Additional Notes'
        );
      } else if (eventData.segment === 'familyDay') {
        headers.push(
          'Parent 1 Name',
          'Parent 2 Name',
          'Parent 1 Phone',
          'Parent 2 Phone',
          'Child 1 Name',
          'Child 1 Age',
          'Child 2 Name',
          'Child 2 Age',
          'Child 3 Name',
          'Child 3 Age',
          'Child 4 Name',
          'Child 4 Age',
          'Number of Children',
          'Emergency Contact Name',
          'Emergency Contact Phone',
          'Medical Information',
          'How Did You Hear',
          'Waiver Consent',
          'Photography Consent'
        );
      }
      
      // Create sheet without headers first
      sheet = await doc.addSheet({
        title: sheetName
      });
      
      // Wait a moment for the sheet to be fully created
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Resize sheet to accommodate all columns (Family Day needs 30 columns)
      const totalColumns = headers.length;
      if (totalColumns > 26) { // Google Sheets default is 26 columns
        // Use the correct API method to resize the sheet
        const serviceAccountAuth = new JWT({
          email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
          key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const sheets = google.sheets({ version: 'v4', auth: serviceAccountAuth });
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: doc.spreadsheetId,
          requestBody: {
            requests: [{
              updateSheetProperties: {
                properties: {
                  sheetId: sheet.sheetId,
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: Math.max(totalColumns, 30)
                  }
                },
                fields: 'gridProperties(rowCount,columnCount)'
              }
            }]
          }
        });
      }
      
      // Add headers as the first row of data
      const headerRowData = {};
      headers.forEach((header, index) => {
        headerRowData[header] = header;
      });
      await sheet.addRow(headerRowData);
      
      // Wait a moment for the data to be processed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Skip setHeaderRow for now - the data is already added as the first row
      console.log(`✅ Headers added as first row for sheet: ${sheetName}`);
      
      console.log(`Created new sheet: ${sheetName}`);
      console.log(`   - Headers set: ${headers.join(', ')}`);
      console.log(`   - Sheet ready for data rows`);
      
      // Verify the sheet was created correctly
      const rows = await sheet.getRows();
      console.log(`   - Initial rows: ${rows.length} (should be 0)`);
    }
    
    return {
      sheetId: sheet.sheetId,
      sheetName: sheetName,
      spreadsheetId: spreadsheetId
    };
    
  } catch (error) {
    console.error('Error creating event sheet:', error);
    throw error;
  }
};

// Add booking to event-specific sheet
export const addBookingToEventSheet = async (bookingData, eventData) => {
  try {
    console.log('Adding booking to event-specific sheet:', eventData.title);
    
    // Get the appropriate spreadsheet based on event segment
    const { spreadsheetIds } = await import('./eventForms.js');
    const spreadsheetId = spreadsheetIds[eventData.segment];
    
    if (!spreadsheetId) {
      throw new Error(`No spreadsheet configured for segment: ${eventData.segment}`);
    }
    
    const doc = await getGoogleSheet(spreadsheetId);
    
    // Find the event-specific sheet using the same naming convention
    const eventDate = new Date(eventData.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    
    const titleSlug = eventData.title
      .substring(0, 20)
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    
    const sheetName = `${eventDate}_${titleSlug}_${eventData._id.toString().slice(-6)}`;
    const sheet = doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      throw new Error(`Event sheet not found: ${sheetName}`);
    }
    
    // Skip header validation for now - just add the data
    console.log('✅ Adding booking data to sheet');
    
    // Prepare row data
    const rowData = {
      'Booking Date/Time': new Date().toISOString(),
      'Event Title': eventData.title,
      'Event Date': new Date(eventData.date).toISOString().split('T')[0],
      'Guardian Name': bookingData.guardianName || '',
      'Child Name': bookingData.childName || '',
      'Email': bookingData.email || '',
      'Phone': bookingData.phone || '',
      'Number of Tickets': bookingData.numberOfTickets || 1,
      'Transaction ID': bookingData.transactionId || '',
      'Payment Status': bookingData.paymentStatus || 'paid',
      'Timestamp': new Date().toISOString()
    };
    
    // For Family Day events, update Child Name to show all children and add separate parent columns
    if (eventData.segment === 'familyDay') {
      const childrenNames = [];
      if (bookingData.child1Name) childrenNames.push(bookingData.child1Name);
      if (bookingData.child2Name) childrenNames.push(bookingData.child2Name);
      if (bookingData.child3Name) childrenNames.push(bookingData.child3Name);
      if (bookingData.child4Name) childrenNames.push(bookingData.child4Name);
      rowData['Child Name'] = childrenNames.join(', ');
      
      // Add separate parent columns to basic fields
      rowData['Parent 1 Name'] = bookingData.parent1Name || '';
      rowData['Parent 2 Name'] = bookingData.parent2Name || '';
      rowData['Parent 1 Phone'] = bookingData.parent1Phone || '';
      rowData['Parent 2 Phone'] = bookingData.parent2Phone || '';
    }
    
    // Add segment-specific data
    if (eventData.segment === 'cinemaMorning') {
      rowData['Child Age'] = bookingData.childAge || '';
      rowData['Child Gender'] = bookingData.childGender || '';
      rowData['Dietary Requirements'] = bookingData.dietaryRequirements || '';
      rowData['Emergency Contact'] = bookingData.emergencyContact || '';
      rowData['Emergency Phone'] = bookingData.emergencyPhone || '';
      rowData['Medical Conditions'] = bookingData.medicalConditions || '';
      rowData['Photography Consent'] = bookingData.photographyConsent || 'No';
    } else if (eventData.segment === 'mamaBreakfast') {
      rowData['Child Age'] = bookingData.childAge || '';
      rowData['Child Gender'] = bookingData.childGender || '';
      rowData['Dietary Requirements'] = bookingData.dietaryRequirements || '';
      rowData['Emergency Contact'] = bookingData.emergencyContact || '';
      rowData['Emergency Phone'] = bookingData.emergencyPhone || '';
      rowData['Medical Conditions'] = bookingData.medicalConditions || '';
      rowData['Photography Consent'] = bookingData.photographyConsent || 'No';
      rowData['Special Requests'] = bookingData.specialRequests || '';
      rowData['Table Preferences'] = bookingData.tablePreferences || '';
      rowData['Additional Notes'] = bookingData.additionalNotes || '';
    } else if (eventData.segment === 'mamaFit') {
      rowData['Fitness Level'] = bookingData.fitnessLevel || '';
      rowData['Medical Conditions'] = bookingData.medicalConditions || '';
      rowData['Emergency Contact'] = bookingData.emergencyContact || '';
      rowData['Emergency Phone'] = bookingData.emergencyPhone || '';
      rowData['Photography Consent'] = bookingData.photographyConsent || 'No';
    } else if (eventData.segment === 'eklektikEdit') {
      rowData['Photography Consent'] = bookingData.photographyConsent || 'No';
      rowData['Additional Notes'] = bookingData.additionalNotes || '';
    } else if (eventData.segment === 'familyDay') {
      rowData['Parent 1 Name'] = bookingData.parent1Name || '';
      rowData['Parent 2 Name'] = bookingData.parent2Name || '';
      rowData['Parent 1 Phone'] = bookingData.parent1Phone || '';
      rowData['Parent 2 Phone'] = bookingData.parent2Phone || '';
      rowData['Child 1 Name'] = bookingData.child1Name || '';
      rowData['Child 1 Age'] = bookingData.child1Age || '';
      rowData['Child 2 Name'] = bookingData.child2Name || '';
      rowData['Child 2 Age'] = bookingData.child2Age || '';
      rowData['Child 3 Name'] = bookingData.child3Name || '';
      rowData['Child 3 Age'] = bookingData.child3Age || '';
      rowData['Child 4 Name'] = bookingData.child4Name || '';
      rowData['Child 4 Age'] = bookingData.child4Age || '';
      rowData['Number of Children'] = bookingData.numberOfChildren || '';
      rowData['Emergency Contact Name'] = bookingData.emergencyName || '';
      rowData['Emergency Contact Phone'] = bookingData.emergencyPhone || '';
      rowData['Medical Information'] = bookingData.medicalInfo || '';
      rowData['How Did You Hear'] = bookingData.howDidYouHear || '';
      rowData['Waiver Consent'] = bookingData.waiverConsent || '';
      rowData['Photography Consent'] = bookingData.photographyConsent || 'No';
    }
    
    // Use direct Google Sheets API to add the row
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth: serviceAccountAuth });
    
    // Convert rowData object to array in the correct order
    const headers = [
      'Booking Date/Time', 'Event Title', 'Event Date', 'Guardian Name', 'Child Name', 'Email', 'Phone',
      'Number of Tickets', 'Transaction ID', 'Payment Status', 'Timestamp'
    ];
    
    // Add segment-specific headers
    if (eventData.segment === 'familyDay') {
      // Insert parent columns after basic fields but before detailed child fields
      headers.push(
        'Parent 1 Name', 'Parent 2 Name', 'Parent 1 Phone', 'Parent 2 Phone', 'Child 1 Name', 'Child 1 Age',
        'Child 2 Name', 'Child 2 Age', 'Child 3 Name', 'Child 3 Age', 'Child 4 Name', 'Child 4 Age',
        'Number of Children', 'Emergency Contact Name', 'Emergency Contact Phone', 'Medical Information',
        'How Did You Hear', 'Waiver Consent', 'Photography Consent'
      );
    }
    
    // Create row array in the correct order
    const rowArray = headers.map(header => rowData[header] || '');
    
    // Get the next available row (starting from row 2)
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: doc.spreadsheetId,
      range: `${sheetName}!A:A`,
    });
    
    // Find the next available row (start from row 2, skip header row)
    const nextRow = Math.max(2, (existingData.data.values ? existingData.data.values.length + 1 : 2));
    
    // Add the row using the direct API, starting from the calculated row
    // Use AD (30th column) to accommodate Family Day's 30 columns
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: doc.spreadsheetId,
      range: `${sheetName}!A${nextRow}:AD${nextRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowArray]
      }
    });
    
    console.log(`✅ Booking added to event sheet: ${sheetName}`);
    console.log(`   - Row added successfully`);
    console.log(`   - Tickets in booking: ${rowData['Number of Tickets']}`);
    console.log(`   - Guardian: ${rowData['Guardian Name']}`);
    console.log(`   - Event: ${rowData['Event Title']}`);
    
    return true;
    
  } catch (error) {
    console.error('Error adding booking to event sheet:', error);
    throw error;
  }
};

// Get current bookings count for an event
export const getEventBookingsCount = async (eventData) => {
  try {
    console.log('Getting booking count for event:', eventData.title);
    
    // Get the appropriate spreadsheet based on event segment
    const { spreadsheetIds } = await import('./eventForms.js');
    const spreadsheetId = spreadsheetIds[eventData.segment];
    
    if (!spreadsheetId) {
      console.log(`No spreadsheet configured for segment: ${eventData.segment}`);
      return 0;
    }
    
    const doc = await getGoogleSheet(spreadsheetId);
    
    // Find the event-specific sheet using the same naming convention
    const eventDate = new Date(eventData.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
    
    const titleSlug = eventData.title
      .substring(0, 20)
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_');
    
    const sheetName = `${eventDate}_${titleSlug}_${eventData._id.toString().slice(-6)}`;
    console.log('Looking for sheet:', sheetName);
    
    const sheet = doc.sheetsByTitle[sheetName];
    
    if (!sheet) {
      console.log('Sheet not found, no bookings yet');
      return 0;
    }
    
    const rows = await sheet.getRows();
    console.log(`Found ${rows.length} rows in sheet`);
    
    // Validate that we have at least a header row
    if (rows.length === 0) {
      console.log('Sheet is empty, no bookings yet');
      return 0;
    }
    
    // Count total tickets (not just bookings, since each booking can have multiple tickets)
    let totalTickets = 0;
    let dataRowsCount = 0;
    
    rows.forEach((row, index) => {
      dataRowsCount++;
      console.log(`Processing data row ${index + 1}`);
      
      // Try different ways to access the ticket count
      let tickets = 0;
      
      // Method 1: Try with exact column name
      if (row.get('Number of Tickets')) {
        tickets = parseInt(row.get('Number of Tickets'));
        console.log(`Row ${index + 1}: Found tickets via column name: ${tickets}`);
      }
      // Method 2: Try with different variations
      else if (row.get('numberOfTickets')) {
        tickets = parseInt(row.get('numberOfTickets'));
        console.log(`Row ${index + 1}: Found tickets via camelCase: ${tickets}`);
      }
      // Method 3: Try accessing by index (assuming 'Number of Tickets' is column 7)
      else if (row.get(7)) {
        tickets = parseInt(row.get(7));
        console.log(`Row ${index + 1}: Found tickets via index 7: ${tickets}`);
      }
      // Method 4: Log all available columns to debug
      else {
        console.log(`Row ${index + 1}: Could not find ticket count`);
        console.log('Available columns in row:', Object.keys(row._rawData || {}));
        console.log('Row data:', row._rawData);
      }
      
      if (!isNaN(tickets) && tickets > 0) {
        totalTickets += tickets;
        console.log(`✅ Row ${index + 1}: Added ${tickets} tickets (Total: ${totalTickets})`);
      } else {
        console.log(`❌ Row ${index + 1}: Invalid ticket count (${tickets}), raw data:`, row._rawData);
      }
    });
    
    console.log(`Total tickets booked: ${totalTickets}`);
    return totalTickets;
    
  } catch (error) {
    console.error('Error getting event bookings count:', error);
    return 0; // Return 0 if there's an error, allowing booking to proceed
  }
};
