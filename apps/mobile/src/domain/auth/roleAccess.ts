import type { AuthRole, AuthUser } from "./auth.types";

export function isTrustedAdmin(user: AuthUser | null | undefined) {
  return user?.isAdmin === true;
}

export function hasRole(user: AuthUser | null | undefined, role: AuthRole) {
  if (role === "admin") {
    return isTrustedAdmin(user);
  }

  return user?.role === role || user?.roles?.includes(role) === true;
}

export function isAdmin(user: AuthUser | null | undefined) {
  return isTrustedAdmin(user);
}

export function canAccessRole(
  user: AuthUser | null | undefined,
  role: AuthRole
) {
  return isTrustedAdmin(user) || hasRole(user, role);
}
