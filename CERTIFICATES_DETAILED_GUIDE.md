# Creating Apple Pay Certificates - Step by Step

You're in the right place! Here's exactly what you need to do based on what you see.

---

## 🎯 What You're Looking At

You have THREE things to set up:

1. ✅ **Apple Pay Payment Processing Certificate** - For encrypting payments
2. ✅ **Apple Pay Merchant Identity Certificate** - For authenticating your server
3. ✅ **Merchant Domains** - Register the domain(s) where Apple Pay will work

---

## 📋 Order to Complete Them

Do them in this order:

1. **First:** Add your domain (Merchant Domains)
2. **Second:** Create Payment Processing Certificate
3. **Third:** Create Merchant Identity Certificate

---

## STEP 1️⃣: Add Your Domain (Start Here!)

### Click "Add Domain" Button

1. On the page you're looking at, find **Merchant Domains** section
2. Click **"Add Domain"** button

### What to enter:

**For local testing with ngrok:**
```
1a2b3c4d5e6f.ngrok.io
```
(without `https://` - just the domain)

**For AWS SAM or real domain:**
```
yourdomain.com
```
or
```
pay.yourdomain.com
```

### After adding:

1. Click **Save**
2. You should see your domain listed with status: **"Verification Required"**
3. A **[Download]** button appears next to it
4. This is the verification file you'll use later

### Important:
- **Save/remember this domain** - you'll register it with Apple Pay later
- Each time you restart ngrok, you get a new URL, so you'll need a new domain entry

---

## STEP 2️⃣: Create Payment Processing Certificate

### Click "Create Certificate" Button

1. Find **Apple Pay Payment Processing Certificate** section
2. Click **"Create Certificate"** button

### You'll see a form:

**Select your Merchant ID:**
- Dropdown will show: `merchant.com.uic.sam-uic-offers`
- It's already selected ✓

### Click "Continue"

You'll be asked to upload a **Certificate Signing Request (CSR)**

### Generate CSR on Windows:

You need to create a CSR first. Open **Command Prompt** and run:

```cmd
openssl req -new -newkey rsa:2048 -nodes -out C:\Users\ali.yusuf\Documents\apple-pay\csr\paymentprocessing.csr -keyout C:\Users\ali.yusuf\Documents\apple-pay\csr\paymentprocessing.key -subj "/CN=paymentprocessing"
```

