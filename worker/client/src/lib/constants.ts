/**
 * Mirrors PRIMARY_SUPERADMIN_EMAIL in worker/src/constants.ts.
 *
 * Duplicated rather than imported because the client and the Worker are
 * separate TypeScript projects with separate roots. The server is the
 * authority — it refuses to delete this account regardless of what the client
 * sends — so a drift here hides the Delete button on the wrong row at worst,
 * it cannot make the account deletable.
 */
export const PRIMARY_SUPERADMIN_EMAIL = 'utdata@utoledo.edu';
