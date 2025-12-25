const fs = require("fs");
const path = require("path");
const forge = require("node-forge");

const p12Path = path.join(__dirname, "MAC_CERTS", "Certificates.p12");
const password = "Ali@1986";
const outputPath = path.join(__dirname, "csr", "apple_pay_new.key");

console.log("Reading P12 file...");
const p12Data = fs.readFileSync(p12Path);
const p12Asn1 = forge.asn1.fromDer(p12Data.toString("binary"));

console.log("Decrypting with password...");
try {
  const pkcs12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

  console.log("PKCS12 structure:", {
    hasPrivateKey: !!pkcs12.privateKey,
    hasCert: !!pkcs12.cert,
    bagsKeys: pkcs12.bags ? Object.keys(pkcs12.bags) : "no bags",
  });

  let privateKey = null;
  let cert = null;

  // Extract from bags
  if (pkcs12.privateKey) {
    privateKey = pkcs12.privateKey;
    console.log("✓ Private key found");
  }

  if (pkcs12.cert) {
    cert = pkcs12.cert;
    console.log("✓ Certificate found");
  }

  // Also check in bags array
  if (pkcs12.bags) {
    for (const [bagType, bagArray] of Object.entries(pkcs12.bags)) {
      console.log(`Found bag type: ${bagType}`);
      if (Array.isArray(bagArray)) {
        for (const item of bagArray) {
          if (item.key) {
            privateKey = item.key;
            console.log("✓ Private key found in bags:", bagType);
          }
          if (item.cert) {
            cert = item.cert;
            console.log("✓ Certificate found in bags:", bagType);
          }
        }
      }
    }
  }

  if (privateKey) {
    // Convert to PEM format
    const pem = forge.pki.privateKeyToPem(privateKey);
    fs.writeFileSync(outputPath, pem);
    console.log("✓ Private key saved to:", outputPath);
  } else {
    console.log("✗ No private key found in P12");
  }
} catch (e) {
  console.error("Error:", e.message);
  console.log("Password might be incorrect or file is corrupted");
}
