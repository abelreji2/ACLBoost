import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    const{ exerciseId } = await request.json();
    if (!exerciseId) {
        return new Response("Missing exerciseId", { status: 400 });
    }
    const prompt = 
    `Provide detailed guidance from the view of a physical therapist on how to perform the exercise: ${exerciseId}. 
     Use markdown formatting. Keep it short and concise. Include tips for proper form, common mistakes to avoid, benefits of the exercise, 
     equipment required, variations, and safety.`;

     try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });
        console.log(response);
        return Response.json({ message: response.choices[0].message.content });
    } catch (error) {
        console.error("Error fetching AI response:", error);
        return new Response("Error fetching AI response", { status: 500 });
    }
}