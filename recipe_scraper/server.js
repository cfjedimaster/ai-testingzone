import * as http from 'http';
import fs from 'fs'; 
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from "@google/generative-ai/server";


const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GOOGLE_API_KEY;

const fileManager = new GoogleAIFileManager(API_KEY);

const schema = `
{
  "description": "A recipe.",
  "type": "object",
	"properties": {
		"name": {
			"type":"string"
		},
		"ingredients": {
			"type":"array",
			"items": {
				"type":"string"
			}
		},
		"steps": {
			"type":"array",
			"items": {
				"type":"string"
			}
		}
	},
	"required": ["name","ingredients","steps"]
}
`;


const si = `
You are an API that attempts to parse HTML content and find a recipe. You will try to find the name, ingredients, and 
directions. You will return the recipe in a JSON object. If you are unable to find a recipe, return nothing.
`;

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: MODEL_NAME, 
	systemInstruction: {
		parts: [{ text:si }],
		role:"model"
	} 
});

async function callGemini(html) {

	// Store to a file temporarily - note the hard coded path, should be a uuid
	fs.writeFileSync('./test_temp.html', html, 'utf8');

	const uploadResult = await fileManager.uploadFile('./test_temp.html', {
		mimeType:'text/html',
		displayName: "temp html content",
	});
	const file = uploadResult.file;

	const generationConfig = {
		temperature: 0.9,
		topK: 1,
		topP: 1,
		maxOutputTokens: 2048,
		responseMimeType:'application/json',
		responseSchema:JSON.parse(schema)
	};

	

	let text = `
Given the HTML content, attempt to find a recipe.
	`;

	const parts = [
    	{text},
		{
			fileData: {
				fileUri:file.uri, 
				mimeType:'text/html'
			}
		}
  	];

	console.log('calling api');
	const result = await model.generateContent({
		contents: [{ role: "user", parts }],
		generationConfig
	});

	console.log(JSON.stringify(result,null,'\t'));

	try {

		if(result.response.promptFeedback && result.response.promptFeedback.blockReason) {

			return { error: `Blocked for ${result.response.promptFeedback.blockReason}` };
		}
		const response = result.response.candidates[0].content.parts[0].text;
		return response;
	} catch(e) {
		// better handling
		return {
			error:e.message
		}
	}
	
}

async function handler(req, res) {
	console.log('Entered handler.', req.method, req.url);

	if(req.method === 'GET' && req.url.indexOf('favicon.ico') === -1) {
		res.writeHead(200, { 'Content-Type':'text/html' });
		res.write(fs.readFileSync('./index.html'));
		res.end();
	} else if(req.method === 'POST' && req.url === '/api') {

		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		});

		req.on('end', async () => {
			body = JSON.parse(body);

			console.log('BODY:\n', JSON.stringify(body, null, '\t'));

			let htmlReq = await fetch(body.url);
			let htmlText = await htmlReq.text();
			let result;

			try {
				result = await callGemini(htmlText);
			} catch(e) {
				console.error('Issue calling API', e);
				result = { status:'Error' };
			}

			res.writeHead(200, { 'Content-Type':'application/json' });
			res.write(result);
			res.end();

		});

	}

}

const server = http.createServer(handler);
server.listen(3000);
console.log('Listening on port 3000');