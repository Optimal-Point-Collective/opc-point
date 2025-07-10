# Supabase Security Configuration Guide

## 1. Enable Email Confirmations

To enable email confirmations in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. Enable the following settings:
   - ✅ **Enable Email Confirmations**
   - ✅ **Secure email change (requires both new and old email to be verified)**
   - ✅ **Enable double confirm email changes**

## 2. Configure Email Templates

Update your email templates for better security:

### Confirmation Email Template
```html
<h2>Confirm your email</h2>
<p>Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't create an account with OPC Point, please ignore this email.</p>
```

### Password Reset Template
```html
<h2>Reset your password</h2>
<p>You requested a password reset. Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
```

## 3. Configure Auth Settings

In **Authentication** → **Settings**:

```json
{
  "SITE_URL": "https://your-domain.com",
  "DISABLE_SIGNUP": false,
  "EXTERNAL_EMAIL_ENABLED": true,
  "MAILER_AUTOCONFIRM": false,
  "MAILER_OTP_EXP": 3600,
  "MAILER_URLPATHS_CONFIRMATION": "/auth/confirm",
  "MAILER_URLPATHS_INVITE": "/auth/invite",
  "MAILER_URLPATHS_RECOVERY": "/auth/reset-password",
  "MAILER_URLPATHS_EMAIL_CHANGE": "/auth/email-change",
  "PASSWORD_MIN_LENGTH": 8,
  "SECURITY_CAPTCHA_ENABLED": true,
  "SECURITY_CAPTCHA_PROVIDER": "hcaptcha",
  "SECURITY_REFRESH_TOKEN_ROTATION_ENABLED": true,
  "SECURITY_REFRESH_TOKEN_REUSE_INTERVAL": 10
}
```

## 4. Row Level Security (RLS) Policies

Enable RLS for all tables and create appropriate policies:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Only admins can insert/delete users
CREATE POLICY "Only admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

## 5. Configure SMTP for Email Delivery

In **Settings** → **SMTP Settings**:

1. Enable **Custom SMTP**
2. Configure with your SMTP provider:
   - Host: `smtp.sendgrid.net` (or your provider)
   - Port: `587`
   - Username: Your SMTP username
   - Password: Your SMTP password
   - Sender email: `noreply@your-domain.com`
   - Sender name: `OPC Point`

## 6. Enable MFA (Multi-Factor Authentication)

In your application code, enable MFA:

```typescript
// Enable MFA for a user
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
});

// Verify MFA code
const { data, error } = await supabase.auth.mfa.verify({
  factorId: enrollData.id,
  challengeId: challengeData.id,
  code: totpCode
});
```

## 7. Session Configuration

Configure session settings in Supabase:

```typescript
// In your Supabase client initialization
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
    storage: {
      // Use secure storage for sessions
      getItem: (key) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      },
    },
  },
});
```

## 8. API Key Security

1. Never expose your `service_role` key in client-side code
2. Use environment variables for all keys
3. Rotate keys regularly through Supabase Dashboard
4. Use different keys for different environments (dev, staging, prod)

## 9. Monitoring and Alerts

Enable monitoring in Supabase:

1. Go to **Settings** → **Logging**
2. Enable query logs
3. Set up alerts for:
   - Failed login attempts
   - Unusual activity patterns
   - API rate limit violations

## 10. Regular Security Audits

Schedule regular security audits:

- [ ] Review RLS policies monthly
- [ ] Check for unused API keys quarterly
- [ ] Audit user permissions monthly
- [ ] Review authentication logs weekly
- [ ] Update dependencies regularly
