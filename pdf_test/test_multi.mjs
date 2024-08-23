import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

let API_KEY = process.env.GOOGLE_AI_KEY;

// Initialize GoogleAIFileManager with your API_KEY.
const fileManager = new GoogleAIFileManager(API_KEY);
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  // Choose a Gemini model.
  model: "gemini-1.5-flash",
});

// Upload the file and specify a display name.
const uploadResponse = await fileManager.uploadFile("hamlet.pdf", {
  mimeType: "application/pdf",
  displayName: "Hamlet",
});

const uploadResponse2 = await fileManager.uploadFile("romeo-and-juliet.pdf", {
  mimeType: "application/pdf",
  displayName: "Romeo and Juliet",
});

console.log('Uploaded both files.');

// Generate content using text and the URI reference for the uploaded file.
let result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri
      }
    },
    {
      fileData: {
        mimeType: uploadResponse2.file.mimeType,
        fileUri: uploadResponse2.file.uri
      }
    },

    { text: "Compare these two plays and discuss similar themes as well as major differences." },
  ]);

// Output the generated text to the console
console.log(result.response.text())

console.log('-'.repeat(80));

