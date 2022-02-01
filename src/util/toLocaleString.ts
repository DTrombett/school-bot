/**
 * Formats a date or a number as a string using the provided locale.
 * @param element - The element to format
 * @param lng - The language to use
 * @returns The formatted element
 */
export const toLocaleString = (element: Date | number, lng?: string) => {
	try {
		return element.toLocaleString(lng);
	} catch (error) {
		return element.toLocaleString();
	}
};

export default toLocaleString;
