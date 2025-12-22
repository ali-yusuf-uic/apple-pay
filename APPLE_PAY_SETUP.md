# Apple Pay Setup Guide

This guide walks you through everything you need to get from Apple to make Apple Pay work.

## 📋 Requirements Checklist

- [ ] Apple Developer Account
- [ ] Merchant ID
- [ ] Payment Processing Certificate
- [ ] Domain Verification File
- [ ] Merchant Identity Certificate
- [ ] Key ID
- [ ] Team ID

---

## Step 1: Create an Apple Developer Account

1. Go to [Apple Developer Account](https://developer.apple.com)
2. Sign up or login to your account
3. Agree to the Apple Developer Agreement

---

## Step 2: Register Your Merchant ID

1. Go to **Certificates, Identifiers & Profiles** in [Apple Developer](https://developer.apple.com/account)
2. Click **Identifiers** in the left sidebar
3. Click the **+** button to create a new identifier
4. Select **Merchant IDs**
5. Enter a description (e.g., "My Apple Pay Merchant")
6. Enter a Merchant ID in the format: `merchant.com.yourcompany.applepay`
7. Click **Continue** and then **Register**
8. **Save this Merchant ID** - you'll need it in `app.js`

### Update Your Code:

```javascript
const MERCHANT_ID = "merchant.com.yourcompany.applepay"; // Update this
```

---

## Step 3: Register Your Domain

1. Go back to **Certificates, Identifiers & Profiles**
2. Click **Identifiers** → Select your **Merchant ID**
3. Under **Associated Domains**, click **Edit**
4. Add your website domain (e.g., `example.com`)
5. Click **Save**

### Domain Verification:

Apple will ask you to verify domain ownership:

1. You'll receive a verification file (domain-validation file)
2. Download this file
3. Upload it to your server at: `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`
4. Click **Verify** in Apple Developer portal

If you don't verify the domain, Apple Pay will not work on your domain.

---

## Step 4: Create a Payment Processing Certificate

1. Go to **Certificates, Identifiers & Profiles** → **Certificates**
2. Click the **+** button
3. Select **Apple Pay Payment Processing Certificate**
4. Select your **Merchant ID** from the dropdown
5. Click **Continue**
6. Upload a **Certificate Signing Request (CSR)**

   - On macOS: Use Keychain Access
   - On Windows: Use OpenSSL

   **OpenSSL Command (Windows/Linux/Mac):**

   ```bash
   openssl req -new -newkey rsa:2048 -nodes -out paymentprocessing.csr -keyout paymentprocessing.key -subj "/CN=paymentprocessing"
   ```

7. Download the certificate
8. **Save both the certificate and the key file** - you'll need them for processing payments

---

## Step 5: Create a Merchant Identity Certificate

1. Go to **Certificates, Identifiers & Profiles** → **Certificates**
2. Click the **+** button
3. Select **Apple Pay Merchant Identity Certificate**
4. Select your **Merchant ID**
5. Upload a new **Certificate Signing Request**

   ```bash
   openssl req -new -newkey rsa:2048 -nodes -out merchantidentity.csr -keyout merchantidentity.key -subj "/CN=merchantidentity"
   ```

6. Download the certificate
7. **Save the certificate and key**

---

## Step 6: Get Your Key ID and Team ID

1. Go to **Account Settings** in Apple Developer
2. Under **Membership**, find your **Team ID**
3. Write it down

For the **Key ID**, you'll create an API key:

1. Go to **Account Settings** → **API Keys**
2. Click **+** to create a new key
3. Give it a name related to Apple Pay
4. Download the key (`.p8` file)
5. The **Key ID** is shown on the page

---

## Step 7: Test on Device

Apple Pay only works on:

- **Safari on iPhone/iPad** (iOS 11+)
- **Safari on Mac** (macOS 10.12+)
- **Apple Pay enabled websites**

You **cannot** test on Android or non-Safari browsers.

---

## Important Files to Keep Safe

Create a `.env` file (never commit to git):

```
APPLE_MERCHANT_ID=merchant.com.yourcompany.applepay
APPLE_MERCHANT_CERTIFICATE_PATH=/path/to/paymentprocessing.p8
APPLE_MERCHANT_IDENTITY_CERTIFICATE_PATH=/path/to/merchantidentity.p8
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_PAYMENT_PROCESSING_KEY=/path/to/paymentprocessing.key
```

---

## Troubleshooting

### "Apple Pay is not available on this device"

- You must use Safari on iPhone/iPad or Mac
- Your domain must be verified with Apple

### "Merchant validation failed"

- Your domain is not verified
- Your Merchant ID is incorrect
- Your certificate is expired

### "Payment processing failed"

- Your payment processing certificate is invalid
- Your backend server is not properly configured

---

## Security Notes

⚠️ **Never commit these files to GitHub:**

- `.env` file with secrets
- Certificate keys (`.p8`, `.key` files)
- Merchant certificates

Use environment variables or secure vaults instead.

---

## Next Steps

1. ✅ Create Apple Developer Account
2. ✅ Register Merchant ID
3. ✅ Add domain and verify it
4. ✅ Create payment processing certificate
5. ✅ Get your Key ID and Team ID
6. ✅ Update `app.js` with your Merchant ID
7. ✅ Deploy to HTTPS domain
8. ✅ Test on Safari on real iPhone/iPad

Once you have all these, update the values in your `.env` file and the code will work!

---

## Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/apple_pay)
- [Setting Up Apple Pay](https://developer.apple.com/documentation/apple_pay/setting_up_apple_pay)
- [Apple Pay JS API](https://developer.apple.com/documentation/apple_pay_on_the_web)
