export const DEFAULT_COURSE_RETURN_PATH = "/courses";

export const ALLOWED_COURSE_RETURN_PATH_PREFIXES = [
  "/",
  "/engine",
  "/courses",
  "/profile",
  "/organizations",
  "/application-sent",
] as const;

const LEGACY_COURSE_RETURN_PATHS: Record<string, string> = {
  "/business": "/organizations",
  "/business-dashboard": "/organizations",
  "/business-form": "/organizations/create",
  "/freelancers": "/services",
  "/role": "/account-type",
  "/student-profile": "/profile",
  "/worker": "/profile",
  "/worker-dashboard": "/profile",
  "/worker-form": "/profile/edit",
};

type SearchParamValue = string | string[] | undefined;

export function buildCourseDetailsPath(courseId: string, returnTo: string) {
  const safeReturnTo =
    sanitizeCourseReturnPath(returnTo) ?? DEFAULT_COURSE_RETURN_PATH;

  return `/courses/${encodeURIComponent(courseId)}?from=${encodeURIComponent(
    safeReturnTo
  )}`;
}

export function buildCourseReturnPath(
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

  return sanitizeCourseReturnPath(path) ?? DEFAULT_COURSE_RETURN_PATH;
}

export function sanitizeCourseReturnPath(value?: string | string[] | null) {
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

  if (pathname === "/") {
    return "/";
  }

  const legacyPath = LEGACY_COURSE_RETURN_PATHS[pathname];

  if (legacyPath) {
    return legacyPath;
  }

  const isAllowed = ALLOWED_COURSE_RETURN_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  return isAllowed ? decoded : null;
}

export function getCourseReturnLabel(returnPath?: string | null) {
  const safePath =
    sanitizeCourseReturnPath(returnPath) ?? DEFAULT_COURSE_RETURN_PATH;
  const pathname = getPathname(safePath);

  if (pathname === "/profile" || pathname.startsWith("/profile/")) {
    return "Înapoi la profil";
  }

  if (pathname === "/organizations" || pathname.startsWith("/organizations/")) {
    return "Înapoi la organizații";
  }

  if (pathname === "/engine") {
    return "Înapoi la pagina principală";
  }

  if (pathname === "/") {
    return "Înapoi la RabAI";
  }

  return "Înapoi la cursuri";
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
