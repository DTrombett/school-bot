import type { EventOptions } from "../../util";
import Constants, { EventType } from "../../util";

const label = Constants.clientOnlineLabel();

export const event: EventOptions<EventType.Discord, "ready"> = {
	name: "ready",
	type: EventType.Discord,
	async once(discordClient) {
		await discordClient.application.fetch();
		console.timeEnd(label);
	},
};
