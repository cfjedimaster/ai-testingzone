import slugify from '@sindresorhus/slugify';
import fs from 'fs'; 

const API_KEY = process.env.GEMINI_API_KEY;

if(process.argv.length < 3) {
	console.log('Usage: node node_demo.mjs "prompt"');
	process.exit(1);
}

let prompt = process.argv[2];

let body = {
	instances: [
		{ prompt },
	],
	parameters: {
		aspectRatio:'4:3'
	}
};

let model_name = 'imagen-3.0-generate-002';
let resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model_name}:predict?key=${API_KEY}`, {
  method: 'POST',
  headers: {
	'Content-Type': 'application/json'
  },
  body: JSON.stringify(body)
});

let result = await resp.json();
for(let i=0; i<result.predictions.length; i++) {
	let ext = '.png';
	if(result.predictions[i].mimeType == 'image/jpeg') {
		ext = '.jpg';
	}

	let filename = `output/${slugify(prompt)}_${i+1}${ext}`;
	let buffer = Buffer.from(result.predictions[i].bytesBase64Encoded, 'base64');
	fs.writeFileSync(filename, buffer);
	console.log(`Saving ${filename}`);
}
