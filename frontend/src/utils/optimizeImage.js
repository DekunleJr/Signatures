// Adds Cloudinary delivery transforms (auto format/quality + max width).
// Non-Cloudinary URLs are returned unchanged.
export function optimizeImage(url, width = 600) {
  if (!url || !url.includes("/image/upload/")) return url;
  return url.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width}/`);
}
