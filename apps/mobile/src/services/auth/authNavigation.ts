const ALLOWED_AUTH_RETURN_PATH_PREFIXES = [
  "/applications",
  "/courses",
  "/create-job",
  "/engine",
  "/jobs",
  "/messages",
  "/onboarding/interests",
  "/organizations",
  "/profile",
  "/services",
  "/tasks",
] as const;

export function buildLoginPath(returnTo?: string | null) {
  const safeReturnTo = sanitizeAuthReturnPath(returnTo);

  return safeReturnTo
    ? `/login?returnTo=${encodeURIComponent(safeReturnTo)}`
    : "/login";
}

export function buildSignupPath(returnTo?: string | null) {
  const safeReturnTo = sanitizeAuthReturnPath(returnTo);

  return safeReturnTo
    ? `/login?mode=signup&returnTo=${encodeURIComponent(safeReturnTo)}`
    : "/login?mode=signup";
}

export function sanitizeAuthReturnPath(value?: string | string[] | null) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return null;
  }

  const decoded = decodeReturnPath(rawValue.trim());

  if (!decoded) {
    return null;
  }

  if (
    decoded.length > 2048 ||
    containsControlCharacter(decoded) ||
    decoded.includes("\\") ||
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(decoded)
  ) {
    return null;
  }

  const pathname = getPathname(decoded);

  if (!pathname || pathname.includes("//") || pathname === "/login") {
    return null;
  }

  if (pathname === "/") {
    return "/";
  }

  const isAllowed = ALLOWED_AUTH_RETURN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  return isAllowed ? decoded : null;
}

function decodeReturnPath(value: string) {
  let decoded = value;

  for (let index = 0; index < 2; index += 1) {
    if (!/%[0-9a-f]{2}/i.test(decoded)) {
      break;
    }

    try {
      decoded = decodeURIComponent(decoded);
    } catch {
      return null;
    }
  }

  return decoded.trim();
}

function getPathname(value: string) {
  return value.split(/[?#]/, 1)[0] ?? "";
}

function containsControlCharacter(value: string) {
  return /[\u0000-\u001F\u007F]/.test(value);
}
