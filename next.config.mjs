/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/progressReport/create', // Public URL path without "admin"
          destination: '/admin/progressReport/create', // Actual file path
        },
        {
          source: '/relationship', // Public URL path without "admin"
          destination: '/admin/relationship', // Actual file path
        },
        {
          source: '/relationship/create', // Public URL path without "admin"
          destination: '/admin/relationship/create', // Actual file path
        },
        
        {
        source: '/relationship/:childID', // Public URL path without "admin"
        destination: '/admin/relationship/:childID', // Actual file path
        }
      ];
    },
  };
  
  export default nextConfig;
  