require('dotenv').config();
const db = require('./src/models');

async function testUserModel() {
  try {
    // Test 1: Create user
    console.log('Test 1: Creating user...');
    const user = await db.User.createUser({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ User created:', user.toSafeObject());

    // Test 2: Find by email
    console.log('\nTest 2: Finding by email...');
    const foundUser = await db.User.findByEmail('test@example.com');
    console.log('✅ Found user:', foundUser.toSafeObject());

    // Test 3: Compare password (correct)
    console.log('\nTest 3: Testing correct password...');
    const isValid = await foundUser.comparePassword('password123');
    console.log('✅ Password valid:', isValid); 

    // Test 4: Compare password (wrong)
    console.log('\nTest 4: Testing wrong password...');
    const isInvalid = await foundUser.comparePassword('wrongpassword');
    console.log('✅ Password invalid:', isInvalid); 

    // Cleanup
    await user.destroy();
    console.log('\n✅ Test user deleted');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testUserModel();