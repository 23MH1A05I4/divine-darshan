const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1600100397608-f9932a1f63c6?q=80&w=1200&auto=format&fit=crop";

export const getTempleImage = (templeOrName) => {
  if (!templeOrName) return DEFAULT_IMAGE;
  if (typeof templeOrName === "object") {
    return templeOrName.image || DEFAULT_IMAGE;
  }
  if (typeof templeOrName === "string" && (templeOrName.startsWith("/") || templeOrName.startsWith("http"))) {
    return templeOrName;
  }
  return DEFAULT_IMAGE;
};

export { DEFAULT_IMAGE };
