document.addEventListener('DOMContentLoaded', init, false);

let $filetypeAlert, $currentPage, $pageNumbers, $dropZone, $comicDisplay, $prevButton, $nextButton;

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
}