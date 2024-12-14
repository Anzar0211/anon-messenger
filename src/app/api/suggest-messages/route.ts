// Import `GoogleGenerative` from the package we installed earlier.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Create an asynchronous function POST to handle POST 
// request with parameters request and response.
export async function POST(req:Request, res:Response) {

    try {
        // Access your API key by creating an instance of GoogleGenerativeAI we'll call it GenAI
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

        // Ininitalise a generative model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {

                temperature: 0.8,

                topK: 40,
                topP: 0.9,
            }
        })

        const data = await req.json()

        // Define a prompt varibale
        const prompt = data.body
        const randomVariations = [
            "Explore topics that reveal creativity and imagination.",
            "Focus on questions that invite playful and unexpected responses.",
            "Craft questions that encourage storytelling and personal reflection.",
            "Generate inquiries that spark curiosity and friendly interaction.",
            "Create prompts that reveal unique perspectives and experiences."
        ];
        const randomVariation = randomVariations[Math.floor(Math.random() * randomVariations.length)];

        const fullPrompt = `${prompt} ${randomVariation} `

        // Pass the prompt to the model and retrieve the output
        const result = await model.generateContent(fullPrompt)
        const response = await result.response;
        const output = await response.text();
        
        // Send the llm output as a server reponse object
        return NextResponse.json({ output: output })
    } catch (error) {

        return NextResponse.json({ 
            error: 'Failed to generate messages', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 })
    }
}
