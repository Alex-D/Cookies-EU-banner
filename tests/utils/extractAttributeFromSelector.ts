export const extractHtmlAttributeFromSelector = (selector: string) => {
	if (selector.startsWith("#")) {
		return selector.replace(/^#/, 'id="').replace(/$/, '"');
	}

	if (selector.startsWith(".")) {
		return selector.replace(/^./, 'class="').replace(/$/, '"');
	}

	throw new Error(
		`Selector "${selector}" not supported in test extractHtmlAttributeFromSelector util`,
	);
};
