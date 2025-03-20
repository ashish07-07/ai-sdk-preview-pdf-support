 /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

// // const nextConfig = {
// //     experimental: {
// //       serverActions: {
// //         bodySizeLimit: "10mb", // Increase body size limit to 10MB
// //       },
// //     },
// //   };
  
// //   export default nextConfig;
  
// const nextConfig = {
//     experimental: {
//       serverComponentsExternalPackages: ['pdf2json'],
//     },
//   };
  
//   module.exports = nextConfig;
const nextConfig = {
    experimental: {
      serverComponentsExternalPackages: ['pdf2json'],
    },
  };
  
  export default nextConfig; // ✅ Correct way to export in ES modules
  