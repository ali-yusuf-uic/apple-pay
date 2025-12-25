const fs = require("fs");
const path = require("path");
const forge = require("node-forge");

const p12Path = path.join(__dirname, "MAC_CERTS", "Certificates.p12");
const outputPath = path.join(__dirname, "csr", "apple_pay_new.key");

// قائمة الباسوردات اللي تريد تجربها
const passwordsToTry = ["Ali@1986", "Mohd@1986", "United*1986"];

console.log("Reading P12 file...");
const p12Data = fs.readFileSync(p12Path);
const p12Asn1 = forge.asn1.fromDer(p12Data.toString("binary"));

let found = false;

for (const password of passwordsToTry) {
  console.log(`\nTrying password: "${password}"`);

  try {
    const pkcs12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    let privateKey = null;

    // Check main privateKey
    if (pkcs12.privateKey) {
      privateKey = pkcs12.privateKey;
      console.log("✓ FOUND! Private key in pkcs12.privateKey");
    }

    // Check bags
    if (pkcs12.bags && !privateKey) {
      for (const [bagType, bagArray] of Object.entries(pkcs12.bags)) {
        if (Array.isArray(bagArray)) {
          for (const item of bagArray) {
            if (item.key) {
              privateKey = item.key;
              console.log("✓ FOUND! Private key in bags:", bagType);
              break;
            }
          }
        }
      }
    }

    if (privateKey) {
      // Convert to PEM format
      const pem = forge.pki.privateKeyToPem(privateKey);
      fs.writeFileSync(outputPath, pem);
      console.log("\n✓✓✓ SUCCESS! Private key saved to:", outputPath);
      console.log("Password used:", password);
      found = true;
      break;
    }
  } catch (e) {
    console.log("✗ Failed:", e.message.substring(0, 50));
  }
}

if (!found) {
  console.log(
    "\n✗ Could not extract private key with any of the tried passwords"
  );
  console.log("Please provide the correct password");
}
