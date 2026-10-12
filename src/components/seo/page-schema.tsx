import type { Metadata } from 'next';
import { buildPageGraph, serializeSchema, type PageSchemaInput } from '@/lib/structured-data';
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSchema(data) }} />;
}
export function PageSchema({ metadata, ...input }: Omit<PageSchemaInput, 'title'> & { title?: string; metadata?: Metadata }) {
  const title = input.title || (typeof metadata?.title === 'string' ? metadata.title : 'Gravity For AI');
  return <JsonLd data={buildPageGraph({ ...input, title, description: input.description || metadata?.description || undefined })} />;
}
