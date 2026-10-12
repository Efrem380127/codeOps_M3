/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    /*
     * Product images are served from /public, so no remote host is needed yet.
     * `remotePatterns` stays here (empty) because Module 4 moves product
     * photography to object storage — when it does, the host goes in this
     * array and nowhere else.
     */
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },

  /*
   * React Compiler auto-memoises components. Enabled because the catalogue
   * re-renders on every search keystroke, and the compiler removes the need for
   * hand-written useMemo/useCallback in the list components.
   */
  reactCompiler: true,

  // Do not advertise the framework in a response header.
  poweredByHeader: false,
};

export default nextConfig;
