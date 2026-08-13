/* global process */
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

const getServiceAccount = () => {
    const value = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!value) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured.');
    return JSON.parse(value);
};

const app = getApps()[0] || initializeApp({ credential: cert(getServiceAccount()) });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminMessaging = getMessaging(app);
