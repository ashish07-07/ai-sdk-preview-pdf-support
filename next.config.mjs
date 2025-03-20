 /** @type {import('next').NextConfig} */

// const nextConfig = {
//     experimental: {
//       serverComponentsExternalPackages: ['pdf2json'],
//     },
//   };
  
//   export default nextConfig; 

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf2json'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
  