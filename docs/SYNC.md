# Activate private cross-device preferences

1. Create or choose a Supabase project in your own account.
2. Run `supabase.sql` in the SQL editor. It enables row-level security and a field-wise, timestamp-based merge RPC that serializes concurrent writes with a row lock.
3. In Auth → Users, create your personal email/password user. Registration is not offered on the site. Do not commit the password.
4. Set `supabaseUrl` and `supabasePublishableKey` in `assets/config.js`. These are public client settings. **Never use a secret or service-role key.**
5. Publish and use the site's top-right settings button to sign in on each device.
6. Check that the indicator reaches 已同步. Change a display preference on one device, return to the site on the other device and confirm it follows. Check that account A cannot read or update account B's row before expanding beyond personal use.

Only `theme`, `kana`, `meaning`, and `reading` are synchronized. Each value has its own modification time, so changing a theme does not overwrite a newer reading position. Device clocks should be reasonably accurate. Offline changes stay local and retry upon reconnect or foregrounding. Successful remote merges preserve unsent newer local edits. Reading changes on two devices resolve to the later edit. Typing answers, scores and history are never uploaded or persisted.

State is cached under account-specific local-storage keys. Sessions persist in this browser until sign-out. Signing out switches to the device's local preferences; it does not delete cloud data. Network failure is displayed as 待同步. When configuration is absent, no cloud requests are made and the UI says 本机保存.

The SQL and REST integration are supplied but cannot be verified against a live account until a project is connected. Unit tests cover merge behavior; mocked browser tests cover UI states. Complete a two-device live test after configuring.

Official references:
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/api/securing-your-api
