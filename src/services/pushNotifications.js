import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { firebaseApp, firebaseConfig, hasFirebaseConfig } from '../firebase';

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const registerMessagingWorker = async () => {
    const params = new URLSearchParams(firebaseConfig);
    return navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params}`, { scope: '/' });
};

export const getPushSupport = async () => ({
    configured: hasFirebaseConfig && Boolean(vapidKey),
    supported: 'Notification' in window && 'serviceWorker' in navigator && await isSupported(),
});

export const subscribeToPush = async audience => {
    const support = await getPushSupport();
    if (!support.configured) throw new Error('Push notifications are not configured.');
    if (!support.supported) throw new Error('This browser does not support web push.');

    const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Notification permission was not granted.');

    const registration = await registerMessagingWorker();
    const messaging = getMessaging(firebaseApp);
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    if (!token) throw new Error('The device did not return a notification token.');

    const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, audience: audience.toLowerCase(), userAgent: navigator.userAgent }),
    });
    if (!response.ok) throw new Error((await response.json()).error || 'Could not register background alerts.');

    return { messaging, registration };
};

export const listenForForegroundPush = (messaging, handler) => onMessage(messaging, handler);
