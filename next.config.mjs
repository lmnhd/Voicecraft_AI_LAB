/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better error handling
  reactStrictMode: true,
  
  // Optimize images from external sources
  images: {
    domains: ['iahutfkcvbtovelsxyio.supabase.co'],
  },
  
  // Experimental features for Next.js 15
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
