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
  details: string | null;
  date: Date;
  read: boolean;
  userId: string;
  link: string | null;
}
