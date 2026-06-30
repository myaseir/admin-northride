"use client";
import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalInit() {
  useEffect(() => {
    // Only initialize if it hasn't been initialized yet
    // react-onesignal internal logic often handles this, but this check is safer
    if (!OneSignal.initialized) {
      OneSignal.init({
        appId: "1cda3b15-73f8-4e66-837d-ab019edf120c",
        safari_web_id: "web.onesignal.auto.449e8e5d-df22-4f65-ad52-0d8b06e9cdb9",
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: true,
        },
      }).then(() => {
        // Only prompt after initialization is fully complete
        OneSignal.Slidedown.promptPush();
      });
    }
  }, []);

  return null;
}