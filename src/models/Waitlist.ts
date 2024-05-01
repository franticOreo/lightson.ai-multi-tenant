import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    instagramHandle: {
        type: String,
        required: true,
        minLength: 5
    },
    createdAt: {
        type: Date,
        default: Date.now // This will automatically set the date when a new record is created
    }
});

const Waitlist = mongoose.model('Waitlist', waitlistSchema);

export default Waitlist;