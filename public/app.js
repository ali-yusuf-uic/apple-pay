// Apple Pay Configuration
const MERCHANT_ID = "merchant.com.uic.sam-uic-offers";
const TOTAL_AMOUNT = "0.10";
const CURRENCY = "BHD";

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
      showStatus(`Error: ${error.message}`, "error");
      console.error("Apple Pay error:", error);
    }
  });
}

// Initiate Apple Payment
async function initiateApplePayment() {
  // Payment request configuration
  const paymentRequest = {
    countryCode: "US",
    currencyCode: CURRENCY,
    merchantCapabilities: ["supports3DS"],
    supportedNetworks: ["amex", "discover", "masterCard", "visa"],
    requiredBillingContactFields: ["postalAddress"],
    requiredShippingContactFields: ["email", "phone"],
    total: {
      label: "Premium Subscription",
      amount: TOTAL_AMOUNT,
      type: "final",
    },
    lineItems: [
      {
        label: "Subscription Fee",
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
      const merchantValidation = await validateMerchant(event.validationURL);
      session.completeMerchantValidation(merchantValidation);
    } catch (error) {
      console.error("Merchant validation failed:", error);
      session.abort();
      showStatus("Payment failed: Merchant validation error", "error");
    }
  };

  // Handles payment authorization
  session.onpaymentauthorized = async (event) => {
    showStatus("Processing payment...", "loading");

    try {
      const paymentToken = event.payment.token.paymentData;

      // Process the payment token
      const response = await fetch("/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: paymentToken,
          amount: TOTAL_AMOUNT,
          currency: CURRENCY,
        }),
      });

      if (!response.ok) {
        throw new Error("Payment processing failed");
      }

      const result = await response.json();

      // Mark payment as successful
      session.completePayment(ApplePaySession.STATUS_SUCCESS);
      showStatus(
        "✓ Payment successful! Thank you for your purchase.",
        "success"
      );

      // Optional: Reset button after successful payment
      setTimeout(() => {
        document.getElementById("apple-pay-button").textContent =
          "Payment Complete ✓";
        document.getElementById("apple-pay-button").disabled = true;
      }, 500);
    } catch (error) {
      console.error("Payment error:", error);
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
        label: "Premium Subscription",
        amount: TOTAL_AMOUNT,
        type: "final",
      },
      {
        label: "Premium Subscription",
        amount: TOTAL_AMOUNT,
        type: "final",
      }
    );
  };

  session.begin();
}

// Validate merchant with Apple Pay servers
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
    return data.merchantSession;
  } catch (error) {
    console.error("Merchant validation error:", error);
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
