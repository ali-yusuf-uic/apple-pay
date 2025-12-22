const express = require("express");
const path = require("path");
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

    if (!validationURL) {
      return res.status(400).json({
        success: false,
        message: "Validation URL is required",
      });
    }

    // Apple requires HTTPS POST to validationURL with merchant certificate
    // For now, return a basic session object
    // In production, you would use your merchant certificate here
    console.log("Apple Pay merchant validation requested");

    res.json({
      success: true,
      merchantSession: {
        // This would be populated with Apple's response using your certificate
        // For testing, return a basic object
      },
    });
  } catch (error) {
    console.error("Merchant validation error:", error);
    res.status(500).json({
      success: false,
      message: "Merchant validation failed: " + error.message,
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
