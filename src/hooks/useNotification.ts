// src/hooks/useNotification.ts
import { useEffect, useState } from "react";
import {
  requestNotificationPermission,
  onMessageListener,
} from "@/firebase/firebase";

export const useNotification = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      const token = await requestNotificationPermission();
      if (token) {
        setToken(token);
        // 토큰을 서버에 저장하거나 필요한 처리 수행
        localStorage.setItem("fcmToken", token);
      }
    };

    requestPermission();

    const unsubscribe = onMessageListener().then((payload: any) => {
      const { title, body } = payload.notification;
      new Notification(title, { body });
    });

    return () => {
      unsubscribe;
    };
  }, []);

  return token;
};
