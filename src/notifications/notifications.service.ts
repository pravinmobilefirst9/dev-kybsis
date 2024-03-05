import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(userId: number, title: string, body: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        body,
      },
    });
  }
  
  // Method to mark a notification as read
  async markNotificationAsRead(notificationId: number) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // Additional methods as needed...
}
