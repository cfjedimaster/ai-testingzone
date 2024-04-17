import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GOOGLE_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME } , { apiVersion:'v1beta' });

async function callGemini(text, mimeType="text/plain") {

	const generationConfig = {
		temperature: 0.9,
		topK: 1,
		topP: 1,
		maxOutputTokens: 2048,
		response_mime_type:mimeType
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

	const result = await model.generateContent({
		contents: [
			{ role: "user", parts }
			],
		generationConfig,
		safetySettings,
	});

	//console.log(JSON.stringify(result,null,'\t'));

	try {

		if(result.response.promptFeedback && result.response.promptFeedback.blockReason) {

			return { error: `Blocked for ${result.response.promptFeedback.blockReason}` };
		}
		const response = result.response;
		return { response };
	} catch(e) {

		return {
			error:e.message
		}
	}
	
}

//let result = await callGemini('What is the nature of light? Your answer should be in valid JSON which includes an `answer` key with the value being your answer.');
let result = await callGemini('What is the nature of light');

console.log('Normal response using text...');
console.log(result.response.candidates[0].content.parts[0].text);

console.log('-'.repeat(80));

result = await callGemini('What is the nature of light? Answer in five to ten sentences.','application/json');

console.log('Normal response using application/json...');
console.log(result.response.candidates[0].content.parts[0].text);