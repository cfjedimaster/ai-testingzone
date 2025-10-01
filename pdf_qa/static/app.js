import EmbedPDF from 'https://snippet.embedpdf.com/embedpdf.js';
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

// jQuery LIVES!
const $ = s => document.querySelector(s);

let $dropZone, $instructions, $pdfViewer, $chat, $userInput, $chatBtn;
let pdf;

document.addEventListener('DOMContentLoaded', init, false);
async function init() {
	console.log('welcome to the shit show');
	$dropZone = $('#dropZone');
	$instructions = $('#instructions');
	$pdfViewer = $('#pdf-viewer');
	$chat = $('#chat');
	$userInput = $('#userInput');
	$chatBtn = $('#chatBtn');

	$dropZone.addEventListener('dragover', e => {
		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';
	});

	$dropZone.addEventListener('drop', async e => {
		e.preventDefault();
		let files = e.dataTransfer.files;
		if(!files) return;
		if(files[0].type !== 'application/pdf') {
			alert('Drop PDF files only, please.');
			return;
		}
		pdf = files[0];

		// ok, we begin by kicking off the rendering process 
		$instructions.parentNode.removeChild($instructions);
		$pdfViewer.style.display = 'block';

		const viewer = EmbedPDF.init({
			type: 'container',
			target: document.getElementById('pdf-viewer'),
			src: URL.createObjectURL(pdf),
			plugins: {
				zoom: {
					defaultZoomLevel: 'fit-width',
				}
			}
		});

		// now we're going to send it to the server
		console.log('beginning file upload');
		let data = new FormData();
		data.append('pdf', pdf);
		let uploadReq = await fetch('/upload', {
			method:'POST',
			body:data
		});
		let resp = await uploadReq.json();

		if(resp.status === 'Ok') initChat();
		else {
			alert('Something has gone wrong. I\'m terribly sorry about this.');
		}

	});
}

/*
My responsibility is to init the chat UI in the right hand side, 
ask for the initial summary, 
and listen for new chat stuff after the summary is done.
*/
async function initChat() {
	logChat('Starting to parse your PDF and creating a summary...');
	let summary = await getSummary();
	logChat(`Here's the summary returned from Gemini:<br><br>${marked.parse(summary)}`);
	logChat('You can now enter your questions below.<br>');

	$userInput.removeAttribute('disabled');
	$chatBtn.removeAttribute('disabled');
	$chatBtn.addEventListener('click', doChat);
}

async function doChat() {
	let input = $userInput.value.trim();
	if(input === '') return;
	console.log('sending chat', input);

	logChat(`User asked: ${input}`);
	$userInput.value = '';
	$chat.scrollTop = $chat.scrollHeight;

	$chatBtn.setAttribute('disabled','disabled');
	let result = await getChat(input);
	console.log('result', result);
	logChat(marked.parse(result));
	$chat.scrollTop = $chat.scrollHeight;
	$chatBtn.removeAttribute('disabled');
}

function logChat(s) {
	$chat.innerHTML += s + '<br/>';
}

async function getSummary() {
	let req = await fetch('/summary');
	let res = await req.json();
	console.log(marked.parse(res.result));
	return res.result;
}

async function getChat(s) {
	let req = await fetch('/chat', {
		method:'post',
		headers: {
			'Content-Type':'application/json'
		},
		body: JSON.stringify({ input: s })
	});
	let res = await req.json();
	console.log(marked.parse(res.result));
	return res.result;
}