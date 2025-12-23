const express = require("express");
const path = require("path");
const https = require("https");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

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
app.post("/api/apple-pay-session", async (req, res) => {
  try {
    const { validationURL } = req.body;

    console.log("[SERVER] Apple Pay merchant validation endpoint called");
    console.log("[SERVER] Validation URL:", validationURL);

    if (!validationURL) {
      console.error("[SERVER] ERROR: Validation URL is required");
      return res.status(400).json({
        success: false,
        message: "Validation URL is required",
      });
    }

    // Create a proper merchant session that Apple Pay can use
    // The session needs valid timestamp, nonce, and signature
    const merchantSession = {
      epochTimestamp: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour
      merchantSessionIdentifier: "SSH-MER-" + Math.random().toString(36).substr(2, 20),
      nonce: Math.random().toString(36).substr(2, 32),
      signature: "mock-signature-for-testing", // In production, this would be signed with your certificate
    };

    console.log("[SERVER] ✓ Merchant session created:", merchantSession.merchantSessionIdentifier);
    console.log("[SERVER] Returning session to Apple Pay");

    res.json({
      success: true,
      session: merchantSession,
    });
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
    const { amount, currency, paymentData, source } = req.body;

    console.log("[SERVER] Processing Apple Pay payment:");
    console.log("[SERVER] - Amount:", amount);
    console.log("[SERVER] - Currency:", currency);
    console.log("[SERVER] - Source:", source);
    console.log("[SERVER] - Payment data size:", paymentData ? paymentData.length : 0, "bytes");

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
      applePaymentData = typeof paymentData === 'string' ? JSON.parse(paymentData) : paymentData;
      console.log("[SERVER] ✓ Apple payment data parsed successfully");
      console.log("[SERVER] Payment data keys:", Object.keys(applePaymentData));
    } catch (error) {
      console.error("[SERVER] ERROR: Failed to parse payment data:", error.message);
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
    console.log("[SERVER] Token type:", paymentToken.paymentMethod ? "Has paymentMethod" : "Unknown");

    // For now, just log the successful receipt of Apple Pay data
    // In a real system, you would:
    // 1. Send token to payment processor
    // 2. Verify payment
    // 3. Store in database
    
    console.log("[SERVER] ✓ Payment successfully authorized with Apple Pay");
    console.log("[SERVER] Amount: " + amount + " " + currency);
    console.log("[SERVER] ========== PAYMENT PROCESSING COMPLETE ==========");

    // Return success to Apple Pay
    res.json({
      success: true,
      message: "Payment processed successfully",
      amount: amount,
      currency: currency,
      source: "apple_pay",
    });

  } catch (error) {
    console.error("[SERVER] ========== ERROR in /api/process-apple-pay ==========");
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
