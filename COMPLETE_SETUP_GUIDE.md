# Complete Apple Pay Setup - Step by Step

You have your Merchant ID: `merchant.com.uic.sam-uic-offers`

Follow these steps to get Apple Pay fully working.

---

## ✅ STEP 1: Register Your Domain with Apple

### What is this?
You need to tell Apple what domain your Apple Pay button will be on.

### How to do it:

1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click **Identifiers** in left menu
3. Find and click your **Merchant ID**: `merchant.com.uic.sam-uic-offers`
4. Scroll down to **Associated Domains**
5. Click **Add Domain**
6. Enter your domain:
   - For local testing with ngrok: `xxxx-xxxx-xxxx.ngrok.io` (without https://)
   - For AWS SAM: Your actual domain
7. Click **Save**

**✓ Domain is now registered**

---

## ✅ STEP 2: Download Verification File from Apple

### What is this?
Apple gives you a verification file to prove you own this domain.

### How to do it:

1. After registering domain, Apple shows: **"Verification Required"**
2. Click the **Download** button next to your domain
3. A file downloads (no extension, just text)
4. **Copy the entire content of this file**

**Example content** (yours will be different):
```
8E1C2C4D-7F8A-4B9C-6E5D-2A8F9B3C7E1D...
```

---

## ✅ STEP 3: Save Verification File to Your Project

### Where to put it:

The file path must be: `.well-known/apple-developer-merchantid-domain-association`

It's already created in your project at:
```
C:\Users\ali.yusuf\Documents\apple-pay\.well-known\apple-developer-merchantid-domain-association
```

### How to update it:

1. Open the file in your editor
2. **Delete everything** in it
3. **Paste Apple's verification file content**
4. **Save it**

⚠️ **Important:** 
- No extra text, spaces, or newlines
- Paste EXACTLY what Apple gave you
- Nothing more, nothing less

---

## ✅ STEP 4: Test That the File is Accessible

### Check locally:

In your browser, visit:
```
http://localhost:3000/.well-known/apple-developer-merchantid-domain-association
```

You should see the verification file content (long string).

If you see the content ✓ → Move to next step

### Check with ngrok:

If using ngrok (e.g., `https://xxxx-xxxx-xxxx.ngrok.io`):

Visit in browser:
```
https://xxxx-xxxx-xxxx.ngrok.io/.well-known/apple-developer-merchantid-domain-association
```

You should see the verification content.

---

## ✅ STEP 5: Verify Domain with Apple

### How to verify:

1. Go back to Apple Developer → Your Merchant ID
2. Under **Associated Domains**, find your domain
3. Click **Verify**
4. Apple checks if the file is accessible
5. You should see: **"Verified"** ✓

**If verification fails:**
- Make sure file content is exactly what Apple provided
- Make sure server is running
- Make sure ngrok is running (if testing with ngrok)
- Wait a minute and try again

---

## ✅ STEP 6: Create Payment Processing Certificate

### What is this?
This certificate encrypts payment data between user and Apple.

### How to create it:

1. Go to: https://developer.apple.com/account/resources/certificates/list
2. Click **+** to create new certificate
3. Select **Apple Pay Payment Processing Certificate**
4. Select your Merchant ID from dropdown
5. Click **Continue**
6. You need a **Certificate Signing Request (CSR)**

### Generate CSR on Windows:

Open Command Prompt and run:

```bash
openssl req -new -newkey rsa:2048 -nodes -out C:\Users\ali.yusuf\Documents\apple-pay\csr\paymentprocessing.csr -keyout C:\Users\ali.yusuf\Documents\apple-pay\csr\paymentprocessing.key -subj "/CN=paymentprocessing"
```

**This creates:**
- `paymentprocessing.csr` → Upload to Apple
- `paymentprocessing.key` → **Keep safe, never share**

⚠️ Don't have OpenSSL? Download from: https://slproweb.com/products/Win32OpenSSL.html (Light version)

### Continue with Apple:

1. Upload the `.csr` file to Apple
2. Click **Continue**
3. Download the certificate (`.cer` file)
4. Save it somewhere safe: `C:\Users\ali.yusuf\Documents\apple-pay\certs\`

**You now have:**
- Certificate (`.cer`)
- Private key (`.key`)

---

## ✅ STEP 7: Create Merchant Identity Certificate

### Why do you need this?
This is for backend server-to-server communication with Apple.

### How to create it:

Same process as Step 6:

1. Go to: https://developer.apple.com/account/resources/certificates/list
2. Click **+**
3. Select **Apple Pay Merchant Identity Certificate**
4. Select your Merchant ID
5. Click **Continue**

### Generate CSR:

```bash
openssl req -new -newkey rsa:2048 -nodes -out C:\Users\ali.yusuf\Documents\apple-pay\csr\merchantidentity.csr -keyout C:\Users\ali.yusuf\Documents\apple-pay\csr\merchantidentity.key -subj "/CN=merchantidentity"
```

### Upload and Download:

1. Upload the `.csr`
2. Download the certificate
3. Save both files safely

**You now have:**
- Merchant Identity Certificate (`.cer`)
- Private key (`.key`)

---

## ✅ STEP 8: Get Your Team ID and Key ID

### Team ID:

1. Go to: https://developer.apple.com/account/
2. Click **Membership**
3. Find **Team ID** (e.g., `XXXXXXXXXX`)
4. **Copy and save it**

### Key ID:

1. Go to: https://developer.apple.com/account/resources/authkeys/list
2. Click **+** to create new key
3. Name it something like "Apple Pay"
4. Check the box for "Apple Pay Merchant API"
5. Click **Continue**
6. Click **Register**
7. Download the key (`.p8` file)
8. The **Key ID** is shown on the screen (looks like: `1ABC2DEF3G`)
9. **Save both the key and Key ID**

---

## ✅ STEP 9: Update Your `.env` File

Create or update `.env` in your project root:

```
APPLE_MERCHANT_ID=merchant.com.uic.sam-uic-offers
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_MERCHANT_CERTIFICATE=/path/to/paymentprocessing.cer
APPLE_MERCHANT_KEY=/path/to/paymentprocessing.key
APPLE_MERCHANT_IDENTITY_CERTIFICATE=/path/to/merchantidentity.cer
APPLE_MERCHANT_IDENTITY_KEY=/path/to/merchantidentity.key
PORT=3000
```

Replace `YOUR_TEAM_ID`, `YOUR_KEY_ID`, and paths with your actual values.

---

## ✅ STEP 10: Test on Real Device

### Requirements:
- iPhone, iPad, or Mac with Safari
- Must support Apple Pay (most modern devices do)
- iOS 11+ or macOS 10.12+

### Testing Steps:

1. **Make sure your server is running:**
   ```bash
   npm start
   ```

2. **Make sure ngrok is running** (if testing remote):
   ```bash
   C:\Users\ali.yusuf\Downloads\ngrok\ngrok.exe http 3000
   ```

3. **On your iPhone/iPad/Mac Safari:**
   - Visit your ngrok URL or domain
   - You should see the Apple Pay checkout page
   - Click **"Pay with Apple Pay"** button

4. **What happens:**
   - Apple Pay sheet appears
   - You can select saved cards or add new card
   - Complete payment with Face ID/Touch ID
   - You'll see "Payment successful" message

---

## 📋 Quick Checklist

- [ ] Register domain with Apple
- [ ] Download verification file from Apple
- [ ] Save verification file to `.well-known/` folder
- [ ] Test file is accessible (http://localhost:3000/.well-known/...)
- [ ] Verify domain with Apple (should show "Verified" ✓)
- [ ] Create Payment Processing Certificate + CSR
- [ ] Download Payment Processing Certificate
- [ ] Create Merchant Identity Certificate + CSR
- [ ] Download Merchant Identity Certificate
- [ ] Get Team ID from Account Settings
- [ ] Get Key ID from API Keys
- [ ] Update `.env` file with all credentials
- [ ] Test on real iPhone/iPad/Mac Safari

---

## 🆘 Common Issues & Solutions

### "Domain verification failed"
**Solution:**
- File content must be EXACTLY what Apple provided
- No extra spaces or newlines
- Server must be running
- Wait 1-2 minutes and try again

### "Apple Pay button doesn't appear"
**Solution:**
- Must be on Safari on iPhone/iPad/Mac
- Domain must be verified (Verified ✓)
- Check browser console for errors
- Make sure you're using HTTPS (ngrok provides this)

### "Merchant validation failed"
**Solution:**
- Check that domain is verified
- Check that Merchant ID is correct
- Check that certificate is properly loaded

### OpenSSL not found
**Solution:**
- Download: https://slproweb.com/products/Win32OpenSSL.html
- Install "Light" version
- Restart terminal and try again

---

## 🔐 Security Notes

⚠️ **Never commit to GitHub:**
- `.env` file
- Private keys (`.key` files)
- Certificates (`.cer`, `.p8` files)

Use `.gitignore` to exclude these:
```
.env
certs/
csr/
```

---

## Next Steps After Setup

Once everything works:

1. Test with real transactions
2. Deploy to AWS SAM
3. Register production domain with Apple
4. Configure backend payment processing
5. Go live!

---

Questions? Check:
- Apple Pay Documentation: https://developer.apple.com/apple-pay/
- Your project's APPLE_PAY_SETUP.md
- LOCAL_TESTING_GUIDE.md for ngrok help
