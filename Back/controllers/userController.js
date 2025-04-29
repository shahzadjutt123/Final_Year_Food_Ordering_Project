import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcrypt"
import validator from 'validator'
import nodemailer from 'nodemailer'
import NodeCache from "node-cache"; // For temporary storage
const tempUserCache = new NodeCache({ stdTTL: 300 }); // Store for 5 minutes



const loginUser= async(req, res)=>{
    const {email,password}=req.body;
    try {
        const user= await userModel.findOne({email});

        if(!user){
            return res.json({success:false,message:"User does't  exist"})
        }
        const isMatch= await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.json({success:false,message:"Invalid Password"})
        }

        const token=createToken(user._id);
        res.json({success:true,token})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}

const registerUser = async (req, res) => {
    const {name, email, password, countryCode, phone } = req.body;

    try {
        // Name Validation (Only Alphabets Allowed, No Numbers or Special Characters)
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!name || name.length < 3 || !nameRegex.test(name)) {
            return res.json({ success: false, message: "Please enter a valid name (at least 3 characters, only letters allowed)" });
        }

        // Email Validation (Format Check)
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // Additional Email Validation (Reject emails like '123@gmail.com')
        const emailRegex = /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.json({ success: false, message: "Please enter a meaningful email address" });
        }

        // Password Validation (Strong Password Check)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.json({ success: false, message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character" });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.json({ success: false, message: "Email or phone already in use" });
        }

        // Generate a 6-digit verification code
        const emailOTP = Math.floor(100000 + Math.random() * 900000);

        // Hash the user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Store user in temporary cache (NOT database yet)
        tempUserCache.set(email, {
            name,
            email,
            password: hashedPassword,
            countryCode,
            phone,
            verificationCode: emailOTP,
            emailVerified: false,
        });
        // Send verification email
        await sendVerificationEmail(email, emailOTP);
        res.json({
            success: true,
            message: "Verification codes sent to email. Please verify your account.",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Send Email Verification Code
const sendVerificationEmail = async (email, code) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Your Verification Code",
            text: `Your email verification code is: ${code}`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Verification email sent to ${email}`);
        return true;

    } catch (error) {
        console.error("❌ Error sending email:", error);
        return false;
    }
};
const verifyUser = async (req, res) => {
    const { email, emailCode} = req.body;

    try {
         // Get user from temporary storage
         const userData = tempUserCache.get(email);
         if (!userData) {
             return res.json({ success: false, message: "Verification expired. Please sign up again." });
         }
         // Check if OTP matches
         if (userData.verificationCode.toString() !== emailCode.toString()) {
            return res.json({ success: false, message: "Invalid verification code" });
        }
         // Mark as verified and save to DB
         const newUser = new userModel({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            emailVerified: true,
            countryCode: userData.countryCode,
            phone: userData.phone,
        });

        await newUser.save();
         // Remove from temporary storage
         tempUserCache.del(email);

         res.json({ success: true, message: "Verification successful. You can now log in." });
     } catch (error) {
         console.error("Error in verifyUser:", error);
         res.status(500).json({ success: false, message: "Internal server error" });
     }
 };




export {loginUser,registerUser,verifyUser}











