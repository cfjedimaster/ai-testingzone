import readline from 'readline';
import { styleText } from 'node:util';

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

async function chat(upload,question) {

  return (await model.generateContent([
      {
        fileData: {
          mimeType: upload.file.mimeType,
          fileUri: upload.file.uri
        }
    },
    { text: question },
    ])).response.text();

}

// Credit: https://stackoverflow.com/a/50890409/52160
function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

if(process.argv.length < 3) {
  console.log('Pass a path to a PDF file to use this tool.');
  process.exit();
}

let path = process.argv[2];

console.log(`Uploading ${path}`);
let upload = await uploadFile(path);
console.log('Ready to ask questions. To end the session, type quit');

let question = '';

while(question !== 'quit') {

	question = await askQuestion('Your question: ');
	if(question !== 'quit') {
		process.stdout.write('...working...');
		let resp = await chat(upload,question);
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		console.log(styleText('yellow',`Gemini: ${resp}`));
	}
}
