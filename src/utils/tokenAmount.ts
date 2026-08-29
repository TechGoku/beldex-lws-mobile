// Token supplies travel as atomic units (an integer scaled by the token's own
// decimal_point) everywhere below the UI: in tx.extra, in the daemon's
// get_token_info reply, and in the JSON descriptor files the CLI takes. Only
// the screen shows them scaled, so the conversion lives in one place.
//
// BigInt throughout: a token may declare up to 18 decimals, and a supply of
// 10^18 atomic units already exceeds what a double can hold exactly.

export function atomicToDisplay(raw: unknown, decimals: number): string {
  let v: bigint;
  try {
    v = BigInt(String(raw).trim());
  } catch {
    return "";
  }
  if (decimals <= 0) return v.toString();
  // Built from a string rather than 10n ** BigInt(decimals): the project's TS
  // target predates ES2016, where the exponent operator is not allowed on
  // bigint.
  const scale = BigInt("1" + "0".repeat(decimals));
  const whole = v / scale;
  const frac = (v % scale).toString().padStart(decimals, "0").replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole.toString();
}

// The inverse, for values the user typed. Returns null when the input is not a
// well-formed decimal or carries more fractional digits than the token can
// represent — callers surface that as a validation error rather than silently
// truncating someone's supply.
export function displayToAtomic(display: string, decimals: number): string | null {
  const trimmed = (display ?? "").trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const [whole, frac = ""] = trimmed.split(".");
  if (frac.length > decimals) return null;
  return (BigInt(whole) * BigInt("1" + "0".repeat(decimals)) + BigInt(frac.padEnd(decimals, "0") || "0")).toString();
}

// Thousands separators on the integer part only; the fraction is left alone so
// a long tail of decimals stays readable as one run of digits.
export function groupDigits(value: string): string {
  const [whole, frac] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

// Token ids are 64 hex characters — too long for a list row, and the middle
// carries no meaning to a reader, so elide it.
export function shortenTokenId(id: string, lead = 10, tail = 6): string {
  if (!id || id.length <= lead + tail + 1) return id || "";
  return `${id.slice(0, lead)}…${id.slice(-tail)}`;
}
