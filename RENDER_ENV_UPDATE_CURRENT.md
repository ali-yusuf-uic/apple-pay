# 🔄 RENDER ENVIRONMENT VARIABLES - UPDATED

**Date Updated**: Updated with new Apple Pay Payment Processing Certificate from Eazypay

---

## ⚙️ REQUIRED ENVIRONMENT VARIABLES FOR RENDER

Go to: **Render Dashboard → apple-pay service → Settings → Environment**

### 1. APPLE_PAY_CERT ✅ (NEW - PAYMENT PROCESSING CERTIFICATE)

**What is it?**: Payment Processing Certificate from Eazypay (apple_pay.cer)  
**Valid until**: Jan 24, 2028  
**Format**: Base64-encoded PEM certificate

```
LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUVtakNDQkVDZ0F3SUJBZ0lJZVhtMVo0Yzd3OGt3Q2dZSUtvWkl6ajBFQXdJd2dZQXhOREF5QmdOVkJBTU0KSzBGd2NHeGxJRmR2Y214a2QybGtaU0JFWlhabGJHOXdaWElnVW1Wc1lYUnBiMjV6SUVOQklDMGdSekl4SmpBawpCZ05WQkFzTUhVRndjR3hsSUVObGNuUnBabWxqWVhScGIyNGdRWFYwYUc5eWFYUjVNUk13RVFZRFZRUUtEQXBCCmNIQnNaU0JKYm1NdU1Rc3dDUVlEVlFRR0V3SlZVekFlRncweU5URXlNalV3TnpRd01qSmFGdzB5T0RBeE1qUXcKTnpRd01qRmFNSUhMTVM4d0xRWUtDWkltaVpQeUxHUUJBUXdmYldWeVkyaGhiblF1WTI5dExuVnBZeTV6WVcwdApkV2xqTFc5bVptVnljekZGTUVNR0ExVUVBd3c4UVhCd2JHVWdVR0Y1SUZCaGVXMWxiblFnVUhKdlkyVnpjMmx1Clp6cHRaWEpqYUdGdWRDNWpiMjB1ZFdsakxuTmhiUzExYVdNdGIyWm1aWEp6TVJNd0VRWURWUVFMREFwSU9FZEwKUXpaVVVGWlRNUzh3TFFZRFZRUUtEQ1pVU0VVZ1ZVNUpWRVZFSUVsT1UxVlNRVTVEUlNCRFQwMVFRVTVaSUVJdQpVeTVESUNoREtURUxNQWtHQTFVRUJoTUNRa2d3V1RBVEJnY3Foa2pPUFFJQkJnZ3Foa2pPUFFNQkJ3TkNBQVRrCjNVN1dwRUR6SG1EY3p4bkVUdlB6WGlUNThQK3NkKzdSWDRQeXNTbnBzMERlYVFPb2NkaUYxOE1oZEc4UnZsVEwKZVNlR2phenVSb3VqNnlOZ21Ld1NvNElDVlRDQ0FsRXdEQVlEVlIwVEFRSC9CQUl3QURBZkJnTlZIU01FR0RBVwpnQlNFdG9UTU9vWmljaFpabE9nYW83MUkzenJmQ3pCSEJnZ3JCZ0VGQlFjQkFRUTdNRGt3TndZSUt3WUJCUVVICk1BR0dLMmgwZEhBNkx5OXZZM053TG1Gd2NHeGxMbU52YlM5dlkzTnd4RGN0WVhCd2JHVjNkMlJ5WTJFeU1ERXcKZ2dFZEJnTlZIU0FFZ2dFVU1JSUJFRENDQVF3R0NTcUdTSWIzWTJRRkFUQ0IvakNCd3dZSUt3WUJCUVVIQWdJdwpnYllNZ2JOU1pXeHBZVzVqWlNCdmJpQjBhR2x6SUdObGNuUnBabWxqWVhSbElHSjVJR0Z1ZVNCd1lYSjBlU0JoCmMzTjFiV1Z6SUdGalkyVndkR0Z1WTJVZ2IyWWdkR2hsSUhSb1pXNGdZWEJ3YkdsallXSnNaU0J6ZEdGdVpHRnkKWkNCMFpYSnRjeUJoYm1RZ1kyOXVaR2wwYVc5dWN5QnZaaUIxYzJVc0lHTmxjblJwWm1sallYUmxJSEJ2YkdsagplU0JoYm1RZ1kyVnlkR2xtYVdOaGRHbHZiaUJ3Y21GamRHbGpaU0J6ZEdGMFpXMWxiblJ6TGpBMkJnZ3JCZ0VGCkJRY0NBUllxYUhSMGNEb3ZMM2QzZHk1aGNIQnNaUzVqYjIwdlkyVnlkR2xtYVdOaGRHVmhkWFJvYjNKcGRIa3YKTURZR0ExVWRId1F2TUMwd0s2QXBvQ2VHSldoMGRIQTZMeTlqY213dVlYQndiR1V1WTI5dEwyRndjR3hsZDNkawpjbU5oTWk1amNtd3dIUVlEVlIwT0JCWUVGS2ZKM3pkSFdaS3JjL2d1c21iU0xmMXU3dGsvTUE0R0ExVWREd0VCCi93UUVBd0lES0RCUEJna3Foa2lHOTJOa0JpQUVRZ3hBT1RJek1EWTFRVVU1UVVBNU1DVXpRVUpFTVRNek16UXkKTmpKQk5qY3lRMEpFTmpWR09USXpOekJGUWpneU9EY3pSamhGTWpKRlJrRXdNRU15TkRjNFJEQUtCZ2dxaGtqTwpQUVFEQWdOSUFEQkZBaUVBaHg0dUE0c2wydVdvOG1hQ2dVUnZCUXIwUlArdElNTkhCMWR2anExTnRPb0NJRUtFCkFCeFNBMnFNSXJiZWRrMGFJUjQ1bkR3MlpFMkxGZjVXZ3V1enN1amwKLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=
```

