# Local Testing Guide for Apple Pay

This guide walks you through testing Apple Pay locally using ngrok.

## 🚀 Step 1: Install ngrok

### On Windows:

1. Download from: https://ngrok.com/download
2. Extract the executable to a folder (e.g., `C:\ngrok`)
3. Add it to your PATH or use the full path to run it

Verify installation:

```bash
ngrok version
```

---

## 🌐 Step 2: Start Your Local Server

In one terminal window, start your Apple Pay server:

```bash
npm start
```

You should see:

```
Server running on http://localhost:3000
```

Keep this terminal open.

---

## 🔗 Step 3: Expose localhost with ngrok

In a **NEW** terminal window, run:

```bash
ngrok http 3000
```

You'll see output like:

```
ngrok by @inconshrevat                       (Ctrl+C to quit)

Session Status                online
Account                       your-email@example.com
Version                        3.x.x
Region                         us (United States)
Latency                        45ms
Web Interface                  http://127.0.0.1:4040

Forwarding                     https://xxxx-xx-xxx-xxx-xx.ngrok.io -> http://localhost:3000

Connections                    ttotal    mean    median   p95
                               0         0.00ms  0.00ms   0.00ms
```

**Copy the HTTPS URL** (the one that looks like `https://xxxx-xx-xxx-xxx-xx.ngrok.io`)

Keep this terminal open too.

---

## 📝 Step 4: Register Your Domain with Apple

1. Go to [Apple Developer Account](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → Select your **Merchant ID**
4. Click **Edit**
5. Under **Associated Domains**, click **Add Domain**
6. Paste your ngrok URL (WITHOUT `https://`):
   ```
   xxxx-xx-xxx-xxx-xx.ngrok.io
   ```
7. Click **Save**

Apple will show you a **Verification File** to download.

---

## 💾 Step 5: Create the Verification Endpoint

1. In your project root, create a folder:

   ```bash
   mkdir .well-known
   ```

2. Create the verification file in that folder:

   ```
   .well-known/apple-developer-merchantid-domain-association
   ```

3. Open the verification file Apple gave you and copy its content
4. Paste it into your newly created file

Your file structure should look like:

```
apple-pay/
├── .well-known/
│   └── apple-developer-merchantid-domain-association
├── public/
├── src/
├── server.js
└── package.json
```

---

## 🔧 Step 6: Update server.js to Serve the Verification File

Edit your `server.js` file and add this line **before other routes**:

```javascript
// Serve the Apple Pay domain verification file
app.use("/.well-known", express.static(".well-known"));
```

Your server.js should look like:

```javascript
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// 👇 ADD THIS LINE
app.use("/.well-known", express.static(".well-known"));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ... rest of your code
```

---

## ✅ Step 7: Verify the Domain File is Accessible

1. **Stop and restart your server:**

   ```bash
   # Press Ctrl+C in the npm start terminal
   # Then run:
   npm start
   ```

2. **Test the URL in your browser:**
   Visit: `https://xxxx-xx-xxx-xxx-xx.ngrok.io/.well-known/apple-developer-merchantid-domain-association`

   You should see the verification file content (it's usually a long string).

3. **If it works:** Go back to Apple Developer and click **Verify**

---

## 🍎 Step 8: Update Your Merchant ID in the Code

Edit `public/app.js` and make sure your MERCHANT_ID matches:

```javascript
const MERCHANT_ID = "merchant.com.yourcompany.applepay"; // Match what you registered with Apple
```

---

## 📱 Step 9: Test on a Real Device

### Requirements:

- iPhone, iPad, or Mac with Safari
- Connected to the same network (or internet)
- Running iOS 11+ or macOS 10.12+

### Test Steps:

1. **On your iPhone/iPad/Mac**, open Safari
2. Visit your ngrok URL:

   ```
   https://xxxx-xx-xxx-xxx-xx.ngrok.io
   ```

3. You should see the Apple Pay checkout page
4. Click the **"Pay with Apple Pay"** button
5. You should see the Apple Pay payment sheet (requires Face ID/Touch ID or Apple Pay card)

### If Apple Pay doesn't show:

- Check browser console (Safari → Develop → Console)
- Verify domain is registered with Apple
- Verify verification file is accessible at the `.well-known` URL
- Make sure you're using HTTPS (ngrok provides this automatically)

---

## ⚡ Quick Reference Commands

### Terminal 1 (Server):

```bash
npm start
```

### Terminal 2 (ngrok):

```bash
ngrok http 3000
```

### Test the verification file:

```bash
# Windows PowerShell or curl:
curl https://xxxx-xx-xxx-xxx-xx.ngrok.io/.well-known/apple-developer-merchantid-domain-association
```

---

## 🔄 Each Time You Restart ngrok

**Important:** Every time you restart ngrok, you get a NEW URL

1. Stop ngrok (Ctrl+C)
2. Run `ngrok http 3000` again
3. Copy the new URL
4. Update it in Apple Developer → Your Merchant ID → Associated Domains
5. Re-verify the domain

To avoid this, you can use **ngrok custom domains** (paid feature) to always get the same URL.

---

## 🐛 Troubleshooting

### "Apple Pay is not available"

- Make sure you're on Safari on iPhone/iPad or Mac
- Verify your ngrok URL is accessible from the device
- Check that domain is verified with Apple

### "Cannot access verification file"

- Run: `curl https://your-ngrok-url/.well-known/apple-developer-merchantid-domain-association`
- Make sure the `.well-known` folder exists
- Restart your server with `npm start`

### "Domain verification failed"

- The file content must be EXACTLY what Apple provided
- No extra spaces or newlines
- File must be served at the exact path

### ngrok tunnel is slow/unstable

- ngrok free tier has rate limiting
- Consider upgrading or testing with a direct IP
- Use a wired connection for best results

---

## 📋 Checklist

- [ ] ngrok installed and working
- [ ] Local server running on `npm start`
- [ ] ngrok exposing localhost on port 3000
- [ ] `.well-known` folder created with verification file
- [ ] server.js updated to serve `.well-known` folder
- [ ] Verification file accessible at the URL
- [ ] Domain registered and verified with Apple
- [ ] Merchant ID updated in `app.js`
- [ ] Tested on real iOS device with Safari
- [ ] Apple Pay button appears and works

---

## Next Steps

Once local testing works:

1. Deploy to AWS SAM with a real domain
2. Register that domain with Apple
3. Upload verification file to production
4. Test on real device with production URL

Good luck! 🍎
