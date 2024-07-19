import {
  GoogleGenerativeAI
} from '@google/generative-ai';

import { FileState, GoogleAIFileManager, GoogleAICacheManager } from '@google/generative-ai/server';

const MODEL_NAME = 'models/gemini-1.5-flash-001';
const API_KEY = process.env.GEMINI_API_KEY;
const fileManager = new GoogleAIFileManager(API_KEY);
const cacheManager = new GoogleAICacheManager(API_KEY);
const genAI = new GoogleGenerativeAI(API_KEY);

// System instructions used for both tests
let si = 'You are an English professor for middle school students and can provide help for students struggling to understand classical works of literature.';

/*
const listResult = await cacheManager.list();
listResult.cachedContents.forEach((cache) => {
  //console.log(cache);
});
await cacheManager.delete('cachedContents/tdmrxciimmq0');
process.exit(1);
*/


async function uploadToGemini(path, mimeType) {
	const fileResult = await fileManager.uploadFile(path, {
		mimeType,
		displayName: path,
	});

	let file = await fileManager.getFile(fileResult.file.name);
	while(file.state === FileState.PROCESSING) {
		console.log('Waiting for file to finish processing');
		await new Promise(resolve => setTimeout(resolve, 2_000));
		file = await fileManager.getFile(fileResult.file.name);
	}

  return file;
}

// First, upload the book to Google 
let book = './pride_and_prejudice.txt';
let bookFile = await uploadToGemini(book, 'text/plain');
console.log(`${book} uploaded to Google.`);

let cache = await cacheManager.create({
	model: MODEL_NAME, 
	displayName:'pride and prejudice', 
	systemInstruction:si,
	contents: [
		{
			role:'user',
			parts:[
				{
					fileData: {
						mimeType:bookFile.mimeType, 
						fileUri: bookFile.uri
					}
				}
			]
		}
	],
	ttlSeconds: 60 * 10 // ten minutes
});

// used for both tests.
let contents = [
		{
			role:'user',
			parts: [
				{
					text:'Describe the major themes of this work and then list the major characters.'
				}
			]
		}
	];

let contents2 = [
		{
			role:'user',
			parts: [
				{
					text:'What historical period is the book based on?'
				}
			]
		}
	];

let genModel = genAI.getGenerativeModelFromCachedContent(cache);

let now = new Date();
let result = await genModel.generateContent({
	contents
});
let duration = (new Date()) - now;

console.log(result.response.usageMetadata);
console.log(`with cache, duration is ${duration}`);


now = new Date();
result = await genModel.generateContent({
	contents:contents2
});
duration = (new Date()) - now;

console.log(result.response.usageMetadata);
console.log(`with cache, second prompt, duration is ${duration}`);

console.log('-'.repeat(80));

let modelWOCache = genAI.getGenerativeModel({ 
	model: MODEL_NAME,
	systemInstruction: {
		parts: [{ text:si }],
		role:"model"
	} 
});

/*
We need to add the file ref to contents.
*/
contents[0].parts.push({
 fileData: {
      fileUri:bookFile.uri,
      mimeType:bookFile.mimeType
    }
});

contents2[0].parts.push({
 fileData: {
      fileUri:bookFile.uri,
      mimeType:bookFile.mimeType
    }
});

now = new Date();
result = await modelWOCache.generateContent({
	contents
});
duration = (new Date()) - now;

console.log(result.response.usageMetadata);
console.log(`without cache, duration is ${duration}`);

now = new Date();
result = await modelWOCache.generateContent({
	contents:contents2
});
duration = (new Date()) - now;

console.log(result.response.usageMetadata);
console.log(`without cache, second prompt, duration is ${duration}`);
