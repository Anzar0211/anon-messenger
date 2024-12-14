import nodemailer from "nodemailer";

import { ApiResponse } from "@/types/ApiResponse";



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.PASSWORD, 
  },
});

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {

    await transporter.sendMail({
      from: '"Mystery Messenger" <anzarkhan790@gmail.com>', 
      to: email, 
        subject: "Verify your email address", 
        text: `Hello ${username},\n\nPlease verify your email address by entering the following code on the verification page: ${verifyCode}\n\nIf you did not sign up for an account, please ignore this email.\n\nThanks,\nMystery Messenger`, 
    });

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error sending verification email", error);
    return {
      success: false,
      message: "Error sending verification email",
    };
  }
}
