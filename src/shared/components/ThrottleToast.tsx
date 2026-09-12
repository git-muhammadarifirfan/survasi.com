import React from 'react';
import { notifyToast as unifiedNotifyToast } from './NotificationToast';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastPayload {
  type: ToastType;
  title: string;
  message: string;
}

/**
 * Legacy dispatch helper — delegates directly to unified NotificationToast
 */
export function notifyToast(payload: ToastPayload) {
  unifiedNotifyToast(payload);
}

export const ThrottleToast: React.FC = () => {
  return null;
};

export default ThrottleToast;
