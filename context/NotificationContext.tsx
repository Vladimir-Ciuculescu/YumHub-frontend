import NotificationService from "@/api/services/notifications.service";
import { registerForPushNotificationsAsync } from "@/utils/registerForPushNotificationsAsync";
import { useQueryClient } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: Error | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error("useNotification must be within a NotificationProvider");
  }

  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const queryClient = useQueryClient();

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const expoPushTokenRef = useRef<string | null>(null);

  const incrementAppBadge = async () => {
    const currentBadgeCount = await Notifications.getBadgeCountAsync();

    await Notifications.setBadgeCountAsync(currentBadgeCount);
  };

  const resetAppNotificationBadges = async () => {
    await Notifications.setBadgeCountAsync(0);
  };

  useEffect(() => {
    const redirect = async (notification: Notifications.Notification) => {
      const url = notification.request.content.data.url;

      if (url) {
        router.push("/(tabs)/notifications");
      }

      await resetAppNotificationBadges();

      const token = expoPushTokenRef.current;

      if (token) {
        await NotificationService.resetBadgeCountNotification(token);
      }
    };

    let isMounted = true;

    registerForPushNotificationsAsync().then(
      (token) => {
        setExpoPushToken(token as any);
      },
      (error) => setError(error),
    );

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return;
      }
      redirect(response?.notification);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(
      async (notification) => {
        setNotification(notification);
        await incrementAppBadge();

        queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
      },
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification);
    });

    return () => {
      isMounted = false;

      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }

      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    expoPushTokenRef.current = expoPushToken;
  }, [expoPushToken]);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, error }}>
      {children}
    </NotificationContext.Provider>
  );
};
