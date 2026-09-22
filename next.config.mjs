/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [],
  },
  // croner usa APIs do Node; mantém fora do bundle do servidor
  serverExternalPackages: ["croner"],
};

export default nextConfig;
