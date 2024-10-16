let $recordButton, $recordedVoice, $idButton, $result;
let speechRecognition;
let recording = false;

document.addEventListener('DOMContentLoaded', init, false);
async function init() {

	$recordButton = document.querySelector('#recordButton');
	$recordedVoice = document.querySelector('#recordedVoice');
	$idButton = document.querySelector('#idButton');
	$result = document.querySelector('#result');

	const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
	speechRecognition = new SpeechRecognition();
	if(speechRecognition) {
		speechRecognition.continuous = true;
		speechRecognition.lang = 'en-US';
		speechRecognition.interimResults = false;

		speechRecognition.onresult = e => {
			console.log('result');
			if(e.results && e.results[e.results.length-1].isFinal) {
				let text = e.results[e.results.length-1][0].transcript;
				console.log('text',text);
				$recordedVoice.value = text;
			}
		}


	} else {
		alert('SpeechRecognition not enabled, this demo will not work.\nI have a sad.');
		return;
	}

	$recordButton.addEventListener('click', toggleRecog);
	$idButton.addEventListener('click', doLookup);
	console.log('Init done');
}

function toggleRecog() {
	if(!recording) {
		$recordedVoice.value = '';
		speechRecognition.start();
		recording = true;
		$result.innerHTML = '<p><i>Recording...</i></p>';
		console.log('started');
	} else {
		console.log(speechRecognition);
		speechRecognition.stop();
		recording = false;
		$result.innerHTML = '';
		console.log('stopped');
	}

	speechRecognition.onerror = e => {
		console.log('onerrror',e);
	}

}

async function doLookup() {
	if($recordedVoice.value === '') {
		alert('Please record some lyrics, or type something at least.');
		return;
	}

	let input = $recordedVoice.value.trim();
	$idButton.setAttribute('disabled','disabled');
	$result.innerHTML = '<p><i>Trying to identify...</i></p>';

	let req = await fetch('/identify', {
		method:'POST',
		body:JSON.stringify({lyrics:input})
	});
	let result = await req.json();
	console.log(result);

	$result.innerHTML = `<h3>Result From Gemini</h3>${marked.parse(result.text)}`;
	$idButton.removeAttribute('disabled');
}