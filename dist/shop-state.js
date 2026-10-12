export function canPreviewCosmetic(category, owned) {
  return category !== 'avatar' && Boolean(owned);
}
