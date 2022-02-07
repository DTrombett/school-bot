import { AsyncQueue } from "@sapphire/async-queue";
import type { Buffer } from "node:buffer";
import { env } from "node:process";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium, devices } from "playwright";
import type { Activity } from "..";
import CustomClient from "../CustomClient";

/**
 * A list of ISO 639-1 language codes
 */
export enum LanguageCode {
	"Abkhazian" = "ab",
	"Afar" = "aa",
	"Afrikaans" = "af",
	"Akan" = "ak",
	"Albanian" = "sq",
	"Amharic" = "am",
	"Arabic" = "ar",
	"Aragonese" = "an",
	"Armenian" = "hy",
	"Assamese" = "as",
	"Avestan" = "ae",
	"Aymara" = "ay",
	"Azerbaijani" = "az",
	"Bambara" = "bm",
	"Bashkir" = "ba",
	"Basque" = "eu",
	"Belarusian" = "be",
	"Bengali" = "bn",
	"Bosnian" = "bs",
	"Breton" = "br",
	"Bulgarian" = "bg",
	"Burmese" = "my",
	"Catalan" = "ca",
	"Chamorro" = "ch",
	"Chechen" = "ce",
	"Chichewa" = "ny",
	"Chinese" = "zh",
	"Chuvash" = "cv",
	"Cornish" = "kw",
	"Corsican" = "co",
	"Cree" = "cr",
	"Croatian" = "hr",
	"Czech" = "cs",
	"Danish" = "da",
	"Dutch" = "nl",
	"English" = "en",
	"Esperanto" = "eo",
	"Estonian" = "et",
	"Ewe" = "ee",
	"Faroese" = "fo",
	"Fijian" = "fj",
	"Finnish" = "fi",
	"French" = "fr",
	"Galician" = "gl",
	"Georgian" = "ka",
	"German" = "de",
	"Greek" = "el",
	"Guarani" = "gn",
	"Gujarati" = "gu",
	"Haitian" = "ht",
	"Hausa" = "ha",
	"Hebrew" = "he",
	"Herero" = "hz",
	"Hindi" = "hi",
	"Hungarian" = "hu",
	"Indonesian" = "id",
	"Irish" = "ga",
	"Igbo" = "ig",
	"Inupiaq" = "ik",
	"Ido" = "io",
	"Icelandic" = "is",
	"Italian" = "it",
	"Inuktitut" = "iu",
	"Japanese" = "ja",
	"Javanese" = "jv",
	"Kannada" = "kn",
	"Kashmiri" = "ks",
	"Kazakh" = "kk",
	"Central Khmer" = "km",
	"Kikuyu" = "ki",
	"Kirghiz" = "ky",
	"Komi" = "kv",
	"Kongo" = "kg",
	"Korean" = "ko",
	"Kurdish" = "ku",
	"Latin" = "la",
	"Luxembourgish" = "lb",
	"Ganda" = "lg",
	"Lao" = "lo",
	"Lithuanian" = "lt",
	"Latvian" = "lv",
	"Manx" = "gv",
	"Macedonian" = "mk",
	"Malagasy" = "mg",
	"Malay" = "ms",
	"Malayalam" = "ml",
	"Maltese" = "mt",
	"Maori" = "mi",
	"Marathi" = "mr",
	"Marshallese" = "mh",
	"Mongolian" = "mn",
	"Nauru" = "na",
	"Navajo" = "nv",
	"North Ndebele" = "nd",
	"Nepali" = "ne",
	"Norwegian Bokmål" = "nb",
	"Norwegian Nynorsk" = "nn",
	"Norwegian" = "no",
	"Sichuan Yi" = "ii",
	"South Ndebele" = "nr",
	"Occitan" = "oc",
	"Ojibwa" = "oj",
	"Church Slavic" = "cu",
	"Oriya" = "or",
	"Ossetian" = "os",
	"Punjabi" = "pa",
	"Pali" = "pi",
	"Persian" = "fa",
	"Polish" = "pl",
	"Pashto" = "ps",
	"Portuguese" = "pt",
	"Quechua" = "qu",
	"Romansh" = "rm",
	"Romanian" = "ro",
	"Russian" = "ru",
	"Sanskrit" = "sa",
	"Sardinian" = "sc",
	"Sindhi" = "sd",
	"Northern Sami" = "se",
	"Samoan" = "sm",
	"Serbian" = "sr",
	"Gaelic" = "gd",
	"Shona" = "sn",
	"Slovak" = "sk",
	"Slovenian" = "sl",
	"Somali" = "so",
	"Southern Sotho" = "st",
	"Spanish" = "es",
	"Sundanese" = "su",
	"Swahili" = "sw",
	"Swedish" = "sv",
	"Tamil" = "ta",
	"Telugu" = "te",
	"Tajik" = "tg",
	"Thai" = "th",
	"Uighur" = "ug",
	"Ukrainian" = "uk",
	"Urdu" = "ur",
	"Uzbek" = "uz",
	"Venda" = "ve",
	"Vietnamese" = "vi",
	"Volapük" = "vo",
	"Walloon" = "wa",
	"Welsh" = "cy",
	"Wolof" = "wo",
	"Western Frisian" = "fy",
	"Xhosa" = "xh",
	"Yiddish" = "yi",
	"Yoruba" = "yo",
	"Zhuang" = "za",
	"Zulu" = "zu",
}

