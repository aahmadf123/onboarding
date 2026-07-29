/**
 * The designated super admin. This account owns the seeded sample content, is
 * the only account `POST /api/auth/bootstrap` will issue a passcode for, and
 * cannot be deleted through the admin UI.
 *
 * Bootstrap used to pick `the lowest-id admin with no password`, which selected
 * whichever placeholder row happened to sort first rather than this account.
 */
export const PRIMARY_SUPERADMIN_EMAIL = 'utdata@utoledo.edu';
