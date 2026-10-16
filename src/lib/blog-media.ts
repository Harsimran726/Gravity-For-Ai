export const BLOG_MEDIA_TYPES: Record<string, { extension: string; maxBytes: number }> = {
  'image/jpeg': { extension: 'jpg', maxBytes: 10 * 1024 * 1024 },
  'image/png': { extension: 'png', maxBytes: 10 * 1024 * 1024 },
  'image/webp': { extension: 'webp', maxBytes: 10 * 1024 * 1024 },
  'image/gif': { extension: 'gif', maxBytes: 10 * 1024 * 1024 },
  'video/mp4': { extension: 'mp4', maxBytes: 100 * 1024 * 1024 },
  'video/webm': { extension: 'webm', maxBytes: 100 * 1024 * 1024 },
};

export function validateBlogMedia(type: string, size: number) {
  const rule = BLOG_MEDIA_TYPES[type];
  if (!rule) throw new Error('Choose a JPG, PNG, WebP, GIF, MP4 or WebM file.');
  if (!Number.isFinite(size) || size <= 0 || size > rule.maxBytes) {
    throw new Error(type.startsWith('video/') ? 'Video must be between 1 byte and 100 MB.' : 'Image must be between 1 byte and 10 MB.');
  }
  return rule;
}

export function mediaMarkdown(url: string, description: string, video: boolean) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Media requires a secure HTTPS URL.');
  const label = description.trim().replace(/[\r\n]+/g, ' ').replace(/[\\\[\]]/g, '\\$&');
  if (!label) throw new Error('Add an image description or video title first.');
  // Angle brackets keep spaces and parentheses in URLs from breaking Markdown.
  return `![${label}](<${parsed.href.replace(/</g, '%3C').replace(/>/g, '%3E')}>${video ? ' "video"' : ''})`;
}

export function insertMediaAtCursor(content: string, position: number, markdown: string) {
  const index = Math.max(0, Math.min(content.length, position));
  const before = content.slice(0, index);
  const after = content.slice(index);
  const inserted = `${before && !before.endsWith('\n\n') ? '\n\n' : ''}${markdown}\n\n`;
  return { content: before + inserted + after, cursor: index + inserted.length };
}
