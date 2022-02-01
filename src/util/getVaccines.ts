import type { PageScreenshotOptions } from "playwright";
import { chromium, devices } from "playwright";
import CustomClient from "./CustomClient";

const path = `./tmp/vaccini.jpg`;
const URL = "https://www.governo.it/it/cscovid19/report-vaccini";
const viewport = { width: 1024, height: 520 };

const screenshotOptions: PageScreenshotOptions = {
	clip: { x: 0, y: 0, width: viewport.width, height: 1900 },
	fullPage: true,
	path,
	quality: 100,
	type: "jpeg",
};

/**
 * Screenshot the vaccines page and save it to the given path.
 */
export const getVaccines = async () => {
	const browser = await chromium.launch();
	const context = await browser.newContext({
		...devices["Desktop Chrome"],
		viewport,
	});
	const page = await context.newPage();

	await page.goto(URL);
	await page.waitForSelector("#loader-custom", { state: "hidden" });
	await page.screenshot(screenshotOptions);
	void CustomClient.printToStdout(
		`[Vaccini]: Screenshot saved to ${path}!`,
		true
	);
};

export default getVaccines;
