
document.addEventListener('alpine:init', () => {
	console.log('alpine:init fired');

	Alpine.data('classSuggester', () => ({
		async init() {
			console.log('app init fired');
		},
		strVal:null,
		dexVal:null,
		conVal:null,
		intVal:null,
		wisVal:null,
		chrVal:null,
		statsReady:false,
		result:'',
		async getSuggestion() {
			this.result = '<i>Loading a suggestion from Google Gemini...</i>';
			let body = {
				str:this.strVal,
				dex:this.dexVal,
				con:this.conVal, 
				int:this.intVal,
				wis:this.wisVal,
				chr:this.chrVal
			};
			let suggestion = await (await fetch('/api', { method:'POST', body:JSON.stringify(body)})).json();

			this.result = marked.parse(suggestion.response);
		},
		roll() {

			// for each stat, roll 4 times, drop lowest
			this.strVal = getScore();
			this.dexVal = getScore();
			this.conVal = getScore();
			this.intVal = getScore();
			this.wisVal = getScore();
			this.chrVal = getScore();

			this.statsReady = true;

		}
	}));

});

function getScore() {
	let rolls = [getRandomInt(1,6), getRandomInt(1,6), getRandomInt(1,6), getRandomInt(1,6)].sort((a,b) => a-b);
	rolls.shift();
	return rolls.reduce((prev,cur) => { return prev + cur }, 0);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); 
}