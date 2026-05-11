/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  // R3F 8 acessa internals do React (ReactCurrentBatchConfig) que
  // o bundler do Next 16 + Turbopack quebra ao tree-shakear.
  // Forcar transpile mantem o mesmo contexto de React para evitar
  // "Cannot read properties of undefined (reading 'ReactCurrentBatchConfig')".
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
}
module.exports = nextConfig
