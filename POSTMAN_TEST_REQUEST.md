# Eazypay Apple Pay - Postman Test Request

## Request Details

### Method

**PUT**

### URL

```
https://eazypay.gateway.mastercard.com/api/rest/version/100/merchant/40018574/order/APPLEPAY-1766561308/transaction/1
```

### Authentication (Basic Auth)

**Username:** `merchant.40018574`
**Password:** `[YOUR_EAZYPAY_PASSWORD]`

In Postman:

1. Select "Basic Auth" under Authorization tab
2. Enter username: `merchant.40018574`
3. Postman will auto-encode to Base64

Or manually: `Authorization: Basic bWVyY2hhbnQuNDAwMTg1NzQ6W1lPVVJfUEFTU1dPUkRd`

### Headers

```
Content-Type: application/json
```

### Body (Raw JSON)

**Important:** The `paymentToken` should be a **plain string** (NOT a JSON object with escaped quotes).

Copy the entire raw encrypted token from your Apple Pay response and paste it as a simple string value.

```json
{
  "apiOperation": "AUTHORIZE",
  "order": {
    "amount": "0.01",
    "currency": "BHD",
    "walletProvider": "APPLE_PAY"
  },
  "sourceOfFunds": {
    "type": "CARD",
    "provided": {
      "card": {
        "devicePayment": {
          "paymentToken": "PASTE_YOUR_FULL_APPLE_PAY_TOKEN_HERE"
        }
      }
    }
  },
  "transaction": {
    "source": "INTERNET"
  }
}
```

### How to Get the Correct paymentToken

1. **From your server logs**, find the line that says:

   ```
   [SERVER] Payment data string length: XXXX bytes
   ```

2. **Copy the entire encrypted token** from the server response (it starts with `{\"data\":` and ends with `}`)

3. **Paste it directly** as the value for `paymentToken` - it should be a plain string, not escaped

**Example:**

```json
{
  "apiOperation": "AUTHORIZE",
  "order": {
    "amount": "0.01",
    "currency": "BHD",
    "walletProvider": "APPLE_PAY"
  },
  "sourceOfFunds": {
    "type": "CARD",
    "provided": {
      "card": {
        "devicePayment": {
          "paymentToken": "{\"data\":\"kEw27u2xNsba0HdC4fW4i3I...\",\"signature\":\"MIAGCSqGSIb3...\",\"header\":{...},\"version\":\"EC_v1\"}"
        }
      }
    }
  },
  "transaction": {
    "source": "INTERNET"
  }
}
```

---

## The Real Issue

**Eazypay doesn't have the Apple Pay certificate registered.**

The error `"The payment token's public key does not match any configured"` means:

- You're sending an encrypted token from Apple Pay
- Eazypay is trying to decrypt it, but doesn't have the matching Apple certificate in their system
- They need to configure the Apple Pay merchant processing certificate on their gateway

---

## Next Steps - What You Need to Do

### Option 1: Contact Eazypay Support

Ask them to:

1. **Register your Apple Pay processing certificate** with their gateway
2. Ask them for the **exact format/structure** they expect for Apple Pay tokens
3. Confirm they support Apple Pay gateway-decrypted approach
4. Get documentation on their Apple Pay setup

### Option 2: Use Your APPLE_PAY_CERT

You have `APPLE_PAY_CERT` loaded in your environment. This might be what Eazypay needs to register in their system:

- Location: environment variable `APPLE_PAY_CERT`
- You may need to provide this cert to Eazypay support

### Option 3: Check If They Need Different Approach

Ask Eazypay:

- Do they support Apple Pay gateway-decrypted tokens at all?
- Do they require you to decrypt on your server first and send individual card fields?
- What is their exact Apple Pay integration setup?

---

## Test in Postman

### Step-by-Step Instructions

1. **Create new PUT request**
2. **URL:**

   ```
   https://eazypay.gateway.mastercard.com/api/rest/version/100/merchant/40018574/order/APPLEPAY-TEST-1/transaction/1
   ```

3. **Auth Tab:**

   - Type: `Basic Auth`
   - Username: `merchant.40018574`
   - Password: `dbbb7fb7f42c5173cb86a676e5b67874` (from your .env)

4. **Headers Tab:**

   ```
   Content-Type: application/json
   ```

5. **Body Tab:**
   - Select `raw`
   - Select `JSON` from dropdown
   - Paste the body structure below:

```json
{
  "apiOperation": "AUTHORIZE",
  "order": {
    "amount": "0.01",
    "currency": "BHD",
    "walletProvider": "APPLE_PAY"
  },
  "sourceOfFunds": {
    "type": "CARD",
    "provided": {
      "card": {
        "devicePayment": {
          "paymentToken": "{\"data\":\"kEw27u2xNsba0HdC4fW4i3IFOb/LNVRDb11iniVr/JLjgpUCDEjtoglouR0V/QiMr98CvX0JJNF6akSRJHCuk6FfcKwMVq/iUTu+RCLzrLZN7Qa28aM8deX7PEW06rnUFRXbGqDagHsg85+v9JRF46S6npN7aAqH5kE5cBMOhBzOM3uFtQcDiSltNCIZjZCU4a9Wh0aNQXVjP4IKe3UAmO2bNks6gwKF6IjHBPsV9+eWf0ouF8xphnFwtftaAkZenY6vnyCCfijGLGhKqqlVznF/uoixrbHFLXIBRPqwtA1MoDB1zqletK+zQOuVWJERdPfeCu21HA0iXMmfpLmDN6551odOvg8LTl1l/e+DDpRKnexy7RDhMg6fFgYouoefpv5ZBa7Tu0zFFQ==\",\"signature\":\"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\",\"header\":{\"publicKeyHash\":\"qwQl9mC4gcvUvSdzY40536NbAphJyZPXjOmYP7RmME0=\",\"ephemeralPublicKey\":\"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE2eWbbraRJnPS8vi2LB3bLjpI2GXVxHfwylPY0uvd6WAaT1TMoiIeV0bvMJBMi9uoj44bMn45gXu+xx+RIhtElg==\",\"transactionId\":\"cdbabc27520e4fba83033e941190b278f3b080b57954b7b0963a4a30b580fc68\"},\"version\":\"EC_v1\"}"
        }
      }
    }
  },
  "transaction": {
    "source": "INTERNET"
  }
}
```

6. **Send** the request

---

### Troubleshooting

**Error: "Apple Pay payment token cannot be parsed as JSON string"**

- **Cause**: The `paymentToken` field contains extra escaping or wrong format
- **Fix**: Make sure the `paymentToken` value is a plain JSON string (starts with `{` and ends with `}`)
- **NOT this**: `"paymentToken": "\"{\\"data\\"...}\""`
- **YES this**: `"paymentToken": "{\"data\":...}"`

---

## Summary

**The issue is not with your code** - it's that Eazypay doesn't have Apple's certificate configured to decrypt Apple Pay tokens. You need to contact their support team to register your Apple Pay certificate with them.
