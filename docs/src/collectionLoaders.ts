import { getCollection, getEntry } from "astro:content";

import { Collection } from "./content.config.ts";

// Lowest order first
function sortByOrder<T extends { data: { order: number } }>(item1: T, item2: T): number {
	return item1.data.order - item2.data.order;
}

function filterDrafts<T extends { data: { isDraft?: boolean } }>(item: T): boolean {
	return !item.data.isDraft;
}

/**
 * Collection Loaders
 */

export async function getProjects() {
	return (await getCollection(Collection.PROJECTS, filterDrafts)).sort(sortByOrder);
}

export async function getProject(id: string) {
	return getEntry(Collection.PROJECTS, id);
}

export async function getSocials() {
	return await getCollection(Collection.SOCIALS, filterDrafts);
}

export async function getSocial(id: string) {
	return getEntry(Collection.SOCIALS, id);
}
