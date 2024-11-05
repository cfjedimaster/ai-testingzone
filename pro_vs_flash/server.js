import * as http from 'http';
import fs from 'fs'; 
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const PRO_MODEL_NAME = "gemini-1.5-pro-latest";
const FLASH_MODEL_NAME = "gemini-1.5-flash-latest"
const FLASH_MODEL_8B_NAME = "gemini-1.5-flash-8b";

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const pro_model = genAI.getGenerativeModel({ model: PRO_MODEL_NAME });
const flash_model = genAI.getGenerativeModel({ model: FLASH_MODEL_NAME });
const flash_model_8B = genAI.getGenerativeModel({ model: FLASH_MODEL_8B_NAME });

async function callGemini(text, model) {

	const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 64,
	maxOutputTokens: 8192,
	responseMimeType: "text/plain",
	};

	const safetySettings = [
		{ category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
		{ category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,	threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
		{ category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
		{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
	];

	const parts = [
    	{text},
  	];

	//console.log(JSON.stringify(result,null,'\t'));

	try {

		const result = await model.generateContent({
			contents: [{ role: "user", parts }],
			generationConfig,
			safetySettings,
		});

		if(result.response.promptFeedback && result.response.promptFeedback.blockReason) {

			return { error: `Blocked for ${result.response.promptFeedback.blockReason}` };
		}
		return result.response.text();
	} catch(e) {
		// better handling
		console.log('Error', e);
		return {
			error:e.message
		}
	}
	
}

async function handler(req, res) {
	console.log('Entered handler.', req.method, req.url);

	if(req.method === 'GET' && req.url.indexOf('favicon.ico') === -1) {
		res.writeHead(200, { 'Content-Type':'text/html' });
		res.write(fs.readFileSync('./demo.html'));
		res.end();

	} else if(req.method === 'POST' && req.url === '/api') {

		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		});

		req.on('end', async () => {
			body = JSON.parse(body);
			let airesult;
			let now = new Date();
			if(body.model === 'pro') {
				console.log('using pro');
				airesult = await callGemini(body.prompt,pro_model);
			} else if(body.model === 'flash') {
				console.log('using flash');
				airesult = await callGemini(body.prompt,flash_model);
			} else {
				console.log('using flash8b');
				airesult = await callGemini(body.prompt,flash_model_8B);
			}
			let duration = (new Date()) - now;
			let result = { duration, airesult };
			//let result = 'the result '+body.prompt;
			res.writeHead(200, { 'Content-Type':'application/json' });
			res.write(JSON.stringify(result));
			res.end();

		});

	}

}

const server = http.createServer(handler);
server.listen(3000);
console.log('Listening on port 3000');