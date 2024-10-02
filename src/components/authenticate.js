// components/authenticate.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import jwt from 'jsonwebtoken';

const publicPaths = ['/login', '/register', '/'];

export default function Authenticate({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Decode the token to extract accountType
          const decodedToken = jwt.decode(token);
          const accountType = decodedToken?.accountType;

          if (accountType && ["admin", "staff", "parent"].includes(accountType.toLowerCase())) {
            setLoading(false); // Token is valid with a correct account type
          } else {
            setLoading(false);
            if (!publicPaths.includes(pathname)) {
              router.push('/login'); // Account type is not valid, redirect to login
            }
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          setLoading(false);
          if (!publicPaths.includes(pathname)) {
            router.push('/login'); // Decoding failed, redirect to login
          }
        }
      } else {
        setLoading(false);
        if (!publicPaths.includes(pathname)) {
          router.push('/login'); // No token, redirect to login
        }
      }
    };

    checkToken();
  }, [pathname, router]);

  if (loading) {
    return null; // Optionally, return a loading spinner here
  }

  return <>{children}</>;
}
