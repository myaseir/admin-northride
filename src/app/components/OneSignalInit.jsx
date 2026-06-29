"use client";
import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalInit() {
  useEffect(() => {
    const runOneSignal = async () => {
      await OneSignal.init({
        appId: "1cda3b15-73f8-4e66-837d-ab019edf120c",
        safari_web_id: "web.onesignal.auto.449e8e5d-df22-4f65-ad52-0d8b06e9cdb9", 
        allowLocalhostAsSecureOrigin: true, 
        notifyButton: {
          enable: true,
        },
      });
      // Prompt the user to subscribe
      OneSignal.Slidedown.promptPush();
    };

    runOneSignal();
  }, []);

  // This component doesn't render any visible UI of its own
  return null; 
}