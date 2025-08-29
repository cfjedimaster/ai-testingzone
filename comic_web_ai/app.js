document.addEventListener('DOMContentLoaded', init, false);

let $filetypeAlert, $currentPage, $pageNumbers, $dropZone, $comicDisplay, $prevButton, $nextButton, $aiSummary;
let session;

// used to help guide Chrome AI
const paragraphSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Clean Paragraph",
  "description": "A single paragraph of text without multiple consecutive newlines.",
  "type": "string",
  "pattern": "^[^\\n]*(\\n[^\\n]*)*$"
};

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

	const getBin = async p => {
		return await p.read();
	}

	let archive = await Unarchiver.open(d);

	// todo - remove Thumbs.db if possible
	let entries = archive.entries.filter(e => e.is_file);

	displayComic(entries, getData, getBin);
}

async function handleZip(d) {

	const getB64 = async p => {
		let dw = new zip.Data64URIWriter();
		return await p.getData(dw);
	}

	const getBlob = async p => {
		let bw = new zip.BlobReader();
		return await p.getData(bw);
	}

	console.log('processing zip');
	const blob = new Blob([d], { type: 'application/octet-stream' });
	const reader = new zip.ZipReader(new zip.BlobReader(blob));
	console.log('got a reader');
	const entries = (await reader.getEntries()).filter(e => !e.directory && !e.filename.endsWith('Thumbs.db'));
	//console.log(entries);
	displayComic(entries, getB64, getBlob);
}

/*
I'm a generic function that will be called after zip/rar parsing. I expect an 
array of pages and a function that should return a b64 encoded version of the image
*/
async function displayComic(pages, reader, binreader) {

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

	handleAISupport(pages, reader, binreader);
}

async function handleAISupport(pages, reader, binreader) {
	if(!window.LanguageModel) {
		$aiSummary.innerHTML = "<p>Sorry, your browser does not support built-in AI.</p>";
		return;
	}

	let status = await LanguageModel.availability();

	if(status === 'unavailable') {
		$aiSummary.innerHTML = "<p>AI support is unavailable, sorry.</p>";
		return;
	}

	console.log('status', status);
	session = await LanguageModel.create({
		initailPrompts: [{
			role:"system", 
			content:"You analyze images that are part of a comic book. Each image represents one page of a story. I will prompt you with the image as well as any previous summary from earlier pages. You should summarize the current image and use any previous summary to help guide you with the current page. If the current page is an advertisement or promotional page, simply return nothing. If the image appears to be a cover, return nothing. Your summary should be one paragraph that is no more than three to four sentences and focused on describing what is being shown on the page. Do not give your opinion on the art or color. Just summarize what happens on the page."
		}],
		expectedInputs: [ {type:"image" }],
		expectedOutputs: [{
    		type: "text",
    		languages: ["en"]
		}],
		monitor(m) {
			m.addEventListener('downloadprogress', e => {
				console.log(`AI model downloaded ${e.loaded * 100}%`);
				if(e === 1) doAISummary(pages, reader, binreader);
			});
		}
	});

	if(status === 'downloadable' || status == 'downloading') {
		$aiSummary.innerHTML = "<p>AI support is enabled, but must be downloaded. Please stand by.</p>";
		return;
	} else doAISummary(pages, reader, binreader);
}

async function doAISummary(pages, reader, binreader) {
	$aiSummary.innerHTML = "<p>Starting work on AI Summary.</p>";
	summary = '';

	/* 
	In my testing, it feels like the model could do 7-10 pages before
	filling the quota - so I'm going to do it in 6 page 'chunks'.
	Nope, 10, and made it a variable.
	*/
	const CHUNK = 10;

	console.log('TOTAL PAGES', pages.length);
	for(let i=1; i<pages.length; i+=CHUNK) {
		console.log('CHUNK',i);
		let content = [];
		let x;
		for(x=0;x<CHUNK;x++) {
			if(x+i < pages.length) {
				content.push({type:"image", value: await binreader(pages[x+i])});
				console.log('page ',x+i);
			}
		}

		console.log('beginning prompt');
		let response = await session.prompt([{
			role:"user", 
			content
		}], { responseConstraint: paragraphSchema });

		console.log('resp?', response);
		console.log(session);
		console.log('early exit in chunk ',i);

		$aiSummary.innerHTML = `<p>Completed ${x} pages.</p>`;

		return;
	}
	return;
	// note, start at 1 to skip cover
	for(let i=1;i<pages.length;i++) {
		console.log(`doing page ${i+1}`);
		console.log(session);
		console.log(await binreader(pages[i]));
		let response = await session.prompt([{
			role:"user", 
			content: [
				{ type:"image", value: await binreader(pages[i]) },
				{ type:"image", value: await binreader(pages[i+1]) },
				{ type:"image", value: await binreader(pages[i+2]) },
				{ type:"image", value: await binreader(pages[i+3]) }
			]
		}]);
		console.log('resp?', response);
		console.log(session);
		console.log('early exit');
		return;		
	}
}