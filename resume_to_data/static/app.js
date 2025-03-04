
document.addEventListener('DOMContentLoaded', init, false);

let $fileInput, $parseButton;

async function init() {

	$fileInput = document.querySelector('#file');
	$parseButton = document.querySelector('#submit');

	$parseButton.addEventListener('click', handleReview, false);
}

async function handleReview(e) {
	e.preventDefault();

	if($fileInput.files.length === 0) return;
	$parseButton.disabled = true;

	let file = $fileInput.files[0];
	// Create a form body object to post the file
	let formData = new FormData();
	formData.append('file', file);

	let resp = await fetch('/parse', { 
		method: 'POST', 
		body: formData 
	});
	let json = await resp.json();

	// Being a bit lazy here and not making objects for each form field
	document.querySelector('#firstName').value = json.firstName;
	document.querySelector('#lastName').value = json.lastName;
	document.querySelector('#location').value = json.location;
	document.querySelector('#emailAddress').value = json.emailAddress;
	document.querySelector('#website').value = json.website;
	document.querySelector('#telephoneNumber').value = json.telephoneNumber;
	document.querySelector('#introduction').value = json.introduction;
	document.querySelector('#skills').value = json.skills.join(', ');

	document.querySelector('#workHistory').value = json.experience.reduce((s, j) => {
		return s + `Company: ${j.company}
Title: ${j.jobTitle}
Duration: ${j.timeWorked}

${j.description_and_responsibilities}

		`
	},'');

	$parseButton.disabled = false;

}