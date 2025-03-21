import * as http from 'http';
import fs from 'fs'; 
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { GoogleAIFileManager } from "@google/generative-ai/server";

import mime from 'mime';

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GOOGLE_API_KEY;

const si = `
You are professional photographer and you review photos. You are incredibly mean spirited and will rarely say anything good about a photo.
`;

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: MODEL_NAME, 
	systemInstruction: {
		parts: [{ text:si }],
		role:"model"
	} 
});

const fileManager = new GoogleAIFileManager(API_KEY);

async function callGemini(photo) {

	/*
	I'm sent b64 data, lets to binary that thing and store it temporarily. Note
	I've hard coded a name here, it should be a UUID instead.
	*/

	photo = photo.replace(/data:.*?;base64,/, '');
	let buf = Buffer.from(photo, 'base64');
	fs.writeFileSync('./test_temp.jpg', buf);

	const uploadResult = await fileManager.uploadFile('./test_temp.jpg', {
		mimeType:'image/jpeg',
		displayName: "temp cemera content",
	});
	const file = uploadResult.file;

	const generationConfig = {
		temperature: 0.9,
		topK: 1,
		topP: 1,
		maxOutputTokens: 2048,
	};

	const safetySettings = [
		{ category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE, },
		{ category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,	threshold: HarmBlockThreshold.BLOCK_NONE, },
		{ category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE, },
		{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE, },
	];
	
	let text = 'Roast the attached picture.';

	const parts = [
    	{text},
		{
			fileData: {
				fileUri:file.uri, 
				mimeType:'image/jpeg'
			}
		}
  	];

	const result = await model.generateContent({
		contents: [{ role: "user", parts }],
		generationConfig,
		safetySettings
	});

	console.log(JSON.stringify(result,null,'\t'));

	try {

		if(result.response.promptFeedback && result.response.promptFeedback.blockReason) {

			return { error: `Blocked for ${result.response.promptFeedback.blockReason}` };
		}
		const response = result.response.candidates[0].content.parts[0].text;
		return { response };
	} catch(e) {
		// better handling
		return {
			error:e.message
		}
	}
	
}

// Simple utility to see if the url req matches a static asset. 
function urlToStatic(u) {
	if(u === '/') u = '/index.html';
	// simple lame path traversal check
	u = u.replaceAll('..','');
	let path = `./static${u}`;
	console.log('path', path);
	if(fs.existsSync(path)) {
		return {
			mimeType:mime.getType(path),
			content: fs.readFileSync(path, 'utf8')
		}
	} else return '';
}

async function handler(req, res) {

	if(req.method === 'GET' && req.url.indexOf('favicon.ico') === -1) {
		let file = await urlToStatic(req.url);
		if(file) {
			res.writeHead(200, { 'Content-Type': file.mimeType });
			res.write(file.content);
		} else {
			res.writeHead(404);
		}
		res.end();
	} else if(req.method === 'POST' && req.url === '/roast') {

		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		});

		req.on('end', async () => {
			body = JSON.parse(body);

			//console.log('BODY:\n', JSON.stringify(body, null, '\t'));

			let result;

			try {
				result = await callGemini(body.imgdata);
			} catch(e) {
				console.error('Issue calling API', e);
				result = { status:'Error' };
			}

			res.writeHead(200, { 'Content-Type':'application/json' });
			res.write( JSON.stringify({text:result.response}) );
			res.end();

		});

	}

}

const server = http.createServer(handler);
server.listen(3000);
console.log('Listening on port 3000');