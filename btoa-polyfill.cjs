// Polyfill: make btoa Unicode-safe for Next.js SSR
// Next.js 16 internal code (use-flight-response, encryption) calls btoa()
// which fails on non-Latin1 characters present in page metadata / RSC data.

const originalBtoa = btoa.bind(globalThis);

globalThis.btoa = function (data: string): string {
  try {
    return originalBtoa(data);
  } catch (e) {
    if (e instanceof DOMException || (e instanceof TypeError && e.message.includes("ByteString"))) {
      // Input contains non-Latin1 Unicode — encode to UTF-8 bytes first
      const bytes = new TextEncoder().encode(data);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return originalBtoa(binary);
    }
    throw e;
  }
};
