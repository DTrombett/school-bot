import { promises } from "node:fs";
import { join } from "node:path";
import { URL } from "node:url";
import type { CustomClient, EventOptions, EventType } from ".";
import Constants from "./Constants";
import Event from "./Event";

const folder = Constants.eventsFolderName();

/**
 * Load events listeners for the client.
 * @param client - The client to load the events for
 * @param subfolder - The subfolder to load the events from
 */
export const loadEvents = (client: CustomClient, subfolder: EventType) =>
	promises
		.readdir(new URL(join(folder, subfolder), import.meta.url))
		.then((fileNames) =>
			Promise.all(
				fileNames
					.filter((fileName) => fileName.endsWith(".js"))
					.map(
						(fileName) =>
							import(`./${folder}/${subfolder}/${fileName}`) as Promise<{
								event: EventOptions;
							}>
					)
			)
		)
		.then((files) => files.map((file) => file.event))
		.then((events) => {
			for (const event of events)
				client.events.set(event.name, new Event(client, event));
		});

export default loadEvents;
