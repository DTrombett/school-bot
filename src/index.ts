import { config } from "dotenv";
import { start } from "node:repl";
import Constants, { CustomClient, startJob } from "./util";

await CustomClient.logToFile("\n");
config({ debug: true });
console.time(Constants.clientOnlineLabel());

const client = new CustomClient();
(
	global as typeof globalThis & {
		client: CustomClient;
	}
).client = client;

await client.login();
startJob(client);
start();
