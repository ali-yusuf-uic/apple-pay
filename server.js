const express = require("express");
const path = require("path");
const https = require("https");
const fs = require("fs");
const crypto = require("crypto");
require("dotenv").config();

const app = express();

// Load certificates from environment or local files
let applePayCert = null;
let merchantIdCert = null;
let applePayKey = null;
let merchantIdKey = null;

function loadCertificates() {
  console.log("[SERVER] Loading certificates and private keys...");

  // Try to load from environment variables (for Render)
  if (process.env.APPLE_PAY_CERT) {
    try {
      // Environment variable should contain the PEM-formatted certificate text
      applePayCert = process.env.APPLE_PAY_CERT;
      console.log("[SERVER] ✓ Loaded APPLE_PAY_CERT from environment");
    } catch (error) {
      console.error(
        "[SERVER] ERROR loading APPLE_PAY_CERT from env:",
        error.message
      );
    }
  }

  if (process.env.APPLE_PAY_KEY) {
    try {
      applePayKey = Buffer.from(process.env.APPLE_PAY_KEY, "base64").toString();
      console.log("[SERVER] ✓ Loaded APPLE_PAY_KEY from environment");
    } catch (error) {
      console.error(
        "[SERVER] ERROR loading APPLE_PAY_KEY from env:",
        error.message
      );
    }
  }

  if (process.env.MERCHANT_ID_CERT) {
    try {
      // Environment variable should contain the PEM-formatted certificate text
      merchantIdCert = process.env.MERCHANT_ID_CERT;
      console.log("[SERVER] ✓ Loaded MERCHANT_ID_CERT from environment");
    } catch (error) {
      console.error(
        "[SERVER] ERROR loading MERCHANT_ID_CERT from env:",
        error.message
      );
    }
  }

  if (process.env.MERCHANT_ID_KEY) {
    try {
      merchantIdKey = Buffer.from(
        process.env.MERCHANT_ID_KEY,
        "base64"
      ).toString();
      console.log("[SERVER] ✓ Loaded MERCHANT_ID_KEY from environment");
      console.log("[SERVER] MERCHANT_ID_KEY length:", merchantIdKey.length);
      console.log(
        "[SERVER] MERCHANT_ID_KEY first 50 chars:",
        merchantIdKey.substring(0, 50)
      );
      console.log(
        "[SERVER] MERCHANT_ID_KEY last 50 chars:",
        merchantIdKey.substring(merchantIdKey.length - 50)
      );
    } catch (error) {
      console.error(
        "[SERVER] ERROR loading MERCHANT_ID_KEY from env:",
        error.message
      );
    }
  }

  // Try to load from local files (for development)
  if (
    !applePayCert &&
    fs.existsSync(path.join(__dirname, "certs", "apple_pay.pem"))
  ) {
    try {
      applePayCert = fs.readFileSync(
        path.join(__dirname, "certs", "apple_pay.pem"),
        "utf8"
      );
      console.log("[SERVER] ✓ Loaded APPLE_PAY_CERT from local PEM file");
    } catch (error) {
      console.error(
        "[SERVER] ERROR loading local apple_pay.pem:",
        error.message
      );
    }
  }

  if (
    !applePayCert &&
    fs.existsSync(path.join(__dirname, "certs", "apple_pay.cer"))
  ) {
    try {
      applePayCert = fs.readFileSync(
        path.join(__dirname, "certs", "apple_pay.cer"),
        "utf8"
      );
      console.log("[SERVER] ✓ Loaded APPLE_PAY_CERT from local file");
    } catch (error) {
      console.error(
        "[SERVER] ERROR loading local apple_pay.cer:",
        error.message
      );
    }
  }

  if (
    !applePayKey &&
    fs.existsSync(path.join(__dirname, "csr", "paymentprocessing.key"))
  ) {
    try {
      applePayKey = fs.readFileSync(
        path.join(__dirname, "csr", "paymentprocessing.key"),
        "utf8"
      );
      console.log("[SERVER] ✓ Loaded APPLE_PAY_KEY from local file");
    } catch (error) {
      console.error(
        "[SERVER] ERROR loading local paymentprocessing.key:",
        error.message
      );
    }
  }

  if (
    !merchantIdCert &&
    fs.existsSync(path.join(__dirname, "certs", "merchant_id.pem"))
  ) {
    try {
      merchantIdCert = fs.readFileSync(
        path.join(__dirname, "certs", "merchant_id.pem"),
        "utf8"
      );
      console.log("[SERVER] ✓ Loaded MERCHANT_ID_CERT from local PEM file");
    } catch (error) {
      console.error(
        "[SERVER] ERROR loading local merchant_id.pem:",
        error.message
      );
    }
  }

  if (
    !merchantIdCert &&
    fs.existsSync(path.join(__dirname, "certs", "merchant_id.cer"))
  ) {
    try {
      merchantIdCert = fs.readFileSync(
        path.join(__dirname, "certs", "merchant_id.cer"),
        "utf8"
      );
      console.log("[SERVER] ✓ Loaded MERCHANT_ID_CERT from local file");
    } catch (error) {
      console.error(
        "[SERVER] ERROR loading local merchant_id.cer:",
        error.message
      );
    }
  }

  if (
    !merchantIdKey &&
    fs.existsSync(path.join(__dirname, "csr", "merchantidentity.key"))
  ) {
    try {
      merchantIdKey = fs.readFileSync(
        path.join(__dirname, "csr", "merchantidentity.key"),
        "utf8"
      );
      console.log("[SERVER] ✓ Loaded MERCHANT_ID_KEY from local file");
    } catch (error) {
      console.error(
        "[SERVER] ERROR loading local merchantidentity.key:",
        error.message
      );
    }
  }

  console.log("[SERVER] Certificate and Key status:");
  console.log(
    "[SERVER] - APPLE_PAY_CERT:",
    applePayCert ? "LOADED" : "NOT FOUND"
  );
  console.log(
    "[SERVER] - APPLE_PAY_KEY:",
    applePayKey ? "LOADED" : "NOT FOUND"
  );
  console.log(
    "[SERVER] - MERCHANT_ID_CERT:",
    merchantIdCert ? "LOADED" : "NOT FOUND"
  );
  console.log(
    "[SERVER] - MERCHANT_ID_KEY:",
    merchantIdKey ? "LOADED" : "NOT FOUND"
  );
}

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Load certificates on startup
loadCertificates();

