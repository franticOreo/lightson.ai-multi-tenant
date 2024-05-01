
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' }); // Ensure your environment variables are loaded

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI_DEV);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;

async function testDatabaseConnection() {
    try {
        const db = await connectDB();
        console.log("Database connection is successful.");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

testDatabaseConnection();