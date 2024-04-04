import { BedrockClient, ListFoundationModelsCommand } from "@aws-sdk/client-bedrock";

const client = new BedrockClient({region:'us-east-1', 
	credentials:{
		secretAccessKey:process.env.SECRET_ACCESS_KEY,
		accessKeyId:process.env.ACCESS_KEY_ID
	}
});

const command = new ListFoundationModelsCommand({});
const resp = await client.send(command);
const models = resp.modelSummaries;
//console.log(JSON.stringify(resp,null,'\t'));
for(let m of models) {
	// um, I was going to output more, but maybe later
	console.log(`${m.modelName.padEnd(50)}${m.modelId}`);
}
