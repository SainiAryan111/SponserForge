/**
 * Resolves raw image URL or website URL input string into a valid image URL.
 * - Converts YouTube Channel URLs (e.g. https://www.youtube.com/@TechnicalGuruji) into channel avatar images.
 * - Converts Website domain URLs (e.g. https://www.samsung.com/in/...) into high-res official brand logos via Google Favicons & Unavatar API.
 * - Leaves direct image links (.png, .jpg, .svg, etc.) intact.
 */
export const resolveImageUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string' || !urlStr.trim()) return '';
  const trimmed = urlStr.trim();
  
  // 1. YouTube Handle URL format: https://www.youtube.com/@TechnicalGuruji
  const ytMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([a-zA-Z0-9_-]+)/i);
  if (ytMatch && ytMatch[1]) {
    return `https://unavatar.io/youtube/${ytMatch[1]}`;
  }

  // 2. YouTube Channel ID format: https://www.youtube.com/channel/UC...
  const ytChannelMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/([a-zA-Z0-9_-]+)/i);
  if (ytChannelMatch && ytChannelMatch[1]) {
    return `https://unavatar.io/youtube/${ytChannelMatch[1]}`;
  }

  // 3. YouTube Custom URL format: https://www.youtube.com/c/TechnicalGuruji
  const ytCustomMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|user)\/([a-zA-Z0-9_-]+)/i);
  if (ytCustomMatch && ytCustomMatch[1]) {
    return `https://unavatar.io/youtube/${ytCustomMatch[1]}`;
  }

  // 4. Website Domain URL format (e.g. https://www.samsung.com/in/?srsltid=...)
  try {
    const fullUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
    const urlObj = new URL(fullUrl);
    const pathname = urlObj.pathname.toLowerCase();

    // If it is a direct image file extension, return as-is
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico)(\?.*)?$/i.test(pathname) || /unavatar\.io|googleusercontent\.com|wikimedia\.org/i.test(urlObj.hostname)) {
      return trimmed;
    }

    // For general brand website URLs, extract hostname (e.g. samsung.com) and fetch official brand logo
    const cleanHost = urlObj.hostname.replace(/^www\./i, '');
    if (cleanHost) {
      return `https://www.google.com/s2/favicons?domain=${cleanHost}&sz=128`;
    }
  } catch (e) {
    // If URL parsing fails, return raw string
  }

  return trimmed;
};
