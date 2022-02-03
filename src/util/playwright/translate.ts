import { chromium, devices } from "playwright";
import CustomClient from "../CustomClient";

/**
 * Translate a word or phrase from a language to another using Google Translate.
 * @param word - The word or phrase to translate
 * @param from - The language to translate from
 * @param to - The language to translate to
 * @returns The translated word or phrase
 */
export const translate = async (
	word: string,
	from = "auto",
	to = "it"
): Promise<string> => {
	const browser = await chromium.launch();
	const page = await browser.newPage(devices["Desktop Chrome"]);
	const locator = page.locator('c-wiz[role="region"]');
	const [, , result] = await Promise.all([
		page.goto(
			`https://translate.google.it/?sl=${from}&tl=${to}&text=${encodeURIComponent(
				word
			)}&op=translate`
		),
		page.click("text=Accetto"),
		locator
			.waitFor({ state: "visible" })
			.then(() => locator.innerText())
			.then((r) => r.split("\n").slice(1, -3).join("\n")),
	]);

	browser.close().catch(CustomClient.printToStderr);
	return result;
};

export default translate;
