let $chat, $send, $log;
let currentImage;

document.addEventListener('DOMContentLoaded', init, false);
async function init() {

	$chat = document.querySelector('#chat');
	$send = document.querySelector('#send');
	$log = document.querySelector('#log');

	$send.addEventListener('click', sendMessage, false);

}

async function sendMessage() {
	let msg = $chat.value.trim();
	if(msg === '') return;

	$send.disabled = true;
	console.log('user message: ', msg);
	
	$chat.value = '';

	$log.innerHTML += `
	<p class="userMessage">You said: ${msg}</p>
	`;

	let body = {};
	body.message = msg;

	if(currentImage) body.picture = currentImage;

	let resp = await fetch('/chat', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	let data = await resp.json();

	console.log('server response: ', data);
	
	// todo, text response
	let result = '';

	if(data.picture) {
		currentImage = data.picture;
		result += `
<img src="data:image/png;base64,${data.picture}">
		`;
	}

	$log.innerHTML += result;

	$send.disabled = false;

}