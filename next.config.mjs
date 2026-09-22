/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [],
  },
  // croner usa APIs do Node; mantém fora do bundle do servidor
  serverExternalPackages: ["croner"],
  // Fontes das imagens de compartilhamento, lidas do disco em runtime
  outputFileTracingIncludes: { "/**": ["./app/fonts/**"] },
};

export default nextConfig;
