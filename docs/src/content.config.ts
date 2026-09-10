import * as path from "node:path";

import { file, glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

export enum Collection {
	PROJECTS = "projects",
	SOCIALS = "socials",
}

const base = path.resolve(import.meta.dirname + "/content");

export const collections = {
	[Collection.PROJECTS]: defineCollection({
		loader: glob({
			pattern: "projects/*.yaml",
			base,
		}),
		schema: () =>
			z.object({
				isDraft: z.boolean().optional(),

				order: z.number().optional().default(1000),

				name: z.string(),
				icon: z.string().optional(),
				tagline: z.string().optional(),
				vanity: z.string().optional(),
				url: z.url().optional(),
				githubUrl: z.url().optional(),
			}),
	}),

	[Collection.SOCIALS]: defineCollection({
		loader: file(path.join(base, "socials.yaml")),
		schema: () =>
			z.object({
				isDraft: z.boolean().optional(),

				displayName: z.string(),
				url: z.url(),
				why: z.string().optional(),
			}),
	}),
};
