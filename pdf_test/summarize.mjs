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

async function uploadFile(path) {
  // assumes /, kinda bad
  let name = path.split('/').pop();

  // Upload the file and specify a display name.
  return await fileManager.uploadFile(path, {
    mimeType: "application/pdf",
    displayName: name,
  });

};

async function summarize(upload) {

  return (await model.generateContent([
      {
        fileData: {
          mimeType: upload.file.mimeType,
          fileUri: upload.file.uri
        }
    },
    { text: "Can you summarize this document?" },
    ])).response.text();

}

/*
// Output the generated text to the console
console.log(result.response.text())

console.log('-'.repeat(80));
*/

if(process.argv.length < 3) {
  console.log('Pass a path to a PDF file to use this tool.');
  process.exit();
}

let path = process.argv[2];

console.log(`Upload ${path}`);
let upload = await uploadFile(path);
console.log('Asking for a summary...');
let summary = await summarize(upload);
console.log('-'.repeat(80));
console.log(summary);
