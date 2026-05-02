const required = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
};

const optional = (key: string): string | undefined => process.env[key] || undefined;

export const env = {
  MAPBOX_TOKEN_PUBLIC: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "",
  RESEND_API_KEY: optional("RESEND_API_KEY"),
  RESEND_FROM: process.env.RESEND_FROM || "StormRelief <onboarding@resend.dev>",
  SESSION_SECRET:
    process.env.SESSION_SECRET ||
    (process.env.NODE_ENV === "production"
      ? required("SESSION_SECRET")
      : "stormrelief_dev_secret_at_least_thirty_two_chars_xxxxxx"),
};

export const isDev = process.env.NODE_ENV !== "production";
