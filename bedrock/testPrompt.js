import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({region:'us-east-1', 
	credentials:{
		secretAccessKey:process.env.SECRET_ACCESS_KEY,
		accessKeyId:process.env.ACCESS_KEY_ID
	}
});

const prompt = `
Define, in terms a young child would understand, what the meaning of life is. You should answer by using a short story as an example.
`;

const input = {
	modelId:"amazon.titan-text-lite-v1",
	contentType:"application/json",
	accept:"application/json",
	body: JSON.stringify({
		inputText:prompt,
		textGenerationConfig: {
			maxTokenCount: 512
		}
	})
};

const command = new InvokeModelCommand(input);
const resp = await client.send(command);
//console.log(resp);

const decodedResponseBody = JSON.parse(new TextDecoder().decode(resp.body));
console.log(decodedResponseBody);
console.log('-'.repeat(80));
console.log(decodedResponseBody.results[0].outputText);