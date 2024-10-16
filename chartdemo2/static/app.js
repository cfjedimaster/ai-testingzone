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
	let html = `<sl-carousel pagination navigation>`;
	insights.forEach(i => html += `<sl-carousel-item style="background: var(--sl-color-red-200);font-size: var(--sl-font-size-2x-large);padding:20px;">${i}</sl-carousel-item>`);
	html += '</sl-carousel>';
	$result.innerHTML = html;
}

