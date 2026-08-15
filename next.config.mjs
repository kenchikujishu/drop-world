import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;

// `next dev` で Cloudflare のバインディングを使えるようにする。本番ビルドには影響しない。
initOpenNextCloudflareForDev();
