'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import {
  Calendar as CalendarIcon,
  Clock,
  Mail,
  Phone,
  Video,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { updateLeadStatusAction } from '@/actions/lead-admin-actions';
import { useRouter } from 'next/navigation';

export interface BookingRecord {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  serviceInterest: string;
  meetingDate: string;
  timeSlot: string;
  timezone: string;
  notes: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST';
  createdAt: string;
}

import { updateBookingTimeSlotsAction, updateCustomDateSlotsAction } from '@/actions/settings-actions';

interface AdminBookingsClientProps {
  initialBookings: BookingRecord[];
  initialTimeSlots: string[];
  initialCustomDateSlots: Record<string, string[]>;
}

// Map lead statuses to booking-appropriate display labels
const STATUS_LABELS: Record<string, string> = {
  NEW: 'CONFIRMED',
  CONTACTED: 'IN PROGRESS',
  QUALIFIED: 'COMPLETED',
  WON: 'CLOSED',
  LOST: 'CANCELLED',
};

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-emerald-100 text-emerald-800',
  CONTACTED: 'bg-blue-100 text-blue-800',
  QUALIFIED: 'bg-purple-100 text-purple-800',
  WON: 'bg-amber-100 text-amber-800',
  LOST: 'bg-red-100 text-red-800',
};

