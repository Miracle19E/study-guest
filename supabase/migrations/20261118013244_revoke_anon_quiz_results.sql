/*
# Revoke excess anon grants from quiz_results

1. Security Changes
- Revoke SELECT, INSERT, UPDATE, DELETE from anon role on quiz_results.
- This is a sign-in app; only authenticated users should access quiz_results.
- The REVOKE was intended in the previous migration but Postgres default
  privileges may have re-granted to anon. This ensures anon has no access.
*/

REVOKE SELECT, INSERT, UPDATE, DELETE ON quiz_results FROM anon;