export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "critical";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  details?: string;
  date: string; // ISO string
  read: boolean;
  userId: string;
  link?: string;
}
