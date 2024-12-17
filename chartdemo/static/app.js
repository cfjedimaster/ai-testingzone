document.addEventListener('DOMContentLoaded', init, false);
let sales;
let $result;

async function init() {

	$result = document.querySelector('#result');

	let req = await fetch('./data.json');
	salesData = await req.json();

	let chartData = [];

	let productNames = ['Apples', 'Bananas', 'Cherries', 'Donuts'];
	for(let p of productNames) {

		let data = {
			label:p, 
			data: salesData.sales.map(d => {
				for(let product of d.items) {
					if(product.name === p) return product.total;
				}
			})
		}

		chartData.push(data);
	}

	chartLabels = salesData.sales.map(d => {
		return d.date;
	});

	const ctx = document.getElementById('myChart');

	new Chart(ctx, {
		type: 'bar',
		data: {
			labels: chartLabels,
			datasets:chartData,
		},
		options: {
		scales: {
			y: {
			beginAtZero: true
			}
		}
		}
	});

	$result.innerHTML = '<p><i>Getting AI insights into this data...</i></p>';

	let insightsReq = await fetch('/insights', {
		method:'POST', 
		body:JSON.stringify(salesData)
	});

	let insights = await insightsReq.json();
	console.log(insights);
	$result.innerHTML = marked.parse(insights.text);
}

