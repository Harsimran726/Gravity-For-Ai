import type { Components } from 'react-markdown';

// Explicit media markup only; raw HTML and arbitrary iframe embeds stay disabled.
export const blogMediaComponents: Components = {
  img: ({ src, alt, title }) => {
    if (!src) return null;
    if (title === 'video') {
      return <video src={src} controls preload="metadata" playsInline aria-label={alt || 'Article video'} className="my-6 block w-full max-h-[640px] rounded-xl bg-black" style={{ maxWidth: '100%', height: 'auto' }}>
        Your browser cannot play this video. <a href={src}>Download the video</a>.
      </video>;
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt || ''} title={title} loading="lazy" decoding="async" className="my-6 rounded-xl" style={{ maxWidth: '100%', height: 'auto' }} />;
  },
};
