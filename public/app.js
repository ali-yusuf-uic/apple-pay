// Apple Pay Configuration
const MERCHANT_ID = "merchant.com.uic.sam-uic-offers";
const TOTAL_AMOUNT = "0.010";
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

// Initiate Apple Payment - Native Apple Pay Sheet
async function initiateApplePayment() {
  console.log("[PAYMENT] ========== APPLE PAY FLOW STARTED ==========");
  console.log(
    "[PAYMENT] Initiating Native Apple Payment with amount:",
    TOTAL_AMOUNT,
    CURRENCY
  );

  try {
    // Create Apple Pay payment request FIRST (before any async calls)
    console.log("[PAYMENT] Creating Apple Pay payment request");
    const request = {
      countryCode: "BH",
      currencyCode: CURRENCY,
      supportedNetworks: ["visa", "masterCard", "amex"],
      merchantCapabilities: ["supports3DS"],
      total: {
        label: "UIC Payment",
        amount: TOTAL_AMOUNT,
        type: "final",
      },
    };
    console.log("[PAYMENT] Payment request:", request);

    // Create ApplePaySession immediately (must be in user gesture handler)
    console.log("[PAYMENT] Creating ApplePaySession");
    const session = new ApplePaySession(3, request);
    console.log("[PAYMENT] ✓ ApplePaySession created");

    // Variable to store orderId from merchant validation
    let orderIdForPayment = null;

    // Handle validation event - simplified for testing
    session.onvalidatemerchant = async (event) => {
      console.log("[PAYMENT] ========== MERCHANT VALIDATION ==========");
      console.log("[PAYMENT] Validation URL from Apple:", event.validationURL);

      try {
        // For testing: Call backend to generate a session object
        // In production: Backend would POST to Apple's validation URL with merchant certificate
        const response = await fetch("/api/apple-pay-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            validationURL: event.validationURL,
            displayName: "UIC Payment",
          }),
        });

        const data = await response.json();
        console.log(
          "[PAYMENT] Backend returned:",
          data.success ? "SUCCESS" : "FAILED"
        );

        if (data.success && data.session) {
          // Extract session fields that Apple requires
          const sessionData = data.session;

          // Store the orderId for use in payment processing
          orderIdForPayment = data.orderId;
          console.log("[PAYMENT] Order ID received:", orderIdForPayment);

          console.log("[PAYMENT] Session fields:");
          console.log(
            "[PAYMENT] - epochTimestamp:",
            sessionData.epochTimestamp
          );
          console.log("[PAYMENT] - expiresAt:", sessionData.expiresAt);
          console.log(
            "[PAYMENT] - merchantSessionIdentifier:",
            sessionData.merchantSessionIdentifier
          );
          console.log(
            "[PAYMENT] - nonce:",
            sessionData.nonce ? "SET" : "MISSING"
          );
          console.log(
            "[PAYMENT] - signature:",
            sessionData.signature ? "SET" : "MISSING"
          );

          console.log("[PAYMENT] Calling completeMerchantValidation...");
          session.completeMerchantValidation(sessionData);
          console.log("[PAYMENT] ✓ Merchant validation completed");
        } else {
          console.error(
            "[PAYMENT] ERROR: Backend returned error:",
            data.message
          );
          console.log("[PAYMENT] Will abort Apple Pay session");
          session.abort();
        }
      } catch (error) {
        console.error(
          "[PAYMENT] ERROR: Merchant validation fetch failed:",
          error.message
        );
        console.error("[PAYMENT] Aborting Apple Pay session");
        session.abort();
      }
    };

    // Handle payment method selection
    session.onpaymentmethodselected = (event) => {
      console.log("[PAYMENT] Payment method selected:", event.paymentMethod);
      session.completePaymentMethodSelection({
        newTotal: request.total,
        newLineItems: [],
      });
    };

    // Handle shipping method selection
    session.onshippingmethodselected = (event) => {
      console.log("[PAYMENT] Shipping method selected");
      session.completeShippingMethodSelection({
        newTotal: request.total,
        newLineItems: [],
      });
    };

    // Handle payment authorization
    session.onpaymentauthorized = async (event) => {
      console.log(
        "[PAYMENT] ========== onpaymentauthorized EVENT TRIGGERED =========="
      );
      console.log("[PAYMENT] Full event object:", event);
      console.log("[PAYMENT] Payment object:", event.payment);
      showLoading("Processing Apple Pay payment...");

      try {
        // Get the payment token from Apple - ONLY the token.paymentData (the encrypted token)
        const paymentToken = event.payment.token.paymentData;
        console.log("[PAYMENT] Payment token received:");
        console.log(
          "[PAYMENT] - Token type:",
          typeof paymentToken
        );
        console.log(
          "[PAYMENT] - Token keys:",
          paymentToken ? Object.keys(paymentToken) : "NULL"
        );
        console.log(
          "[PAYMENT] - Token has 'data' field:",
          paymentToken?.data ? "YES" : "NO"
        );
        console.log(
          "[PAYMENT] - Token has 'signature' field:",
          paymentToken?.signature ? "YES" : "NO"
        );

        // Send to backend for processing
        console.log("[PAYMENT] Sending payment to backend...");
        const saveResponse = await fetch("/api/process-apple-pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: TOTAL_AMOUNT,
            currency: CURRENCY,
            paymentData: paymentToken, // ✅ Send the encrypted token directly (as object, NOT stringified)
            source: "apple_pay_native",
            orderId: orderIdForPayment,
          }),
        });

        console.log("[PAYMENT] Backend response status:", saveResponse.status);
        const saveResult = await saveResponse.json();
        console.log("[PAYMENT] Backend response body:", saveResult);

        hideLoading();

        if (saveResult.success) {
          console.log("[PAYMENT] ✓ Backend confirmed success!");
          console.log("[PAYMENT] Calling session.completePayment(SUCCESS)");
          const completeResult = session.completePayment(
            ApplePaySession.STATUS_SUCCESS
          );
          console.log("[PAYMENT] completePayment result:", completeResult);
          console.log(
            "[PAYMENT] ========== APPLE PAY FLOW COMPLETED SUCCESSFULLY =========="
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
            "[PAYMENT] ✗ Backend returned error:",
            saveResult.message
          );
          console.log("[PAYMENT] Calling session.completePayment(FAILURE)");
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          showStatus(
            "Payment processing failed: " +
              (saveResult.message || "Unknown error"),
            "error"
          );
        }
      } catch (error) {
        console.error(
          "[PAYMENT] ========== PAYMENT AUTHORIZATION ERROR =========="
        );
        console.error("[PAYMENT] Error:", error);
        console.error("[PAYMENT] Error message:", error.message);
        console.error("[PAYMENT] Error stack:", error.stack);
        hideLoading();
        console.log(
          "[PAYMENT] Calling session.completePayment(FAILURE) due to error"
        );
        session.completePayment(ApplePaySession.STATUS_FAILURE);
        showStatus("Payment error: " + error.message, "error");
      }
    };

    // Handle cancel
    session.oncancel = (event) => {
      console.log("[PAYMENT] Apple Pay cancelled by user");
      showStatus("Payment cancelled.", "error");
    };

    console.log("[PAYMENT] Beginning Apple Pay session...");
    session.begin();
    console.log("[PAYMENT] ✓ Apple Pay sheet presented to user");
  } catch (error) {
    console.error("[PAYMENT] ========== APPLE PAY FLOW ERROR ==========");
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
