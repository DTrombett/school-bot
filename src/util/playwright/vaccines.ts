import { chromium, devices } from "playwright";
import CustomClient from "../CustomClient";
import buffers from "./buffers";

const viewport = { width: 1024, height: 520 };

/**
 * Screenshot the vaccines page and save it to the given path.
 */
export const loadVaccinesData = async () => {
	const browser = await chromium.launch();
	const context = await browser.newContext({
		...devices["Desktop Chrome"],
		viewport,
	});
	const page = await context.newPage();

	await page.goto("https://www.governo.it/it/cscovid19/report-vaccini");
	await page.waitForSelector("#loader-custom", { state: "hidden" });
	buffers.set(
		"vaccines",
		await page.screenshot({
			clip: { x: 0, y: 0, width: viewport.width, height: 1900 },
			fullPage: true,
			quality: 100,
			type: "jpeg",
		})
	);
	void CustomClient.printToStdout(`[Vaccini]: Screenshot saved!`, true);

	await context.close();
	await browser.close();
};

export default loadVaccinesData;
