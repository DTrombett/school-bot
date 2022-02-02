import type { PageScreenshotOptions } from "playwright";
import { chromium, devices } from "playwright";
import CustomClient from "../CustomClient";

const path = `./tmp/covid.jpg`;
const URL =
	"https://github.com/pcm-dpc/COVID-19/blob/master/schede-riepilogative/regioni/dpc-covid19-ita-scheda-regioni-latest.pdf";

const screenshotOptions: PageScreenshotOptions = {
	path,
	quality: 100,
	type: "jpeg",
};

/**
 * Screenshot the covid data page and save it to the given path.
 */
export const covid = async () => {
	const browser = await chromium.launch();
	const context = await browser.newContext({
		...devices["Desktop Chrome HiDPI"],
	});
	const page = await context.newPage();

	await page.goto(URL);
	const locator = page.mainFrame().childFrames()[0].locator("canvas");

	await locator.screenshot(screenshotOptions);
	void CustomClient.printToStdout(
		`[Covid]: Screenshot saved to ${path}!`,
		true
	);

	await browser.close();
};

export default covid;
