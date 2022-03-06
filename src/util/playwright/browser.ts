import { AsyncQueue } from "@sapphire/async-queue";
import { env } from "node:process";
import type { Browser, BrowserContext, Page } from "playwright";
import { chromium } from "playwright";
import type { Activity, TranslationResults } from "..";
import { parseDate } from "../argoDate";
import CustomClient from "../CustomClient";
import { LanguageCode } from "../types";

const cache = {
	activities: { data: [] as Activity[], lastUpdate: 0 },
};
const cacheTimeout = 1000 * 60 * 5;

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
export const translations: TranslationResults[] = [];

/**
 * Conclude Argo login.
 * @param page - The page to load
 */
const concludeArgoLogin = async (page: Page) => {
	await page.fill('input[name="username"]', env.ARGO_USERNAME ?? "");
	await page.fill('input[name="password"]', env.ARGO_PASSWORD ?? "");
	await page
		.fill('input[name="famiglia_customer_code"]', env.ARGO_CODE ?? "", {
			timeout: 100,
		})
		.catch(() => {
			// Ignore
		});
	await page.click("text=Entra");
	void CustomClient.printToStdout(`[Argo]: Logged in!`, true);
};

/**
 * Load Argo.
 */
const loadArgo = async () => {
	const page = await _context.newPage();

	indexes.argo = _pages.push(page) - 1;
	await page.goto(`https://${env.ARGO_CODE ?? ""}.scuolanext.info`);
	await concludeArgoLogin(page);
	page.on("load", () => {
		if (/https:\/\/www\.portaleargo\.it\/auth\/sso\/login.*/.test(page.url()))
			void concludeArgoLogin(page);
	});
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
	if (typeof index !== "number" || index < 0)
		throw new TypeError(
			"Argument 'index' must be a number greater than or equal to 0"
		);
	// eslint-disable-next-line security/detect-object-injection
	const queue = queues[index];

	if (_pages.length) {
		await queue.wait();
		// eslint-disable-next-line security/detect-object-injection
		return [_pages[index], queue];
	}
	_browser ??= await chromium.launch({
		args: ["--enable-features=WebContentsForceDark", "--start-maximized"],
		channel: "chrome-beta",
		headless: false,
	});
	_context ??= await _browser.newContext({
		colorScheme: "dark",
		locale: "it-IT",
		viewport: null,
	});
	await Promise.all([loadArgo(), loadTranslate()]);
	// eslint-disable-next-line security/detect-object-injection
	return [_pages[index], queue];
};

/**
 * Get the activities from the work page.
 * @returns The activities
 */
export const getActivities = async (): Promise<Activity[]> => {
	if (Date.now() - cache.activities.lastUpdate < cacheTimeout)
		return cache.activities.data;
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
									date: parseDate(date),
									description: description.join(" "),
									subject,
								});
							else
								activities.at(-1)!.description += `; ${description.join(" ")}`;
							if (i === count - 1 && j === v - 1) {
								resolve(activities);
								cache.activities.data = activities;
								cache.activities.lastUpdate = Date.now();
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
): Promise<TranslationResults> => {
	if (typeof word !== "string")
		throw new TypeError("Argument 'word' must be a string");
	if (typeof from !== "string")
		throw new TypeError("Argument 'from' must be a string");
	if (typeof to !== "string")
		throw new TypeError("Argument 'to' must be a string");
	const existing = translations.find(
		(t) => t.word === word && t.to === to && t.from === from
	);
	if (existing) return existing;
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
			.innerText({ timeout: 1000 })
			.catch(() => undefined),
		page
			.locator('div:text("Traduci da:") >> span')
			.first()
			.innerText({ timeout: 1000 })
			.then((text) => LanguageCode[text as keyof typeof LanguageCode])
			.catch(() => undefined),
	]);
	const result = { attachment, maybe, language, word, from, to };

	page.goto("about:blank").catch(CustomClient.printToStderr);
	queue.shift();
	translations.push(result);
	return result;
};
