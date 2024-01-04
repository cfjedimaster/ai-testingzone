/*
,
		{
			"name":"product_price",
			"description":"return the price of a product",
			"parameters": {
				"type":"object",
				"properties":{
					"product": {
						"type":"string",
						"description":"The product to be queried."
					}
				},
				"required":["product"]
			}
		}
*/
import 'dotenv/config';

const API_KEY = process.env.GOOGLE_AI_KEY;

async function runGenerate(prompt) {

  let data = {
    contents: {
      role: "user",
      parts: {
        "text": prompt
      }
    },
    tools: {
      function_declarations: [
		{
			"name":"order_product",
			"description":"order or buy a product",
			"parameters": {
				"type":"object",
				"properties":{
					"product": {
						"type":"string",
						"description":"The product to be ordered."
					},
					"quantity":{
						"type":"number",
						"description":"The amount of the product to be ordered."
					}
				},
				"required":["product"]
			}
		}
,
		{
			"name":"product_price",
			"description":"return the price of a product",
			"parameters": {
				"type":"object",
				"properties":{
					"product": {
						"type":"string",
						"description":"The product to be queried."
					}
				},
				"required":["product"]
			}
		}
      ]
    }
  }

  let resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
    method:'post',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify(data)
  });

  return await resp.json();
}

(async () => {

	const prompts = [
'I want to order a coffee.',
'I want to buy an espresso.',
'I want to get two espressos',
'Whats on the menu?',
'What time is love?',
'May I buy ten cats?',
'I want to order ten cats'
	];

	for(let p of prompts) {
		let result = await runGenerate(p);
		//console.log(JSON.stringify(result,null,'\t'));
		console.log(`For prompt: ${p}\nResponse: ${JSON.stringify(result.candidates[0].content,null,'\t')}\n`);
		console.log('------------------------------------------');
	}
})();