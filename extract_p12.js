const fs = require('fs');
const path = require('path');

// Read the .p12 file
const p12Path = path.join(__dirname, 'MAC_CERTS', 'Certificates.p12');
const password = 'Ali@1986';

console.log('P12 file path:', p12Path);
console.log('File exists:', fs.existsSync(p12Path));

// For now, copy the Merchant ID cert and ask for manual extraction
console.log('\nNote: Private key extraction from P12 requires OpenSSL.');
console.log('Please extract manually or use Keychain on Mac.');
console.log('\nAlternatively, you can get the key from Eazypay directly.');
