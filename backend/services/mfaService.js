const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// In-memory store for MFA secrets (replace with database in production)
const mfaSecrets = new Map();
// In-memory store for recovery codes (replace with database in production)
const recoveryCodes = new Map();
// In-memory store for verification codes (replace with database in production)
const verificationCodes = new Map();
// In-memory store for trusted devices (replace with database in production)
const trustedDevices = new Map();

/**
 * Multi-Factor Authentication Service
 * Handles TOTP, SMS verification, and recovery codes
 */
class MFAService {
  /**
   * Generate a new TOTP secret for a user
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @returns {Object} Secret details with QR code
   */
  async generateTOTPSecret(userId, email) {
    // Generate a new secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `KYNSEY MD:${email}`,
      issuer: 'KYNSEY MD'
    });
    
    // Store the secret
    mfaSecrets.set(userId, {
      type: 'totp',
      secret: secret.base32,
      verified: false,
      createdAt: Date.now()
    });
    
    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauthUrl: secret.otpauth_url
    };
  }
  
  /**
   * Verify TOTP token
   * @param {string} userId - User ID
   * @param {string} token - TOTP token
   * @returns {boolean} True if valid
   */
  verifyTOTP(userId, token) {
    const secretData = mfaSecrets.get(userId);
    if (!secretData || secretData.type !== 'totp') {
      return false;
    }
    
    const verified = speakeasy.totp.verify({
      secret: secretData.secret,
      encoding: 'base32',
      token,
      window: 1 // Allow 1 time step before/after for clock drift
    });
    
    if (verified) {
      // Mark as verified if this is the first successful verification
      if (!secretData.verified) {
        secretData.verified = true;
        mfaSecrets.set(userId, secretData);
      }
    }
    
    return verified;
  }
  
  /**
   * Send SMS verification code
   * @param {string} userId - User ID
   * @param {string} phoneNumber - User's phone number
   * @returns {boolean} True if sent successfully
   */
  async sendSMSVerificationCode(userId, phoneNumber) {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store the code with expiration (5 minutes)
    verificationCodes.set(userId, {
      type: 'sms',
      code,
      phoneNumber,
      expiresAt: Date.now() + 5 * 60 * 1000
    });
    
    // In a real implementation, this would send an SMS via a provider like Twilio
    console.log(`[MOCK SMS] Sending verification code ${code} to ${phoneNumber}`);
    
    // For development, return the code (in production, would return success status)
    return {
      success: true,
      code // Only for development
    };
  }
  
  /**
   * Verify SMS code
   * @param {string} userId - User ID
   * @param {string} code - Verification code
   * @returns {boolean} True if valid
   */
  verifySMSCode(userId, code) {
    const codeData = verificationCodes.get(userId);
    if (!codeData || codeData.type !== 'sms' || codeData.expiresAt < Date.now()) {
      return false;
    }
    
    const verified = codeData.code === code;
    
    if (verified) {
      // Remove the used code
      verificationCodes.delete(userId);
    }
    
    return verified;
  }
  
  /**
   * Send email verification link
   * @param {string} userId - User ID
   * @param {string} email - User's email
   * @returns {boolean} True if sent successfully
   */
  async sendEmailVerificationLink(userId, email) {
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store the token with expiration (24 hours)
    verificationCodes.set(userId, {
      type: 'email',
      token,
      email,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000
    });
    
    // Generate verification link
    const verificationLink = `https://kynsey-md.example.com/verify-email?token=${token}&userId=${userId}`;
    
    // In a real implementation, this would send an email via a provider like SendGrid
    console.log(`[MOCK EMAIL] Sending verification link to ${email}:`);
    console.log(verificationLink);
    
    return {
      success: true,
      link: verificationLink // Only for development
    };
  }
  
  /**
   * Verify email token
   * @param {string} userId - User ID
   * @param {string} token - Verification token
   * @returns {boolean} True if valid
   */
  verifyEmailToken(userId, token) {
    const tokenData = verificationCodes.get(userId);
    if (!tokenData || tokenData.type !== 'email' || tokenData.expiresAt < Date.now()) {
      return false;
    }
    
    const verified = tokenData.token === token;
    
    if (verified) {
      // Remove the used token
      verificationCodes.delete(userId);
    }
    
    return verified;
  }
  
  /**
   * Generate recovery codes for a user
   * @param {string} userId - User ID
   * @param {number} count - Number of codes to generate (default: 10)
   * @returns {Array<string>} Array of recovery codes
   */
  generateRecoveryCodes(userId, count = 10) {
    const codes = [];
    
    // Generate random codes
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(5).toString('hex').toUpperCase();
      const formattedCode = `${code.slice(0, 5)}-${code.slice(5, 10)}`;
      codes.push(formattedCode);
    }
    
    // Hash the codes before storing
    const hashedCodes = codes.map(code => {
      return crypto.createHash('sha256').update(code).digest('hex');
    });
    
    // Store the hashed codes
    recoveryCodes.set(userId, {
      codes: hashedCodes,
      createdAt: Date.now()
    });
    
    // Return the plain text codes to show to the user once
    return codes;
  }
  
  /**
   * Verify a recovery code
   * @param {string} userId - User ID
   * @param {string} code - Recovery code
   * @returns {boolean} True if valid
   */
  verifyRecoveryCode(userId, code) {
    const userData = recoveryCodes.get(userId);
    if (!userData || !userData.codes || userData.codes.length === 0) {
      return false;
    }
    
    // Hash the provided code
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    
    // Check if the code exists and remove it if found
    const index = userData.codes.indexOf(hashedCode);
    if (index !== -1) {
      // Remove the used code
      userData.codes.splice(index, 1);
      recoveryCodes.set(userId, userData);
      return true;
    }
    
    return false;
  }
  
  /**
   * Trust a device for a user
   * @param {string} userId - User ID
   * @param {string} deviceInfo - Device information
   * @returns {string} Trust token
   */
  trustDevice(userId, deviceInfo) {
    // Generate a device token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store the token with an expiration (30 days)
    if (!trustedDevices.has(userId)) {
      trustedDevices.set(userId, []);
    }
    
    const userDevices = trustedDevices.get(userId);
    userDevices.push({
      token,
      deviceInfo,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    });
    
    // Limit to 5 trusted devices per user
    if (userDevices.length > 5) {
      userDevices.shift(); // Remove oldest device
    }
    
    trustedDevices.set(userId, userDevices);
    
    return token;
  }
  
  /**
   * Check if a device is trusted
   * @param {string} userId - User ID
   * @param {string} token - Trust token
   * @returns {boolean} True if device is trusted
   */
  isDeviceTrusted(userId, token) {
    const userDevices = trustedDevices.get(userId);
    if (!userDevices) {
      return false;
    }
    
    // Clean up expired devices
    const now = Date.now();
    const validDevices = userDevices.filter(device => device.expiresAt > now);
    
    if (validDevices.length !== userDevices.length) {
      trustedDevices.set(userId, validDevices);
    }
    
    // Check if token matches a trusted device
    return validDevices.some(device => device.token === token);
  }
  
  /**
   * Get MFA status for a user
   * @param {string} userId - User ID
   * @returns {Object} MFA status
   */
  getMFAStatus(userId) {
    const hasTOTP = mfaSecrets.has(userId) && mfaSecrets.get(userId).verified;
    const hasRecoveryCodes = recoveryCodes.has(userId) && recoveryCodes.get(userId).codes.length > 0;
    const trustedDevicesCount = trustedDevices.has(userId) ? trustedDevices.get(userId).length : 0;
    
    return {
      enabled: hasTOTP,
      verifiedTOTP: hasTOTP,
      hasRecoveryCodes,
      trustedDevicesCount
    };
  }
  
  /**
   * Disable MFA for a user
   * @param {string} userId - User ID
   */
  disableMFA(userId) {
    mfaSecrets.delete(userId);
    recoveryCodes.delete(userId);
    trustedDevices.delete(userId);
  }
}

module.exports = new MFAService();