import { useEffect } from 'react';
import './Notification.css';

export default function Notification({ message, onDismiss }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onDismiss, 2200);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  return <div className="notif">{message}</div>;
}
