/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/progressReport/create', // Public URL path without "admin"
          destination: '/admin/progressReport/create', // Actual file path
        },
        {
          source: '/progressReport/child', // Public URL path
          destination: '/admin/progressReport/child', // Destination path with childID from the query parameter
          has: [
            {
              type: 'query',
              key: 'childID', // Ensure the query parameter 'childID' is present
            },
          ],
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
  