// Polyfill: make btoa Unicode-safe for Next.js SSR on Node.js 24
// Next.js internally calls btoa() on RSC flight data which may contain
// non-Latin1 characters (page metadata, user names, etc.)
// btoa() only accepts Latin1 (char codes 0-255), crashing SSR.

var originalBtoa = btoa.bind(globalThis);

globalThis.btoa = function (data) {
  try {
    return originalBtoa(data);
  } catch (e) {
    if ((e instanceof DOMException) || (e instanceof TypeError && e.message.indexOf("ByteString") !== -1)) {
      // Non-Latin1 Unicode detected — encode to UTF-8 bytes first
      var bytes = new TextEncoder().encode(data);
      var binary = "";
      for (var i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return originalBtoa(binary);
    }
    throw e;
  }
};