export default function AdminBookingsClient({ 
  initialBookings, 
  initialTimeSlots = [],
  initialCustomDateSlots = {}
}: AdminBookingsClientProps) {
  const router = useRouter();
  const [bookings, setBookings] = React.useState<BookingRecord[]>(initialBookings);
  const [selectedBooking, setSelectedBooking] = React.useState<BookingRecord | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const [timeSlotsInput, setTimeSlotsInput] = React.useState(initialTimeSlots.join(', '));
  const [isUpdatingSlots, setIsUpdatingSlots] = React.useState(false);
  
  const [customSlotsMap, setCustomSlotsMap] = React.useState<Record<string, string[]>>(initialCustomDateSlots);
  const [selectedCalendarDate, setSelectedCalendarDate] = React.useState<string | null>(null);
  const [customSlotInput, setCustomSlotInput] = React.useState('');

  const handleUpdateSlots = async () => {
    setIsUpdatingSlots(true);
    const slotsArray = timeSlotsInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    await updateBookingTimeSlotsAction(slotsArray);
    setIsUpdatingSlots(false);
    alert('Time slots updated successfully!');
  };

  const handleUpdateCustomSlots = async () => {
    if (!selectedCalendarDate) return;
    setIsUpdatingSlots(true);
    const slotsArray = customSlotInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    await updateCustomDateSlotsAction(selectedCalendarDate, slotsArray);
    
    setCustomSlotsMap(prev => ({
      ...prev,
      [selectedCalendarDate]: slotsArray
    }));
    
    setIsUpdatingSlots(false);
    alert(`Time slots for ${selectedCalendarDate} updated successfully!`);
    setSelectedCalendarDate(null);
  };

  const handleStatusChange = async (id: string, newStatus: BookingRecord['status']) => {
    setUpdatingId(id);
    // Optimistic update
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    if (selectedBooking?.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }

    try {
      await updateLeadStatusAction(id, newStatus);
    } catch (err) {
      console.error(err);
      // Revert on error (could implement more robust rollback here)
      router.refresh();
    } finally {
      setUpdatingId(null);
    }
  };

  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  // Compute stats per date string (YYYY-MM-DD)
  const bookingStats = React.useMemo(() => {
    const stats: Record<string, { scheduled: number; cancelled: number }> = {};
    bookings.forEach(b => {
      if (!b.meetingDate) return;
      if (!stats[b.meetingDate]) stats[b.meetingDate] = { scheduled: 0, cancelled: 0 };
      if (b.status === 'LOST') stats[b.meetingDate].cancelled++;
      else stats[b.meetingDate].scheduled++;
    });
    return stats;
  }, [bookings]);

  const maxSlotsPerDay = timeSlotsInput.split(',').filter(s => s.trim().length > 0).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#122C57]">Booking Management</h1>
          <p className="text-xs text-[#6B7280]">
            Manage incoming meeting requests, discovery calls, and schedule capacity.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#FFFFFF] p-1.5 border border-[#E4E2DC] shadow-sm">
          <div className="flex flex-col px-3">
            <span className="text-[10px] font-mono text-[#6B7280] uppercase">Total Bookings</span>
            <span className="font-semibold text-[#122C57] leading-none">{bookings.length}</span>
          </div>
        </div>
      </div>
      
      {/* Interactive Time Slots Configuration Panel */}
      <Card variant="outline" className="p-6 bg-[#FFFFFF] border border-[#E4E2DC] space-y-4 shadow-sm mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg text-[#122C57]">
              {selectedCalendarDate 
                ? `Manage Overrides for ${new Date(selectedCalendarDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}`
                : 'Manage Default Weekly Time Slots'}
            </h3>
            <p className="text-xs text-[#6B7280]">
              {selectedCalendarDate 
                ? 'Select specific times for this date. These will override the default weekly schedule.'
                : 'Click to toggle available time slots. These will apply to all dates by default.'}
            </p>
          </div>
          {selectedCalendarDate && (
            <button 
              onClick={() => setSelectedCalendarDate(null)}
              className="text-[11px] font-mono uppercase text-[#6B7280] hover:text-[#122C57] underline"
            >
              Back to Defaults
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
            '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'].map(slot => {
            
            // Determine which input state to use based on mode
            const activeInputStr = selectedCalendarDate ? customSlotInput : timeSlotsInput;
            const activeSlots = activeInputStr.split(',').map(s => s.trim()).filter(Boolean);
            const isSelected = activeSlots.includes(slot);

            const toggleSlot = () => {
              const newSlots = isSelected ? activeSlots.filter(s => s !== slot) : [...activeSlots, slot];
              // sort slots chronologically (simple sort works since they are fixed format, wait, AM/PM sort is tricky but let's just append for now, or sort properly)
              const sorted = newSlots.sort((a, b) => {
                const parseTime = (time: string) => {
                  const [t, m] = time.split(' ');
                  const [h, min] = t.split(':').map(Number);
                  return (m === 'PM' && h !== 12 ? h + 12 : h === 12 && m === 'AM' ? 0 : h) * 60 + min;
                };
                return parseTime(a) - parseTime(b);
              });
              
              if (selectedCalendarDate) setCustomSlotInput(sorted.join(', '));
              else setTimeSlotsInput(sorted.join(', '));
            };

            return (
              <button
                key={slot}
                onClick={toggleSlot}
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors border ${
                  isSelected 
                    ? 'bg-[#122C57] text-[#FFFFFF] border-[#122C57]' 
                    : 'bg-[#F7F5F0] text-[#6B7280] border-[#E4E2DC] hover:border-[#122C57]'
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button 
            onClick={selectedCalendarDate ? handleUpdateCustomSlots : handleUpdateSlots}
            disabled={isUpdatingSlots}
            className="px-6 py-2 bg-[#C99A44] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#b08639] transition-colors disabled:opacity-50"
          >
            {isUpdatingSlots ? 'Saving...' : (selectedCalendarDate ? 'Save Overrides' : 'Save Default Slots')}
          </button>
          
          {selectedCalendarDate && customSlotsMap[selectedCalendarDate] && (
            <button 
              onClick={async () => {
                setIsUpdatingSlots(true);
                await updateCustomDateSlotsAction(selectedCalendarDate, []);
                setCustomSlotsMap(prev => { const n = {...prev}; delete n[selectedCalendarDate]; return n; });
                setCustomSlotInput(timeSlotsInput);
                setIsUpdatingSlots(false);
                setSelectedCalendarDate(null);
                alert('Overrides removed. Reverted to default schedule.');
              }}
              disabled={isUpdatingSlots}
              className="px-4 py-2 bg-transparent text-red-600 border border-red-200 text-xs font-medium rounded hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Remove Overrides
            </button>
          )}
        </div>
      </Card>

      {/* Admin Calendar View */}
      <Card variant="outline" className="bg-[#FFFFFF] border border-[#E4E2DC] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#E4E2DC] bg-[#F7F5F0]">
          <h3 className="font-serif text-lg text-[#122C57] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#C99A44]" /> Booking Calendar Schedule
          </h3>
          <div className="flex items-center gap-4 text-xs font-mono font-semibold text-[#122C57]">
            <button onClick={prevMonth} className="hover:text-[#C99A44] transition-colors">&lt; Prev</button>
            <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button onClick={nextMonth} className="hover:text-[#C99A44] transition-colors">Next &gt;</button>
          </div>
        </div>
        <div className="p-4">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] text-[#6B7280] uppercase pb-2">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          {/* Date Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {[...Array(firstDayIndex)].map((_, i) => (
              <div key={`empty-${i}`} className="p-2 border border-transparent bg-gray-50/50" />
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum);
              const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              const stats = bookingStats[dateStr] || { scheduled: 0, cancelled: 0 };
              
              // Max slots for this specific day (custom override or default)
              const maxSlotsForThisDay = customSlotsMap[dateStr] 
                ? customSlotsMap[dateStr].length 
                : maxSlotsPerDay;
                
              const available = Math.max(0, maxSlotsForThisDay - stats.scheduled);
              
              // Only show available slots for today and future days, except Sundays
              const todayMidnight = new Date();
              todayMidnight.setHours(0, 0, 0, 0);
              const isPast = dateObj < todayMidnight;
              const isSunday = dateObj.getDay() === 0;
              const actualAvailable = (!isPast && !isSunday) ? available : 0;
              
              const isSelectedDate = selectedCalendarDate === dateStr;
              const hasOverride = !!customSlotsMap[dateStr];
              
              return (
                <button 
                  key={dateStr} 
                  type="button"
                  onClick={() => {
                    setSelectedCalendarDate(dateStr);
                    if (customSlotsMap[dateStr]) setCustomSlotInput(customSlotsMap[dateStr].join(', '));
                    else setCustomSlotInput(timeSlotsInput);
                  }}
                  className={`p-2 min-h-[80px] border text-left transition-colors flex flex-col justify-between hover:border-[#122C57] ${
                    isSelectedDate ? 'ring-2 ring-[#122C57] border-[#122C57]' : ''
                  } ${
                    stats.scheduled > 0 ? 'border-[#C99A44] bg-[#F7F5F0]' : 'border-[#E4E2DC] bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-[#122C57]">{dayNum}</div>
                    {hasOverride && <div className="w-1.5 h-1.5 rounded-full bg-[#122C57]" title="Custom Override Active" />}
                  </div>
                  <div className="space-y-0.5 pt-1">
                    {stats.scheduled > 0 && (
                      <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 rounded">
                        {stats.scheduled} Scheduled
                      </div>
                    )}
                    {stats.cancelled > 0 && (
                      <div className="text-[10px] text-red-600 bg-red-50 px-1 rounded">
                        {stats.cancelled} Cancelled
                      </div>
                    )}
                    {actualAvailable > 0 && (
                      <div className="text-[10px] text-blue-600 px-1">
                        {actualAvailable} Avail.
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {bookings.length === 0 ? (
        <Card variant="outline" className="bg-[#FFFFFF] p-12 text-center space-y-4 border border-dashed border-[#E4E2DC]">
          <div className="w-12 h-12 rounded-full bg-[#F7F5F0] flex items-center justify-center mx-auto border border-[#E4E2DC]">
            <Inbox className="w-6 h-6 text-[#C99A44]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-[#122C57]">No Meeting Bookings Yet</h3>
            <p className="text-xs text-[#6B7280] max-w-md mx-auto">
              When visitors schedule a 20-minute AI discovery audit on the booking calendar, their appointment will appear here automatically.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/contact"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#122C57] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#0A1B3D] transition-colors"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#C99A44]" /> Test Public Booking Calendar →
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Bookings List */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E4E2DC] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F5F0] border-b border-[#E4E2DC] font-mono uppercase text-[#6B7280]">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Client / Business</th>
                  <th className="p-3.5">Topic</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DC]">
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className={`cursor-pointer transition-colors ${
                      selectedBooking?.id === booking.id ? 'bg-[#F7F5F0]' : 'hover:bg-[#F7F5F0]/50'
                    }`}
                  >
                    <td className="p-3.5">
                      <p className="font-medium text-[#122C57]">
                        {booking.meetingDate
                          ? new Date(booking.meetingDate + 'T00:00:00').toLocaleDateString('en-IN', {
                              weekday: 'short', month: 'short', day: 'numeric',
                            })
                          : 'Date TBD'}
                      </p>
                      <p className="text-[11px] font-mono text-[#C99A44] font-semibold">
                        {booking.timeSlot || 'Time TBD'}
                      </p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium text-[#0A1B3D]">{booking.name}</p>
                      <p className="text-[11px] text-[#6B7280]">{booking.businessName}</p>
                    </td>
                    <td className="p-3.5 text-[#0A1B3D] max-w-[150px] truncate">{booking.serviceInterest}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 font-mono text-[10px] uppercase font-semibold ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Selected Booking Detail */}
          <div className="lg:col-span-5">
            {selectedBooking ? (
              <Card variant="outline" className="bg-[#FFFFFF] p-6 space-y-6">
                <div className="flex items-start justify-between border-b border-[#E4E2DC] pb-4">
                  <div>
                    <h3 className="font-serif text-xl text-[#122C57]">{selectedBooking.name}</h3>
                    <p className="text-xs text-[#6B7280]">{selectedBooking.businessName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {updatingId === selectedBooking.id && (
                      <RefreshCw className="w-3 h-3 text-[#6B7280] animate-spin" />
                    )}
                    <select
                      value={selectedBooking.status}
                      onChange={(e) =>
                        handleStatusChange(selectedBooking.id, e.target.value as BookingRecord['status'])
                      }
                      disabled={updatingId === selectedBooking.id}
                      className="px-2.5 py-1 bg-[#F7F5F0] border border-[#E4E2DC] text-xs font-mono font-semibold text-[#122C57] disabled:opacity-60"
                    >
                      <option value="NEW">CONFIRMED</option>
                      <option value="CONTACTED">IN PROGRESS</option>
                      <option value="QUALIFIED">COMPLETED</option>
                      <option value="WON">CLOSED</option>
                      <option value="LOST">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Call Details */}
                <div className="p-4 bg-[#F7F5F0] border border-[#E4E2DC] space-y-2 text-xs">
                  {selectedBooking.meetingDate && (
                    <div className="flex items-center gap-2 text-[#122C57] font-semibold">
                      <CalendarIcon className="w-4 h-4 text-[#C99A44]" />
                      <span>
                        {new Date(selectedBooking.meetingDate + 'T00:00:00').toLocaleDateString('en-IN', {
                          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                  {selectedBooking.timeSlot && (
                    <div className="flex items-center gap-2 text-[#0A1B3D]">
                      <Clock className="w-4 h-4 text-[#C99A44]" />
                      <span>{selectedBooking.timeSlot} ({selectedBooking.timezone})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[#0A1B3D]">
                    <Video className="w-4 h-4 text-[#122C57]" />
                    <a
                      href="https://meet.google.com/landing"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#122C57] hover:underline font-medium"
                    >
                      Open Google Meet Room →
                    </a>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-[#0A1B3D]">
                    <Mail className="w-3.5 h-3.5 text-[#122C57]" />
                    <a href={`mailto:${selectedBooking.email}`} className="hover:underline break-all">
                      {selectedBooking.email}
                    </a>
                  </div>
                  {selectedBooking.phone && (
                    <div className="flex items-center gap-2 text-[#0A1B3D]">
                      <Phone className="w-3.5 h-3.5 text-[#122C57]" />
                      <a href={`tel:${selectedBooking.phone}`} className="hover:underline">
                        {selectedBooking.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedBooking.notes && (
                  <div className="space-y-1 pt-2 border-t border-[#E4E2DC]">
                    <p className="text-[11px] font-mono uppercase text-[#6B7280] font-semibold">
                      Client Bottleneck / Agenda
                    </p>
                    <p className="p-3 bg-[#F7F5F0] border border-[#E4E2DC] text-xs text-[#0A1B3D] leading-relaxed">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                <a
                  href={`mailto:${selectedBooking.email}?subject=Preparation%20for%20our%20AI%20Audit%20Call%20%E2%80%94%20Gravity%20For%20AI`}
                  className="w-full inline-block text-center py-2.5 bg-[#122C57] text-[#FFFFFF] text-xs font-sans font-medium hover:bg-[#0A1B3D] transition-colors"
                >
                  Send Pre-Call Email
                </a>
              </Card>
            ) : (
              <Card variant="outline" className="p-6 text-center text-xs text-[#6B7280]">
                Select a booking from the table to view full details.
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
