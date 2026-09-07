'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { saveBlogPostAction, type BlogActionState } from '@/actions/blog-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const initialState: BlogActionState = {
  success: false,
  message: '',
  errors: {},
};

function SubmitButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        name="status"
        value="DRAFT"
        disabled={pending}
        className="px-4 py-2 bg-[#FFFFFF] border border-[#E4E2DC] text-xs font-sans text-[#122C57] hover:bg-[#F7F5F0] disabled:opacity-50"
      >
        {pending ? 'Saving...' : 'Save Draft'}
      </button>

      <button
        type="submit"
        name="status"
        value="PUBLISHED"
        disabled={pending}
        className="px-5 py-2 bg-[#122C57] text-[#FFFFFF] text-xs font-sans font-medium hover:bg-[#0A1B3D] disabled:opacity-50"
      >
        {pending ? 'Validating & Publishing...' : 'Validate & Publish Live'}
      </button>
    </div>
  );
}

export default function NewBlogPostPage() {
  const [state, formAction] = useFormState(saveBlogPostAction, initialState);

  // Live SEO validation tracking
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [keyword, setKeyword] = React.useState('');
  const [geoAnswer, setGeoAnswer] = React.useState('');
  const [slug, setSlug] = React.useState('');

  const isTitleValid = title.length >= 25 && title.length <= 75;
  const isDescValid = description.length >= 80 && description.length <= 165;
  const isKeywordValid = keyword.trim().length >= 3;
  const isGeoAnswerValid = geoAnswer.trim().length >= 30;

  const allSeoPassed = isTitleValid && isDescValid && isKeywordValid && isGeoAnswerValid;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E2DC]">
        <div>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6B7280] hover:text-[#122C57] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog List
          </Link>
          <h1 className="font-serif text-3xl text-[#122C57]">Create New Blog Post</h1>
          <p className="text-xs text-[#6B7280]">
            Enforces strict SEO, AEO, and GEO fields before publishing.
          </p>
        </div>
      </div>

      {state.message && (
        <div
          className={`p-4 text-xs sm:text-sm flex items-center gap-2.5 ${
            state.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {state.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Fields */}
        <div className="lg:col-span-8 space-y-6 bg-[#FFFFFF] p-6 sm:p-8 border border-[#E4E2DC]">
          {/* Title */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
                Post Title <span className="text-[#C99A44]">*</span>
              </label>
              <span className={`text-[10px] font-mono ${isTitleValid ? 'text-emerald-600 font-semibold' : 'text-[#6B7280]'}`}>
                {title.length} / 70 chars (Target: 30-70)
              </span>
            </div>
            <input
              type="text"
              name="title"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                }
              }}
              placeholder="e.g. AI Voice Agent vs Hiring a Receptionist in 2026: Cost Breakdown"
              className="w-full px-4 py-3 bg-[#F7F5F0] border border-[#E4E2DC] text-sm text-[#0A1B3D] focus:outline-none focus:border-[#122C57]"
            />
            {state.errors?.title && <p className="text-[11px] text-red-600">{state.errors.title[0]}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
              URL Slug <span className="text-[#C99A44]">*</span>
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2.5 bg-[#E4E2DC]/50 border border-r-0 border-[#E4E2DC] text-xs font-mono text-[#6B7280]">
                /blog/
              </span>
              <input
                type="text"
                name="slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ai-voice-agent-cost-breakdown"
                className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono text-[#0A1B3D] focus:outline-none focus:border-[#122C57]"
              />
            </div>
          </div>

          {/* Meta Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
                Meta Description <span className="text-[#C99A44]">*</span>
              </label>
              <span className={`text-[10px] font-mono ${isDescValid ? 'text-emerald-600 font-semibold' : 'text-[#6B7280]'}`}>
                {description.length} / 160 chars (Target: 120-160)
              </span>
            </div>
            <textarea
              name="metaDescription"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Concise summary for Google search snippets and social cards..."
              className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] focus:outline-none focus:border-[#122C57] resize-none"
            />
          </div>

          {/* Primary Target Keyword & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
                Primary Target Keyword <span className="text-[#C99A44]">*</span>
              </label>
              <input
                type="text"
                name="primaryKeyword"
                required
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. AI voice agent pricing India"
                className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] focus:outline-none focus:border-[#122C57]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
                Category
              </label>
              <select
                name="category"
                className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] focus:outline-none focus:border-[#122C57]"
              >
                <option value="AI Voice Agents">AI Voice Agents</option>
                <option value="Agentic AI">Agentic AI</option>
                <option value="Website Development">Website Development</option>
                <option value="Automation Strategy">Automation Strategy</option>
              </select>
            </div>
          </div>

          {/* GEO Direct-Answer Paragraph */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
                GEO Direct-Answer Quotable Paragraph <span className="text-[#C99A44]">*</span>
              </label>
              <span className="text-[10px] font-mono text-[#C99A44]">For AI Citations (ChatGPT/Perplexity)</span>
            </div>
            <textarea
              name="geoAnswer"
              required
              rows={3}
              value={geoAnswer}
              onChange={(e) => setGeoAnswer(e.target.value)}
              placeholder="A standalone 40-60 word quotable factual answer defining the core topic and outcome..."
              className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] focus:outline-none focus:border-[#122C57] resize-none"
            />
          </div>

          {/* Article Body Content */}
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
              Article Content (Markdown) <span className="text-[#C99A44]">*</span>
            </label>
            <textarea
              name="bodyContent"
              required
              rows={12}
              placeholder="Write or paste your article markdown here..."
              className="w-full px-4 py-3 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono text-[#0A1B3D] focus:outline-none focus:border-[#122C57]"
            />
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#E4E2DC] flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#6B7280]">Reading Time</label>
              <input
                type="number"
                name="readingTime"
                defaultValue={5}
                min={1}
                max={30}
                className="w-20 px-2 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs"
              />
            </div>
            <SubmitButtons />
          </div>
        </div>

        {/* Pre-Publish SEO Guardrails Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card variant="outline" className="bg-[#FFFFFF] p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#122C57] font-semibold border-b border-[#E4E2DC] pb-3">
              <ShieldCheck className="w-4 h-4 text-[#C99A44]" />
              <span>Pre-Publish SEO Checklist</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span>Title Length (30-70 chars)</span>
                {isTitleValid ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                  </span>
                ) : (
                  <span className="text-amber-600 text-[11px]">Required</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Meta Description (120-160 chars)</span>
                {isDescValid ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                  </span>
                ) : (
                  <span className="text-amber-600 text-[11px]">Required</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>Target Keyword Defined</span>
                {isKeywordValid ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                  </span>
                ) : (
                  <span className="text-amber-600 text-[11px]">Required</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>GEO Answer Paragraph</span>
                {isGeoAnswerValid ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                  </span>
                ) : (
                  <span className="text-amber-600 text-[11px]">Required</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span>AMP Twin Auto-Generation</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E4E2DC]">
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                {allSeoPassed
                  ? 'All SEO guardrails satisfied. Article is eligible for live indexing and AMP generation.'
                  : 'Complete all required checklist items above to enable live publication.'}
              </p>
            </div>
          </Card>

          {/* Google SERP Preview */}
          <Card variant="outline" className="bg-[#FFFFFF] p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#122C57] font-semibold border-b border-[#E4E2DC] pb-3">
              <Sparkles className="w-4 h-4 text-[#C99A44]" />
              <span>Google SERP Preview</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-5 h-5 rounded-full bg-[#F7F5F0] border border-[#E4E2DC] flex items-center justify-center font-serif text-[#122C57] font-bold">G</div>
                <div>
                  <div className="text-[#0A1B3D] font-medium">Gravity For AI</div>
                  <div className="text-[#6B7280]">https://gravityforai.com/blog/{slug || 'your-slug'}</div>
                </div>
              </div>
              <h3 className="text-[16px] text-[#1a0dab] font-medium cursor-pointer hover:underline pt-1">
                {title || 'Your Target SEO Title Will Appear Here'}
              </h3>
              <p className="text-[12px] text-[#4d5156] leading-snug">
                {description || 'This is the meta description that will be shown in Google search results. Keep it between 120 and 160 characters for best CTR.'}
              </p>
            </div>
          </Card>

          {/* JSON-LD Schema Preview */}
          <Card variant="outline" className="bg-[#1e1e1e] p-6 space-y-4 border-none text-white">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#a8a8a8] font-semibold border-b border-[#333] pb-3">
              <span>{'{ }'} JSON-LD Article Schema</span>
            </div>
            <pre className="text-[10px] font-mono text-[#ce9178] overflow-x-auto">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title || "Your Article Title",
  "description": description || "Meta description",
  "url": `https://gravityforai.com/blog/${slug || 'your-slug'}`,
  "author": {
    "@type": "Person",
    "name": "Harsimran Singh"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Gravity For AI"
  }
}, null, 2)}
            </pre>
          </Card>
        </div>
      </form>
    </div>
  );
}
