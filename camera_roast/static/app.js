document.addEventListener('alpine:init', () => {
  Alpine.data('cameraRoast', () => ({
	imageSrc:null,
	working:false,
	status:'',
    async init() {
		console.log('init');
    },
	async gotPic(e) {
		let file = e.target.files[0];
		if(!file) return;
		
		let reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = async e => {
			this.imageSrc = e.target.result;
			this.working = true;
			this.status = '<i>Sending image data to Google Gemini...</i>';

			let body = {
				imgdata:this.imageSrc
			}

			let resp = await fetch('/roast', {
				method:'POST', 
				body: JSON.stringify(body)
			});

			let result = await resp.json();
			console.log(result);
			this.working = false;
			this.status = result.text;

		}

	}
  }))
});
