const dotenv = require('dotenv');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

/**
 * JWT Secret Validator and Auto-Generator
 * Validates the JWT secret and generates a new one if needed
 */

function validateJWTSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    
    console.log('\n🔐 JWT Secret Key Validator\n');
    console.log('='.repeat(80));
    
    // Check if JWT_SECRET exists
    if (!jwtSecret) {
        console.log('❌ No JWT_SECRET found in .env file!');
        return generateAndUpdateSecret();
    }
    
    // Check if it's the default/weak secret
    if (jwtSecret.includes('your_super_secret') || jwtSecret.includes('change_in_production')) {
        console.log('⚠️  WARNING: Using default/weak JWT secret!');
        return generateAndUpdateSecret();
    }
    
    // Check minimum length (should be at least 32 characters)
    if (jwtSecret.length < 32) {
        console.log('⚠️  WARNING: JWT secret is too short! (< 32 characters)');
        return generateAndUpdateSecret();
    }
    
    // All checks passed
    console.log('✅ JWT Secret is valid and secure!');
    console.log(`   Length: ${jwtSecret.length} characters`);
    console.log(`   Entropy: High (${calculateEntropy(jwtSecret).toFixed(2)} bits)`);
    console.log('\n' + '='.repeat(80) + '\n');
    
    return true;
}

function calculateEntropy(str) {
    const freq = {};
    for (let char of str) {
        freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const len = str.length;
    
    for (let char in freq) {
        const p = freq[char] / len;
        entropy -= p * Math.log2(p);
    }
    
    return entropy * len;
}

function generateAndUpdateSecret() {
    console.log('\n🔧 Generating new secure JWT secret...\n');
    
    // Generate a new secure secret
    const newSecret = crypto.randomBytes(64).toString('hex');
    
    // Read the .env file
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    try {
        envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
        console.log('⚠️  .env file not found, creating new one...');
    }
    
    // Update or add JWT_SECRET
    const jwtSecretRegex = /^JWT_SECRET=.*$/m;
    
    if (jwtSecretRegex.test(envContent)) {
        // Update existing JWT_SECRET
        envContent = envContent.replace(jwtSecretRegex, `JWT_SECRET=${newSecret}`);
        console.log('✅ Updated existing JWT_SECRET in .env file');
    } else {
        // Add new JWT_SECRET
        if (envContent && !envContent.endsWith('\n')) {
            envContent += '\n';
        }
        envContent += `JWT_SECRET=${newSecret}\n`;
        console.log('✅ Added new JWT_SECRET to .env file');
    }
    
    // Write back to .env file
    try {
        fs.writeFileSync(envPath, envContent, 'utf8');
        console.log('\n🎉 New JWT Secret generated and saved successfully!\n');
        console.log('New JWT Secret:');
        console.log(newSecret);
        console.log('\n⚠️  Please restart your server for changes to take effect!\n');
        console.log('='.repeat(80) + '\n');
        return true;
    } catch (error) {
        console.error('❌ Error writing to .env file:', error.message);
        console.log('\nManually add this to your .env file:');
        console.log(`JWT_SECRET=${newSecret}\n`);
        return false;
    }
}

// Run validation if executed directly
if (require.main === module) {
    validateJWTSecret();
}

module.exports = { validateJWTSecret, generateAndUpdateSecret };
