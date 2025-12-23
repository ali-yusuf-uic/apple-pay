const fs = require("fs");
const path = require("path");

// Function to convert DER to PEM
function derToPem(derBuffer, type = "CERTIFICATE") {
  const base64 = derBuffer.toString("base64");
  const lines = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${type}-----\n${lines.join("\n")}\n-----END ${type}-----`;
}

// Convert merchant_id.cer
const merchantIdDer = fs.readFileSync(
  path.join(__dirname, "certs", "merchant_id.cer")
);
const merchantIdPem = derToPem(merchantIdDer);
fs.writeFileSync(
  path.join(__dirname, "certs", "merchant_id.pem"),
  merchantIdPem
);
console.log("✓ Created certs/merchant_id.pem");
console.log("First 100 chars:", merchantIdPem.substring(0, 100));
console.log("Length:", merchantIdPem.length);

// Convert apple_pay.cer
const applePayDer = fs.readFileSync(
  path.join(__dirname, "certs", "apple_pay.cer")
);
const applePayPem = derToPem(applePayDer);
fs.writeFileSync(path.join(__dirname, "certs", "apple_pay.pem"), applePayPem);
console.log("✓ Created certs/apple_pay.pem");
console.log("First 100 chars:", applePayPem.substring(0, 100));
console.log("Length:", applePayPem.length);

// Output the PEM for Render
console.log("\n========================================");
console.log("APPLE_PAY_CERT (paste into Render):");
console.log("========================================");
console.log(applePayPem);

console.log("\n========================================");
console.log("MERCHANT_ID_CERT (paste into Render):");
console.log("========================================");
console.log(merchantIdPem);
