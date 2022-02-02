import { config } from "dotenv";
import { start } from "node:repl";
import Constants, { covid, createJob, CustomClient, vaccines } from "./util";

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
createJob(vaccines, "0 7 * * *");
createJob(covid, "0 18 * * *");
start();
