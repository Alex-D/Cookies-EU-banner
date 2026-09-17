export function arrayToString(strings: string[]): string {
	return "[" + strings.map((value) => `"${value}"`).join(", ") + "]";
}
