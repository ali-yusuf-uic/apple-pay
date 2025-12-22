# Apple Pay Integration Project

A simple HTML/CSS/JavaScript Apple Pay implementation to handle payments securely.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- HTTPS domain (required for Apple Pay)
- Apple Developer Account
- Safari browser on iPhone/iPad or Mac

### Installation

1. **Clone/Download the project**

   ```bash
   cd apple-pay
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`)

   ```bash
   cp .env.example .env
   ```

4. **Update `app.js`** with your Merchant ID
   ```javascript
   const MERCHANT_ID = "merchant.com.yourcompany.applepay";
   ```

### Running the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

## 📝 Project Structure

```
apple-pay/
├── public/
│   ├── index.html       # Main checkout page
│   ├── app.js          # Apple Pay implementation
│   └── styles.css      # Styling
├── src/
│   └── (for future backend expansion)
├── server.js           # Express server
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── APPLE_PAY_SETUP.md  # Complete Apple Pay setup guide
└── README.md           # This file
```

## 🍎 What You Need From Apple

### Required Items (See APPLE_PAY_SETUP.md for details):

1. **Merchant ID**

   - Format: `merchant.com.yourcompany.applepay`
   - Get from: Apple Developer → Identifiers → Merchant IDs

2. **Domain Verification**

   - Upload verification file to `https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association`
   - Verify in Apple Developer portal

3. **Payment Processing Certificate**

   - Required for processing payments
   - Get from: Apple Developer → Certificates → Apple Pay Payment Processing Certificate

4. **Merchant Identity Certificate**

   - Required for merchant validation
   - Get from: Apple Developer → Certificates → Apple Pay Merchant Identity Certificate

5. **Key ID and Team ID**
   - Get from: Account Settings in Apple Developer
   - Used for API authentication

## 🔧 Configuration

### Update Merchant ID

Edit `public/app.js`:

```javascript
const MERCHANT_ID = "merchant.com.yourcompany.applepay"; // Change this
```

### Environment Variables

Edit `.env`:

```
APPLE_MERCHANT_ID=merchant.com.yourcompany.applepay
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_TEAM_ID=YOUR_TEAM_ID
PORT=3000
```

## 🧪 Testing

### Local Testing

1. Start the server: `npm start`
2. Open `http://localhost:3000` in your browser
3. On non-Apple devices, you'll see the fallback option

### Real Apple Pay Testing

1. Deploy to an HTTPS domain
2. Verify domain with Apple
3. Open on Safari on iPhone/iPad or Mac
4. The Apple Pay button will appear

## 📚 API Endpoints

### POST `/api/apple-pay-session`

Creates an Apple Pay merchant validation session.

**Request:**

```json
{
  "validationURL": "https://apple-pay-validation-url",
  "merchantId": "merchant.com.yourcompany.applepay"
}
```

**Response:**

```json
{
  "merchantSession": {...}
}
```

### POST `/api/process-payment`

Processes the payment token.

**Request:**

```json
{
  "token": "payment-token-data",
  "amount": "9.99",
  "currency": "USD"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment processed successfully"
}
```

## 🔐 Security Considerations

1. **Never commit certificates or keys to Git**

   - Use `.env` files (already in `.gitignore`)
   - Use secure vaults for production

2. **Always use HTTPS**

   - Apple Pay requires secure connections

3. **Validate payments server-side**

   - Never trust client-side only

4. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

## 🐛 Troubleshooting

### Apple Pay button not showing

- Check if running on Safari
- Verify domain is registered with Apple
- Check browser console for errors

### "Cannot make payments" error

- Device/browser doesn't support Apple Pay
- Domain not verified with Apple
- Wrong Merchant ID

### Merchant validation fails

- Certificate not installed
- Domain verification incomplete
- Check APPLE_PAY_SETUP.md for detailed steps

## 📖 Additional Resources

- [Apple Developer Documentation](https://developer.apple.com/documentation/apple_pay)
- [Apple Pay on the Web](https://developer.apple.com/documentation/apple_pay_on_the_web)
- [APPLE_PAY_SETUP.md](./APPLE_PAY_SETUP.md) - Detailed setup guide

## 📄 License

ISC

## ✅ Checklist Before Going Live

- [ ] Read APPLE_PAY_SETUP.md completely
- [ ] Create Apple Developer Account
- [ ] Register Merchant ID
- [ ] Verify your domain with Apple
- [ ] Generate all required certificates
- [ ] Update `.env` with all credentials
- [ ] Update `app.js` with Merchant ID
- [ ] Test on real iPhone/iPad in Safari
- [ ] Implement proper payment processing
- [ ] Set up error handling and logging
- [ ] Deploy to HTTPS production domain