const _pages: Page[] = [],
	indexes = {
		argo: 0,
		translate: 1,
	},
	queues = [new AsyncQueue(), new AsyncQueue()] as const,
	timeout = 10_000;
let _browser: Browser, _context: BrowserContext;

/**
 * Translations made so far
 */
export const translations: {
	from: LanguageCode | "auto";
	to: LanguageCode;
	word: string;
	language?: LanguageCode;
	maybe?: string;
}[] = [];

/**
 * Load Argo.
 */
const loadArgo = async () => {
	const page = await _context.newPage();

	indexes.argo = _pages.push(page) - 1;
	await page.goto(`https://${env.ARGO_CODE ?? ""}.scuolanext.info`);
	await page.fill('input[name="username"]', env.ARGO_USERNAME ?? "");
	await page.fill('input[name="password"]', env.ARGO_PASSWORD ?? "");
	await page.click("text=Entra");
	void CustomClient.printToStdout(`[Argo]: Logged in!`, true);
};

/**
 * Load Google Translate.
 */
const loadTranslate = async () => {
	const page = await _context.newPage();

	indexes.translate = _pages.push(page) - 1;
	await Promise.all([
		page.goto(`https://translate.google.it`),
		page.click("text=Accetto"),
	]);
	await page.goto("about:blank");
	void CustomClient.printToStdout(`[Translate]: Ready!`, true);
};

/**
 * Open the work page, if it doesn't exist.
 * @returns The page object
 */
export const createPage = async (index = 0): Promise<[Page, AsyncQueue]> => {
	const queue = queues[index];

	if (_pages.length) {
		await queue.wait();
		return [_pages[index], queue];
	}
	_browser ??= await chromium.launch({
		args: ["--enable-features=WebContentsForceDark"],
		channel: "chrome-beta",
		headless: false,
	});
	_context ??= await _browser.newContext({
		...devices["Desktop Chrome"],
		viewport: { width: 1536, height: 792 },
		locale: "it-IT",
		screen: { width: 1536, height: 792 },
	});
	await Promise.all([loadArgo(), loadTranslate()]);
	return [_pages[index], queue];
};

/**
 * Get the activities from the work page.
 * @returns The activities
 */
export const getActivities = async (): Promise<Activity[]> => {
	const activities: Activity[] = [];
	const [page, queue] = await createPage(indexes.argo);
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
								activities.at(-1)!.description += `; ${description.join(" ")}`;
							if (i === count - 1 && j === v - 1) {
								resolve(activities);
								page
									.click(".btl-modal-closeButton")
									.then(() => {
										queue.shift();
									})
									.catch(CustomClient.printToStderr);
							}
						});
			});
		}
	});
};

/**
 * Translate a word or phrase from a language to another using Google Translate.
 * @param word - The word or phrase to translate
 * @param from - The language to translate from
 * @param to - The language to translate to
 * @returns The translated word or phrase
 */
export const translate = async (
	word: string,
	from: LanguageCode | "auto" = "auto",
	to = LanguageCode["Italian"]
): Promise<{ attachment: Buffer; maybe?: string; language?: string }> => {
	const [page, queue] = await createPage(indexes.translate);

	await page.goto(
		`https://translate.google.it/?sl=${from}&tl=${to}&text=${encodeURIComponent(
			word
		)}&op=translate`
	);
	await page.waitForSelector('c-wiz[role="region"]');
	const [attachment, maybe, language] = await Promise.all([
		page.locator('c-wiz[role="main"]').first().screenshot({
			quality: 100,
			type: "jpeg",
			timeout,
		}),
		page
			.locator('div:text("Forse cercavi:") >> span')
			.first()
			.innerText({ timeout: 100 })
			.catch(() => undefined),
		page
			.locator('div:text("Traduci da:") >> span')
			.first()
			.innerText({ timeout: 100 })
			.then((text) => LanguageCode[text as keyof typeof LanguageCode])
			.catch(() => undefined),
	]);
	const result = { attachment, maybe, language, word, from, to };

	page.goto("about:blank").catch(CustomClient.printToStderr);
	queue.shift();
	translations.push(result);
	return result;
};
