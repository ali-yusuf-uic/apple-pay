$gitOpenssl = "C:\Program Files\Git\usr\bin\openssl.exe"
$p12File = "MAC_CERTS\Certificates.p12"
$keyOutput = "csr\apple_pay_new.key"
$password = "Ali@1986"

Write-Host "Extracting private key from .p12..."

& $gitOpenssl pkcs12 -in $p12File -nocerts -nodes -out $keyOutput -password "pass:$password"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Private key extracted successfully"
} else {
    Write-Host "Error extracting key"
}
