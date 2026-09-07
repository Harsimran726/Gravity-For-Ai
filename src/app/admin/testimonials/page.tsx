'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Plus, Trash2, Edit2 } from 'lucide-react';

interface TestimonialItem {
  id: string;
  clientName: string;
  role: string;
  city: string;
  quote: string;
  rating: number;
}

const INITIAL_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't-1',
    clientName: 'Dr. Raman K.',
    role: 'Clinic Founder',
    city: 'Mansa, Punjab',
    quote:
      'We used to lose patients who called after 7 PM. The AI voice agent answers every call in Punjabi and English, answers routine questions, and books appointments straight into our calendar.',
    rating: 5,
  },
  {
    id: 't-2',
    clientName: 'Gurpreet S.',
    role: 'Operations Director',
    city: 'Bathinda, Punjab',
    quote:
      'Instead of an agency trying to sell us 10 different subscription tools, Gravity built a single automated pipeline. It saves our dispatch team at least 15 hours of repetitive data entry every single week.',
    rating: 5,
  },
  {
    id: 't-3',
    clientName: 'Amanpreet M.',
    role: 'Managing Partner',
    city: 'Ludhiana, Punjab',
    quote:
      'Our new website and intake automation represent our brand with genuine authority. Clean typography, instant loading speed, and inquiries flow directly into our notifications.',
    rating: 5,
  },
];

export default function AdminTestimonialsPage() {
  const [items, setItems] = React.useState<TestimonialItem[]>(INITIAL_TESTIMONIALS);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E2DC]">
        <div>
          <h1 className="font-serif text-3xl text-[#122C57]">Testimonials & Proof</h1>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Manage client testimonials, regional proof points, and Review schemas.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => alert('New testimonial form modal')}
          variant="primary"
          size="sm"
          className="text-xs"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Testimonial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} variant="outline" className="bg-[#FFFFFF] p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[#C99A44]">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#C99A44]" />
                ))}
              </div>
              <p className="font-serif text-sm text-[#0A1B3D] italic leading-relaxed">
                &ldquo;{item.quote}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-[#E4E2DC] flex items-center justify-between">
              <div>
                <p className="font-sans font-medium text-xs text-[#122C57]">{item.clientName}</p>
                <p className="text-[11px] text-[#6B7280]">
                  {item.role} · <span className="text-[#0A1B3D]">{item.city}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button type="button" className="p-1 text-[#6B7280] hover:text-[#122C57]">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                  className="p-1 text-[#6B7280] hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
