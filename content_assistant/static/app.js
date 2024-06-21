let $desc, $content, $submitBtn, $results;

document.addEventListener('DOMContentLoaded', init, false);
function init() {
	$desc = document.querySelector('#description');
	$content = document.querySelector('#content');
	$submitBtn = document.querySelector('#submitBtn');
	$results = document.querySelector('#results');

	document.querySelector('form').addEventListener('submit', doAnalysis, false);
}

async function doAnalysis(e) {
	e.preventDefault();

	$results.innerHTML = '';

	let description = $desc.value.trim();
	let content = $content.value.trim();

	let goodToGo = true;
	if(description === '') {
		$desc.setCustomValidity('This field is required');
		goodToGo = false;
	}

	if(content === '') {
		$content.setCustomValidity('This field is required');
		goodToGo = false;
	}

	if(!goodToGo) return false;

	$submitBtn.setAttribute('disabled', 'disabled');
	let body = {
		description, 
		content
	};

	let req = await fetch('/api', {
		method: 'POST', 
		body: JSON.stringify(body)
	});
	let result = await req.json();
	console.log(result);

	$results.innerHTML = `
<sl-card>
	<div slot="header">Results</div>

	${marked.parse(result.result)}
</sl-card>
	`;

	$submitBtn.removeAttribute('disabled');

	return false;
}