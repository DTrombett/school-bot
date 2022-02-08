import { config } from "dotenv";
import { start } from "node:repl";
import Constants, {
	createJob,
	CustomClient,
	loadCovidData,
	loadVaccinesData,
} from "./util";

void CustomClient.printToStdout("Starting...");
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
createJob(loadVaccinesData, "0 7 * * *");
createJob(loadCovidData, "0 18 * * *");
start();
