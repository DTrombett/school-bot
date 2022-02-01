import { exit, memoryUsage } from "node:process";
import type { EventOptions } from "../../util";
import { CustomClient, EventType } from "../../util";

const digits = 2;

export const event: EventOptions<EventType.Discord, "invalidated"> = {
	name: "invalidated",
	type: EventType.Discord,
	once() {
		const memory = memoryUsage();

		void CustomClient.printToStderr(
			`Bot client session became invalidated.\nClosing the process gracefully\n${(
				memory.heapUsed /
				1024 /
				1024
			).toFixed(digits)} MB used\n${(memory.heapTotal / 1024 / 1024).toFixed(
				digits
			)} MB total\n${(memory.external / 1024 / 1024).toFixed(
				digits
			)} MB external\n${(memory.rss / 1024 / 1024).toFixed(digits)} MB rss`,
			true
		);
		this.client.destroy();
		exit(0);
	},
};
