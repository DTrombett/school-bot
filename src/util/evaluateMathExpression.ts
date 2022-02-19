const MathIdentifiers = {
	"×": "*",
	"÷": "/",
	"^": "**",
	"π": "Math.PI",
} as const;

/**
 * Parse a math expression and return the result.
 * @param expression - The expression to be parsed
 * @returns The parsed result
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const evaluateMathExpression = async (expression: string) =>
	// eslint-disable-next-line no-useless-call
	eval.call(
		null,
		expression.replace(
			// eslint-disable-next-line security/detect-non-literal-regexp
			new RegExp(`[${Object.keys(MathIdentifiers).join("")}]`, "g"),
			(match) => MathIdentifiers[match as keyof typeof MathIdentifiers]
		)
	) as number;

export default evaluateMathExpression;
