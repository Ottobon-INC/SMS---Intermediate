import React, { useState } from 'react';
import { dbRepository } from '@/src/services/db';
import { Circular } from '@/src/types';
import { useAuth } from '@/src/modules/auth-and-users/context/AuthContext';
import { Megaphone, Plus, Paperclip } from 'lucide-react';
import { Modal } from '@/src/modules/core/components/Modal';

export const CircularsModulePage: React.FC = () => {
  const { currentUser, triggerRefresh } = useAuth();
  const [circulars, setCirculars] = useState<Circular[]>(() => dbRepository.getCirculars());
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canPublish = currentUser?.role !== 'PARENT_GUARDIAN';

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Holiday' | 'Exam Notice' | 'Academic' | 'General'>('Holiday');
  const [message, setMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const refreshData = () => {
    setCirculars(dbRepository.getCirculars());
    triggerRefresh();
  };

  const handleCreateCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;
    const newCirc: Circular = {
      id: `circ-${Date.now()}`,
      institutionId: 'inst-svic-01',
      branchId: 'branch-hyd-main',
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

    dbRepository.addCircular(newCirc);

    // Enqueue broadcast notification
    dbRepository.addNotificationEvent({
      id: `notif-${Date.now()}`,
      institutionId: 'inst-svic-01',
      branchId: 'branch-hyd-main',
      studentId: 'student-1',
      guardianId: 'guard-1',
      sourceModule: 'Circulars',
      sourceRecordId: newCirc.id,
      recipientMobile: '9000020001',
      eventType: 'CIRCULAR_PUBLISHED',
      resolvedMessage: `Dear Parent,\n\n${title}\n\n${message}\n\nRegards,\nSri Vignan Intermediate College`,
      status: 'DELIVERED',
      createdAt: new Date().toISOString(),
      retryCount: 0,
    });

    refreshData();
    setShowCreateModal(false);
    setTitle('');
    setMessage('');
    alert('Official circular published and broadcasted to Parent WhatsApp Portal!');
  };

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

      {/* List */}
      <div className="space-y-4">
        {circulars.map((circ) => (
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
    </div>
  );
};
