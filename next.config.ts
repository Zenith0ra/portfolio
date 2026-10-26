import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Versioned filename, so the content never changes under this URL.
        // The accent dictionary is 2.8 MB raw; revalidating it every visit
        // would waste more traffic than most pages on this site.
        source: "/vocab/accent.v1.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
