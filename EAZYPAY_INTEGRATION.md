# Eazypay Integration Guide

Your Apple Pay project is now configured to work with Eazypay!

---

## 🔑 Step 1: Get Eazypay Credentials

You need to get these from your Eazypay account:

1. **API Key** (also called Secret Key)
2. **Merchant ID**
3. **API Endpoint** (usually `https://api.eazypay.io`)

### Where to find them:

- Go to your Eazypay Dashboard
- Settings → API Keys
- Copy your API Key and Merchant ID

---

## 📝 Step 2: Add Credentials to .env

Create or update `.env` file in your project root:

```
# Eazypay Configuration
EAZYPAY_API_KEY=your_api_key_here
EAZYPAY_MERCHANT_ID=your_merchant_id_here
EAZYPAY_ENDPOINT=https://api.eazypay.io

# Other configurations
APPLE_MERCHANT_ID=merchant.com.uic.sam-uic-offers
PORT=3000
```

### Important:

- ⚠️ **Never commit .env to GitHub** - it contains secrets
- ✅ `.gitignore` already protects it
- Store safely on your server/hosting

---

## ✅ Step 3: How It Works

### Flow:

1. **User clicks "Pay with Apple Pay"** on your website
2. **Apple Pay shows payment sheet** with saved cards
3. **User authorizes payment** with Face ID/Touch ID
4. **Payment token sent to your server** (`/api/process-payment` endpoint)
5. **Your server sends token to Eazypay**
6. **Eazypay processes payment** and returns result
7. **User sees success/failure message**

### Code Flow:

```
Frontend (app.js)
    ↓
Apple Pay Session
    ↓
User Authorizes
    ↓
Payment Token Generated
    ↓
POST /api/process-payment
    ↓
Backend (server.js)
    ↓
Send Token to Eazypay API
    ↓
Eazypay Processes Payment
    ↓
Return Result to Frontend
    ↓
User Sees Success Message
```

---

## 📊 Payment Request Format

Your server sends this to Eazypay:

```json
{
  "merchantId": "your_merchant_id",
  "amount": "9.99",
  "currency": "BHD",
  "paymentToken": "<Apple Pay Token>",
  "source": "apple_pay",
  "description": "Apple Pay Payment"
}
```

---

## 🔄 Response from Eazypay

Success response:

```json
{
  "success": true,
  "transactionId": "txn_123456789",
  "reference": "REF123456",
  "status": "completed"
}
```

Error response:

```json
{
  "success": false,
  "error": "insufficient_funds",
  "message": "Card has insufficient funds"
}
```

---

## 🧪 Testing

### Local Testing:

1. Make sure `.env` has your Eazypay credentials
2. Start server: `npm start`
3. Visit: `http://localhost:3000`
4. Click "Pay with Apple Pay"
5. Check console for logs

### On Render:

1. Add environment variables in Render dashboard:
   - Go to your Render service
   - Settings → Environment Variables
   - Add: `EAZYPAY_API_KEY`, `EAZYPAY_MERCHANT_ID`, `EAZYPAY_ENDPOINT`
2. Redeploy
3. Test on real iOS device

---

## 🔐 Security Best Practices

### ✅ DO:

- Store credentials in `.env` on server only
- Use HTTPS (Render provides this automatically)
- Validate payment on backend
- Log transactions for audit

### ❌ DON'T:

- Expose API keys in frontend code
- Commit `.env` to GitHub
- Use HTTP (always HTTPS)
- Trust client-side validation only

---

## 🐛 Debugging

### Check logs:

On Render:

```
Logs → View logs in dashboard
```

Look for messages like:

- `Payment received: ...`
- `Eazypay payment successful: txn_...`
- `Eazypay error: ...`

### Common Errors:

#### "Eazypay credentials missing in .env"

- Add `EAZYPAY_API_KEY` and `EAZYPAY_MERCHANT_ID` to .env
- Restart server

#### "Payment processing failed"

- Check API key is correct
- Check Merchant ID is correct
- Check Eazypay API endpoint is accessible
- Check amount is valid

#### "Invalid payment token"

- Token might be expired (tokens expire quickly)
- Make sure token is sent immediately after user authorizes
- Check token format matches Eazypay requirements

---

## 📈 Next Steps

1. ✅ Get Eazypay API credentials
2. ✅ Add to `.env` file
3. ✅ Test locally
4. ✅ Deploy to Render
5. ✅ Test on real iOS device
6. ✅ Monitor transactions

---

## 📞 Support

### Eazypay Docs:

- API Reference: https://docs.eazypay.io
- Payment Processing: https://docs.eazypay.io/payments
- Authentication: https://docs.eazypay.io/authentication

### Apple Pay Docs:

- Apple Pay JS API: https://developer.apple.com/documentation/apple_pay_on_the_web
- Payment Processing: https://developer.apple.com/documentation/apple_pay/payment_request_fields

---

## ✅ Checklist

- [ ] Got Eazypay API credentials
- [ ] Added credentials to `.env`
- [ ] Verified `.env` is in `.gitignore`
- [ ] Tested locally with `npm start`
- [ ] Updated environment variables on Render
- [ ] Redeployed on Render
- [ ] Tested on real iOS device
- [ ] All transactions working correctly

You're ready to accept payments! 🎉