// Serve Apple Pay domain verification file
app.use("/.well-known", express.static(".well-known"));

// Explicit route for Apple Pay domain verification
app.get(
  "/.well-known/apple-developer-merchantid-domain-association",
  (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        ".well-known",
        "apple-developer-merchantid-domain-association"
      )
    );
  }
);

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Eazypay configuration
const eazypayMerchantId = process.env.EAZYPAY_MERCHANT_ID;
const eazypayPassword = process.env.EAZYPAY_PASSWORD;
const eazypayBaseUrl =
  process.env.EAZYPAY_BASE_URL ||
  "https://eazypay.gateway.mastercard.com/api/rest/version/100";

console.log("[SERVER] Eazypay Configuration:");
console.log("[SERVER] - Merchant ID:", eazypayMerchantId ? "SET" : "NOT SET");
console.log("[SERVER] - Password:", eazypayPassword ? "SET" : "NOT SET");
console.log("[SERVER] - Base URL:", eazypayBaseUrl);

// Create Eazypay session endpoint
app.get("/api/create-session", async (req, res) => {
  try {
    console.log("[SERVER] /api/create-session called");
    const { amount, currency = "BHD" } = req.query;
    console.log(
      "[SERVER] Request params - amount:",
      amount,
      "currency:",
      currency
    );

    if (!amount) {
      console.error("[SERVER] ERROR: Amount is missing");
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    // Check if Eazypay credentials are configured
    if (!eazypayMerchantId || !eazypayPassword) {
      console.error("[SERVER] ERROR: Eazypay credentials not configured");
      console.error(
        "[SERVER] - EAZYPAY_MERCHANT_ID:",
        eazypayMerchantId ? "SET" : "MISSING"
      );
      console.error(
        "[SERVER] - EAZYPAY_PASSWORD:",
        eazypayPassword ? "SET" : "MISSING"
      );
      return res.status(500).json({
        success: false,
        message:
          "Eazypay credentials not configured. Please set EAZYPAY_MERCHANT_ID and EAZYPAY_PASSWORD environment variables.",
      });
    }

    const username = `merchant.${eazypayMerchantId}`;
    const orderId = "APPLEPAY-" + Math.floor(Date.now() / 1000);
    const url = `${eazypayBaseUrl}/merchant/${eazypayMerchantId}/session`;

    console.log("[SERVER] Creating Eazypay session:");
    console.log("[SERVER] - URL:", url);
    console.log("[SERVER] - Order ID:", orderId);

    const payload = {
      apiOperation: "INITIATE_CHECKOUT",
      interaction: {
        operation: "AUTHORIZE",
        merchant: {
          name: "UIC - United Insurance Company",
          logo: "https://uic.bh/photos/EmailTemplate/UICLogo.png",
        },
        displayControl: {
          billingAddress: "HIDE",
        },
      },
      order: {
        amount: amount,
        currency: currency,
        id: orderId,
        description: "Apple Pay Payment",
      },
    };

    const authorization =
      "Basic " +
      Buffer.from(`${username}:${eazypayPassword}`).toString("base64");

    console.log("[SERVER] Sending request to Eazypay API...");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify(payload),
    });

    console.log("[SERVER] Eazypay response status:", response.status);
    const data = await response.json();
    console.log(
      "[SERVER] Eazypay response data:",
      JSON.stringify(data, null, 2)
    );

    if (!response.ok) {
      console.error("[SERVER] ERROR: Eazypay API returned error");
      console.error("[SERVER] Status:", response.status);
      console.error("[SERVER] Error details:", data);
      return res.status(response.status).json({
        success: false,
        message: "Failed to create Eazypay session",
        error: data,
      });
    }

    if (!data.session?.id) {
      console.error("[SERVER] ERROR: No session ID in Eazypay response");
      console.error("[SERVER] Response:", data);
      return res.status(500).json({
        success: false,
        message: "Eazypay response missing session ID",
        error: data,
      });
    }

    console.log("[SERVER] ✓ Session created successfully:", data.session.id);
    res.json({
      success: true,
      sessionId: data.session?.id,
      DBdata: {
        sessionId: data.session?.id,
        amount,
        currency,
        orderId,
        response: data,
      },
    });
  } catch (error) {
    console.error("[SERVER] ========== SESSION CREATION ERROR ==========");
    console.error("[SERVER] Error message:", error.message);
    console.error("[SERVER] Error stack:", error.stack);
    console.error("[SERVER] Full error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating session: " + error.message,
    });
  }
});

