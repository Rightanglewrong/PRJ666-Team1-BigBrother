const express = require('express');
const router = express.Router();
const { Auth } = require('aws-amplify');

Auth.configure({
  Auth: {
    region: process.env.AWS_REGION,
    userPoolId: process.env.AWS_USER_POOL_ID,
    userPoolWebClientId: process.env.AWS_CLIENT_ID,
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Auth.signIn(email, password);
    
    // If login is successful, respond with user data or tokens
    return res.status(200).json({
      message: 'Login successful!',
      user: {
        username: user.username,
        email: user.attributes.email,
        tokens: user.signInUserSession, // Contains accessToken, idToken, refreshToken
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(401).json({
      message: 'Login failed',
      error: error.message,
    });
  }
});

// Sign-up Route
router.post('/signup', async (req, res) => {
  const { username, password, email, givenName, familyName, accountType, locationId } = req.body;

  if (!['User', 'Staff', 'Admin'].includes(accountType)) {
    return res.status(400).json({ message: 'Invalid account type' });
  }

  try {
    const signUpResponse = await Auth.signUp({
      username,
      password,
      attributes: {
        email,
        given_name: givenName,
        family_name: familyName,
        'custom:account_type': accountType,
        'custom:location_id': locationId,
      },
    });
    return res.status(200).json({ message: 'Sign-up successful!', data: signUpResponse });
  } catch (error) {
    console.error('Error during sign-up:', error);
    return res.status(500).json({ message: 'Sign-up failed', error });
  }
});

 router.post(checkUser = async (email) => {
  try {
    const response = await fetch('https://big-brother-be-3d6ad173758c.herokuapp.com/api/check-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Failed to check user details.');
    }

    const data = await response.json();
    return data;  // This should return the response whether fields are present or not
  } catch (error) {
    console.error('Error checking user details:', error);
    return { hasAccountDetails: false };  // Default to false on error
  }
});




module.exports = router;
