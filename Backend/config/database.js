const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const uri = process.env.MONGO_URI;

        if (!uri) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        const connect = await mongoose.connect(uri);

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