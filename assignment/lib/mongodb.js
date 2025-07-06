// lib/mongodb.js - Atlas-optimized version
import { MongoClient } from "mongodb";

// Validate environment variable
if (!process.env.MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

const uri = process.env.MONGODB_URI;

// Validate the URI format for MongoDB Atlas
if (!uri.startsWith("mongodb+srv://") && !uri.startsWith("mongodb://")) {
  throw new Error(
    "MONGODB_URI must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)"
  );
}

// MongoDB Atlas optimized options
const options = {
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Atlas-specific optimizations
  retryWrites: true,
  w: "majority",
  appName: "finance-dashboard", // Help identify your app in Atlas logs
};

let client;
let clientPromise;

// Connection setup optimized for Atlas
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client
      .connect()
      .then((client) => {
        console.log("Connected to MongoDB Atlas");
        return client;
      })
      .catch((error) => {
        console.error("MongoDB Atlas connection error:", error);
        throw error;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client
    .connect()
    .then((client) => {
      console.log("Connected to MongoDB Atlas (Production)");
      return client;
    })
    .catch((error) => {
      console.error("MongoDB Atlas connection error (Production):", error);
      throw error;
    });
}

export default clientPromise;

// Helper function to test connection
export async function testConnection() {
  try {
    const client = await clientPromise;
    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB Atlas connection successful");
    return true;
  } catch (error) {
    console.error("MongoDB Atlas connection failed:", error);
    return false;
  }
}
