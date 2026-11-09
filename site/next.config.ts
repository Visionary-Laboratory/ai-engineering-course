import type { NextConfig } from 'next';

const githubPages = process.env.COURSE_GITHUB_PAGES === '1';
const basePath = githubPages ? '/ai-engineering-course' : '';
const nextConfig: NextConfig = {
  assetPrefix: basePath,
  env: { NEXT_PUBLIC_COURSE_BASE_PATH: basePath },
  ...(githubPages ? { output: 'export' } : {}),
};

export default nextConfig;
