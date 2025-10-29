# Membership Google Sheets Logging System

## 🎯 Overview

Your client received a notification that the membership sheet was edited, but couldn't figure out where the changes were made. I've implemented a comprehensive logging system to track all changes to the membership Google Sheet.

## 🔧 What I've Added

### 1. **Enhanced Google Sheets Logging**

#### **Added to `lib/googleSheets.js`:**
- **✅ Detailed Logging for `addMemberToSheet()`**: Logs every new member addition with full data
- **✅ Comprehensive Logging for `updateMemberInSheet()`**: Tracks all field changes with before/after values
- **✅ Exported `getMembersSheet()`**: Made the function available for API access

#### **Logging Features:**
- **📝 Field-by-Field Changes**: Shows exactly what changed from what to what
- **⏰ Timestamps**: Every operation is timestamped
- **📊 Change Summaries**: Clear summary of all modifications
- **❌ Error Logging**: Detailed error information when operations fail

### 2. **Admin API Endpoint**

#### **New API: `/api/admin/google-sheets-logs`**

**Available Actions:**
- **`view`**: View specific member data
- **`audit`**: Get complete audit trail for a member
- **`recent`**: Show 10 most recently updated members

**Usage Examples:**
```bash
# View recent activity
curl "http://localhost:3000/api/admin/google-sheets-logs?action=recent"

# View specific member
curl "http://localhost:3000/api/admin/google-sheets-logs?action=view&email=user@example.com"

# Full audit trail
curl "http://localhost:3000/api/admin/google-sheets-logs?action=audit&email=user@example.com"
```

### 3. **Admin Web Interface**

#### **New Page: `/admin/google-sheets-logs`**

**Features:**
- **🔍 Search Members**: Find any member by email
- **📊 Recent Activity**: View 10 most recently updated members
- **🔍 Full Audit Trail**: See complete member data
- **📱 Responsive Design**: Works on all devices

### 4. **Real-Time Monitoring Script**

#### **New Script: `monitor-membership-logs.js`**

**Features:**
- **🔄 Real-Time Monitoring**: Polls every 5 seconds for changes
- **🚨 Change Detection**: Alerts when sheet is modified
- **🔍 Detailed Audits**: Shows complete change details
- **🎨 Color-Coded Output**: Easy to read console output

**Usage:**
```bash
# Start real-time monitoring
node monitor-membership-logs.js

# Show recent activity once
node monitor-membership-logs.js recent

# Show member audit
node monitor-membership-logs.js audit user@example.com
```

### 5. **Enhanced Webhook Logging**

#### **Updated: `app/api/webhooks/membership/route.js`**

**Added Logging For:**
- **📝 Database Updates**: Tracks all membership changes
- **📊 Google Sheets Updates**: Logs what data is sent to sheets
- **🔄 Plan Changes**: Detects and logs membership upgrades/downgrades
- **⏰ Period Updates**: Tracks billing period changes

## 🚀 How to Use

### **Option 1: Web Interface (Recommended)**
1. Go to: `http://localhost:3000/admin/google-sheets-logs`
2. Use the search form to find specific members
3. Click "View Recent Activity" to see latest changes

### **Option 2: Command Line API**
```bash
# Check recent activity
curl "http://localhost:3000/api/admin/google-sheets-logs?action=recent" | jq .

# Check specific member
curl "http://localhost:3000/api/admin/google-sheets-logs?action=audit&email=user@example.com" | jq .
```

### **Option 3: Real-Time Monitoring**
```bash
# Start monitoring (runs continuously)
node monitor-membership-logs.js

# Check once
node monitor-membership-logs.js recent
```

## 📊 What You'll See in Logs

### **When Adding a Member:**
```
=== ADDING NEW MEMBER TO GOOGLE SHEETS ===
Member Email: user@example.com
Member Name: John Doe
Membership Type: monthly
Status: active
Timestamp: 2025-10-26T13:43:26.414Z
Row Data to be added: { ... }
✅ Member successfully added to Google Sheets with Row ID: 12
=== END ADDING MEMBER ===
```

### **When Updating a Member:**
```
=== UPDATING MEMBER IN GOOGLE SHEETS ===
Member Email: user@example.com
Update Data: { "Status": "cancelled", "Plan Type": "Annual" }
📝 Field "Status" changed: "active" → "cancelled"
📝 Field "Plan Type" changed: "Monthly" → "Annual"
📊 Summary of changes:
  • Status: "active" → "cancelled"
  • Plan Type: "Monthly" → "Annual"
✅ Member successfully updated in Google Sheets
=== END UPDATING MEMBER ===
```

### **When Webhook Updates Sheet:**
```
=== UPDATING GOOGLE SHEETS FROM WEBHOOK ===
Google Sheets update data: {
  "Status": "active",
  "Plan Type": "Monthly",
  "Current Period Start": "2025-10-26",
  "Current Period End": "2025-11-26",
  "Next Payment Date": "2025-11-26"
}
✅ Google Sheets updated successfully
=== END WEBHOOK UPDATE ===
```

## 🔍 Troubleshooting

### **If You Can't See Logs:**
1. **Check Server Console**: All logs appear in your development server console
2. **Use the API**: Test with curl commands above
3. **Check Web Interface**: Visit `/admin/google-sheets-logs`

### **If API Returns Errors:**
1. **Check Server Status**: Make sure your dev server is running
2. **Check Email Format**: Ensure email addresses are valid
3. **Check Permissions**: Make sure Google Sheets API is configured

### **If Monitoring Script Fails:**
1. **Check Node.js**: Ensure Node.js is installed
2. **Check Server**: Make sure API is accessible
3. **Check Network**: Ensure localhost:3000 is reachable

## 📈 Current Status

**Your Membership Sheet Has:**
- **11 Total Members**
- **Most Recent Update**: Kartik Mistry (kartikmistry301@gmail.com) - 10/26/2025, 6:59:02 PM
- **Status Breakdown**: 10 Active, 1 Cancelled

## 🎯 Next Steps

1. **Monitor Changes**: Use the real-time monitoring script to watch for changes
2. **Check Recent Activity**: Use the web interface to see what's been updated recently
3. **Audit Specific Members**: If you know which member was affected, use the audit feature
4. **Set Up Alerts**: Consider setting up notifications for future changes

## 📞 Support

If you need help:
1. **Check the logs** in your development server console
2. **Use the web interface** at `/admin/google-sheets-logs`
3. **Run the monitoring script** to see real-time changes
4. **Check the API** with curl commands

The logging system is now fully operational and will help you track exactly what changes are made to your membership Google Sheet! 🚀

