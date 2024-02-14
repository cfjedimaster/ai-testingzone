import fs from 'fs/promises';
import 'dotenv/config';
import slugify from '@sindresorhus/slugify';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const MODEL_NAME = "gemini-pro-vision";
const API_KEY = process.env.GOOGLE_AI_KEY;

const SOURCE = './source/';
const OUTPUT = './output/';


async function getImageSummary(path) {
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

  // ToDo potentially - make mimeType actually check the image type
  const parts = [
    {text: "Write a one sentence short summary of this image. The sentence should be no more than five words.\n\n"},
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: Buffer.from(await fs.readFile(path)).toString("base64")
      }
    },
    {text: "\n"},
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });

  // This assumes a good response. Never assume.
  return result.response.candidates[0].content.parts[0].text.trim();
}


const files = await fs.readdir(SOURCE);
for(let file of files) {
	console.log(`Processing ${file}`);
	let result = await getImageSummary(SOURCE + file);
	// again, assumes jpg
	let newname = OUTPUT + slugify(result) + '.jpg';
	console.log(`Copying to ${newname}`);
	await fs.copyFile(SOURCE + file, newname);
}

console.log('Done');
