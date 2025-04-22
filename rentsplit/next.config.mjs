/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
    images: {
      domains: ['lh3.googleusercontent.com'],
    },
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Content-Security-Policy",
              value: `
                default-src 'self';
                script-src 'self' https://www.paypal.com https://www.googletagmanager.com https://www.google.com 'unsafe-inline' 'unsafe-eval';
                connect-src 'self' https://*.paypal.com https://www.google.com https://www.googleadservices.com;
                frame-src https://*.paypal.com https://www.google.com;
                img-src * data:;
              `.replace(/\s{2,}/g, " "), // Minify spacing
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  