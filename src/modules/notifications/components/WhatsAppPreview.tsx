import React, { useState } from 'react';
import {
  CheckCheck,
  Send,
  Phone,
  Video,
  MoreVertical,
  Check,
  AlertCircle,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { NotificationEventType, NotificationEvent } from '@/src/types';

interface WhatsAppPreviewProps {
  customMessage?: string;
  eventType?: NotificationEventType;
  studentName?: string;
  guardianName?: string;
  amount?: number;
  date?: string;
  status?: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  onSimulateDelivery?: () => void;
  onSimulateFailure?: () => void;
  id?: string;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  customMessage,
  eventType = 'ATTENDANCE_ABSENCE',
  studentName = 'Ravi Kumar',
  guardianName = 'Mrs. Lakshmi Kumar',
  amount = 12500,
  date = '6 Aug 2026',
  status = 'DELIVERED',
  onSimulateDelivery,
  onSimulateFailure,
  id = 'whatsapp-preview-frame',
}) => {
  const [selectedType, setSelectedType] = useState<NotificationEventType>(eventType);

  const presets: Record<NotificationEventType, { title: string; body: string }> = {
    ATTENDANCE_ABSENCE: {
      title: '1. Attendance Absence',
      body: `Dear ${guardianName},\n\n${studentName} was marked absent on ${date} at Sri Vignan Intermediate College, Main Campus.\n\nPlease contact the college office if clarification is required.`,
    },
    ATTENDANCE_CORRECTION: {
      title: '2. Attendance Correction',
      body: `Dear ${guardianName},\n\nAn attendance record for ${studentName} on ${date} at Sri Vignan Intermediate College was updated to Present following class teacher review.`,
    },
    FEE_ASSIGNED: {
      title: '3. Fee Assigned',
      body: `Dear ${guardianName},\n\nA new fee instalment of ₹${amount.toLocaleString('en-IN')} for ${studentName} (First Year MPC-A) has been assigned for the academic term 2026–2027. Due Date: 15 Aug 2026.`,
    },
    FEE_DUE_REMINDER: {
      title: '4. Fee Due Reminder',
      body: `Dear ${guardianName},\n\nAn outstanding fee amount of ₹${amount.toLocaleString('en-IN')} for ${studentName} is due on 15 Aug 2026.\n\nRegards,\nSri Vignan Intermediate College`,
    },
    FEE_OVERDUE: {
      title: '5. Fee Overdue',
      body: `Dear ${guardianName},\n\nURGENT: An overdue fee balance of ₹${amount.toLocaleString('en-IN')} for ${studentName} was due on 15 Aug 2026. Please settle the dues at the college office or via digital payment.`,
    },
    PAYMENT_CONFIRMATION: {
      title: '6. Payment Confirmation',
      body: `Dear ${guardianName},\n\nA payment of ₹10,000 has been recorded for ${studentName} on ${date}.\n\nReceipt: SVI-2026-00125\nRemaining balance: ₹${amount.toLocaleString('en-IN')}\n\nRegards,\nSri Vignan Intermediate College`,
    },
    EXAM_RESULT_PUBLISHED: {
      title: '7. Result Published',
      body: `Dear ${guardianName},\n\nThe result for ${studentName} in Monthly Test 1 has been published.\n\nTotal: 316 / 400\nPercentage: 79%\nResult: Pass\n\nRegards,\nSri Vignan Intermediate College`,
    },
    EXAM_RESULT_CORRECTED: {
      title: '8. Corrected Result',
      body: `Dear ${guardianName},\n\nThe published result for ${studentName} in Monthly Test 1 has been re-verified and updated (Version 2). Final Score: 320/400 (80% - Grade A).`,
    },
    CIRCULAR_PUBLISHED: {
      title: '9. Circular Published',
      body: `Dear Parent,\n\nThe college will remain closed on 15 August 2026 for Independence Day. Flag hoisting starts at 8:00 AM. Classes will resume on 16 August 2026.\n\nRegards,\nSri Vignan Intermediate College`,
    },
  };

  const messageText = customMessage || presets[selectedType].body;

  const renderStatusBadge = () => {
    switch (status) {
      case 'DELIVERED':
        return (
          <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> Delivered
          </span>
        );
      case 'SENT':
        return (
          <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            <Check className="w-3.5 h-3.5 text-slate-500" /> Sent
          </span>
        );
      case 'QUEUED':
        return (
          <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Queued
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Failed
          </span>
        );
    }
  };

  return (
    <div id={id} className="flex flex-col items-center">
      {/* Category selector pills */}
      {!customMessage && (
        <div className="w-full max-w-sm mb-4 overflow-x-auto flex gap-1.5 pb-2 scrollbar-none">
          {(Object.keys(presets) as NotificationEventType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors ${
                selectedType === type
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {presets[type].title}
            </button>
          ))}
        </div>
      )}

      {/* Realistic Mobile Frame */}
      <div className="w-[320px] h-[580px] bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden flex flex-col">
        {/* Notch & Speaker */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-b-xl z-30 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
        </div>

        {/* Screen Container */}
        <div className="w-full h-full bg-[#E5DDD5] rounded-[30px] overflow-hidden flex flex-col relative pt-4">
          {/* Status Bar */}
          <div className="bg-[#075E54] text-white px-4 py-1 text-[10px] flex items-center justify-between z-20">
            <span>10:30 AM</span>
            <div className="flex items-center gap-1">
              <span>LTE</span>
              <span>85%</span>
            </div>
          </div>

          {/* WhatsApp Header */}
          <div className="bg-[#075E54] text-white px-3 py-2 flex items-center justify-between shadow-md z-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-[#075E54] font-bold text-xs flex items-center justify-center border border-emerald-300">
                SVIC
              </div>
              <div>
                <h4 className="text-xs font-semibold leading-tight">
                  Sri Vignan College
                </h4>
                <p className="text-[10px] text-emerald-100">Official Institution Account</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Phone className="w-3.5 h-3.5" />
              <Video className="w-3.5 h-3.5" />
              <MoreVertical className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Chat Background & Wallpaper */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#efeae2] relative">
            <div className="text-center my-1">
              <span className="bg-white/90 text-[10px] text-slate-500 px-2.5 py-0.5 rounded-md shadow-2xs font-medium border border-slate-200">
                TODAY
              </span>
            </div>

            {/* Official Security Info */}
            <div className="bg-[#FFE2B8] text-[10px] text-amber-900 p-2 rounded-lg text-center leading-snug shadow-2xs">
              🔒 Messages are end-to-end encrypted. No one outside of this chat can read them.
            </div>

            {/* Message Bubble */}
            <div className="bg-white rounded-lg p-3 shadow-xs max-w-[90%] self-start relative border-l-4 border-[#128C7E]">
              <div className="text-[10px] font-bold text-[#128C7E] mb-1">
                Sri Vignan Intermediate College
              </div>
              <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {messageText}
              </p>
              <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                <span>10:30 AM</span>
                {status === 'DELIVERED' && <CheckCheck className="w-3 h-3 text-blue-500" />}
                {status === 'SENT' && <Check className="w-3 h-3 text-slate-400" />}
                {status === 'QUEUED' && <Clock className="w-3 h-3 text-amber-500" />}
                {status === 'FAILED' && <AlertCircle className="w-3 h-3 text-rose-500" />}
              </div>
            </div>
          </div>

          {/* Chat Footer Input Simulation */}
          <div className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-slate-200">
            <div className="flex-1 bg-white rounded-full px-3 py-1 text-xs text-slate-400">
              Type a message...
            </div>
            <div className="w-7 h-7 rounded-full bg-[#128C7E] text-white flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Controls */}
      <div className="w-full max-w-sm mt-3 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
        <div>{renderStatusBadge()}</div>
        <div className="flex gap-2">
          {onSimulateDelivery && (
            <button
              onClick={onSimulateDelivery}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors"
            >
              Simulate Deliver
            </button>
          )}
          {onSimulateFailure && (
            <button
              onClick={onSimulateFailure}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md font-medium transition-colors"
            >
              Simulate Fail
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
