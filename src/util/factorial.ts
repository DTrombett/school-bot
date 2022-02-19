/**
 * @param n - The number to calculate the factorial of
 * @returns The factorial of the number
 */
export const factorial = (n: number): number => {
	if (n >= 19)
		throw new RangeError(`Factorial of ${n} is too large to calculate`);
	if (n === 0) return 1;
	return n * factorial(n - 1);
};
