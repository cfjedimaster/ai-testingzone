import fs from 'fs'; 
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GoogleAIFileManager } from "@google/generative-ai/server";

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GOOGLE_API_KEY;

const fileManager = new GoogleAIFileManager(API_KEY);

const schema = `
{
  "type": "object",
  "properties": {
    "category": {
      "type": "string",
      "enum": [
        "comedy",
        "tragedy",
        "history"
      ]
    },
    "reasoning": {
      "type": "string"
    }
  }
}
`;

const si = `
You categorize an input play into one of three categories: Comedy, Tragedy, History. You also return your reasoning.
`;

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: MODEL_NAME, 
	systemInstruction: {
		parts: [{ text:si }],
		role:"model"
	},
	generationConfig: {
		responseMimeType:'application/json',
		responseSchema:JSON.parse(schema)
	} 
});

async function classifyDocument(path) {


	const uploadResult = await fileManager.uploadFile(path, {
		mimeType:'application/pdf',
	});
	const file = uploadResult.file;

	let prompt = 'Categorize this play.';

	const result = await model.generateContent([
		prompt, 
		{
			fileData: {
				fileUri:file.uri, 
				mimeType:'application/pdf'
			}
		}
	]);

	//console.log(JSON.stringify(result,null,'\t'));

	try {

		if(result.response.promptFeedback && result.response.promptFeedback.blockReason) {

			return { error: `Blocked for ${result.response.promptFeedback.blockReason}` };
		}
		return result.response.candidates[0].content.parts[0].text;
	} catch(e) {
		// better handling
		return {
			error:e.message
		}
	}
	
}

async function delay(x) {
	return new Promise(resolve => {
		setTimeout(() => resolve(), x);
	});
}

(async () => {

	let files = fs.readdirSync('./').filter(f => f.endsWith('.pdf'));

	for(let f of files) {
		console.log(`Analyze ${f}`);
		let result = await classifyDocument(f);
		console.log(result);

		// for rate limiting
		await delay(30 * 1000);
	}

})();