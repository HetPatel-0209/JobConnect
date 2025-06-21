const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        console.log('MongoDB URI:', uri.replace(/\/\/.*:.*@/, '//***:***@')); // Log URI without credentials

        const connect = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000, // 45 seconds socket timeout
        });

        console.log('✅ MongoDB connected successfully!');

        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error: ', err);
        });
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        return connect;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;