import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2';
import alpinejs from 'https://cdn.jsdelivr.net/npm/alpinejs@3.14.6/+esm';

document.addEventListener('DOMContentLoaded', () => {
	alpinejs.start();
});

document.addEventListener('alpine:init', () => {
	
  alpinejs.data('cameraApp', () => ({
	imageSrc:null,
	working:false,
	status:'',
	detector:null, 
    async init() {
		console.log('init');
		this.working = true;
		this.detector = await pipeline("object-detection", "Xenova/detr-resnet-50");
		console.log('ready');
		this.working = false;
    },
	async gotPic(e) {
		let file = e.target.files[0];
		if(!file) return;

		let reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = async e => {
			this.imageSrc = e.target.result;
			// saw some issues w/ the image being shown, this didn't seem to work terribly well though
			await this.$nextTick();
			this.working = true;
			this.status = '<i>Analyzing image data...</i>';

			let output = await this.detector(e.target.result, {
				threshold: 0.5,
				percentage: true,
			});	

			let labels = output.map(i => i.label);
			let isCat = labels.includes('cat') || labels.includes('cats');
			console.log(output);
			console.log(labels);
			this.working = false;

			if(isCat) this.status = '<strong>Yes, I see a cat (or cats)!</strong>';
			else this.status = 'Sorry, I see no cat. :(';
			
		}

	}
	
  }))
  
});

