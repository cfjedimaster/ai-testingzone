document.addEventListener('DOMContentLoaded', init, false);

let $prompt, $submit, $output, $citations, $pdfviewer;

async function init() {
	$prompt = document.querySelector('#prompt');
	$submit = document.querySelector('#submit');
	$output = document.querySelector('#output');
	$citations = document.querySelector('#citations');
	$pdfviewer = document.querySelector('#pdfviewer');

	$submit.addEventListener('click', handleSubmit, false);
}

async function handleSubmit(e) {
	e.preventDefault();
	let prompt = $prompt.value.trim();
	if(prompt === '') return; 

	console.log(`Going to test with: ${prompt}`);
	$submit.disabled = true;
	$submit.innerText = 'Processing...';

	let resp = await fetch('/handlePrompt', {
		method:'POST',
		headers: {
			'Content-Type':'application/json',
		},
		body: JSON.stringify({prompt}),
	});

	let result = await resp.json();
	console.log(result);
	
	$submit.disabled = false;
	$submit.innerText = 'Submit';

	$output.innerHTML = `<h2>Result</h2> ${marked.parse(result.content)}`;

	// handle displaying citations
	let chtml = '<h2>Citations</h2>';
	for(let i=0; i<result.citations.length; i++) {

		let pageHTML = '';
		for(page of result.citations[i].pages) {
			pageHTML += `<a href="${result.citations[i].file}#page=${page}" class="pdflink">${page}</a> `;
		}

		chtml += `
<p>
File: <a href="${result.citations[i].file}" class="pdflink">${result.citations[i].file}</a><br>
Pages: ${pageHTML}<br>
</p>
		`;

	}

	$citations.innerHTML = chtml;

	document.querySelectorAll('.pdflink').forEach((el) => {
		el.addEventListener('click', handlePDFLink, false);
	});

}

function handlePDFLink(e) {
	e.preventDefault();
	// hard coding /static which is maybe a Flask no no
	$pdfviewer.src = '/static/' + e.target.href.split('/').pop();
}