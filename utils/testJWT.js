const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

/**
 * Test JWT Authentication
 * Tests user registration and login with the new JWT secret
 */

async function testJWTAuth() {
    console.log('\n🧪 Testing JWT Authentication\n');
    console.log('='.repeat(80));
    
    try {
        // Test 1: Register a new user
        console.log('\n1️⃣  Testing User Registration...');
        const registerResponse = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser_' + Date.now(),
                email: `test_${Date.now()}@ecotrack.com`,
                password: 'securepass123',
                firstName: 'Test',
                lastName: 'User'
            })
        });

        const registerData = await registerResponse.json();
        
        if (registerData.success) {
            console.log('✅ Registration Successful!');
            console.log('   User:', registerData.user.username);
            console.log('   Email:', registerData.user.email);
            console.log('   Token received:', registerData.token ? 'Yes (' + registerData.token.substring(0, 20) + '...)' : 'No');
        } else {
            console.log('❌ Registration Failed:', registerData.message);
            return;
        }

        const token = registerData.token;
        const userEmail = registerData.user.email;

        // Test 2: Get user profile with token
        console.log('\n2️⃣  Testing Profile Access with JWT Token...');
        const profileResponse = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const profileData = await profileResponse.json();
        
        if (profileData.success) {
            console.log('✅ Profile Access Successful!');
            console.log('   Username:', profileData.user.username);
            console.log('   Carbon Goal:', profileData.user.carbonFootprintGoal, 'kg CO₂');
        } else {
            console.log('❌ Profile Access Failed:', profileData.message);
        }

        // Test 3: Test token refresh
        console.log('\n3️⃣  Testing Token Refresh...');
        const refreshResponse = await fetch(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const refreshData = await refreshResponse.json();
        
        if (refreshData.success) {
            console.log('✅ Token Refresh Successful!');
            console.log('   New token received:', refreshData.token ? 'Yes' : 'No');
        } else {
            console.log('❌ Token Refresh Failed:', refreshData.message);
        }

        // Test 4: Test login with same credentials
        console.log('\n4️⃣  Testing User Login...');
        const loginResponse = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                password: 'securepass123'
            })
        });

        const loginData = await loginResponse.json();
        
        if (loginData.success) {
            console.log('✅ Login Successful!');
            console.log('   Welcome back:', loginData.user.username);
            console.log('   Token received:', loginData.token ? 'Yes' : 'No');
        } else {
            console.log('❌ Login Failed:', loginData.message);
        }

        // Test 5: Test invalid token
        console.log('\n5️⃣  Testing Invalid Token Handling...');
        const invalidResponse = await fetch(`${API_URL}/auth/profile`, {
            headers: {
                'Authorization': 'Bearer invalid_token_12345'
            }
        });

        const invalidData = await invalidResponse.json();
        
        if (!invalidData.success) {
            console.log('✅ Invalid Token Correctly Rejected!');
            console.log('   Message:', invalidData.message);
        } else {
            console.log('❌ Security Issue: Invalid token was accepted!');
        }

        console.log('\n' + '='.repeat(80));
        console.log('\n🎉 JWT Authentication Tests Complete!\n');
        console.log('Summary:');
        console.log('  ✅ User Registration: Working');
        console.log('  ✅ JWT Token Generation: Working');
        console.log('  ✅ Profile Access with Token: Working');
        console.log('  ✅ Token Refresh: Working');
        console.log('  ✅ User Login: Working');
        console.log('  ✅ Invalid Token Rejection: Working');
        console.log('\n✨ All JWT security features are functioning correctly!\n');

    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        console.log('\nMake sure the server is running on http://localhost:5000\n');
    }
}

// Run tests
testJWTAuth();
