import mongoose from 'mongoose';

const GoogleSheetsLogSchema = new mongoose.Schema({
  operation: {
    type: String,
    required: true,
    enum: ['add', 'update', 'create_sheet', 'delete']
  },
  sheetName: {
    type: String,
    required: true
  },
  spreadsheetId: {
    type: String,
    required: true
  },
  recordId: {
    type: String, // Row ID or record identifier
    required: false
  },
  recordEmail: {
    type: String, // Email if it's a member record
    required: false
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // Store the actual changes made
    required: false
  },
  oldValues: {
    type: mongoose.Schema.Types.Mixed, // Store old values for updates
    required: false
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed, // Store new values
    required: false
  },
  source: {
    type: String,
    required: true,
    enum: ['webhook', 'manual', 'api', 'admin', 'system']
  },
  sourceDetails: {
    type: String, // Additional context about the source
    required: false
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  },
  errorMessage: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
GoogleSheetsLogSchema.index({ timestamp: -1 });
GoogleSheetsLogSchema.index({ sheetName: 1, timestamp: -1 });
GoogleSheetsLogSchema.index({ recordEmail: 1, timestamp: -1 });
GoogleSheetsLogSchema.index({ operation: 1, timestamp: -1 });

export default mongoose.models.GoogleSheetsLog || mongoose.model('GoogleSheetsLog', GoogleSheetsLogSchema);

