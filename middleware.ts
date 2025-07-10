// This file is disabled to restore site access.
// The previous middleware was causing access issues.

export function middleware() {
  // Empty middleware - no restrictions
  return;
}

// Empty matcher means this middleware won't run anywhere
export const config = {
  matcher: [],
};
