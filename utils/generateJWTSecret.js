const crypto = require('crypto');

/**
 * JWT Secret Key Generator
 * Generates a secure random key for JWT token signing
 */

function generateJWTSecret(length = 64) {
    // Generate cryptographically strong random bytes
    const secret = crypto.randomBytes(length).toString('hex');
    return secret;
}

// Generate the secret key
const jwtSecret = generateJWTSecret();

console.log('\n🔐 JWT Secret Key Generator\n');
console.log('=' .repeat(80));
console.log('\n✅ Generated JWT Secret Key:\n');
console.log(jwtSecret);
console.log('\n' + '='.repeat(80));
console.log('\n📝 Copy this key and add it to your .env file:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('\n⚠️  IMPORTANT: Keep this secret safe and never commit it to version control!\n');

// Export for use in other files if needed
module.exports = { generateJWTSecret };
