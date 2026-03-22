import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

export const testAi = () => {
    model.invoke("who is alakh panday?").then((response) => {
        console.log(response.text);
    }).catch((err) => {console.log("testAi failed: ", err);
    })
}