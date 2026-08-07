import { dbRepository } from '@/src/services/db';
import { NotificationEvent, Circular } from '@/src/types';

export class NotificationsService {
  static getNotificationEvents(): NotificationEvent[] {
    return dbRepository.getNotificationEvents();
  }
  
  static updateNotificationStatus(eventId: string, status: 'PENDING' | 'DELIVERED' | 'FAILED') {
    dbRepository.updateNotificationStatus(eventId, status);
  }
  
  static getCirculars(): Circular[] {
    return dbRepository.getCirculars();
  }
  
  static addCircular(circular: Circular) {
    dbRepository.addCircular(circular);
  }
  
  static addNotificationEvent(event: NotificationEvent) {
    dbRepository.addNotificationEvent(event);
  }
}
