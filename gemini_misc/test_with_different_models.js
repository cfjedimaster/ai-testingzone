/*
The purpose of this is to let me quickly test prompts with multiple models at once, showing output as well as timing info.
*/

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function getResponse(text, modelName) {

	// determine if v1Beta always needed
	const model = genAI.getGenerativeModel({ model: modelName } , { apiVersion:'v1beta' });

	const generationConfig = {
		temperature: 0.9,
		topK: 1,
		topP: 1,
		maxOutputTokens: 2048,
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
		contents: [{ role: "user", parts }],
		generationConfig,
		safetySettings,
	});

	//console.log(JSON.stringify(result,null,'\t'));

	try {

		if(result.response.promptFeedback && result.response.promptFeedback.blockReason) {

			return { error: `Blocked for ${result.response.promptFeedback.blockReason}` };
		}

		return result;
	} catch(e) {
		// better handling
		return {
			error:e.message
		}
	}

}

let prompt = `
Describe the basic principal of calculus, including a short history of the subject, what concepts it covers, 
and what practical applications it enables.
`;

/*
 Note to self, I stopped outputting the results as while they differed, the 'shape' was the same and
 I'm more concerned with timing.
*/

console.time('test1');
let test1 = await getResponse(prompt,'gemini-1.5-pro-latest');
//console.log(JSON.stringify(test1,null,'\t'));
console.log('Timing for first prompt, gemini-1.5-pro-latest');
console.timeEnd('test1');

console.log('x'.repeat(80));

console.time('test2');
let test2 = await getResponse(prompt,'gemini-1.5-spark-latest');
//console.log(JSON.stringify(test2,null,'\t'));
console.log('Timing for first prompt, gemini-1.5-spark-latest');
console.timeEnd('test2');

console.log('x'.repeat(80),'\n');

prompt = `
Summarize the overarching plot and story of the Lord of the Rings in two to three paragraphs. Include plot elements
as well as themes of the story.
`;

console.time('test3');
let test3 = await getResponse(prompt,'gemini-1.5-pro-latest');
//console.log(JSON.stringify(test1,null,'\t'));
console.log('Timing for second prompt, gemini-1.5-pro-latest');
console.timeEnd('test3');

console.log('x'.repeat(80));

console.time('test4');
let test4 = await getResponse(prompt,'gemini-1.5-spark-latest');
//console.log(JSON.stringify(test2,null,'\t'));
console.log('Timing for second prompt, gemini-1.5-spark-latest');
console.timeEnd('test4');
