import { exit } from "node:process";
import type { EventOptions } from "../../util";
import { calculateRam, CustomClient, EventType } from "../../util";

export const event: EventOptions<EventType.Discord, "invalidated"> = {
	name: "invalidated",
	type: EventType.Discord,
	async once() {
		await CustomClient.printToStderr(
			`Bot client session became invalidated.\nClosing the process gracefully\n${calculateRam()}`,
			true
		);
		this.client.destroy();
		exit(0);
	},
};
