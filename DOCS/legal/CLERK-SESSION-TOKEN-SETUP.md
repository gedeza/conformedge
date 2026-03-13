# Clerk Session Token Setup for Terms Acceptance

## Required Configuration

The terms acceptance middleware reads `publicMetadata` from the Clerk session token. You need to add this custom claim in the Clerk Dashboard.

### Steps

1. Go to **Clerk Dashboard** → **Configure** → **Sessions**
2. Click **"Customize session token"**
3. Add this JSON:

```json
{
  "metadata": "{{user.public_metadata}}"
}
```

4. Click **Save**

### Do this for BOTH instances:
- **Development** (pk_test_...) — https://dashboard.clerk.com
- **Production** (pk_live_...) — https://dashboard.clerk.com

### What this does

When a user accepts terms, the server action writes `termsAcceptedAt` and `termsVersionId` to their Clerk `publicMetadata`. The middleware then reads this from the session token (no DB call needed) to decide whether to redirect to `/terms`.

Without this configuration, the middleware will redirect ALL authenticated users to `/terms` on every request.

### Verification

After configuring, you can verify by checking the session token in browser dev tools:
1. Sign in to ConformEdge
2. Open browser dev tools → Application → Cookies
3. Find the `__session` cookie
4. Decode the JWT at jwt.io
5. You should see `"metadata": { "termsAcceptedAt": "...", "termsVersionId": "..." }` after accepting terms
