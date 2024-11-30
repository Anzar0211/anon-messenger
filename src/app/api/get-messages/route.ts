import {getServerSession} from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import {User} from 'next-auth';
import mongoose from 'mongoose';


export async function GET(request:Request){
    await dbConnect();
    const session=await getServerSession(authOptions);
    const user:User=session?.user;

    if(!session || !session.user){
        return Response.json({
            success:'false',
            message:'Unauthorized'
        },{status:401})
    }
    const userId=new mongoose.Types.ObjectId(user._id);
    try {
        const user=await UserModel.aggregate(
            [
                {
                    $match:{
                        id:userId
                    }
                },
                {
                    $unwind:"$messages"
                },
                {
                    $sort:{
                        "messages.createdAt":-1
                    }
                },
                {
                    $group:{
                        _id:"$_id",
                        messages:{
                            $push:"$messages"
                        }
                    }
                }
            ]
        )
        if(!user || user.length===0){
            return Response.json({
                success:'true',
                message:'Not Authenticated'
            },{status:401})
        }
        return Response.json({
            success:'true',
            messages:user[0].messages
        })
    } catch (error) {
        console.error('Error getting messages',error);
        return Response.json({
            success:'false',
            message:'Error getting messages'
        },{
            status:500
        })
    }
}