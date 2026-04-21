// ============================================================
// config/db.js — MongoDB Connection
// Uses Mongoose to connect to MongoDB (local or Atlas)
// ============================================================
 
const mongoose = require('mongoose');
 
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Exit process on DB connection failure
    process.exit(1);
  }
};
 
module.exports = connectDB;
 