// Apple Pay session endpoint (merchant validation)
// Debug endpoint to check server status
app.get("/api/debug", (req, res) => {
  res.json({
    server: "running",
    environment: process.env.NODE_ENV || "development",
    credentials: {
      eazypayMerchantId: process.env.EAZYPAY_MERCHANT_ID ? "SET" : "NOT SET",
      eazypayPassword: process.env.EAZYPAY_PASSWORD ? "SET" : "NOT SET",
      applePayCert: applePayCert ? "LOADED" : "NOT FOUND",
      applePayKey: applePayKey ? "LOADED" : "NOT FOUND",
      merchantIdCert: merchantIdCert ? "LOADED" : "NOT FOUND",
      merchantIdKey: merchantIdKey ? "LOADED" : "NOT FOUND",
    },
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/apple-pay-session", async (req, res) => {
  try {
    const { validationURL } = req.body;

    console.log("[SERVER] ========== MERCHANT VALIDATION REQUEST ==========");
    console.log("[SERVER] Validation URL:", validationURL);

    if (!validationURL) {
      console.error("[SERVER] ERROR: Validation URL is required");
      return res.status(400).json({
        success: false,
        message: "Validation URL is required",
      });
    }

    // Check if we have certificates
    // The new check is below after the validationURL check

    // Check if we have both certificate and key
    if (!merchantIdCert || !merchantIdKey) {
      console.warn(
        "[SERVER] WARNING: MERCHANT_ID_CERT or MERCHANT_ID_KEY not loaded"
      );
      console.warn("[SERVER] Using mock session for testing");
      console.warn(
        "[SERVER] For production: Add MERCHANT_ID_CERT and MERCHANT_ID_KEY to Render environment variables"
      );

      // Return a test session
      const testSession = {
        epochTimestamp: Math.floor(Date.now()),
        expiresAt: Math.floor(Date.now() + 3600000),
        merchantSessionIdentifier: "SSH-TEST-" + Date.now(),
        nonce: "test-nonce-" + Math.random().toString(36).substr(2, 16),
        signature: "test-signature",
      };

      return res.json({
        success: true,
        session: testSession,
      });
    }

    console.log(
      "[SERVER] ✓ MERCHANT_ID_CERT and MERCHANT_ID_KEY loaded, proceeding with validation"
    );
    console.log(
      "[SERVER] Calling Apple's validation endpoint with client certificate..."
    );

    try {
      // Call Apple's validation endpoint with client certificate
      const validationPayload = {
        merchantIdentifier: "merchant.com.uic.sam-uic-offers",
        domainName: "apple-pay-h5sj.onrender.com",
        displayName: "UIC Payment",
      };

      console.log("[SERVER] Validation payload:", validationPayload);

      // Log certificate/key info for diagnostics
      console.log("[SERVER] MERCHANT_ID_CERT length:", merchantIdCert.length);
      console.log(
        "[SERVER] MERCHANT_ID_CERT first 60 chars:",
        merchantIdCert.substring(0, 60)
      );
      console.log("[SERVER] MERCHANT_ID_KEY length:", merchantIdKey.length);
      console.log(
        "[SERVER] MERCHANT_ID_KEY first 60 chars:",
        merchantIdKey.substring(0, 60)
      );

      // Use Node.js https module to send client certificate
      const httpsOptions = {
        cert: merchantIdCert,
        key: merchantIdKey,
        rejectUnauthorized: false, // Allow self-signed certificates during development
      };

      const appleResponse = await new Promise((resolve, reject) => {
        const url = new URL(validationURL);
        const options = {
          hostname: url.hostname,
          path: url.pathname,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(
              JSON.stringify(validationPayload)
            ),
          },
          cert: merchantIdCert,
          key: merchantIdKey,
          rejectUnauthorized: false,
        };

        const httpsRequest = https.request(options, (appleRes) => {
          let data = "";
          appleRes.on("data", (chunk) => {
            data += chunk;
          });
          appleRes.on("end", () => {
            resolve({
              status: appleRes.statusCode,
              data: data,
              headers: appleRes.headers,
            });
          });
        });

        httpsRequest.on("error", (error) => {
          console.error("[SERVER] HTTPS request error:", error.message);
          console.error("[SERVER] Error code:", error.code);
          console.error("[SERVER] Error library:", error.library);
          reject(error);
        });

        httpsRequest.write(JSON.stringify(validationPayload));
        httpsRequest.end();
      });

      console.log("[SERVER] Apple response status:", appleResponse.status);

      // Generate a unique order ID for this transaction
      const orderId = "APPLEPAY-" + Math.floor(Date.now() / 1000);
      console.log("[SERVER] Generated Order ID:", orderId);

      if (appleResponse.status === 200) {
        try {
          const appleSession = JSON.parse(appleResponse.data);
          console.log("[SERVER] ✓ Got valid session from Apple");
          console.log(
            "[SERVER] Session details:",
            JSON.stringify(appleSession, null, 2)
          );

          return res.json({
            success: true,
            orderId: orderId,
            session: appleSession,
          });
        } catch (parseError) {
          console.error(
            "[SERVER] ERROR parsing Apple response:",
            parseError.message
          );
          console.error("[SERVER] Raw response:", appleResponse.data);

          // Fallback to test session
          const testSession = {
            epochTimestamp: Math.floor(Date.now()),
            expiresAt: Math.floor(Date.now() + 3600000),
            merchantSessionIdentifier: "SSH-" + Date.now(),
            nonce: "nonce-" + Math.random().toString(36).substr(2, 16),
            signature: "sig-" + Math.random().toString(36).substr(2, 16),
          };

          return res.json({
            success: true,
            session: testSession,
          });
        }
      } else {
        console.error(
          "[SERVER] ERROR: Apple returned status",
          appleResponse.status
        );
        console.error("[SERVER] Response:", appleResponse.data);

        // Fallback to test session
        const testSession = {
          epochTimestamp: Math.floor(Date.now()),
          expiresAt: Math.floor(Date.now() + 3600000),
          merchantSessionIdentifier: "SSH-" + Date.now(),
          nonce: "nonce-" + Math.random().toString(36).substr(2, 16),
          signature: "sig-" + Math.random().toString(36).substr(2, 16),
        };

        console.log("[SERVER] Returning fallback test session");
        return res.json({
          success: true,
          session: testSession,
        });
      }
    } catch (appleError) {
      console.error("[SERVER] ERROR calling Apple:", appleError.message);
      console.error("[SERVER] Error details:", appleError);

      // Return test session on error
      const testSession = {
        epochTimestamp: Math.floor(Date.now()),
        expiresAt: Math.floor(Date.now() + 3600000),
        merchantSessionIdentifier: "SSH-" + Date.now(),
        nonce: "nonce-" + Math.random().toString(36).substr(2, 16),
        signature: "sig-" + Math.random().toString(36).substr(2, 16),
      };

      return res.json({
        success: true,
        session: testSession,
      });
    }
  } catch (error) {
    console.error("[SERVER] ERROR in apple-pay-session:", error);
    res.status(500).json({
      success: false,
      message: "Merchant validation failed: " + error.message,
    });
  }
});

// Process Apple Pay native payment
app.post("/api/process-apple-pay", async (req, res) => {
  try {
    console.log("[SERVER] ========== /api/process-apple-pay CALLED ==========");
    const { amount, currency, paymentData, source, orderId } = req.body;

    console.log("[SERVER] Processing Apple Pay payment:");
    console.log("[SERVER] - Amount:", amount);
    console.log("[SERVER] - Currency:", currency);
    console.log("[SERVER] - Order ID:", orderId);
    console.log("[SERVER] - Source:", source);
    console.log(
      "[SERVER] - Payment data size:",
      paymentData ? paymentData.length : 0,
      "bytes"
    );

    if (!amount || !paymentData) {
      console.error("[SERVER] ERROR: Missing amount or payment data");
      return res.status(400).json({
        success: false,
        message: "Amount and payment data are required",
      });
    }

    // Check if Eazypay credentials are configured
    if (!eazypayMerchantId || !eazypayPassword) {
      console.error("[SERVER] ERROR: Eazypay credentials not configured");
      return res.status(500).json({
        success: false,
        message: "Eazypay credentials not configured",
      });
    }

    // Parse the payment data from Apple
    let applePaymentData;
    try {
      applePaymentData =
        typeof paymentData === "string" ? JSON.parse(paymentData) : paymentData;
      console.log("[SERVER] ✓ Apple payment data parsed successfully");
      console.log("[SERVER] Payment data keys:", Object.keys(applePaymentData));
    } catch (error) {
      console.error(
        "[SERVER] ERROR: Failed to parse payment data:",
        error.message
      );
      return res.status(400).json({
        success: false,
        message: "Invalid payment data format: " + error.message,
      });
    }

    // Get the payment token from Apple Pay
    const paymentToken = applePaymentData.token;
    if (!paymentToken) {
      console.error("[SERVER] ERROR: No payment token in Apple Pay data");
      console.error("[SERVER] Available keys:", Object.keys(applePaymentData));
      return res.status(400).json({
        success: false,
        message: "No payment token received from Apple Pay",
      });
    }

    console.log("[SERVER] ✓ Payment token received from Apple Pay");
    console.log(
      "[SERVER] Token type:",
      paymentToken.paymentMethod ? "Has paymentMethod" : "Unknown"
    );

    // Send payment to Eazypay for authorization
    console.log("[SERVER] Sending payment to Eazypay for authorization...");
    
    const username = `merchant.${eazypayMerchantId}`;
    const eazypayOrderId = orderId || "APPLEPAY-" + Math.floor(Date.now() / 1000);
    
    // Create a unique transaction ID for Eazypay
    const transactionId = "TXN-" + Math.floor(Date.now() / 1000);
    
    // Use the correct endpoint: /merchant/{id}/order/{orderId}/transaction/{transactionId}
    const authUrl = `${eazypayBaseUrl}/merchant/${eazypayMerchantId}/order/${eazypayOrderId}/transaction/${transactionId}`;

    const authorization =
      "Basic " +
      Buffer.from(`${username}:${eazypayPassword}`).toString("base64");

    // Create payment authorization request to Eazypay with Apple Pay token
    const paymentPayload = {
      apiOperation: "PAY",
      order: {
        amount: parseFloat(amount).toFixed(2),
        currency: currency,
        id: eazypayOrderId,
        description: "Apple Pay Payment from UIC",
      },
      sourceOfFunds: {
        type: "APPLE_PAY",
        provided: {
          applePayToken: JSON.stringify({
            header: paymentToken.header,
            signature: paymentToken.signature,
            data: paymentToken.data,
          }),
        },
      },
      deviceFingerprint: {
        provider: "DIGITAL_INSIGHT",
      },
    };

    console.log("[SERVER] Eazypay Payment Request URL:", authUrl);
    console.log("[SERVER] Transaction ID:", transactionId);
    console.log("[SERVER] Order ID:", eazypayOrderId);
    console.log("[SERVER] Sending Apple Pay token to Eazypay...");
    console.log("[SERVER] Payload:", JSON.stringify(paymentPayload, null, 2));

    const eazypayResponse = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify(paymentPayload),
    });

    console.log("[SERVER] Eazypay response status:", eazypayResponse.status);
    const eazypayData = await eazypayResponse.json();
    console.log(
      "[SERVER] Eazypay response data:",
      JSON.stringify(eazypayData, null, 2)
    );

    if (!eazypayResponse.ok) {
      console.error("[SERVER] ERROR: Eazypay payment authorization failed");
      console.error("[SERVER] Status:", eazypayResponse.status);
      console.error("[SERVER] Error details:", eazypayData);
      return res.status(eazypayResponse.status).json({
        success: false,
        message: "Payment authorization failed with Eazypay",
        error: eazypayData,
      });
    }

    // Check if transaction was successful
    const transactionResult = eazypayData.transaction?.result || eazypayData.result;

    if (transactionResult !== "SUCCESS") {
      console.error("[SERVER] ERROR: Eazypay transaction not successful");
      console.error("[SERVER] Result:", transactionResult);
      console.error("[SERVER] Response:", eazypayData);
      return res.status(400).json({
        success: false,
        message: "Payment authorization failed: " + transactionResult,
        error: eazypayData,
      });
    }

    console.log("[SERVER] ✓ Payment successfully authorized with Eazypay");
    console.log("[SERVER] - Transaction ID:", transactionId);
    console.log("[SERVER] - Result:", transactionResult);
    console.log("[SERVER] - Amount: " + amount + " " + currency);
    console.log("[SERVER] ========== PAYMENT PROCESSING COMPLETE ==========");

    // Return success to Apple Pay and frontend
    res.json({
      success: true,
      message: "Payment processed successfully",
      transactionId: transactionId,
      amount: amount,
      currency: currency,
      orderId: eazypayOrderId,
      source: "apple_pay",
      eazypayResult: transactionResult,
      eazypayResponse: eazypayData,
    });
  } catch (error) {
    console.error(
      "[SERVER] ========== ERROR in /api/process-apple-pay =========="
    );
    console.error("[SERVER] Error message:", error.message);
    console.error("[SERVER] Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error processing payment: " + error.message,
    });
  }
});

// Process payment completion (save transaction)
app.post("/api/save-payment", async (req, res) => {
  try {
    const { DBdata } = req.body;

    if (!DBdata) {
      return res.status(400).json({
        success: false,
        message: "Payment data is required",
      });
    }

    console.log("Saving payment data:", DBdata);

    // In a real application, you would:
    // 1. Verify the payment with Eazypay using the session ID
    // 2. Save transaction to your database
    // 3. Update customer records
    // 4. Send confirmation email
    // 5. Trigger backend processes

    // For now, just log and return success
    res.json({
      success: true,
      message: "Payment saved successfully",
      data: DBdata,
    });
  } catch (error) {
    console.error("Error saving payment:", error);
    res.status(500).json({
      success: false,
      message: "Error saving payment: " + error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    "Domain verification endpoint: /.well-known/apple-developer-merchantid-domain-association"
  );
});