---

### 2. EAZYPAY_MERCHANT_ID ✅ (KEEP AS IS)

```
40018574
```

---

### 3. EAZYPAY_PASSWORD ✅ (KEEP AS IS)

```
(Use your existing password - don't change)
```

---

## 📋 HOW TO UPDATE IN RENDER

### Step-by-Step:

1. **Go to Render Dashboard**

   - URL: https://dashboard.render.com

2. **Select Your Service**

   - Click on "apple-pay" service

3. **Open Settings**

   - Click "Settings" tab (top right)

4. **Update Environment Variables**

   - Scroll to "Environment" section
   - You should see these variables listed:
     - `APPLE_PAY_CERT` ← **UPDATE THIS**
     - `EAZYPAY_MERCHANT_ID` ← Keep as is
     - `EAZYPAY_PASSWORD` ← Keep as is

5. **Edit APPLE_PAY_CERT**

   - Click the pencil (edit) icon next to `APPLE_PAY_CERT`
   - **Clear the current value completely**
   - **Paste the entire base64 string above** (copy from the code block)
   - Click "Save"

6. **Wait for Redeploy**

   - Render will auto-redeploy (2-3 minutes)
   - You'll see a notification when deployment completes

7. **Verify**
   - Open https://apple-pay-h5sj.onrender.com
   - Test the Apple Pay flow

---

## ✅ WHAT'S DIFFERENT FROM BEFORE?

| Item                 | Before                      | Now                         | Why                                               |
| -------------------- | --------------------------- | --------------------------- | ------------------------------------------------- |
| **APPLE_PAY_CERT**   | Old certificate from Dec 22 | NEW certificate from Dec 25 | Eazypay issued new Payment Processing Certificate |
| **MERCHANT_ID_CERT** | Set (but not used)          | **REMOVE IF EXISTS**        | Not needed for payment processing                 |
| **MERCHANT_ID_KEY**  | Set (but not used)          | **REMOVE IF EXISTS**        | Not needed for payment processing                 |
| **APPLE_PAY_KEY**    | Set (but not used)          | **REMOVE IF EXISTS**        | Eazypay handles all encryption                    |

---

## ⚠️ IMPORTANT - NEXT STEP: EAZYPAY REGISTRATION

**After updating Render, you MUST do this:**

1. Log into Eazypay Merchant Dashboard
2. Go to: **Admin → Device Payments → Apple Pay**
3. Upload the new certificate file: `EZPAY_CERT.pem`
4. **Wait for confirmation** that certificate is registered
5. Then test the Apple Pay flow

**Without this step**, you'll continue to see the error:

```
"The payment token's public key does not match any configured"
```

---

## 🔗 CERTIFICATE INFO

- **Certificate Name**: Apple Pay Payment Processing (apple_pay.cer)
- **Merchant ID**: merchant.com.uic.sam-uic-offers
- **Valid From**: Dec 25, 2025
- **Valid Until**: Jan 24, 2028
- **Issuer**: Apple Worldwide Developer Relations CA - G2
- **Key Size**: EC P-256 (256-bit)
- **SHA**: 92306505AEA9AA93E3ABD1333426 2A67 2CBD65F923 70EB828 73F8E22EFA00C247 8D0

---

## 🆘 TROUBLESHOOTING

### If you see: "The payment token's public key does not match..."

- **Solution**: Eazypay hasn't registered the new certificate yet
- **Action**: Contact Eazypay support to register EZPAY_CERT.pem

### If the frontend loads but Apple Pay doesn't appear

- **Solution**: Browser may have cached old domain settings
- **Action**: Hard refresh (Ctrl+F5) or clear cache

### If there's a 500 error on payment submit

- **Solution**: Check Render logs
- **Action**:
  1. Go to Render dashboard
  2. Click "apple-pay" service
  3. Click "Logs" tab
  4. Look for error messages

---

## 📚 REFERENCE FILES

- **Render Cert File**: `certs/EZPAY_CERT.pem` (local backup)
- **Server Code**: `server.js` (loads APPLE_PAY_CERT from env)
- **Frontend Code**: `public/app.js` (sends paymentData to server)

---

**Status**: ✅ Ready to deploy to Render  
**Last Updated**: New certificate from Eazypay (Dec 25, 2025)
