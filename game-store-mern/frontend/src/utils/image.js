const API_ROOT = (() => {
  const raw = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();
  if (!raw) {
    return 'http://localhost:5000';
  }
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
})();

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

export const resolveImageUrl = (value) => {
  if (!value) {
    return null;
  }

  if (isAbsoluteUrl(value)) {
    return value;
  }

  const normalized = value.startsWith('/') ? value : `/${value}`;
  if (normalized.startsWith('/uploads/')) {
    return `${API_ROOT}${normalized}`;
  }

  return value;
};

export const pickGameImage = (game) => {
  if (!game) {
    return null;
  }

  const candidates = [game.coverImage, game.images?.[0], game.screenshots?.[0]];
  for (const candidate of candidates) {
    const resolved = resolveImageUrl(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return null;
};
