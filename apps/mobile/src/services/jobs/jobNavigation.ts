export const DEFAULT_JOB_RETURN_PATH = "/jobs";

export const ALLOWED_JOB_RETURN_PATH_PREFIXES = [
  "/engine",
  "/jobs",
  "/profile",
  "/organizations",
  "/worker-dashboard",
  "/business-dashboard",
  "/applications",
  "/application-sent",
  "/job-published",
  "/create-job",
  "/business-form",
  "/worker-form",
] as const;

type SearchParamValue = string | string[] | undefined;

export function buildJobDetailsPath(jobId: string, returnTo: string) {
  const safeReturnTo = sanitizeReturnPath(returnTo) ?? DEFAULT_JOB_RETURN_PATH;

  return `/jobs/${encodeURIComponent(jobId)}?from=${encodeURIComponent(
    safeReturnTo
  )}`;
}

export function buildInternalReturnPath(
  pathname: string,
  params?: Record<string, SearchParamValue>
) {
  const query = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          addQueryParam(query, key, item);
        }
      } else {
        addQueryParam(query, key, value);
      }
    }
  }

  const queryString = query.toString();
  const path = queryString ? `${pathname}?${queryString}` : pathname;

  return sanitizeReturnPath(path) ?? DEFAULT_JOB_RETURN_PATH;
}

export function sanitizeReturnPath(value?: string | string[] | null) {
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

  if (!pathname || pathname.includes("//")) {
    return null;
  }

  const isAllowed = ALLOWED_JOB_RETURN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  return isAllowed ? decoded : null;
}

export function getJobReturnLabel(returnPath?: string | null) {
  const safePath = sanitizeReturnPath(returnPath) ?? DEFAULT_JOB_RETURN_PATH;
  const pathname = getPathname(safePath);

  if (pathname === "/engine") {
    return "Inapoi la pagina principala";
  }

  if (pathname === "/jobs" || pathname.startsWith("/jobs/")) {
    return "Inapoi la joburi";
  }

  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    return "Inapoi la profil";
  }

  if (pathname === "/organizations" || pathname.startsWith("/organizations/")) {
    return "Inapoi la organizatii";
  }

  if (
    pathname === "/worker-dashboard" ||
    pathname === "/business-dashboard"
  ) {
    return "Inapoi la dashboard";
  }

  if (pathname === "/applications" || pathname.startsWith("/applications/")) {
    return "Inapoi la aplicatii";
  }

  return "Inapoi la joburi";
}

function addQueryParam(query: URLSearchParams, key: string, value?: string) {
  if (value && value.trim()) {
    query.append(key, value.trim());
  }
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
