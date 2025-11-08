import mongoose from "mongoose";
import dns from "dns";

// Set DNS to prefer IPv4 to avoid IPv6 connection issues
dns.setDefaultResultOrder('ipv4first');

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
  // Ensure DNS is configured FIRST - this is critical
  dns.setDefaultResultOrder('ipv4first');
  
  // If there's ANY existing connection, close it first to ensure fresh connection
  if (mongoose.connection.readyState !== 0) {
    console.log('🔄 Closing any existing connection to ensure fresh start...');
    try {
      await mongoose.connection.close();
      isConnected = false;
      // Wait for connection to fully close
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (err) {
      console.warn('⚠️ Error closing connection:', err.message);
      isConnected = false;
    }
  }
  
  // Always verify the connection is to the correct database
  // If connection exists, verify it's correct and has all collections
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    const currentDbName = mongoose.connection.db.databaseName;
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      console.log(`🔍 Checking existing connection to "${currentDbName}"`);
      console.log(`📊 Collections found: ${collectionNames.length} - [${collectionNames.join(', ')}]`);
      
      if (currentDbName === 'myapp' && collectionNames.length >= 8) {
        console.log(`✅ MongoDB already connected to "${currentDbName}" with correct collections`);
        isConnected = true;
        return;
      } else {
        if (currentDbName !== 'myapp') {
          console.warn(`⚠️ Existing connection is to "${currentDbName}", not "myapp". Reconnecting...`);
        }
        if (collectionNames.length < 8) {
          console.warn(`⚠️ Only found ${collectionNames.length} collections, expected 8. Reconnecting...`);
        }
        
        // Force close and reconnect
        console.log('🔄 Closing existing connection to force reconnection...');
        await mongoose.connection.close();
        isConnected = false;
        // Wait a moment for connection to close
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (err) {
      console.warn(`⚠️ Error checking existing connection: ${err.message}. Reconnecting...`);
      await mongoose.connection.close().catch(() => {});
      isConnected = false;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } else if (mongoose.connection.readyState !== 0) {
    // Connection exists but might be in a bad state - close it
    console.log('🔄 Closing existing connection in bad state...');
    await mongoose.connection.close().catch(() => {});
    isConnected = false;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("✅ MongoDB already connected");
    return;
  }

  // Try Atlas first, then fallback to local
  const connectionOptions = {
    dbName: "myapp",
    serverSelectionTimeoutMS: 15000, // Increased timeout for Atlas connection
    socketTimeoutMS: 45000,
    connectTimeoutMS: 15000, // Increased timeout
    bufferCommands: true, // Enable buffering to handle connection timing
    maxPoolSize: 5,
    minPoolSize: 1,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    retryReads: true,
    // Additional connection options for better reliability
    directConnection: false, // Use SRV records for connection string
    tls: true, // Enable TLS for Atlas
    tlsAllowInvalidCertificates: false,
  };

  try {
    console.log("🔄 Connecting to MongoDB Atlas...");
    console.log("🔗 Connection URI:", process.env.MONGODB_URI ? "Set" : "Not set");
    
    // Parse the URI to check if it has a database name
    let uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not set!");
    }
    
    // Show sanitized URI for debugging (hide credentials)
    const sanitizedUri = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log("🔗 Connection URI (sanitized):", sanitizedUri);
    
    // Check if URI contains a database name
    const uriMatch = uri.match(/mongodb\+srv:\/\/[^/]+\/([^?]+)/);
    if (uriMatch && uriMatch[1]) {
      const dbNameInUri = uriMatch[1];
      console.log(`⚠️ URI contains database name: "${dbNameInUri}"`);
      
      if (dbNameInUri !== 'myapp') {
        console.warn(`⚠️ WARNING: URI database "${dbNameInUri}" differs from expected "myapp"`);
        console.warn(`⚠️ Removing database name from URI to use dbName option instead...`);
        
        // Remove database name from URI to let dbName option take precedence
        // Format: mongodb+srv://user:pass@host/dbname?options
        // We want: mongodb+srv://user:pass@host/?options or mongodb+srv://user:pass@host?options
        const match = uri.match(/^(mongodb\+srv:\/\/[^/]+\/)([^?]+)(\?.*)?$/);
        if (match) {
          const [, baseWithSlash, dbName, queryString] = match;
          uri = baseWithSlash + (queryString || '');
          console.log(`📝 Modified URI (database "${dbName}" removed):`, uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
        }
      }
    }
    
    // Extract cluster hostname for DNS testing
    const hostnameMatch = uri.match(/mongodb\+srv:\/\/([^/]+)/);
    if (hostnameMatch) {
      const hostname = hostnameMatch[1].split('@')[1] || hostnameMatch[1];
      console.log(`🌐 Attempting to connect to cluster: ${hostname}`);
    }
    
    console.log("🔄 Attempting connection with timeout:", connectionOptions.serverSelectionTimeoutMS, "ms");
    
    await mongoose.connect(uri || process.env.MONGODB_URI, connectionOptions);
    
    // Wait for connection to be ready
    await new Promise((resolve, reject) => {
      if (mongoose.connection.readyState === 1) {
        resolve();
      } else {
        mongoose.connection.once('open', resolve);
        mongoose.connection.once('error', reject);
      }
    });
    
    // Verify which database we're actually connected to
    const adminDb = mongoose.connection.db.admin();
    const admin = mongoose.connection.db.admin();
    
    // List all databases to see what's available
    try {
      const dbList = await admin.listDatabases();
      console.log(`📊 Available databases in cluster:`, dbList.databases.map(db => ({
        name: db.name,
        size: (db.sizeOnDisk / 1024 / 1024).toFixed(2) + ' MB'
      })));
      
      const myappDb = dbList.databases.find(db => db.name === 'myapp');
      if (myappDb) {
        console.log(`✅ Found "myapp" database in cluster`);
      } else {
        console.warn(`⚠️ WARNING: "myapp" database not found in cluster!`);
        console.warn(`⚠️ Available databases:`, dbList.databases.map(db => db.name).join(', '));
      }
    } catch (err) {
      console.warn(`⚠️ Could not list databases:`, err.message);
    }
    
    const actualDbName = mongoose.connection.db?.databaseName;
    console.log(`📊 Actually connected to database: "${actualDbName}"`);
    console.log(`📊 Expected database: "myapp"`);
    
    if (actualDbName !== 'myapp') {
      console.warn(`⚠️ WARNING: Connected to "${actualDbName}" but expected "myapp"!`);
      console.warn(`⚠️ This might be why you're not seeing all events.`);
    }
    
    // List all collections to verify
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      console.log(`📊 Collections found in "${actualDbName}":`, collectionNames);
      console.log(`📊 Total collections: ${collections.length}`);
      
      if (collectionNames.length < 8) {
        console.warn(`⚠️ WARNING: Expected 8 collections but found ${collectionNames.length}!`);
        console.warn(`⚠️ This might indicate connection to wrong database or cluster.`);
        console.warn(`⚠️ Please verify your MONGODB_URI points to the correct cluster.`);
      }
      
      // Check events collection specifically
      if (collectionNames.includes('events')) {
        const eventsCollection = mongoose.connection.db.collection('events');
        const eventsCount = await eventsCollection.countDocuments();
        console.log(`📊 Events collection has ${eventsCount} documents`);
        
        if (eventsCount < 14) {
          console.warn(`⚠️ WARNING: Expected 14 events but found ${eventsCount}!`);
        }
      }
    }
    
    isConnected = true;
    console.log("✅ MongoDB Atlas connected successfully");
    
  } catch (atlasError) {
    console.error("❌ Atlas connection failed!");
    console.error("Atlas error:", atlasError.message);
    console.error("Error code:", atlasError.code);
    
    // Check if it's a network/DNS issue
    if (atlasError.code === 'ECONNREFUSED' || atlasError.message.includes('querySrv')) {
      console.error("🌐 Network/DNS issue detected. Possible causes:");
      console.error("   1. Internet connection problem");
      console.error("   2. Firewall blocking MongoDB Atlas");
      console.error("   3. DNS resolution issue");
      console.error("   4. MongoDB Atlas cluster might be paused or unavailable");
      console.error("   5. Your local IP might not be whitelisted in Atlas Network Access");
      console.error("");
      console.error("💡 Solutions:");
      console.error("   1. Check your internet connection");
      console.error("   2. Verify MongoDB Atlas cluster is running (not paused)");
      console.error("   3. Add your current IP to Atlas Network Access whitelist");
      console.error("   4. Check firewall settings");
      console.error("   5. Try connecting from MongoDB Compass to verify cluster is accessible");
      console.error("");
      
      // Allow fallback for local development, but with clear warnings
      if (process.env.NODE_ENV === 'development' && process.env.ALLOW_LOCAL_MONGODB_FALLBACK === 'true') {
        console.warn("⚠️ DEVELOPMENT MODE: Allowing fallback to local MongoDB");
        console.warn("⚠️ WARNING: This will show outdated test data, not real-time events!");
        console.warn("⚠️ To see real-time events, fix Atlas connection and set ALLOW_LOCAL_MONGODB_FALLBACK=false");
      } else {
        console.error("⚠️ NOT falling back to local MongoDB - this would show incorrect data!");
        console.error("⚠️ Please fix Atlas connection to see real-time events.");
        console.error("⚠️ For local development, you can temporarily set ALLOW_LOCAL_MONGODB_FALLBACK=true");
        throw new Error(`Cannot connect to MongoDB Atlas: ${atlasError.message}. Please check your network and Atlas cluster status.`);
      }
    }
    
    console.warn("⚠️ Atlas connection failed, trying local MongoDB...");
    console.warn("⚠️ WARNING: Local MongoDB may have outdated test data!");
    
    try {
      // Fallback to local MongoDB (only for non-network errors)
      const localUri = "mongodb://localhost:27017/eklektikmama";
      console.log("🔄 Connecting to local MongoDB...");
      console.warn("⚠️ Using local MongoDB - events shown may be outdated test data!");
      
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
