// components/authenticate.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import jwt from "jsonwebtoken";

export const UserContext = createContext(null);
const publicPaths = ["/login", "/register", "/"];

export function useUser() {
  return useContext(UserContext);
}

export default function Authenticate({ children }) {
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
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

          if (
            accountType &&
            ["admin", "staff", "parent"].includes(accountType.toLowerCase())
          ) {
            setUserDetails({
              accountType: decodedToken.accountType,
              firstName: decodedToken.firstName,
              lastName: decodedToken.lastName,
              email: decodedToken.email,
            });
            setLoading(false); // Token is valid with a correct account type
          } else {
            setLoading(false);
            if (!publicPaths.includes(pathname)) {
              router.push("/login"); // Account type is not valid, redirect to login
            }
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          setLoading(false);
          if (!publicPaths.includes(pathname)) {
            router.push("/login"); // Decoding failed, redirect to login
          }
        }
      } else {
        setLoading(false);
        if (!publicPaths.includes(pathname)) {
          router.push("/login"); // No token, redirect to login
        }
      }
    };

    checkToken();
  }, [pathname, router]);

  if (loading) {
    return null;
  }

  return (
    <UserContext.Provider value={userDetails}>
      <>{children}</>;
    </UserContext.Provider>
  );
}
