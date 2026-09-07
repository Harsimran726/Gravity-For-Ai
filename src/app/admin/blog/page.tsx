import * as React from 'react';
import Link from 'next/link';
import { BLOG_POSTS_SEED } from '@/data/blog-seed-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, ExternalLink, Zap, Edit3 } from 'lucide-react';

export default function AdminBlogListPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E2DC]">
        <div>
          <h1 className="font-serif text-3xl text-[#122C57]">Blog & CMS Management</h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Manage technical articles, required SEO fields, and dual AMP publication routes.
          </p>
        </div>

        <Button href="/admin/blog/new" variant="primary" size="sm" className="text-xs">
          <Plus className="w-3.5 h-3.5 mr-1" /> Create New Post
        </Button>
      </div>

      {/* Posts Table */}
      <div className="bg-[#FFFFFF] border border-[#E4E2DC] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F7F5F0] border-b border-[#E4E2DC] font-mono uppercase text-[#6B7280]">
            <tr>
              <th className="p-3.5">Article Title</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Target Keyword</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">AMP Route</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E2DC]">
            {BLOG_POSTS_SEED.map((post) => (
              <tr key={post.slug} className="hover:bg-[#F7F5F0]/50 transition-colors">
                <td className="p-3.5 font-medium text-[#122C57] max-w-xs">
                  {post.title}
                  <span className="block text-[11px] font-mono text-[#6B7280]">/blog/{post.slug}</span>
                </td>
                <td className="p-3.5 text-[#0A1B3D]">{post.category}</td>
                <td className="p-3.5 font-mono text-[#6B7280]">{post.primaryKeyword}</td>
                <td className="p-3.5">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-mono text-[10px] uppercase font-semibold">
                    Published
                  </span>
                </td>
                <td className="p-3.5">
                  <Link
                    href={`/amp/blog/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-700 hover:underline"
                  >
                    <Zap className="w-3 h-3 text-[#C99A44]" /> AMP Active
                  </Link>
                </td>
                <td className="p-3.5 text-right space-x-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-[#122C57] hover:underline"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
