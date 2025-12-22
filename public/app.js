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

  if (!button) return;

  button.addEventListener("click", async () => {
    if (!checkApplePayAvailability()) {
      return;
    }

    try {
      await initiateApplePayment();
    } catch (error) {
      hideLoading();
      showStatus(`Error: ${error.message}`, "error");
      console.error("Apple Pay error:", error);
    }
  });
}

// Create Eazypay session
async function createEazypaySession(amount) {
  const url = "/api/create-session?amount=" + amount + "&currency=" + CURRENCY;

  try {
    showLoading("Creating secure session...");
    const res = await fetch(url);
    const data = await res.json();

    if (!data.success || !data.sessionId) {
      throw new Error("Failed to create Eazypay session");
    }

    return data;
  } catch (error) {
    hideLoading();
    throw error;
  }
}

// Initialize Eazypay checkout
function initializeEazypayCheckout(sessionId) {
  return new Promise((resolve, reject) => {
    // Remove old script if exists
    const oldScript = document.getElementById("eazypay-checkout-script");
    if (oldScript) oldScript.remove();

    // Load Eazypay checkout script
    const script = document.createElement("script");
    script.id = "eazypay-checkout-script";
    script.src = EAZYPAY_CHECKOUT_URL;
    script.setAttribute("data-error", "window.eazypayErrorCallback");
    script.setAttribute("data-cancel", "window.eazypayCancel Callback");
    script.setAttribute("data-complete", "window.eazypayCompleteCallback");

    script.onload = () => {
      try {
        showLoading("Loading payment form...");

        // Configure Checkout
        Checkout.configure({
          session: { id: sessionId },
        });

        // Store callback handlers globally
        window.eazypayErrorCallback = () => {
          hideLoading();
          showStatus("Payment error occurred", "error");
          reject(new Error("Payment error"));
        };

        window.eazypayCancelCallback = () => {
          hideLoading();
          showStatus("Payment cancelled", "error");
          reject(new Error("Payment cancelled"));
        };

        window.eazypayCompleteCallback = async () => {
          showLoading("Finalizing payment...");
          resolve(true);
        };

        hideLoading();
        showLoading("Opening payment form...");
        Checkout.showPaymentPage();
      } catch (error) {
        hideLoading();
        reject(error);
      }
    };

    script.onerror = () => {
      hideLoading();
      reject(new Error("Failed to load Eazypay checkout"));
    };

    document.body.appendChild(script);
  });
}

// Initiate Apple Payment
async function initiateApplePayment() {
  // Payment request configuration
  const paymentRequest = {
    countryCode: "BH",
    currencyCode: CURRENCY,
    merchantCapabilities: ["supports3DS"],
    supportedNetworks: ["amex", "discover", "masterCard", "visa"],
    requiredBillingContactFields: ["postalAddress"],
    requiredShippingContactFields: ["email", "phone"],
    total: {
      label: "UIC Payment",
      amount: TOTAL_AMOUNT,
      type: "final",
    },
    lineItems: [
      {
        label: "Insurance Premium",
        amount: TOTAL_AMOUNT,
        type: "final",
      },
    ],
  };

  // Create Apple Pay session
  const session = new ApplePaySession(3, paymentRequest);

  // Validates the merchant
  session.onvalidatemerchant = async (event) => {
    try {
      showLoading("Validating merchant...");
      const merchantValidation = await validateMerchant(event.validationURL);
      hideLoading();
      session.completeMerchantValidation(merchantValidation);
    } catch (error) {
      hideLoading();
      console.error("Merchant validation failed:", error);
      session.abort();
      showStatus("Payment failed: Merchant validation error", "error");
    }
  };

  // Handles payment authorization
  session.onpaymentauthorized = async (event) => {
    try {
      showLoading("Processing with Eazypay...");

      // Get Apple Pay token
      const paymentToken = event.payment.token.paymentData;

      // Create Eazypay session
      const eazypaySession = await createEazypaySession(TOTAL_AMOUNT);

      // Store session data globally
      window.eazypaySessionData = {
        sessionId: eazypaySession.sessionId,
        DBdata: {
          ...eazypaySession.DBdata,
          applePayToken: paymentToken,
        },
        session,
      };

      // Initialize Eazypay checkout
      await initializeEazypayCheckout(eazypaySession.sessionId);

      // Complete Apple Pay session
      session.completePayment(ApplePaySession.STATUS_SUCCESS);
      showStatus(
        "✓ Payment successful! Thank you for your purchase.",
        "success"
      );

      // Save payment data
      await savePayment(window.eazypaySessionData.DBdata);

      // Reload after success
      setTimeout(() => {
        location.reload();
      }, 2000);
    } catch (error) {
      hideLoading();
      console.error("Payment authorization failed:", error);
      session.completePayment(ApplePaySession.STATUS_FAILURE);
      showStatus("Payment failed: " + error.message, "error");
    }
  };

  // Handle shipping contact selection
  session.onshippingcontactselection = (event) => {
    session.completeShippingContactSelection(
      ApplePaySession.STATUS_SUCCESS,
      [],
      {
        label: "UIC Payment",
        amount: TOTAL_AMOUNT,
        type: "final",
      },
      {
        label: "UIC Payment",
        amount: TOTAL_AMOUNT,
        type: "final",
      }
    );
  };

  session.begin();
}

// Validate merchant with Apple
async function validateMerchant(validationURL) {
  try {
    const response = await fetch("/api/apple-pay-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        validationURL: validationURL,
        merchantId: MERCHANT_ID,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to validate merchant");
    }

    const data = await response.json();
    return data.merchantSession || {};
  } catch (error) {
    console.error("Merchant validation error:", error);
    throw error;
  }
}

// Save payment data
async function savePayment(DBdata) {
  try {
    const response = await fetch("/api/save-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ DBdata }),
    });

    if (!response.ok) {
      throw new Error("Failed to save payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saving payment:", error);
    throw error;
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
  // Check Apple Pay availability and set up button
  if (!checkApplePayAvailability()) {
    console.log("Apple Pay not available, showing fallback");
  } else {
    console.log("✓ Apple Pay is available");
  }

  setupApplePayButton();
  setupFallbackButton();
});

// Debug: Log merchant ID (remove in production)
console.log("Apple Pay Merchant ID:", MERCHANT_ID);
