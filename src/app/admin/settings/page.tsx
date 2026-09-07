'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, CheckCircle2, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E2DC]">
        <div>
          <h1 className="font-serif text-3xl text-[#122C57]">Site & Global SEO Settings</h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Manage NAP schema, Google Business Profile alignment, and global metadata defaults.
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully. Edge cache purged.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* NAP (Name, Address, Phone) Settings */}
        <Card variant="outline" className="bg-[#FFFFFF] p-6 space-y-4">
          <h2 className="font-serif text-xl text-[#122C57] border-b border-[#E4E2DC] pb-3">
            LocalBusiness NAP (Mansa HQ)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#122C57] font-semibold">
                Company Name
              </label>
              <input
                type="text"
                defaultValue="Gravity For AI"
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#122C57] font-semibold">
                Contact Email
              </label>
              <input
                type="email"
                defaultValue="contact@gravity4ai.com"
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#122C57] font-semibold">
                Address Locality (City)
              </label>
              <input
                type="text"
                defaultValue="Mansa"
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#122C57] font-semibold">
                Region / State
              </label>
              <input
                type="text"
                defaultValue="Punjab"
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#122C57] font-semibold">
                Postal Code
              </label>
              <input
                type="text"
                defaultValue="151505"
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#122C57] font-semibold">
                Country
              </label>
              <input
                type="text"
                defaultValue="India (IN)"
                disabled
                className="w-full px-3 py-2 bg-[#F7F5F0]/60 border border-[#E4E2DC] text-xs text-[#6B7280]"
              />
            </div>
          </div>
        </Card>

        {/* Social & E-E-A-T Links */}
        <Card variant="outline" className="bg-[#FFFFFF] p-6 space-y-4">
          <h2 className="font-serif text-xl text-[#122C57] border-b border-[#E4E2DC] pb-3">
            E-E-A-T & Social Presence
          </h2>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#122C57] font-semibold">
                Founder LinkedIn URL
              </label>
              <input
                type="url"
                defaultValue="https://www.linkedin.com/in/harsimransinghaiengineer/"
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-[#122C57] font-semibold">
                Founder GitHub Profile
              </label>
              <input
                type="url"
                defaultValue="https://github.com/harsimran726"
                className="w-full px-3 py-2 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D]"
              />
            </div>
          </div>
        </Card>

        <div className="pt-2">
          <Button type="submit" variant="primary" size="md" className="text-xs">
            <Save className="w-3.5 h-3.5 mr-1.5" /> Save Global Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
