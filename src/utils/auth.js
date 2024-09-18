export const signup = async (signupData) => {
    try {
      const response = await fetch('https://big-brother-be-3d6ad173758c.herokuapp.com/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        console.log('Sign-up successful:', data);
        if (data.token && typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
        }
        window.location.href = '/login';
      } else {
        console.error('Sign-up failed:', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  