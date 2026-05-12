/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // experimental.optimizePackageImports desabilitado: estava travando o build
  // de produção do Next 16 (Turbopack/webpack) na fase de compilação.
}
module.exports = nextConfig
