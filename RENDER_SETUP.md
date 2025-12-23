# Setting Up Certificates on Render

Since you cannot commit certificates to GitHub, you need to add them to Render manually.

## Steps:

### 1. Go to Render Dashboard

- Visit https://dashboard.render.com
- Select your "apple-pay" service

### 2. Add Environment Variables

- Click "Environment" on the left sidebar
- Add the following environment variables:

**Option A: Upload certificates as base64 strings (Recommended)**

Run this in PowerShell to get base64 encoded certificates:

```powershell
# For Apple Pay certificate
$appleCertPath = "C:\Users\ali.yusuf\Documents\apple-pay\certs\apple_pay.cer"
$appleCertBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($appleCertPath))
Write-Host "APPLE_PAY_CERT=$appleCertBase64"


# For Merchant ID certificate
$merchantCertPath = "C:\Users\ali.yusuf\Documents\apple-pay\certs\merchant_id.cer"
$merchantCertBase64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($merchantCertPath))
Write-Host "MERCHANT_ID_CERT=$merchantCertBase64"


```

Then copy each output and add as environment variables in Render:

- `APPLE_PAY_CERT` = (base64 string from above)
- `MERCHANT_ID_CERT` = (base64 string from above)

### 3. Update your .env.example (for reference, DON'T commit secrets)

```
EAZYPAY_MERCHANT_ID=your_merchant_id
EAZYPAY_PASSWORD=your_password
APPLE_PAY_CERT=<base64_encoded_certificate>
MERCHANT_ID_CERT=<base64_encoded_certificate>
```

### 4. Restart Render Service

- Click the three dots menu → "Manual Deploy"
- Select "Deploy latest commit"

## For Development (Local)

Keep your `.env` file locally with the actual certificate paths:

```
APPLE_PAY_CERT_PATH=./certs/apple_pay.cer
MERCHANT_ID_CERT_PATH=./certs/merchant_id.cer
```

The app will read from the file system locally but from environment variables on Render.

## Security Notes

✓ Certificates are NOT in Git (protected by .gitignore)
✓ Certificates stored securely in Render environment
✓ Never share environment variable values
✓ Regenerate certificates if compromised
