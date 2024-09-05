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
const uploadResponse = await fileManager.uploadFile("adobe_security_properly_ocr.pdf", {
  mimeType: "application/pdf",
  displayName: "Adobe Security PDF",
});

// Generate content using text and the URI reference for the uploaded file.
let result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri
      }
    },
    { text: "Can you summarize this document as a bulleted list?" },
  ]);

// Output the generated text to the console
console.log(result.response.text())

console.log('-'.repeat(80));

result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResponse.file.mimeType,
        fileUri: uploadResponse.file.uri
      }
    },
    { text: "Return a list of categories that define the content of this document. Return your result as a comma-delimited list." },
  ]);

// Output the generated text to the console
console.log(result.response.text())

