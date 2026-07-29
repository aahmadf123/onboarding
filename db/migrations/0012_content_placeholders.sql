-- Removes placeholder text that shipped as if it were real contact data.
--
-- KeyContacts id 11 (Athletics IT) carried the literal phone number
--   "TBD — update in Admin → Content → Contacts"
-- which rendered on the contacts page as a tel: link and was fed to the AI
-- assistant as a phone number. Confirmed present in production on 2026-07-29.
--
-- Nulling is the right answer rather than guessing a number: an absent phone
-- shows no Call button, while a wrong one sends a new hire to the wrong place.
-- The client now also hides values that begin with TBD/N/A/None/Unknown, so the
-- UI stays correct even if similar text is entered again through the CMS.
--
-- Safe to re-run.

UPDATE KeyContacts
SET phone = NULL
WHERE phone IS NOT NULL
  AND (
    phone LIKE 'TBD%'
    OR phone LIKE '%update in Admin%'
    OR TRIM(phone) = ''
  );

UPDATE KeyContacts
SET email = NULL
WHERE email IS NOT NULL
  AND (email LIKE 'TBD%' OR TRIM(email) = '');
