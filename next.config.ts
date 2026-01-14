import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'crypto-images-4545f.web.app', protocol: 'https' },
    ],
  },
  /* config options here */
  reactStrictMode: false, // Disable for demo to prevent duplicate WebSocket connections
  reactCompiler: true,
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/:all*.(jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc|glb|gltf|css|js|woff)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000',
          },
        ],
      },
    ];
  },
  webpack: config => {
    // NOTE: ignore log or warning by this lib
    config.externals.push('pino-pretty');
    return config;
  },
};

export default nextConfig;
