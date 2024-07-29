import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

import fs from 'fs';

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

async function processPrompt(prompt) {

	let parts = [
    	{text:prompt},
  	];

	let tokens = await model.countTokens({
		contents: [{ role: "user", parts }]
	});
	console.log('got tokens?', tokens);

	let result = await model.generateContent({
		contents: [{ role: "user", parts }]
	});

  const response = result.response;
  return response.text();
}

if(process.argv.length < 3) {
  console.log('Pass a path to a prompt.');
  process.exit();
}

let promptFile = process.argv[2];
let prompt = fs.readFileSync(promptFile, 'utf8');

console.log(`Sending prompt...`);
let result = await processPrompt(prompt);
console.log(result);