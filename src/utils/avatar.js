export const getAvatarUrl = (photo, name = 'U') => {
  let resolvedPhoto = photo;
  if (typeof resolvedPhoto === 'string' && resolvedPhoto.includes('localhost:5000')) {
    resolvedPhoto = resolvedPhoto.replace('http://localhost:5000', '');
  }

  if (!resolvedPhoto || resolvedPhoto.includes('unsplash.com') || resolvedPhoto.includes('default') || resolvedPhoto === '') {
    const initial = name ? name.charAt(0).toUpperCase() : 'U';
    const colors = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    const charCode = initial.charCodeAt(0) || 0;
    const color = colors[charCode % colors.length];
    
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="${color}"/>
      <text x="50" y="52" font-family="system-ui, sans-serif" font-size="40" font-weight="bold" fill="white" dominant-baseline="middle" text-anchor="middle">${initial}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  return resolvedPhoto;
};
