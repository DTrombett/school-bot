import { AsyncQueue } from "@sapphire/async-queue";
import { env } from "node:process";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium, devices } from "playwright";
import type { Activity } from "..";
import CustomClient from "../CustomClient";

const queue = new AsyncQueue(),
	timeout = 10_000;
let _browser: Browser, _context: BrowserContext, _page: Page;

/**
 * Open the work page, if it doesn't exist.
 * @returns The page object
 */
export const createPage = async (): Promise<Page> => {
	await queue.wait();
	if (typeof _page !== "undefined") return _page;
	_browser ??= await chromium.launch();
	_context ??= await _browser.newContext(devices["Desktop Chrome"]);
	_page = await _context.newPage();
	await _page.goto(`https://${env.ARGO_CODE ?? ""}.scuolanext.info`);
	await _page.fill('input[name="username"]', env.ARGO_USERNAME ?? "");
	await _page.fill('input[name="password"]', env.ARGO_PASSWORD ?? "");
	await _page.click("text=Entra");
	void CustomClient.printToStdout(`[Argo]: Logged in!`, true);
	queue.shift();
	return _page;
};

/**
 * Conclude gracefully a task.
 * @param resolve - The promise to resolve
 * @param arg - The argument to pass to the promise
 */
export const concludeTask = <T>(resolve: (arg: T) => void, arg: T): void => {
	resolve(arg);
	_page
		.click(".btl-modal-closeButton")
		.then(() => {
			queue.shift();
		})
		.catch(CustomClient.printToStderr);
};

/**
 * Get the activities from the work page.
 * @returns The activities
 */
export const getActivities = async (): Promise<Activity[]> => {
	const activities: Activity[] = [];
	const page = await createPage();
	const fields = page.locator("fieldset");

	await Promise.all([
		page.click('text="Servizi Classe"', { timeout }),
		page.click('[aria-label="Argomento Lezioni"]', { timeout }),
		page.waitForSelector("fieldset", { timeout }),
	]);
	const count = await fields.count();

	return new Promise((resolve) => {
		for (let i = 0; i < count; i++) {
			const field = fields.nth(i);
			const locators = field.locator("tr");

			void Promise.all([
				field.locator("legend").innerText({ timeout }),
				locators.count(),
			]).then(([subject, v]) => {
				for (let j = 0; j < v; ++j)
					void locators
						.nth(j)
						.innerText({ timeout })
						.then((text) => {
							const [date, ...description] = text.split(/\s+/);

							if (date)
								activities.push({
									date,
									description: description.join(" "),
									subject,
								});
							else
								activities.at(-1)!.description += `\n${description.join(" ")}`;
							if (i === count - 1 && j === v - 1)
								concludeTask(resolve, activities);
						});
			});
		}
	});
};
