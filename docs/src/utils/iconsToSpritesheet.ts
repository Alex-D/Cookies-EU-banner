export function iconsToSpritesheet(iconFiles: Record<string, string>) {
	let svgSpriteParts: string[] = ['<svg xmlns="http://www.w3.org/2000/svg">'];

	for (const [iconFileName, iconSvg] of Object.entries(iconFiles)) {
		const iconId = iconFileNameToIconId(iconFileName);

		const iconSymbol = iconSvg
			.replace(/<svg ((width|height)="1em" ?)*/, `<symbol id="${iconId}" `)
			.replace('xmlns="http://www.w3.org/2000/svg"', "")
			.replace("</svg>", "</symbol>");
		svgSpriteParts.push(iconSymbol);
	}

	svgSpriteParts.push("</svg>");

	return svgSpriteParts.join("");
}

export function iconFileNameToIconId(iconName: string): string {
	return iconName.split("/").pop()!.replace(".svg", "");
}
