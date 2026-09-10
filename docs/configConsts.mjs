const isDev = import.meta.env?.DEV ?? process.env.NODE_ENV === "development";

export const WEBSITE_DOMAIN = isDev ? "localhost:8080" : "alex-d.github.io";
export const WEBSITE_URL = `http${isDev ? "" : "s"}://${WEBSITE_DOMAIN}`;
