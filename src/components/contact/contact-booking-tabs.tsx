'use client';

import * as React from 'react';
import { BookingCalendar } from '@/components/booking/booking-calendar';
import { ContactForm } from '@/components/contact/contact-form';
import { Calendar, Mail } from 'lucide-react';

export function ContactBookingTabs({ 
  availableTimeSlots = [],
  customDateSlots = {}
}: { 
  availableTimeSlots?: string[];
  customDateSlots?: Record<string, string[]>;
}) {
  const [activeTab, setActiveTab] = React.useState<'calendar' | 'message'>('calendar');

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center p-1 bg-[#F7F5F0] border border-[#E4E2DC] rounded max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-mono uppercase font-semibold transition-all rounded ${
            activeTab === 'calendar'
              ? 'bg-[#122C57] text-[#FFFFFF] shadow-sm'
              : 'text-[#6B7280] hover:text-[#122C57]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Call on Calendar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('message')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-mono uppercase font-semibold transition-all rounded ${
            activeTab === 'message'
              ? 'bg-[#122C57] text-[#FFFFFF] shadow-sm'
              : 'text-[#6B7280] hover:text-[#122C57]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Send Quick Message</span>
        </button>
      </div>

      {/* Active Tab View */}
      {activeTab === 'calendar' ? (
        <BookingCalendar 
          availableTimeSlots={availableTimeSlots} 
          customDateSlots={customDateSlots} 
        />
      ) : (
        <ContactForm />
      )}
    </div>
  );
}
