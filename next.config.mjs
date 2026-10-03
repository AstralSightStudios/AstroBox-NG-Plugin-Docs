import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ["@claralight-design/abweb-navbar"],
  async redirects() {
    return [
      {
        source: "/docs/plugin-development",
        destination: "/docs/plugin-development/v4",
        permanent: true,
      },
      {
        source: "/docs/plugin-v4",
        destination: "/docs/plugin-development/v4",
        permanent: true,
      },
      {
        source: "/docs/plugin-v4/:path*",
        destination: "/docs/plugin-development/v4/:path*",
        permanent: true,
      },
      {
        source: "/docs/plugin-dev",
        destination: "/docs/plugin-development/v2",
        permanent: true,
      },
      {
        source: "/docs/plugin-dev/:path*",
        destination: "/docs/plugin-development/v2/:path*",
        permanent: true,
      },
      {
        source: "/docs/plugin-v1",
        destination: "/docs/plugin-development/v1",
        permanent: true,
      },
      {
        source: "/docs/plugin-v1/:path*",
        destination: "/docs/plugin-development/v1/:path*",
        permanent: true,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },
};

export default withMDX(config);
