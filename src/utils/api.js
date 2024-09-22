export const login = async (email, password) => {
    try {
      const response = await fetch('https://big-brother-be-3d6ad173758c.herokuapp.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        const errorMessage = data.message || 'Login failed';
        throw new Error(errorMessage);
      }
  
      if (typeof window !== 'undefined' && data.user?.signInUserSession?.accessToken?.jwtToken) {
        localStorage.setItem('token', data.user.signInUserSession.accessToken.jwtToken);
      }
  
      return data;
    } catch (error) {
      console.error('Error during login:', error.message);
      throw error;
    }
  };