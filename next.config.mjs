import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ["@claralight-design/abweb-navbar"],
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default withMDX(config);
