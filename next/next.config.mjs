import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** @type {import('next').NextConfig} */

const nextConfig = {
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['sql.js'],
    serverActions: {
      bodySizeLimit: '55mb',
    },
  },
  images: {
    domains: [
      'axajzftmwrmj.compat.objectstorage.ap-chuncheon-1.oraclecloud.com',
    ],
  },
};
export default (phase) => ({
  ...nextConfig,
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
});
