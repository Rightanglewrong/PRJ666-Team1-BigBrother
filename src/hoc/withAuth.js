import { useEffect } from 'react';
import { useRouter } from 'next/router';

export const withAuth = (Component) => {
  const AuthenticatedComponent = (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
      }
    }, [router]);

    return <Component {...props} />;
  };

  return AuthenticatedComponent;
};
