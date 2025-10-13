# 🔒 Membership Discount Security System

## **Security Features Implemented**

### **1. Database-Backed Discount Codes**
- ✅ **Unique Codes**: Each code is cryptographically secure and unique
- ✅ **Time-Limited**: Codes expire after 1 hour automatically
- ✅ **Single-Use**: Codes are marked as used and cannot be reused
- ✅ **Member-Specific**: Codes are tied to specific member email addresses

### **2. Multi-Layer Validation**
- ✅ **Membership Verification**: Only active members can generate codes
- ✅ **Email Verification**: Codes only work with the member's registered email
- ✅ **Expiration Check**: Codes automatically expire after 1 hour
- ✅ **Usage Tracking**: Codes are marked as used to prevent reuse

### **3. Security Measures**

#### **Code Generation Security**
```javascript
// Each code is unique and time-limited
const discountCode = await DiscountCode.createForMember(
  membership._id,
  memberEmail,
  {
    discountPercentage: 10,
    expiresIn: 60 * 60 * 1000, // 1 hour
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  }
);
```

#### **Code Validation Security**
```javascript
// Codes are validated against:
// 1. Member email address
// 2. Active membership status
// 3. Code expiration
// 4. Usage status (not already used)
const validation = await DiscountCode.validateCode(discountCode, memberEmail);
```

### **4. Anti-Abuse Measures**

#### **Rate Limiting**
- Codes are generated only for verified members
- Existing valid codes are reused instead of generating new ones
- IP address and user agent tracking

#### **Usage Tracking**
- Each code usage is logged with timestamp and IP
- Codes become invalid after first use
- Automatic cleanup of expired codes

#### **Email Verification**
- Discount codes only work with the member's registered email
- Non-members cannot use member discount codes
- Email must match the membership record

## **How It Prevents Abuse**

### **❌ What Non-Members CANNOT Do:**
1. **Generate Codes**: Only verified members can generate discount codes
2. **Use Codes**: Codes are tied to specific member email addresses
3. **Reuse Codes**: Each code can only be used once
4. **Use Expired Codes**: Codes automatically expire after 1 hour
5. **Share Codes**: Codes only work with the original member's email

### **✅ What Members CAN Do:**
1. **Generate Codes**: Verified members can generate discount codes
2. **Use Codes**: Use their own codes with their registered email
3. **Get Discounts**: Receive 10% discount on purchases
4. **Reuse Expired Codes**: Generate new codes when old ones expire

## **Database Schema Security**

### **DiscountCode Model**
```javascript
{
  code: String,           // Unique discount code
  memberId: ObjectId,     // Reference to membership
  memberEmail: String,    // Member's email address
  isUsed: Boolean,       // Usage tracking
  usedAt: Date,          // When it was used
  expiresAt: Date,       // Automatic expiration
  ipAddress: String,     // Security tracking
  userAgent: String      // Security tracking
}
```

### **Security Indexes**
- `{ code: 1, isUsed: 1 }` - Fast code validation
- `{ memberId: 1, isUsed: 1 }` - Member code lookup
- `{ expiresAt: 1 }` - Automatic cleanup (TTL)

## **API Endpoints Security**

### **1. Generate Discount Code**
- **Endpoint**: `POST /api/membership/discount-code`
- **Security**: Requires active membership
- **Rate Limiting**: Reuses existing valid codes
- **Tracking**: Logs IP and user agent

### **2. Validate Discount Code**
- **Endpoint**: `POST /api/membership/validate-discount`
- **Security**: Validates member email + code combination
- **One-Time Use**: Marks code as used after validation
- **Expiration**: Checks code expiration

### **3. Shopify Integration**
- **Endpoint**: `POST /api/shopify/validate-discount`
- **Security**: Same validation as member endpoint
- **Usage**: Called by Shopify during checkout
- **Tracking**: Logs usage for security monitoring

## **Monitoring & Alerts**

### **Security Monitoring**
- Track failed validation attempts
- Monitor unusual usage patterns
- Alert on multiple failed attempts from same IP
- Log all discount code usage

### **Database Cleanup**
- Automatic removal of expired codes (TTL index)
- Regular cleanup of used codes
- Archive old discount code records

## **Best Practices**

### **For Developers**
1. **Never expose discount codes in client-side code**
2. **Always validate on server-side**
3. **Log all discount code activities**
4. **Monitor for abuse patterns**

### **For Members**
1. **Keep discount codes private**
2. **Use codes only with registered email**
3. **Don't share codes with non-members**
4. **Generate new codes when needed**

## **Emergency Procedures**

### **If Abuse is Detected**
1. **Immediate**: Disable specific discount codes
2. **Short-term**: Block IP addresses if necessary
3. **Long-term**: Review and strengthen security measures
4. **Monitoring**: Increase logging and alerting

### **Code Revocation**
```javascript
// Revoke specific discount code
await DiscountCode.findOneAndUpdate(
  { code: 'MEMBER123456' },
  { isUsed: true, usedAt: new Date() }
);
```

This security system ensures that only verified members can use discount codes, and each code can only be used once with the correct email address.

