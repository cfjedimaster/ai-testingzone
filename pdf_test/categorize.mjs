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

async function categorize(upload) {

  return (await model.generateContent([
      {
        fileData: {
          mimeType: upload.file.mimeType,
          fileUri: upload.file.uri
        }
    },
    { text: "Return the topics covered in this document as a comma-delimited list." },
    ])).response.text();

}

if(process.argv.length < 3) {
  console.log('Pass a path to a PDF file to use this tool.');
  process.exit();
}

let path = process.argv[2];

console.log(`Upload ${path}`);
let upload = await uploadFile(path);
console.log('Asking for the categories...');
let cats = await categorize(upload);
console.log('-'.repeat(80));
console.log(cats);
