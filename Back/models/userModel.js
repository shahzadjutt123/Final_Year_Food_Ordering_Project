import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    cartData: { type: Object, default: {} }, // User cart data
    googleId: { type: String, unique: true, sparse: true }, // 👈 Google se unique ID aayegi

    // Email Verification
    verificationCode: { type: Number }, // OTP for email
    emailVerified: { type: Boolean, default: false }, // Email verification status

    // Phone Number Verification
    countryCode: { type: String }, // e.g., "+92"
    phone: { type: String, unique: true }, // User's phone number

    // Embedded chatMessages for storing conversations
    chatMessages: [
        {
            sender: { type: String, enum: ['user', 'bot'], required: true }, // 'user' or 'bot'
            text: { type: String, required: true }, // The actual message content
            timestamp: { type: Date, default: Date.now }, // Timestamp for the message
        }
    ]
}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
