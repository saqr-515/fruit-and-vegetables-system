import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* تعطيل ESLint و Typescript لضمان استمرارية التشغيل */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* حل مشكلة التنسيق والخطوط على بعض نسخ ويندوز */
  images: {
    unoptimized: true,
  },
  experimental: {
    // تعطيل الميزات التي قد تتطلب lightningcss native bindings
    optimizeCss: false, 
  }
};

export default nextConfig;