**This creates:**
- `paymentprocessing.csr` - Upload this to Apple ✓
- `paymentprocessing.key` - Keep this safe (don't upload)

### If OpenSSL is not installed:

Error: `'openssl' is not recognized`

**Solution:**
1. Download: https://slproweb.com/products/Win32OpenSSL.html (choose "Light" version)
2. Install it
3. Restart Command Prompt
4. Try the command again

### Continue with Apple:

1. Back in Apple Developer, you should see a file upload field
2. Browse and select: `C:\Users\ali.yusuf\Documents\apple-pay\csr\paymentprocessing.csr`
3. Click **Continue**
4. Click **Download** to get the certificate (`.cer` file)
5. Save it to: `C:\Users\ali.yusuf\Documents\apple-pay\certs\paymentprocessing.cer`

### You now have:
- ✓ `paymentprocessing.csr` (uploaded)
- ✓ `paymentprocessing.key` (keep safe)
- ✓ `paymentprocessing.cer` (certificate)

---

## STEP 3️⃣: Create Merchant Identity Certificate

### Similar to Step 2

1. Find **Apple Pay Merchant Identity Certificate** section
2. Click **"Create Certificate"** button
3. Select your Merchant ID - same as before
4. Click **Continue**

### Generate another CSR:

```cmd
openssl req -new -newkey rsa:2048 -nodes -out C:\Users\ali.yusuf\Documents\apple-pay\csr\merchantidentity.csr -keyout C:\Users\ali.yusuf\Documents\apple-pay\csr\merchantidentity.key -subj "/CN=merchantidentity"
```

**This creates:**
- `merchantidentity.csr` - Upload this
- `merchantidentity.key` - Keep safe

### Continue with Apple:

1. Upload: `merchantidentity.csr`
2. Click **Continue**
3. Click **Download** certificate
4. Save to: `C:\Users\ali.yusuf\Documents\apple-pay\certs\merchantidentity.cer`

### You now have:
- ✓ `merchantidentity.csr` (uploaded)
- ✓ `merchantidentity.key` (keep safe)
- ✓ `merchantidentity.cer` (certificate)

---

## 📂 Your Project Structure After All Steps

```
apple-pay/
├── csr/
│   ├── paymentprocessing.csr      ← Upload to Apple
│   ├── paymentprocessing.key      ← Keep safe! Don't upload
│   ├── merchantidentity.csr       ← Upload to Apple
│   └── merchantidentity.key       ← Keep safe! Don't upload
├── certs/
│   ├── paymentprocessing.cer      ← Download from Apple
│   └── merchantidentity.cer       ← Download from Apple
├── public/
├── server.js
└── ...
```

---

## ⚙️ What Each File Does

### `.csr` Files (Certificate Signing Requests)
- Tell Apple: "Please sign this request"
- Upload to Apple
- After upload, you can delete them from your local machine
- They're not needed after Apple signs them

### `.key` Files (Private Keys)
- **NEVER upload to Apple**
- **NEVER commit to GitHub**
- **NEVER share with anyone**
- These decrypt the certificates
- Keep them very safe
- You'll use them in production to sign requests

### `.cer` Files (Certificates)
- Downloaded from Apple
- Safe to keep in your project
- Used for encrypting/validating payments
- Needed in your `.env` file

---

## 🔗 Quick Links for Each Step

### STEP 1: Add Domain
- Apple page: https://developer.apple.com/account/resources/identifiers/list
- Your Merchant ID: `merchant.com.uic.sam-uic-offers`
- Click your Merchant ID → Scroll to "Merchant Domains" → Click "Add Domain"

### STEP 2: Payment Processing Certificate
- Same Apple page as above
- Section: "Apple Pay Payment Processing Certificate"
- Click "Create Certificate"

### STEP 3: Merchant Identity Certificate
- Same Apple page
- Section: "Apple Pay Merchant Identity Certificate"
- Click "Create Certificate"

---

## 📋 Checklist for This Page

- [ ] Click "Add Domain" and add your domain (ngrok URL or real domain)
- [ ] Create `paymentprocessing.csr` using OpenSSL command
- [ ] Upload `paymentprocessing.csr` to Apple
- [ ] Download `paymentprocessing.cer` from Apple
- [ ] Create `merchantidentity.csr` using OpenSSL command
- [ ] Upload `merchantidentity.csr` to Apple
- [ ] Download `merchantidentity.cer` from Apple
- [ ] Save both certificates to `certs/` folder
- [ ] Save both keys to `csr/` folder (keep safe!)

---

## ⚠️ Important Notes

### Don't have OpenSSL?
Download from: https://slproweb.com/products/Win32OpenSSL.html
- Choose "Light" version
- Install it
- Restart your terminal

### CSR Generation Fails?
Make sure the directories exist first:
```cmd
mkdir C:\Users\ali.yusuf\Documents\apple-pay\csr
mkdir C:\Users\ali.yusuf\Documents\apple-pay\certs
```

### Which certificate for what?
- **Payment Processing** = For encrypting user payment data
- **Merchant Identity** = For your server to talk to Apple
- Both are needed for Apple Pay to work

### What if I lose the files?
- `.csr` files: Can be recreated anytime
- `.key` files: Can be recreated by generating a new CSR (but old one is lost)
- `.cer` files: Can be redownloaded from Apple Developer account

---

## Next Steps

After completing all 3 parts on this page:

1. Go to COMPLETE_SETUP_GUIDE.md
2. Follow STEP 3: Save verification file
3. Follow STEP 4: Test file is accessible
4. Follow STEP 5: Verify domain with Apple
5. Continue with other steps

---

Need help with OpenSSL? Or stuck on any step? Let me know! 🍎
