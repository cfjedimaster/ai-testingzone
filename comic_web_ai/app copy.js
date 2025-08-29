document.addEventListener('DOMContentLoaded', init, false);

let $filetypeAlert, $currentPage, $pageNumbers, $dropZone, $comicDisplay, $prevButton, $nextButton, $aiSummary;
let session;

async function init() {

	$dropZone = document.querySelector('div#dropZone');
	$dropZone.addEventListener('dragover', e => e.preventDefault());
	$dropZone.addEventListener('drop', handleDrop);
	
	$comicDisplay = document.querySelector('div#comicDisplay');

	$filetypeAlert = document.querySelector('#filetypeAlert');
	$currentPage = document.querySelector('#currentPage');
	$pageNumbers = document.querySelector('#pageNumbers');

	$prevButton = document.querySelector('#prevButton');
	$nextButton = document.querySelector('#nextButton');

	$aiSummary = document.querySelector('#aiSummary');
	/*
	note, we could do a loading msg, but this seems to work so quick i think we're
	fine just showing the drop zone when ready - will see how it works in prod
	*/
	Unarchiver.load(['rar']).then(function() {
		$dropZone.style.display = 'block';
	});
};

function handleDrop(e) {
	e.preventDefault();

	let droppedFiles = e.dataTransfer.files;
	if(!droppedFiles) return;
	let myFile = droppedFiles[0];
	let ext = myFile.name.split('.').pop().toLowerCase();

	if(ext !== 'cbr' && ext !== 'cbz') {
		$filetypeAlert.toast();
		return;
	} 

	$filetypeAlert.hide();
	$dropZone.style.display = 'none';

	// note, for rar, go right to handler 
	if(ext == 'cbr') {
		handleRar(myFile);
		return;
	}

	let reader = new FileReader();
	reader.onload = e => {
		if(ext === 'cbz') handleZip(e.target.result);
	};
	reader.readAsArrayBuffer(myFile);
}

async function handleRar(d) {
	const getData = async p => {
		let data = await p.read();
		return URL.createObjectURL(data);

	}

	let archive = await Unarchiver.open(d);

	// todo - remove Thumbs.db if possible
	let entries = archive.entries.filter(e => e.is_file);

	displayComic(entries, getData);
}

async function handleZip(d) {

	const getB64 = async p => {
		let dw = new zip.Data64URIWriter();
		return await p.getData(dw);
	}

	console.log('processing zip');
	const blob = new Blob([d], { type: 'application/octet-stream' });
	const reader = new zip.ZipReader(new zip.BlobReader(blob));
	console.log('got a reader');
	const entries = (await reader.getEntries()).filter(e => !e.directory && !e.filename.endsWith('Thumbs.db'));
	//console.log(entries);
	displayComic(entries, getB64);
}

/*
I'm a generic function that will be called after zip/rar parsing. I expect an 
array of pages and a function that should return a b64 encoded version of the image
*/
async function displayComic(pages, reader) {

	const doPrevPage = async () => {
		if(currentPage == 0) return;
		currentPage--;

		$pageNumbers.innerHTML = `Page ${currentPage+1} of ${pages.length}`;
		$currentPage.src = await reader(pages[currentPage]);
	};

	const doNextPage = async () => {
		if(currentPage+1 === pages.length) return;
		currentPage++;
		$pageNumbers.innerHTML = `Page ${currentPage+1} of ${pages.length}`;
		$currentPage.src = await reader(pages[currentPage]);
	};

	let currentPage = 0;
	$comicDisplay.style.display = 'block';
	$pageNumbers.innerHTML = `Page 1 of ${pages.length}`;
	$currentPage.src = await reader(pages[0]);
	$prevButton.addEventListener('click', doPrevPage);
	$nextButton.addEventListener('click', doNextPage);

	// Suggestions by @marypcbuk
	$currentPage.addEventListener('click', doNextPage);
	document.addEventListener('keydown', function(event) {
		if (event.key === 'ArrowLeft') doPrevPage();
        if (event.key === 'ArrowRight') doNextPage();
    });

	handleAISupport(pages, reader);
}

async function handleAISupport(pages, reader) {
	if(!window.LanguageModel) {
		$aiSummary.innerHTML = "<p>Sorry, your browser does not support built-in AI.</p>";
		return;
	}

	let status = await LanguageModel.availability();
	console.log('status', status);
	if(status === 'downloadable') {
		$aiSummary.innerHTML = "<p>AI support is enabled, but must be downloaded. Please stand by.</p>";
		session = await LanguageModel.create({
			initailPrompts: [{
				role:"system", 
				content:"You analyze images that are part of a comic book. Each image represents one page of a story. I will prompt you with the image as well as any previous summary from earlier pages. You should summarize the current image and use any previous summary to help guide you with the current page. If the current page is an advertisement, simply return nothing."
			}],
			expectedInputs: [ {type:"image" }],
			monitor(m) {
				m.addEventListenr('downloadprogress', e => {
					console.log(`AI model downloaded ${e.loaded * 100}%`);
					if(e === 1) doAISummary(pages, reader);
				});
			}
		});
	} else if(status === 'available') doAISummary(pages, reader);
}

async function doAISummary(pages, reader) {
	$aiSummary.innerHTML = "<p>Starting work on AI Summary.</p>";
	summary = '';
	for(let i=0;i<pages.length;i++) {
		console.log(`doing page ${i+1}`);
		console.log(session);
		let response = await session.prompt([{
			role:"user", 
			content: [
				{ type:"image", value: reader(pages[i]) }
			]
		}]);
		console.log('resp?', response);
		console.log('early exit');
		return;		
	}
}