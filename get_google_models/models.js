//import { Table } from 'voici.js';

process.loadEnvFile();
const API_KEY = process.env.GOOGLE_AI_KEY;

(async () => {
	let modelReq = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
	let models = (await modelReq.json()).models;
	console.log(models);
	/*
	const table = new Table(models);
	table.print();
	*/
	//console.table(models.models);
	console.log(`${('Name (model)').padEnd(80)}Description`);
	console.log('-'.repeat(100));
	for(let model of models) {
		let n = `${model.displayName} (${model.name})`;
		console.log(`${n.padEnd(80)}${model.description}`);
	}
})();