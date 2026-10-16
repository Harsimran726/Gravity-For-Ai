'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { blogMediaComponents } from '@/components/blog/blog-media-renderer';

export default function BlogContentPreview({ content }: { content: string }) {
  return <div className="prose max-w-none break-words"><ReactMarkdown remarkPlugins={[remarkGfm]} components={blogMediaComponents}>{content || 'Your article preview will appear here.'}</ReactMarkdown></div>;
}
