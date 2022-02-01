import parser from "cron-parser";
import CustomClient from "./CustomClient";
import getVaccines from "./getVaccines";

// A job that runs every day at 7:00 AM
const parsed = parser.parseExpression("0 7 * * *");

/**
 * Start a job that runs every day at 7:00 to update clan info.
 * @param client - The client to use
 */
export const startJob = (client: CustomClient) =>
	setTimeout(() => {
		getVaccines().catch(CustomClient.printToStderr);
		startJob(client);
	}, parsed.next().getTime() - Date.now());

export default startJob;
