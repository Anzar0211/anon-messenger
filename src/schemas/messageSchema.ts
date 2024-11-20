import {z} from 'zod';

export const messageSchema=z.object({
    content:z
            .string()
            .min(10,{message:"Content must be at least 10 Characters long"})
            .max(500,{message:"Content must be at most 500 Characters long"})
})