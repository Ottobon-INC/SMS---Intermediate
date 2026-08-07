import React, { useState } from 'react';
import { dbRepository } from '@/src/services/db';
import { NotificationEvent, NotificationEventType } from '@/src/types';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { MessageSquare, CheckCheck, Clock, AlertCircle, RefreshCw, Smartphone, Filter } from 'lucide-react';
import { WhatsAppPreview } from '@/src/modules/notifications/components/WhatsAppPreview';

export const NotificationCenterPage: React.FC = () => {
  const { triggerRefresh } = useAuth();
  const [events, setEvents] = useState<NotificationEvent[]>(() => dbRepository.getNotificationEvents());
  const [selectedEvent, setSelectedEvent] = useState<NotificationEvent | null>(events[0] || null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const refreshData = () => {
    setEvents(dbRepository.getNotificationEvents());
    triggerRefresh();
  };

  const handleRetryFailed = (eventId: string) => {
    dbRepository.updateNotificationStatus(eventId, 'DELIVERED');
    refreshData();
    alert('Notification re-sent and successfully delivered!');
  };

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'ALL') return true;
    return ev.eventType === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">WhatsApp Notification Center & Delivery Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time log of automated guardian notifications, delivery status tracking, and interactive mobile preview.
          </p>
        </div>

        <button
          onClick={refreshData}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Logs
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Log Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Delivery Audit Stream ({filteredEvents.length})</h3>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
            >
              <option value="ALL">All Event Types</option>
              <option value="ATTENDANCE_ABSENCE">Attendance Absence</option>
              <option value="PAYMENT_CONFIRMATION">Payment Receipt</option>
              <option value="EXAM_RESULT_PUBLISHED">Result Published</option>
              <option value="CIRCULAR_PUBLISHED">Circular</option>
            </select>
          </div>

          <div className="space-y-2 text-xs">
            {filteredEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedEvent?.id === ev.id
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      {ev.eventType.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        ev.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ev.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ev.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate max-w-sm">
                    {ev.resolvedMessage.replace(/\n/g, ' ')}
                  </p>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Guardian: {ev.guardianMobile} • {new Date(ev.createdAt).toLocaleTimeString('en-IN')}
                  </span>
                </div>

                {ev.status === 'FAILED' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetryFailed(ev.id);
                    }}
                    className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold shrink-0"
                  >
                    Retry Delivery
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Realistic WhatsApp Mobile Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col items-center justify-center">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2 self-start">
            <Smartphone className="w-4 h-4 text-emerald-600" /> WhatsApp Mobile Preview Simulator
          </h3>

          <WhatsAppPreview
            customMessage={selectedEvent?.resolvedMessage}
            eventType={selectedEvent?.eventType || 'ATTENDANCE_ABSENCE'}
            status={selectedEvent?.status || 'DELIVERED'}
            studentName="Ravi Kumar"
            guardianName="Mrs. Lakshmi Kumar"
            onSimulateDelivery={() => {
              if (selectedEvent) {
                dbRepository.updateNotificationStatus(selectedEvent.id, 'DELIVERED');
                refreshData();
              }
            }}
            onSimulateFailure={() => {
              if (selectedEvent) {
                dbRepository.updateNotificationStatus(selectedEvent.id, 'FAILED');
                refreshData();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
