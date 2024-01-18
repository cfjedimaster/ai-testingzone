
import fs from 'fs/promises';
import 'dotenv/config';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const MODEL_NAME = "gemini-pro-vision";
const API_KEY = process.env.GOOGLE_AI_KEY;


async function detectPhoto(path) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.4,
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const parts = [
    {text: "Look at the following photo and tell me if it's a photo, a screenshot, or a meme. Answer with just one word.\n"},
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: Buffer.from(await fs.readFile(path)).toString("base64")
      }
    },
    {text: "\n\n"},
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });

  const response = result.response;
  return response.text();
}

const root = '/mnt/c/Users/ray/Desktop/source_for_detector/';
let files = await fs.readdir(root);
for(const file of files) {
	console.log(`Check to see if ${file} is a photo, meme, or screenshot...`);
	let result = await detectPhoto(root + file);
	console.log(result);
}