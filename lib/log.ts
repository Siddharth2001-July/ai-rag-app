// Tiny structured logger so server-side logs are easy to grep on Vercel.
// Each line has [scope] prefix + message + optional structured payload.
// Vercel collects console output in the Functions tab, so plain console
// is enough — we don't need a full logging library here.

type LogPayload = Record<string, unknown>;

function format(scope: string, payload?: LogPayload): string {
  if (!payload) return `[${scope}]`;
  const parts = Object.entries(payload).map(([k, v]) => {
    if (typeof v === "string") return `${k}=${JSON.stringify(v)}`;
    return `${k}=${v}`;
  });
  return `[${scope}] ${parts.join(" ")}`;
}

export const log = {
  info(scope: string, message: string, payload?: LogPayload): void {
    console.log(`${format(scope, payload)} ${message}`);
  },
  warn(scope: string, message: string, payload?: LogPayload): void {
    console.warn(`${format(scope, payload)} ${message}`);
  },
  error(scope: string, message: string, error?: unknown, payload?: LogPayload): void {
    const errMsg =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error);
    console.error(`${format(scope, payload)} ${message}: ${errMsg}`);
    if (error instanceof Error && error.stack) console.error(error.stack);
  },
};
