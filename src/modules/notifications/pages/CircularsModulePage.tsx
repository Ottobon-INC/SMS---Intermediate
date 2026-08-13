import React, { useState } from 'react';
import { NotificationsService } from '@/src/modules/notifications/services/NotificationsService';
import { Circular } from '@/src/types';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { Megaphone, Plus, Paperclip, Filter, MessageSquare, X, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/src/modules/core/components/Modal';
import { WhatsAppPreview } from '@/src/modules/notifications/components/WhatsAppPreview';

export const CircularsModulePage: React.FC = () => {
  const { currentUser, triggerRefresh } = useAuth();
  const [circulars, setCirculars] = useState<Circular[]>(() => NotificationsService.getCirculars());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [branchFilter, setBranchFilter] = useState<string>('ALL'); // Dean-only filter

  const canPublish = currentUser?.role !== 'PARENT_GUARDIAN';
  const isDean = currentUser?.role === 'INSTITUTION_ADMIN';

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Holiday' | 'Exam Notice' | 'Academic' | 'General'>('Holiday');
  const [message, setMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // WhatsApp Preview Modal
  const [showWhatsAppPreviewModal, setShowWhatsAppPreviewModal] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');

  const refreshData = () => {
    setCirculars(NotificationsService.getCirculars());
    triggerRefresh();
  };

  const handleCreateCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;
    const newCirc: Circular = {
      id: `circ-${Date.now()}`,
      institutionId: currentUser?.institutionId || 'inst-svic-01',
      branchId: currentUser?.branchId || 'branch-hyd-main',
      title,
      category,
      message,
      audienceType: 'All',
      attachmentUrl: attachmentUrl || undefined,
      createdBy: currentUser?.id || 'dean-1',
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      status: 'PUBLISHED',
    };

    NotificationsService.addCircular(newCirc);

    const waMsg = `Dear Parent,\n\n${title}\n\n${message}\n\nRegards,\nSri Vignan Intermediate College`;

    // Enqueue broadcast notification
    NotificationsService.addNotificationEvent({
      id: `notif-${Date.now()}`,
      institutionId: currentUser?.institutionId || 'inst-svic-01',
      branchId: currentUser?.branchId || 'branch-hyd-main',
      studentId: 'student-1',
      guardianId: 'guard-1',
      sourceModule: 'Circulars',
      sourceRecordId: newCirc.id,
      recipientMobile: '9000020001',
      eventType: 'CIRCULAR_PUBLISHED',
      resolvedMessage: waMsg,
      status: 'DELIVERED',
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });

    setPreviewMessage(waMsg);
    
    refreshData();
    setShowCreateModal(false);
    setTitle('');
    setMessage('');
    
    // Show preview instead of alert
    setShowWhatsAppPreviewModal(true);
  };

  const filteredCirculars = circulars.filter((circ) => {
    // Non-Dean users only see their branch
    if (!isDean && currentUser?.branchId && circ.branchId !== currentUser.branchId) {
      return false;
    }
    // Dean branch filter
    if (isDean && branchFilter !== 'ALL' && circ.branchId !== branchFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Official College Circulars</h1>
          <p className="text-xs text-slate-500 mt-1">
            {canPublish
              ? 'Publish holiday announcements, exam timetables, parent-teacher meeting notices, and broadcast alerts.'
              : 'View official holiday announcements, exam timetables, parent-teacher meeting notices, and college updates.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isDean && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="ALL">All Branches</option>
                <option value="branch-hyd-main">Hyderabad Main Campus</option>
                <option value="branch-vzg-north">Visakhapatnam North</option>
                <option value="branch-vja-east">Vijayawada East</option>
              </select>
            </div>
          )}

          {canPublish && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all"
              id="publish-circular-button"
            >
              <Plus className="w-4 h-4 text-teal-400" /> Publish New Circular
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredCirculars.map((circ) => (
          <div key={circ.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <Megaphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{circ.title}</h3>
                  <span className="text-[10px] text-slate-400">
                    Published on {new Date(circ.publishedAt || circ.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {isDean && ` • Branch: ${circ.branchId}`}
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full text-[10px] font-bold border border-slate-200">
                {circ.category}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {circ.message}
            </p>

            {circ.attachmentUrl && (
              <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold pt-1">
                <Paperclip className="w-4 h-4" /> Attached Document: {circ.attachmentUrl}
              </div>
            )}
          </div>
        ))}

        {filteredCirculars.length === 0 && (
          <div className="text-center text-slate-500 py-10 font-medium bg-white rounded-3xl border border-slate-200 shadow-xs">
            No circulars found.
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Publish Official College Circular">
        <form onSubmit={handleCreateCircular} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Circular Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Independence Day Flag Hoisting & Holiday Notice"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            >
              <option value="Holiday">Holiday Notice</option>
              <option value="Exam Notice">Exam Schedule / Timetable</option>
              <option value="Academic">Academic Announcement</option>
              <option value="General">General Institution Announcement</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Body / Message Text</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter full notice content to be broadcasted..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Optional Attachment Name / Link</label>
            <input
              type="text"
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              placeholder="e.g. independence_day_schedule_2026.pdf"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
            >
              Publish & Broadcast Circular
            </button>
          </div>
        </form>
      </Modal>

      {/* WHATSAPP MESSAGE PREVIEW MODAL */}
      {showWhatsAppPreviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Circular Published & Broadcasted</h3>
                  <p className="text-xs text-slate-500">Live preview of automated parent WhatsApp notification</p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* WhatsApp Chat Simulation Card */}
            <div className="bg-emerald-950/90 p-4 rounded-2xl border border-emerald-800 text-xs space-y-3 font-sans shadow-inner">
              <div className="flex justify-between items-center border-b border-emerald-800/60 pb-2">
                <div className="flex items-center gap-2 text-emerald-100 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  WhatsApp Official Alert Engine
                </div>
                <span className="text-[10px] text-emerald-300 font-mono">Broadcast to Parents</span>
              </div>

              {/* Message Bubble */}
              <div className="bg-emerald-900/90 text-emerald-50 p-3.5 rounded-2xl border border-emerald-700/50 space-y-2 whitespace-pre-wrap font-mono leading-relaxed text-[11px] shadow-sm">
                {previewMessage}
                <div className="flex justify-end items-center gap-1 text-[9px] text-emerald-300 font-mono mt-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-teal-300 font-bold">✓✓ Delivered</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Circular is now visible on student dashboards and broadcasted via WhatsApp!
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowWhatsAppPreviewModal(false)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Done & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
