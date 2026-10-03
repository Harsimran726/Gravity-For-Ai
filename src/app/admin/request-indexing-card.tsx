'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
  Globe,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Key,
  ShieldAlert,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RequestIndexingCardProps {
  isConfigured?: boolean;
}

export function RequestIndexingCard({ isConfigured = false }: RequestIndexingCardProps) {
  const [url, setUrl] = React.useState('https://gravityforai.com/');
  const [loading, setLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    details?: string;
  } | null>(null);
  const [showGuide, setShowGuide] = React.useState(!isConfigured);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/request-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setFeedback({
          type: 'success',
          message: `Indexing request published successfully for: ${data.url}`,
          details: `Google Notification Time: ${
            data.notifyTime ? new Date(data.notifyTime).toLocaleString() : 'Just now'
          } · Type: URL_UPDATED`,
        });
      } else if (data.setupRequired) {
        setShowGuide(true);
        setFeedback({
          type: 'info',
          message: data.message || 'Google Service Account credentials setup required.',
          details: 'Please follow the setup steps below to configure GOOGLE_SERVICE_ACCOUNT_JSON.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to submit indexing request',
          details: data.details?.message || data.hint,
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: 'Network error communicating with indexing API endpoint',
        details: String(err instanceof Error ? err.message : err),
      });
    } finally {
      setLoading(false);
    }
  };

  const quickUrls = [
    { label: 'Homepage', path: 'https://gravityforai.com/' },
    { label: 'Blog Index', path: 'https://gravityforai.com/blog' },
    { label: 'Punjab Regional', path: 'https://gravityforai.com/locations/punjab-regional' },
    { label: 'United States', path: 'https://gravityforai.com/locations/united-states' },
  ];

  return (
    <Card variant="outline" className="p-6 bg-[#FFFFFF] space-y-5">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E2DC] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#F7F5F0] border border-[#E4E2DC] flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4 text-[#C99A44]" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-[#122C57] flex items-center gap-2">
              Request Google Indexing
            </h2>
            <p className="text-xs text-[#6B7280]">
              Trigger instant crawl notifications to Google Search Console via the Web Search Indexing API (v3).
            </p>
          </div>
        </div>

        <div>
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold uppercase rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              API Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-semibold uppercase rounded">
              <Key className="w-3 h-3 text-amber-600" />
              Setup Required
            </span>
          )}
        </div>
      </div>

      {/* URL Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="indexing-url" className="text-xs font-mono uppercase text-[#122C57] font-semibold">
            Target URL for Googlebot Crawl
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="indexing-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://gravityforai.com/blog/example-post"
              required
              className="flex-1 px-3 py-2 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono text-[#0A1B3D] focus:border-[#C99A44] focus:outline-none rounded transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#122C57] text-[#FFFFFF] text-xs font-sans font-medium rounded hover:bg-[#0A1B3D] transition-colors disabled:opacity-50 select-none shadow-sm shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Notifying Google...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#C99A44]" />
                  <span>Request Indexing</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Fill Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-mono text-[#6B7280]">Quick fill:</span>
          {quickUrls.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setUrl(preset.path)}
              className="px-2 py-0.5 bg-[#F7F5F0] hover:bg-[#E4E2DC] border border-[#E4E2DC] text-[10px] font-mono text-[#122C57] transition-colors rounded"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </form>

      {/* Real-time Feedback Alerts */}
      {feedback && (
        <div
          className={`p-4 border text-xs space-y-1 rounded ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : feedback.type === 'info'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : feedback.type === 'info' ? (
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          {feedback.details && (
            <p className="font-mono text-[11px] opacity-90 pl-6">
              {feedback.details}
            </p>
          )}
        </div>
      )}

      {/* Collapsible Setup Guide Toggle (shown when configured) */}
      {isConfigured && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#6B7280] hover:text-[#122C57] transition-colors"
          >
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showGuide ? 'Hide API Setup & GSC Guide' : 'View API Setup & GSC Guide'}</span>
          </button>
        </div>
      )}

      {/* Setup Instructions Box (Always shown when unconfigured, or when toggled in configured mode) */}
      {(showGuide || !isConfigured) && (
        <div className="p-5 bg-[#F7F5F0] border border-[#E4E2DC] space-y-4 rounded">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-[#C99A44] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif text-sm font-semibold text-[#122C57]">
                Google Cloud Service Account Setup & Configuration Guide
              </h3>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                To enable one-click URL indexing, configure a Google Service Account and connect it to Google Search Console. Follow these 4 steps:
              </p>
            </div>
          </div>

          <ol className="space-y-3 text-xs text-[#0A1B3D] list-decimal list-inside pl-1">
            <li className="leading-relaxed">
              <span className="font-semibold text-[#122C57]">Enable the Indexing API:</span> Open the{' '}
              <a
                href="https://console.cloud.google.com/apis/library/indexing.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#122C57] underline font-medium inline-flex items-center gap-0.5 hover:text-[#C99A44]"
              >
                Google Cloud Console <ExternalLink className="w-3 h-3 inline" />
              </a>{' '}
              and enable the <em>Web Search Indexing API</em> for your project.
            </li>

            <li className="leading-relaxed">
              <span className="font-semibold text-[#122C57]">Create Service Account & JSON Key:</span> In{' '}
              <strong>IAM & Admin → Service Accounts</strong>, create a new service account (e.g.{' '}
              <code className="bg-[#FFFFFF] px-1 py-0.5 border border-[#E4E2DC] font-mono text-[11px]">
                gsc-indexer@project.iam.gserviceaccount.com
              </code>
              ). Under the <strong>Keys</strong> tab, click <strong>Add Key → Create new key → JSON</strong>, and download the key file.
            </li>

            <li className="leading-relaxed">
              <span className="font-semibold text-[#122C57]">Set Environment Variable:</span> Add the downloaded JSON content to your environment variable as{' '}
              <code className="bg-[#FFFFFF] px-1.5 py-0.5 border border-[#E4E2DC] font-mono text-[11px] text-[#122C57] font-bold">
                GOOGLE_SERVICE_ACCOUNT_JSON
              </code>{' '}
              in <code>.env.local</code> or Vercel Project Settings. Both raw JSON and base64-encoded strings are supported.
            </li>

            <li className="leading-relaxed">
              <span className="font-semibold text-[#122C57]">Add Owner in Google Search Console:</span> Visit{' '}
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#122C57] underline font-medium inline-flex items-center gap-0.5 hover:text-[#C99A44]"
              >
                Google Search Console <ExternalLink className="w-3 h-3 inline" />
              </a>
              , select <code>gravityforai.com</code>, navigate to <strong>Settings → Users and permissions</strong>, and add the Service Account email address as an <strong>Owner</strong>.
            </li>
          </ol>

          <div className="pt-2 border-t border-[#E4E2DC]/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B7280]">
            <span>Daily quota: standard project tier supports 200 URLs notified per day.</span>
            <span className="font-mono text-[10px] text-[#C99A44] font-medium">OAuth Scope: indexing.googleapis.com/v3</span>
          </div>
        </div>
      )}
    </Card>
  );
}
