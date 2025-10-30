import mongoose from 'mongoose';

const sheetCacheSchema = new mongoose.Schema({
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  spreadsheetId: {
    type: String,
    required: true
  },
  sheetName: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  lastChecked: {
    type: Date,
    default: Date.now
  },
  rowCount: {
    type: Number,
    default: 0
  },
  lastChangeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index for efficient queries
sheetCacheSchema.index({ cacheKey: 1 });
sheetCacheSchema.index({ spreadsheetId: 1, sheetName: 1 });

export default mongoose.models.SheetCache || mongoose.model('SheetCache', sheetCacheSchema);








