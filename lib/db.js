import mongoose from "mongoose";

let isConnected = false; // global flag

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ Mongoose disconnected from MongoDB');
  isConnected = false;
});

// Handle app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔌 Mongoose connection closed through app termination');
  process.exit(0);
});

export const connectDB = async () => {
  if (isConnected) {
    console.log("✅ MongoDB already connected");
    return;
  }

  // Check if we already have a connection
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    console.log("✅ MongoDB already connected (readyState: 1)");
    return;
  }

  // Try Atlas first, then fallback to local
  const connectionOptions = {
    dbName: "myapp",
    serverSelectionTimeoutMS: 5000, // Reduced timeout for faster fallback
    socketTimeoutMS: 45000,
    connectTimeoutMS: 5000,
    bufferCommands: true, // Enable buffering to handle connection timing
    maxPoolSize: 5,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    retryReads: true,
  };

  try {
    console.log("🔄 Connecting to MongoDB Atlas...");
    console.log("🔗 Connection URI:", process.env.MONGODB_URI ? "Set" : "Not set");
    
    await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
    
    // Wait for connection to be ready
    await new Promise((resolve, reject) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('open', resolve);
        mongoose.connection.once('error', reject);
      }
    });
    
    isConnected = true;
    console.log("✅ MongoDB Atlas connected successfully");
    
  } catch (atlasError) {
    console.warn("⚠️ Atlas connection failed, trying local MongoDB...");
    console.warn("Atlas error:", atlasError.message);
    
    try {
      // Fallback to local MongoDB
      const localUri = "mongodb://localhost:27017/eklektikmama";
      console.log("🔄 Connecting to local MongoDB...");
      
      await mongoose.connect(localUri, connectionOptions);
      
      // Wait for connection to be ready
      await new Promise((resolve, reject) => {
        if (mongoose.connection.readyState === 1) {
          resolve();
        } else {
          mongoose.connection.once('open', resolve);
          mongoose.connection.once('error', reject);
        }
      });
      
      isConnected = true;
      console.log("✅ Local MongoDB connected successfully");
      
    } catch (localError) {
      console.error("❌ Both Atlas and local MongoDB connection failed");
      console.error("Atlas error:", atlasError.message);
      console.error("Local error:", localError.message);
      
      isConnected = false;
      
      // Provide comprehensive error handling
      if (atlasError.message.includes('ETIMEOUT') || atlasError.message.includes('querySrv')) {
        console.error("🌐 Network connectivity issues detected");
        console.error("💡 Solutions:");
        console.error("   1. Check MongoDB Atlas dashboard - is cluster running?");
        console.error("   2. Verify IP whitelist in Atlas");
        console.error("   3. Check internet connection");
        console.error("   4. Start local MongoDB: brew services start mongodb-community");
      }
      
      throw new Error(`Database connection failed. Atlas: ${atlasError.message}, Local: ${localError.message}`);
    }
  }
};
