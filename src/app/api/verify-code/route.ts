import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export async function POST(request:Request){
    await dbConnect();
    try {
        const{username,code}=await request.json();
        const decodedUsername=decodeURIComponent(username);
        const user=await UserModel.findOne({username:decodedUsername});
        if(!user){
            return Response.json({
                success:'false',
                message:'User not found'
            },{status:404})
        }
        const isCodeValid=user.verifyCode===code;
        const isCodeExpired=new Date(user.verifyCodeExpiry) > new Date();

        if(isCodeValid && isCodeExpired){
            user.isVerified=true;
            await user.save();
            return Response.json({
                success:'true',
                message:'User verified successfully'
            },{status:200})
        }else if(!isCodeExpired){
            return Response.json({
                success:'false',
                message:'Code expired'
            },{status:400})
        }else{
            return Response.json({
                success:'false',
                message:'Invalid code'
            },{status:400})
        }

    } catch (error) {
        console.error('Error verifying user',error);
        return Response.json(
            {
            success:'false',
            message:'Error checking username'
            },
            {
                status:500
            }
        )
    }
}