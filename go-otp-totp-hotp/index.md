# Go OTP TOTP HOTP


越来越多的系统基于安全的考虑加入了多因素认证的功能，实现多因素认证有多种方案，`OTP`就是其中一种实现相对简单便捷的方案。本文简要介绍了相关概念，并基于 `go1.19.2` ，给出`totp`、`hotp`的使用示例，更多可参考 [kit4go/otp](https://github.com/v8fg/kit4go)。

<!--more-->

>**版权声明**：本文为博主 **[xwi88](https://github.com/xwi88)** 的原创文章，遵循 [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) 版权协议，禁止商用，转载请注明出处，欢迎关注 <https://github.com/xwi88>

## 概念

- OTP: One-Time Password.
  - 一次性密码
- TOTP: Time-based One-time Password Algorithm (TOTP) (RFC 6238): Time based OTP, the most commonly used method.
  - 基于时间戳算法生成的一次性密码，使用最广泛
  - 基于私钥及当前时间生成
  - 一般每30秒或60秒产生一个新口令
  - 需要客户端与服务器保持较精确的时钟
- HOTP: HMAC-based One-time Password Algorithm (HOTP) (RFC 4226): Counter based OTP, which TOTP is based upon.
  - 基于`HMAC`算法生成的一次性密码

## 使用场景

- 服务器登录动态密码验证（云服务器登录, 企业管理平台登录等）
- github, twitter, google 登录双因素认证
- 公司内网代理登录双因素验证
- 银行转账动态密码
- 网银、网络游戏的实体动态口令牌
- 双因素认证`2FA`，多因素认证`MFA`等

## 产品

- Microsoft 身份认证器: [microsoft-authenticator](https://www.microsoft.com/zh-cn/security/mobile-authenticator-app)
  - 跨应用使用简单、快速且高度安全的双因素身份验证
  - 推荐个人使用 ☆☆☆☆☆
- Google 身份验证器: [google-authenticator](https://github.com/google/google-authenticator)
- 银行网盾令牌: 仅限绑定账户卡
- 支持OTP的游戏厂商的安全防护应用: 仅限指定厂商产品

## 原理

**`OTP(K, C) = Truncate(HMAC-SHA-1(K, C))`**

- `K`: 秘钥串
- `C`: 数字
- `HMAC-SHA-1`: 使用SHA-1做HMAC
- `Truncate`: 用于截取加密后的字符串

>对HMAC-SHA-1方式加密来说，Truncate实现如下

- HMAC-SHA-1加密后的长度得到一个20字节的密串
- 取这个20字节的密串的最后一个字节，取这字节的低4位，作为截取加密串的下标偏移量
- 按照下标偏移量开始，获取4个字节，按照大端方式组成一个整数
- 截取这个整数的后6位或者8位转成字符串返回。

### OTP

- `C`: 数字，表示随机数
- 其他参数与定义相同

### TOTP

- `C`: 随机数，基于时间戳生成
  - `C = (T - T0) / T1`
  - T:  当前的时间戳
  - T0: 起始时间，一般为0
  - T1: 时间间隔，根据业务需要自定义
    - 一般为 **30**，表示产生的口令`30s`有效

- 其他参数与定义相同
- 一般散列函数使用`SHA2`, 即：基于`SHA-256` or `SHA-512` [SHA2] 的散列函数做事件同步验证

### HOTP

- `C`: 数字，表示随机数
- 其他参数与定义相同

## 实现参考

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

## 使用

>`go get -u github.com/v8fg/kit4go`

```go
import "github.com/v8fg/kit4go/otp"

secret := otp.RandomSecret(10) // 生成10字节长度的 secret字符串，如: JBSWY3DPEHPK3PXP

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
code := otp.TOTPCodeCustom("JBSWY3DPEHPK3PXP", now, &otp.Opts{Skew: 1}) // 允许时间误差在 [Before(30s) ~ Present(30s) ~ After(30s)]

// verify
otp.VerifyTOTP(code, "JBSWY3DPEHPK3PXP") // true

otp.VerifyTOTPCustom(code, "JBSWY3DPEHPK3PXP", now, nil) // true

```

>更多示例可以查看源码 `otp/*_test.go` 文件

