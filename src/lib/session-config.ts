// Session lengths. Safe to import anywhere (server, middleware and browser).

/** Customers stay signed in for 30 days. */
export const CUSTOMER_MAX_AGE = 60 * 60 * 24 * 30;
/** Admins are signed out after this many minutes without using the admin. */
export const ADMIN_IDLE_MINUTES = 30;
export const ADMIN_IDLE_SECONDS = ADMIN_IDLE_MINUTES * 60;
