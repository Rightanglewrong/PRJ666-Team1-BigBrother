/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/progressReport/create', // Public URL path without "admin"
          destination: '/admin/progressReport/create', // Actual file path
        },
      ];
    },
  };
  
  export default nextConfig;
  