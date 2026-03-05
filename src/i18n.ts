import { en } from "./locales/en";
import { es } from "./locales/es";

type LocaleDict = Record<string, Record<string, string>>;

const locales: Record<string, LocaleDict> = {
	en: en as LocaleDict,
	es: es as LocaleDict,
};

const defaultLocale = "en";

function getLocale(): string {
	const lang = typeof navigator !== "undefined" ? navigator.language : defaultLocale;
	const base = lang.split("-")[0].toLowerCase();
	return locales[base] ? base : defaultLocale;
}

let currentLocale = getLocale();

function getNested(obj: Record<string, unknown>, path: string): string | undefined {
	const parts = path.split(".");
	let cur: unknown = obj;
	for (const p of parts) {
		cur = (cur as Record<string, unknown>)?.[p];
		if (cur === undefined) return undefined;
	}
	return typeof cur === "string" ? cur : undefined;
}

export function t(key: string, params?: Record<string, string>): string {
	const dict = locales[currentLocale] ?? locales[defaultLocale];
	let value = getNested(dict as Record<string, unknown>, key) ?? getNested(en as Record<string, unknown>, key) ?? key;
	if (params) {
		for (const [k, v] of Object.entries(params)) {
			value = value.replace(`{{${k}}}`, v);
		}
	}
	return value;
}

export function setLocale(locale: string): void {
	if (locales[locale]) currentLocale = locale;
}

export function getCurrentLocale(): string {
	return currentLocale;
}
