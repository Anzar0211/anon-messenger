import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
    
    try {
        await dbConnect();
        console.log('database connected');
        
        const { username, email, password } = await req.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        });

        if (existingUserVerifiedByUsername) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Username already exists'
            }), { status: 400 });
        }

        const existingUserByEmail = await UserModel.findOne({ email });
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return new Response(JSON.stringify({
                    success: false,
                    message: 'User already exists with this email'
                }), { status: 400 });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour from now
                await existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            });

            await newUser.save();
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        console.log(emailResponse);
        
        if (!emailResponse.success) {
            return new Response(JSON.stringify({
                success: false,
                message: emailResponse.message
            }), { status: 500 });
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'User registered successfully. Please verify your email address'
        }), { status: 201 });
    } catch (error) {
        console.error('Error Registering User', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error Registering User'
        }), { status: 500 });
    }
}