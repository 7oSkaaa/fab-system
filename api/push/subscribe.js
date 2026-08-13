import { createHash } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb, adminMessaging } from './_firebaseAdmin.js';

export default async function handler(request, response) {
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });

    const { token, audience, userAgent } = request.body || {};
    if (typeof token !== 'string' || token.length < 40 || !['volunteer', 'media', 'operations'].includes(audience)) {
        return response.status(400).json({ error: 'Invalid push subscription.' });
    }

    try {
        await adminMessaging.send({ token, data: { probe: 'subscription' } }, true);
        const subscriptionId = createHash('sha256').update(token).digest('hex');
        await adminDb.doc(`pushSubscriptions/${subscriptionId}`).set({
            token,
            audiences: FieldValue.arrayUnion(audience),
            preferredAudience: audience,
            updatedAt: Date.now(),
            userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 500) : '',
        }, { merge: true });
        return response.status(200).json({ subscribed: true });
    } catch (error) {
        console.error('Push subscription failed:', error);
        return response.status(500).json({ error: 'Could not register this device for push notifications.' });
    }
}
