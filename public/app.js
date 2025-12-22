// Apple Pay Configuration
const MERCHANT_ID = "merchant.com.uic.sam-uic-offers";
const TOTAL_AMOUNT = "0.10";
const CURRENCY = "BHD";

// Eazypay configuration
const EAZYPAY_CHECKOUT_URL =
  "https://eazypay.gateway.mastercard.com/static/checkout/checkout.min.js";

// Check if Apple Pay is available
function checkApplePayAvailability() {
  if (!window.ApplePaySession) {
    console.log("Apple Pay is not available on this device");
    showFallback();
    return false;
  }

  // Check if the merchant can process payments
  if (!ApplePaySession.canMakePayments()) {
    console.log("This device cannot make Apple Pay payments");
    showFallback();
    return false;
  }

  return true;
}

// Show fallback payment option
function showFallback() {
  const container = document.getElementById("apple-pay-button-container");
  const fallback = document.getElementById("fallback-section");

  if (container) container.style.display = "none";
  if (fallback) fallback.classList.add("visible");
}

// Show loading overlay
function showLoading(message = "Processing...") {
  let overlay = document.getElementById("loadingOverlay");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "loadingOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.background = "rgba(255,255,255,0.95)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.fontSize = "18px";

    overlay.innerHTML =
      '<div style="border: 6px solid #ddd; border-top: 6px solid #667eea; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>' +
      '<div id="loadingMessage" style="color: #333;">' +
      message +
      "</div>";

    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(overlay);
  } else {
    document.getElementById("loadingMessage").innerText = message;
    overlay.style.display = "flex";
  }
}

function hideLoading() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) overlay.style.display = "none";
}

// Apple Pay Button Click Handler
function setupApplePayButton() {
  const button = document.getElementById("apple-pay-button");

  if (!button) {
    console.warn("[PAYMENT] WARNING: Apple Pay button not found in DOM");
    return;
  }

  console.log("[PAYMENT] Setting up Apple Pay button click handler");

  button.addEventListener("click", async () => {
    console.log("[PAYMENT] Apple Pay button clicked");

    if (!checkApplePayAvailability()) {
      console.warn("[PAYMENT] WARNING: Apple Pay is not available");
      return;
    }

    try {
      await initiateApplePayment();
    } catch (error) {
      console.error("[PAYMENT] ERROR in button click handler:", error);
      hideLoading();
      showStatus(`Error: ${error.message}`, "error");
    }
  });
}

// Create Eazypay session
async function createEazypaySession(amount) {
  const url = "/api/create-session?amount=" + amount + "&currency=" + CURRENCY;
  console.log(
    "[PAYMENT] Creating Eazypay session with amount:",
    amount,
    "currency:",
    CURRENCY
  );

  try {
    showLoading("Creating secure session...");
    console.log("[PAYMENT] Fetching URL:", url);
    const res = await fetch(url);
    console.log("[PAYMENT] Session creation response status:", res.status);
    const data = await res.json();
    console.log("[PAYMENT] Session creation response data:", data);

    if (!data.success || !data.sessionId) {
      console.error("[PAYMENT] ERROR: Failed to create Eazypay session", data);
      throw new Error(
        "Failed to create Eazypay session: " + (data.message || "No session ID")
      );
    }

    console.log("[PAYMENT] ✓ Session created successfully:", data.sessionId);
    return data;
  } catch (error) {
    console.error("[PAYMENT] ERROR in createEazypaySession:", error);
    hideLoading();
    throw error;
  }
}

// Initialize Eazypay checkout
function initializeEazypayCheckout(sessionId) {
  console.log(
    "[PAYMENT] Initializing Eazypay checkout with sessionId:",
    sessionId
  );
  return new Promise((resolve, reject) => {
    // Remove old script if exists
    const oldScript = document.getElementById("eazypay-checkout-script");
    if (oldScript) {
      console.log("[PAYMENT] Removing existing Eazypay script");
      oldScript.remove();
    }

    // Load Eazypay checkout script
    const script = document.createElement("script");
    script.id = "eazypay-checkout-script";
    script.src = EAZYPAY_CHECKOUT_URL;
    console.log(
      "[PAYMENT] Loading Eazypay checkout from:",
      EAZYPAY_CHECKOUT_URL
    );
    script.setAttribute("data-error", "window.eazypayErrorCallback");
    script.setAttribute("data-cancel", "window.eazypayCancel Callback");
    script.setAttribute("data-complete", "window.eazypayCompleteCallback");

    script.onload = () => {
      try {
        console.log("[PAYMENT] Eazypay script loaded successfully");
        showLoading("Loading payment form...");

        // Configure Checkout
        console.log(
          "[PAYMENT] Configuring Checkout with session ID:",
          sessionId
        );
        Checkout.configure({
          session: { id: sessionId },
        });
        console.log("[PAYMENT] ✓ Checkout configured");

        // Store callback handlers globally
        window.eazypayErrorCallback = () => {
          console.error(
            "[PAYMENT] ERROR CALLBACK: Payment error occurred in Eazypay widget"
          );
          hideLoading();
          showStatus(
            "Payment error occurred. Check browser console for details.",
            "error"
          );
          reject(new Error("Payment error from Eazypay"));
        };

        window.eazypayCancelCallback = () => {
          console.log("[PAYMENT] CANCEL CALLBACK: User cancelled payment");
          hideLoading();
          showStatus("Payment cancelled.", "error");
          reject(new Error("Payment cancelled by user"));
        };

        window.eazypayCompleteCallback = async () => {
          console.log(
            "[PAYMENT] COMPLETE CALLBACK: Payment completed in Eazypay widget"
          );
          showLoading("Finalizing payment...");
          resolve(true);
        };

        console.log("[PAYMENT] ✓ Callbacks registered");
        hideLoading();
        showLoading("Opening payment form...");
        console.log("[PAYMENT] Showing Eazypay payment page");
        Checkout.showPaymentPage();
        console.log("[PAYMENT] ✓ Payment page shown");
      } catch (error) {
        console.error("[PAYMENT] ERROR in script.onload:", error);
        hideLoading();
        reject(error);
      }
    };

    script.onerror = () => {
      console.error(
        "[PAYMENT] ERROR: Failed to load Eazypay checkout script from:",
        EAZYPAY_CHECKOUT_URL
      );
      hideLoading();
      reject(new Error("Failed to load Eazypay checkout"));
    };

    console.log("[PAYMENT] Appending Eazypay script to document");
    document.body.appendChild(script);
  });
}

