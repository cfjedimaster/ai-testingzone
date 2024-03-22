
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import fs from 'fs';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

// Requires Node 21.7.0
process.loadEnvFile();

// Google related
const MODEL_NAME = "gemini-1.5-pro-latest";
const API_KEY = process.env.GOOGLE_AI_KEY;

// Adobe releated
const REST_API = "https://pdf-services.adobe.io/";
const CLIENT_ID = process.env.PDF_SERVICES_CLIENT_ID;
const CLIENT_SECRET = process.env.PDF_SERVICES_CLIENT_SECRET;
const SOURCE_PDF = './adobe_security_properly_ocr.pdf';
const EXTRACTED_PDF = './extract.json';

async function delay(x) {
	return new Promise(resolve => {
		setTimeout(() => resolve(), x);
	});
}

async function getAccessToken(id, secret) {

	const params = new URLSearchParams();
	params.append('client_id', id);
	params.append('client_secret', secret);

	let resp = await fetch('https://pdf-services-ue1.adobe.io/token', { 
		method: 'POST', 
		headers: {
			'Content-Type':'application/x-www-form-urlencoded'
		},
		body:params 
	});

	let data = await resp.json();
	return data.access_token;
}

async function getUploadData(mediaType, token, clientId) {

	let body = {
		'mediaType': mediaType
	};
	body = JSON.stringify(body);

	let req = await fetch(REST_API+'assets', {
		method:'post',
		headers: {
			'X-API-Key':clientId,
			'Authorization':`Bearer ${token}`,
			'Content-Type':'application/json'
		},
		body: body
	});

	let data = await req.json();
	return data;
}

async function uploadFile(url, filePath, mediaType) {

	let stream = fs.createReadStream(filePath);
	let stats = fs.statSync(filePath);
	let fileSizeInBytes = stats.size;

	let upload = await fetch(url, {
		method:'PUT', 
		redirect:'follow',
		headers: {
			'Content-Type':mediaType, 
			'Content-Length':fileSizeInBytes
		},
		duplex:'half',
		body:stream
	});

	if(upload.status === 200) return;
	else {
		throw('Bad result, handle later.');
	}

}

async function pollJob(url, token, clientId) {

	let status = null;
	let asset; 

	while(status !== 'done') {
		let req = await fetch(url, {
			method:'GET',
			headers: {
				'X-API-Key':clientId,
				'Authorization':`Bearer ${token}`,
			}
		});

		let res = await req.json();

		status = res.status;
		if(status === 'done') {
			asset = res;
		} else {
			await delay(2000);
		}
	}

	return asset;
}

async function downloadFile(url, filePath) {
	let res = await fetch(url);
	const body = Readable.fromWeb(res.body);
	const download_write_stream = fs.createWriteStream(filePath);
	return await finished(body.pipe(download_write_stream));
}

async function extractJob(asset, token, clientId) {
	let body = {
		'assetID': asset.assetID
	}

	let resp = await fetch(REST_API + 'operation/extractpdf', {
		method: 'POST', 
		headers: {
			'Authorization':`Bearer ${token}`, 
			'X-API-KEY':clientId,
			'Content-Type':'application/json'
		},
		body:JSON.stringify(body)
	});

	return resp.headers.get('location');

}

async function runPrompt(text, question) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME }, { apiVersion:'v1beta'});

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
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
    {text: `
Given this document (delimited by dashes):

${text}
-------------------------------------------

${question}`},
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });

  const response = result.response;
  return response.text();
}


// STEP ONE
// Do we need to run code to extract our contents? Check first.
let extractedData = '';

if(!fs.existsSync(EXTRACTED_PDF)) {
  console.log('Need to extract the PDF.');

  let accessToken = await getAccessToken(CLIENT_ID, CLIENT_SECRET);
  console.log('Got our access token.');

  let uploadedAsset = await getUploadData('application/pdf', accessToken, CLIENT_ID);

  await uploadFile(uploadedAsset.uploadUri, SOURCE_PDF, 'application/pdf');
  console.log('Source PDF Uploaded.');

  let job = await extractJob(uploadedAsset, accessToken, CLIENT_ID);
  console.log('Job created. Now to poll it.');

  let result = await pollJob(job, accessToken, CLIENT_ID);
  console.log('Job is done.'); 

  await downloadFile(result.content.downloadUri, 'extract.json');
  console.log('All done.');

  extractedData = JSON.parse(fs.readFileSync(EXTRACTED_PDF,'utf8'));

} else {
  console.log('Using previously generated extracted PDF data.');
  extractedData = JSON.parse(fs.readFileSync(EXTRACTED_PDF,'utf8'));
}

// STEP TWO - Get the text
// Note that this could be done better.
let text = extractedData.elements.reduce((text, el) => {
	if(el.Text) text += el.Text + '\n';
	return text;
},'');

console.log('Passing text and prompt to Gemini....');
let result = await runPrompt(text, 'What is the summary? Also, what are the three key takeaways?');
console.log(`Result:\n\n${result}`);