// Static export is only used by a Docker deployment that serves pre-built
// files; the default build is a normal SSR build for Vercel / `next start`.
const isStaticExport = process.env.STATIC_EXPORT === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

if (isStaticExport) {
  nextConfig.output = "export";
  nextConfig.images = {
    unoptimized: true,
  };
}

export default nextConfig;
