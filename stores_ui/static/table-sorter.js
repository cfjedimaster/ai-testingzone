class TableSort extends HTMLElement {
	constructor() {
		super();
		this.lastSort = null;
		this.sortAsc = true;

		this.rows = null;
		this.numericColumns = [];
	}
	
	connectedCallback() {
		let table = this.querySelector('table');

		// no table? end!
		if(!table) {
			console.warn('table-sort: No table found. Exiting.');
			return;
		}
		
		if(this.hasAttribute('numeric')) {
			this.numericColumns = this.getAttribute('numeric').split(',').map(x => parseInt(x-1,10));
		}
		
		// require tbody and thead
		let tbody = table.querySelector('tbody');
		let thead = table.querySelector('thead');
		if(!tbody || !thead) {
			console.warn('table-sort: No tbody or thead found. Exiting.');
			return;			
		}
		
		this.rows = Array.from(tbody.querySelectorAll('tr'));
		
		// Get our headers
		let headers = thead.querySelectorAll('th');
		headers.forEach((h,i) => {
			h.style.cursor = 'pointer';
			h.addEventListener('click', e => {
					this.sortCol(e,i);
			});
		});
		
		// copy body to this scope so we can use it again later
		this.tbody = tbody;

	}
	
	sortCol(e,i) {
		let sortToggle = 1;
		if(this.lastSort === i) {
			this.sortAsc = !this.sortAsc;
			if(!this.sortAsc) sortToggle = -1;
		} else this.sortAsc = true;
		this.lastSort = i;
		
		this.rows.sort((a, b) => {
			let cellA = a.querySelectorAll('td')[i];
			let valueA = cellA.innerText;
			if(cellA.dataset.sortval) valueA = cellA.dataset.sortval;
			if(this.numericColumns.indexOf(i) >= 0) valueA = parseInt(valueA,10);
			
			let cellB = b.querySelectorAll('td')[i];
			let valueB = cellB.innerText;
			if(cellB.dataset.sortval) valueB = cellB.dataset.sortval;
			if(this.numericColumns.indexOf(i) >= 0) valueB = parseInt(valueB,10);
			if(valueA < valueB) return -1 * sortToggle;
			if(valueA > valueB) return 1 * sortToggle;

			return 0;
		});

		this.rows.forEach(r => this.tbody.appendChild(r));
	
	}
}

if(!customElements.get('table-sort')) customElements.define('table-sort', TableSort);
