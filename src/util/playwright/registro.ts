import { env } from "node:process";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium, devices } from "playwright";
import CustomClient from "../CustomClient";

export type Activity = {
	date: string;
	description: string;
	subject: string;
};

let _browser: Browser, _context: BrowserContext, _page: Page;

/**
 * Open the work page, if it doesn't exist.
 * @returns The page object
 */
export const createPage = async (): Promise<Page> => {
	if (typeof _page !== "undefined") return _page;
	_browser ??= await chromium.launch();
	_context ??= await _browser.newContext(devices["Desktop Chrome"]);
	_page = await _context.newPage();
	await _page.goto(`https://${env.ARGO_CODE ?? ""}.scuolanext.info`);
	await _page.fill('input[name="username"]', env.ARGO_USERNAME ?? "");
	await _page.fill('input[name="password"]', env.ARGO_PASSWORD ?? "");
	await _page.click("text=Entra");
	void CustomClient.printToStdout(`[Argo]: Logged in!`, true);
	return _page;
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
		page.click('text="Servizi Classe"', { timeout: 10_000 }),
		page.click('[aria-label="Argomento Lezioni"]', { timeout: 10_000 }),
		page.waitForSelector("fieldset", { timeout: 10_000 }),
	]);
	const count = await fields.count();

	return new Promise((resolve) => {
		for (let i = 0; i < count; i++) {
			const field = fields.nth(i);
			const locators = field.locator("tr");

			void Promise.all([
				field.locator("legend").innerText({ timeout: 10_000 }),
				locators.count(),
			]).then(([subject, v]) => {
				for (let j = 0; j < v; ++j)
					void locators
						.nth(j)
						.innerText({ timeout: 10_000 })
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
							if (i === count - 1 && j === v - 1) {
								resolve(activities);
								page
									.click(".btl-modal-closeButton")
									.catch(CustomClient.printToStderr);
							}
						});
			});
		}
	});
};
