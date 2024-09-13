import * as http from 'http';
import fs from 'fs'; 
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GOOGLE_API_KEY;

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

	const generationConfig = {
		temperature: 0.9,
		topK: 1,
		topP: 1,
		maxOutputTokens: 2048,
		responseMimeType:'application/json',
		responseSchema:JSON.parse(schema)
	};

	
	const safetySettings = [
		{ category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
		{ category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,	threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
		{ category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
		{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE, },
	];
	
console.log('len?', html.length);

	let text = `
Given the HTML content below, attempt to find a recipe:

${html}
	`;

	const parts = [
    	{text},
  	];

	const test0 = await model.countTokens({
		contents: [{ role: "user", parts }]
	});

	console.log('TOKEN TEST', test0);

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

let htmlReq = await fetch('https://www.allrecipes.com/recipe/10275/classic-peanut-butter-cookies');
let htmlText = await htmlReq.text();

let result = await callGemini(htmlText);
console.log('Result:', result);