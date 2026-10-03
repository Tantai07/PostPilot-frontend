const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!configuredApiUrl) {
  throw new Error("VITE_API_URL is required");
}

export const API_BASE_URL = configuredApiUrl.replace(/\/$/, "");
export const API_ORIGIN = new URL(API_BASE_URL).origin;
