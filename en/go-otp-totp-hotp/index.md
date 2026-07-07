# Go OTP TOTP HOTP


More and more systems add multi-factor authentication for security. OTP is one of the relatively simple and convenient MFA schemes. This post briefly covers the concepts and gives `totp` and `hotp` examples based on `go1.19.2`. For more, see [kit4go/otp](https://github.com/v8fg/kit4go).

<!--more-->

>**Copyright notice**: This is an original article by **[xwi88](https://github.com/xwi88)**, licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Commercial use is prohibited; please cite the source when reposting. Follow at <https://github.com/xwi88>

## Concepts

- OTP: One-Time Password.
  - A single-use password
- TOTP: Time-based One-time Password Algorithm (RFC 6238): time-based OTP, the most commonly used method.
  - A one-time password generated from a timestamp algorithm
  - Generated from a secret key and the current time
  - Usually produces a new code every 30 or 60 seconds
  - Requires the client and server to keep fairly accurate clocks
- HOTP: HMAC-based One-time Password Algorithm (RFC 4226): counter-based OTP, which TOTP builds upon.
  - A one-time password generated from the `HMAC` algorithm

## Use cases

- Server login dynamic-password verification (cloud servers, enterprise platforms, etc.)
- github, twitter, google login two-factor authentication
- Corporate intranet proxy login 2FA
- Bank transfer dynamic passwords
- Hardware tokens for online banking and online games
- 2FA / MFA and the like

## Products

- Microsoft Authenticator: [microsoft-authenticator](https://www.microsoft.com/zh-cn/security/mobile-authenticator-app)
  - Cross-app, simple, fast and highly secure 2FA
  - Recommended for personal use ☆☆☆☆☆
- Google Authenticator: [google-authenticator](https://github.com/google/google-authenticator)
- Bank token: bound to a specific account/card only
- Vendor-specific OTP security apps: limited to that vendor's products

## Principle

**`OTP(K, C) = Truncate(HMAC-SHA-1(K, C))`**

- `K`: secret key string
- `C`: a number
- `HMAC-SHA-1`: HMAC using SHA-1
- `Truncate`: truncates the encrypted string

>For HMAC-SHA-1 encryption, Truncate works as follows:

- HMAC-SHA-1 produces a 20-byte secret string
- Take the last byte of those 20 bytes, and use its low 4 bits as the index offset into the encrypted string
- Starting at that offset, take 4 bytes and combine them into an integer (big-endian)
- Take the last 6 or 8 digits of that integer and return them as a string

### OTP

- `C`: a number representing a random value
- Other parameters as defined above

### TOTP

- `C`: a random value derived from a timestamp
  - `C = (T - T0) / T1`
  - T: the current timestamp
  - T0: the epoch start, usually 0
  - T1: the time step, customized per your needs
    - Usually **30**, meaning the generated code is valid for `30s`
- Other parameters as defined above
- The hash function is usually `SHA2`, i.e. event-synchronous verification based on a `SHA-256` or `SHA-512` hash

### HOTP

- `C`: a number representing a random value
- Other parameters as defined above

## Implementations

|Name|Language|URL|Notes|
|:---|:---|:---|:---|
|[kit4go/otp](https://github.com/v8fg/kit4go)|Go|https://github.com/v8fg/kit4go||
|[otp](https://github.com/pquerna/otp)|Go|https://github.com/pquerna/otp||
|[pyotp](https://github.com/pyauth/pyotp)|Python|https://github.com/pyauth/pyotp||
|[gotp](https://github.com/xlzd/gotp)|Go|https://github.com/xlzd/gotp||
|[otplib](https://github.com/yeojz/otplib)|Node|https://github.com/yeojz/otplib||
|[otphp](https://github.com/Spomky-Labs/otphp)|PHP|https://github.com/Spomky-Labs/otphp||
|[mintotp](https://github.com/susam/mintotp)|Python|https://github.com/susam/mintotp||
|[otp](https://github.com/erlang/otp)|Erlang|https://github.com/erlang/otp||

## Usage

>`go get -u github.com/v8fg/kit4go`

```go
import "github.com/v8fg/kit4go/otp"

secret := otp.RandomSecret(10) // generate a 10-byte secret string, e.g. JBSWY3DPEHPK3PXP

// otp url
// otpauth://totp/Twitter:@xwi88?issuer=Twitter&secret=JJBFGV2ZGNCFARKIKBFTGUCYKA
totpURL := otp.GenerateURLTOTP(otp.KeyOpts{Issuer: "Twitter", AccountName: "@xwi88", Secret: []byte("JJBFGV2ZGNCFARKIKBFTGUCYKA")})

// now time: 2022-10-22 18:00:00 +0000 UTC
now := time.Date(2022, 10, 22, 18, 00, 00, 00, time.UTC)

// totp
// code := otp.Code("JBSWY3DPEHPK3PXP") // 527484
code := otp.Code("JBSWY3DPEHPK3PXP", now) // 527484

// totp
// code := otp.TOTPCode("JBSWY3DPEHPK3PXP") // 527484
// code := otp.TOTPCodeCustom("JBSWY3DPEHPK3PXP", now, nil) // 527484
code := otp.TOTPCodeCustom("JBSWY3DPEHPK3PXP", now, &otp.Opts{Skew: 1}) // allow clock skew in [Before(30s) ~ Present(30s) ~ After(30s)]

// verify
otp.VerifyTOTP(code, "JBSWY3DPEHPK3PXP") // true

otp.VerifyTOTPCustom(code, "JBSWY3DPEHPK3PXP", now, nil) // true

```

>More examples are in the source `otp/*_test.go` files