// Initiate Apple Payment - Redirect to Eazypay
async function initiateApplePayment() {
  console.log("[PAYMENT] ========== PAYMENT FLOW STARTED ==========");
  console.log(
    "[PAYMENT] Initiating Apple Payment with amount:",
    TOTAL_AMOUNT,
    CURRENCY
  );

  try {
    showLoading("Preparing payment...");

    // Create Eazypay session
    console.log("[PAYMENT] Step 1: Creating Eazypay session");
    const sessionData = await createEazypaySession(TOTAL_AMOUNT);
    console.log("[PAYMENT] ✓ Step 1 complete: Session data:", sessionData);

    hideLoading();

    // Open Eazypay checkout
    console.log("[PAYMENT] Step 2: Initializing Eazypay checkout widget");
    await initializeEazypayCheckout(sessionData.sessionId);
    console.log("[PAYMENT] ✓ Step 2 complete: Eazypay checkout initialized");

    // When checkout completes, finalize the payment
    console.log("[PAYMENT] Step 3: Saving payment to backend");
    showLoading("Finalizing payment...");

    const paymentData = {
      DBdata: {
        sessionId: sessionData.sessionId,
        amount: TOTAL_AMOUNT,
        currency: CURRENCY,
        source: "apple_pay",
      },
    };
    console.log(
      "[PAYMENT] Sending payment data to /api/save-payment:",
      paymentData
    );

    const saveResponse = await fetch("/api/save-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });

    console.log("[PAYMENT] Save response status:", saveResponse.status);
    const saveResult = await saveResponse.json();
    console.log("[PAYMENT] Save response data:", saveResult);

    hideLoading();

    if (saveResult.success) {
      console.log("[PAYMENT] ✓ Step 3 complete: Payment successful!");
      console.log(
        "[PAYMENT] ========== PAYMENT FLOW COMPLETED SUCCESSFULLY =========="
      );
      showStatus(
        "✓ Payment successful! Thank you for your purchase.",
        "success"
      );
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } else {
      console.error(
        "[PAYMENT] ✗ Step 3 failed: Backend returned error",
        saveResult
      );
      showStatus(
        "Payment failed: " + (saveResult.message || "Unknown error"),
        "error"
      );
    }
  } catch (error) {
    console.error("[PAYMENT] ========== PAYMENT FLOW ERROR ==========");
    console.error("[PAYMENT] Error message:", error.message);
    console.error("[PAYMENT] Full error:", error);
    console.error("[PAYMENT] Error stack:", error.stack);
    hideLoading();
    showStatus("Payment error: " + error.message, "error");
  }
}

// Show payment status message
function showStatus(message, type) {
  const statusDiv = document.getElementById("payment-status");
  if (!statusDiv) return;

  statusDiv.textContent = message;
  statusDiv.className = "payment-status " + type;

  if (type === "success") {
    setTimeout(() => {
      statusDiv.textContent = "";
      statusDiv.className = "payment-status";
    }, 5000);
  }
}

// Fallback button handler
function setupFallbackButton() {
  const fallbackBtn = document.getElementById("fallback-button");
  if (fallbackBtn) {
    fallbackBtn.addEventListener("click", () => {
      showStatus("Card payment coming soon...", "loading");
    });
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("[PAYMENT] ========== APP INITIALIZED ==========");
  console.log("[PAYMENT] Merchant ID:", MERCHANT_ID);
  console.log("[PAYMENT] Payment amount:", TOTAL_AMOUNT, CURRENCY);
  console.log("[PAYMENT] Eazypay checkout URL:", EAZYPAY_CHECKOUT_URL);

  // Check Apple Pay availability and set up button
  if (!checkApplePayAvailability()) {
    console.warn(
      "[PAYMENT] WARNING: Apple Pay not available, showing fallback"
    );
  } else {
    console.log("[PAYMENT] ✓ Apple Pay is available on this device");
  }

  setupApplePayButton();
  setupFallbackButton();

  console.log("[PAYMENT] ========== READY FOR PAYMENT ==========");
});
