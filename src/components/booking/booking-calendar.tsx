'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { createBookingAction, type BookingState } from '@/actions/booking-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  Building,
} from 'lucide-react';

const TIME_SLOTS = [
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '04:45 PM',
  '06:00 PM',
  '07:15 PM',
];

const TIMEZONES = [
  'Asia/Kolkata (IST - UTC+5:30)',
  'America/New_York (EST - UTC-5)',
  'Europe/London (GMT - UTC+0)',
  'America/Los_Angeles (PST - UTC-8)',
  'Asia/Dubai (GST - UTC+4)',
  'UTC (Coordinated Universal Time)',
];

const initialState: BookingState = {
  success: false,
  message: '',
  errors: {},
};

function BookingSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      size="md"
      disabled={pending}
      className="w-full justify-center text-xs uppercase tracking-wider"
    >
      {pending ? 'Securing Calendar Slot & Sending Invites...' : 'Confirm & Schedule AI Audit Call'}
    </Button>
  );
}

export function BookingCalendar({ 
  availableTimeSlots = [],
  customDateSlots = {}
}: { 
  availableTimeSlots?: string[];
  customDateSlots?: Record<string, string[]>;
}) {
  const [state, formAction] = useFormState(createBookingAction, initialState);
  const [mounted, setMounted] = React.useState(false);

  // Default initial static date string for SSR consistency
  const [selectedDate, setSelectedDate] = React.useState<string>('2026-09-03');
  const [selectedSlot, setSelectedSlot] = React.useState<string>('11:30 AM');
  const [selectedTimezone, setSelectedTimezone] = React.useState<string>('Asia/Kolkata (IST - UTC+5:30)');
  const [currentMonth, setCurrentMonth] = React.useState(new Date(2026, 8, 1)); // September 2026

  React.useEffect(() => {
    setMounted(true);
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    const targetSlots = selectedDate && customDateSlots[selectedDate] 
      ? customDateSlots[selectedDate] 
      : (availableTimeSlots.length > 0 ? availableTimeSlots : TIME_SLOTS);
      
    if (targetSlots.length > 0 && !targetSlots.includes(selectedSlot)) {
      setSelectedSlot(targetSlots[0]);
    } else if (targetSlots.length === 0) {
      setSelectedSlot('');
    }
  }, [selectedDate, availableTimeSlots, customDateSlots, mounted, selectedSlot]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Today at midnight for past-date comparison (Bug #10 fix)
  const todayMidnight = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Prevent navigating to past months (Bug #12 fix)
  const isCurrentMonth =
    currentMonth.getFullYear() === todayMidnight.getFullYear() &&
    currentMonth.getMonth() === todayMidnight.getMonth();

  const prevMonth = () => {
    if (isCurrentMonth) return; // Block navigating before current month
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  if (state.success && state.bookingDetails) {
    return (
      <Card variant="outline" className="p-8 sm:p-10 bg-[#FFFFFF] border-2 border-[#C99A44] space-y-6 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs uppercase text-[#C99A44] font-semibold tracking-wider">
            Booking Confirmed
          </span>
          <h3 className="font-serif text-3xl text-[#122C57]">Your Discovery Call is Scheduled!</h3>
          <p className="text-sm text-[#6B7280] max-w-md mx-auto">
            A calendar invite and Google Meet link have been dispatched to <strong className="text-[#0A1B3D]">{state.bookingDetails.email}</strong>.
          </p>
        </div>

        <div className="p-6 bg-[#F7F5F0] border border-[#E4E2DC] max-w-md mx-auto text-left space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between border-b border-[#E4E2DC] pb-2">
            <span className="text-[#6B7280]">Host:</span>
            <span className="font-medium text-[#122C57]">Harsimran Singh (Lead AI Engineer)</span>
          </div>
          <div className="flex justify-between border-b border-[#E4E2DC] pb-2">
            <span className="text-[#6B7280]">Date:</span>
            <span className="font-medium text-[#122C57]">
              {new Date(state.bookingDetails.meetingDate).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#E4E2DC] pb-2">
            <span className="text-[#6B7280]">Time Slot:</span>
            <span className="font-medium text-[#122C57]">{state.bookingDetails.timeSlot} ({state.bookingDetails.timezone})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6B7280]">Format:</span>
            <span className="font-medium text-[#122C57]">20-Min Video Call (Google Meet)</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            href="/"
            variant="ghost"
            size="sm"
          >
            Return to Homepage
          </Button>
          <Button
            href="https://meet.google.com/landing"
            isExternal
            variant="primary"
            size="sm"
          >
            Test Google Meet Audio/Video
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="outline" className="p-6 sm:p-8 bg-[#FFFFFF] border border-[#E4E2DC] space-y-8 shadow-sm">
      {/* Booking Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E2DC] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C99A44]" />
            <span className="font-mono text-xs uppercase text-[#C99A44] font-semibold tracking-wider">
              Free 20-Min AI Discovery Audit
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#122C57]">
            Select Date & Preferred Time Slot
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280]">
            Direct architecture consultation with Harsimran Singh. No sales fluff.
          </p>
        </div>

        {/* Timezone Dropdown */}
        <div className="flex items-center gap-2 bg-[#F7F5F0] border border-[#E4E2DC] px-3 py-1.5 self-start sm:self-auto">
          <Globe className="w-3.5 h-3.5 text-[#122C57]" />
          <select
            value={selectedTimezone}
            onChange={(e) => setSelectedTimezone(e.target.value)}
            className="bg-transparent text-xs font-mono text-[#0A1B3D] focus:outline-none"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Interactive Calendar Picker */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between font-serif text-lg text-[#122C57] px-1">
            <span>{monthNames[month]} {year}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                disabled={isCurrentMonth}
                className={`p-1.5 border border-[#E4E2DC] text-[#122C57] transition-colors ${isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#F7F5F0]'}`}
                aria-label="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 hover:bg-[#F7F5F0] border border-[#E4E2DC] text-[#122C57] transition-colors"
                aria-label="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-[#6B7280] uppercase pb-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {/* Blank leading days */}
            {[...Array(firstDayIndex)].map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}

            {/* Month days */}
            {[...Array(daysInMonth)].map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum);
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSunday = dateObj.getDay() === 0;
              // Bug #10 fix: block past dates (strictly before today)
              const isPast = mounted && dateObj < todayMidnight;
              const isDisabled = isSunday || isPast;
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-2.5 rounded font-mono transition-all duration-150 relative ${
                    isSelected
                      ? 'bg-[#122C57] text-[#FFFFFF] font-semibold shadow-sm ring-1 ring-[#C99A44]'
                      : isDisabled
                      ? 'text-[#E4E2DC] cursor-not-allowed'
                      : 'hover:bg-[#F7F5F0] text-[#0A1B3D]'
                  }`}
                >
                  {dayNum}
                  {isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C99A44]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-[#6B7280] pt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#122C57]" /> Selected Date
            <span className="w-2 h-2 rounded-full bg-[#E4E2DC] ml-2" /> Sundays Unavailable
          </div>
        </div>

        {/* Time Slot Picker */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between font-serif text-lg text-[#122C57] px-1">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C99A44]" /> Available Slots
            </span>
            <span className="font-mono text-xs text-[#6B7280]">
              {selectedDate}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(() => {
              const targetSlots = selectedDate && customDateSlots[selectedDate] 
                ? customDateSlots[selectedDate] 
                : (availableTimeSlots.length > 0 ? availableTimeSlots : TIME_SLOTS);
                
              if (targetSlots.length === 0) {
                return (
                  <div className="col-span-2 p-4 text-center text-xs text-[#6B7280] bg-[#F7F5F0] border border-dashed border-[#E4E2DC]">
                    No time slots available on this date.
                  </div>
                );
              }
              
              return targetSlots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2.5 px-3 border text-xs font-mono text-center rounded transition-all ${
                      isSelected
                        ? 'border-[#122C57] bg-[#122C57] text-[#FFFFFF] font-semibold shadow-sm'
                        : 'border-[#E4E2DC] bg-[#F7F5F0]/60 text-[#0A1B3D] hover:border-[#122C57] hover:bg-[#F7F5F0]'
                    }`}
                  >
                    {slot}
                  </button>
                );
              });
            })()}
          </div>

          <div className="p-4 bg-[#F7F5F0] border-l-4 border-[#C99A44] space-y-1 text-xs text-[#0A1B3D]">
            <p className="font-semibold text-[#122C57]">Selected Call Window:</p>
            <p>
              {selectedDate} at <strong>{selectedSlot}</strong> ({selectedTimezone.split(' ')[0]})
            </p>
          </div>
        </div>
      </div>

      {/* Booking Form Fields */}
      <form action={formAction} className="pt-6 border-t border-[#E4E2DC] space-y-6">
        {/* Hidden Calendar Inputs */}
        <input type="hidden" name="meetingDate" value={selectedDate} />
        <input type="hidden" name="timeSlot" value={selectedSlot} />
        <input type="hidden" name="timezone" value={selectedTimezone} />

        {/* Honeypot Spam trap */}
        <input
          type="text"
          name="website_hp"
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none' }}
          aria-hidden="true"
        />

        {state.message && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700">
            {state.message}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="font-serif text-xl text-[#122C57]">Your Contact Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
                Your Full Name <span className="text-[#C99A44]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Dr. Raman Kumar"
                  className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] focus:outline-none focus:border-[#122C57]"
                />
                <User className="w-3.5 h-3.5 absolute right-3 top-3 text-[#6B7280]" />
              </div>
              {state.errors?.name && <p className="text-[11px] text-red-600">{state.errors.name[0]}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
                Work Email <span className="text-[#C99A44]">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. raman@clinic.in"
                  className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] focus:outline-none focus:border-[#122C57]"
                />
                <Mail className="w-3.5 h-3.5 absolute right-3 top-3 text-[#6B7280]" />
              </div>
              {state.errors?.email && <p className="text-[11px] text-red-600">{state.errors.email[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
                Phone / WhatsApp <span className="text-[#C99A44]">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+91 98140 00000"
                  className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] focus:outline-none focus:border-[#122C57]"
                />
                <Phone className="w-3.5 h-3.5 absolute right-3 top-3 text-[#6B7280]" />
              </div>
              {state.errors?.phone && <p className="text-[11px] text-red-600">{state.errors.phone[0]}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
                Business Name / Clinic
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="businessName"
                  placeholder="e.g. Apex Health Clinic"
                  className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] focus:outline-none focus:border-[#122C57]"
                />
                <Building className="w-3.5 h-3.5 absolute right-3 top-3 text-[#6B7280]" />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
              Primary System of Interest
            </label>
            <select
              name="serviceInterest"
              className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] focus:outline-none focus:border-[#122C57]"
            >
              <option value="Free 20-Min AI Discovery Audit">Free 20-Min AI Discovery Audit</option>
              <option value="AI Voice Receptionist (Phone Answering)">AI Voice Receptionist (Phone Answering)</option>
              <option value="High-Performance Website Development">High-Performance Website Development</option>
              <option value="Custom Agentic Workflow Automation">Custom Agentic Workflow Automation</option>
              <option value="Full Automation Sprint (Web + Voice + DB)">Full Automation Sprint (Web + Voice + DB)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase tracking-wider text-[#122C57] font-semibold">
              What manual task is costing you the most hours right now? <span className="text-[#C99A44]">*</span>
            </label>
            <textarea
              name="notes"
              required
              rows={3}
              placeholder="e.g. We miss calls after 7 PM from prospective clients, and spend 15 hours a week updating spreadsheets manually..."
              className="w-full px-4 py-2.5 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] focus:outline-none focus:border-[#122C57] resize-none"
            />
            {state.errors?.notes && <p className="text-[11px] text-red-600">{state.errors.notes[0]}</p>}
          </div>
        </div>

        <BookingSubmitButton />
      </form>
    </Card>
  );
}
