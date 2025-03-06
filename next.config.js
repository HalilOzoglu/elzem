/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jntfcclbjhqyj7x8.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig;
