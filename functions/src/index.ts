import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

admin.initializeApp();

export const sendDailyReminder = onSchedule(
  {
    schedule: "0 21 * * *",
    timeZone: "Asia/Seoul",
  },
  async () => {
    try {
      const users = await admin.firestore().collection("users").get();

      const tokens = users.docs.map((doc) => doc.data().fcmToken);

      const payload: admin.messaging.MulticastMessage = {
        notification: {
          title: "일기 작성 시간!",
          body: "오늘 하루는 어떠셨나요? 일기를 작성해주세요.",
        },
        tokens: tokens,
      };

      const response = await admin.messaging().sendMulticast(payload);
      console.log("알림 전송 완료:", response);
    } catch (error) {
      console.error("알림 전송 실패:", error);
    }
  }
);
