import React from 'react';
import { Modal } from '@/src/modules/core/components/Modal';
import { WhatsAppPreview } from '@/src/modules/notifications/components/WhatsAppPreview';
import { NotificationEventType } from '@/src/types';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  customMessage?: string;
  eventType?: NotificationEventType;
  studentName?: string;
  guardianName?: string;
  amount?: number;
  date?: string;
  status?: 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED';
  onSimulateDelivery?: () => void;
  onSimulateFailure?: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  customMessage,
  eventType,
  studentName,
  guardianName,
  amount,
  date,
  status,
  onSimulateDelivery,
  onSimulateFailure,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="WhatsApp Mobile Message Preview" maxWidth="md">
      <div className="py-2 flex justify-center">
        <WhatsAppPreview
          customMessage={customMessage}
          eventType={eventType}
          studentName={studentName}
          guardianName={guardianName}
          amount={amount}
          date={date}
          status={status}
          onSimulateDelivery={onSimulateDelivery}
          onSimulateFailure={onSimulateFailure}
        />
      </div>
    </Modal>
  );
};
