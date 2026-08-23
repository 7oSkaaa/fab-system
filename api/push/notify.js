/* global process */
import { adminAuth, adminDb, adminMessaging } from './_firebaseAdmin.js';

const invalidTokenCodes = new Set([
    'messaging/invalid-registration-token',
    'messaging/registration-token-not-registered',
]);

const protectedSuperAdminEmails = new Set(
    [
        process.env.SUPER_ADMIN_EMAIL,
        'wahab@acpc.global',
    ]
        .filter(Boolean)
        .map(email => email.toLowerCase())
);

const getBearerToken = request => {
    const authorization = request.headers.authorization || '';
    return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
};

const isAuthorizedStaff = async email => {
    if (protectedSuperAdminEmails.has(email?.toLowerCase())) return true;
    const snapshot = await adminDb.doc('settings/users').get();
    return (snapshot.data()?.list || []).some(user =>
        user.email?.toLowerCase() === email?.toLowerCase() && ['superAdmin', 'admin', 'judge'].includes(user.role)
    );
};

export default async function handler(request, response) {
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });

    try {
        const decodedToken = await adminAuth.verifyIdToken(getBearerToken(request));
        if (!await isAuthorizedStaff(decodedToken.email)) {
            return response.status(403).json({ error: 'Only authorized judges and admins can send alerts.' });
        }

        const { balloonId } = request.body || {};
        if (typeof balloonId !== 'string' || !balloonId) {
            return response.status(400).json({ error: 'A balloon ID is required.' });
        }

        const balloonSnapshot = await adminDb.doc(`balloons/${balloonId}`).get();
        if (!balloonSnapshot.exists) return response.status(404).json({ error: 'Balloon not found.' });
        const balloon = balloonSnapshot.data();
        const [teamSnapshot, problemSnapshot, siteSnapshot, subscriptionsSnapshot] = await Promise.all([
            adminDb.doc(`teams/${balloon.teamId}`).get(),
            adminDb.doc(`problems/${balloon.problemId}`).get(),
            adminDb.doc(`sites/${balloon.siteId}`).get(),
            adminDb.collection('pushSubscriptions').get(),
        ]);
        const team = teamSnapshot.data();
        const problem = problemSnapshot.data();
        const site = siteSnapshot.data();
        const body = `${team?.displayName || team?.name || 'Unknown team'} · ${problem?.fullName || `Problem ${problem?.name || '?'}`}${site?.name ? ` · ${site.name}` : ''}`;
        const subscriptions = subscriptionsSnapshot.docs.map(document => ({ ref: document.ref, ...document.data() }));
        const protocol = request.headers['x-forwarded-proto'] || 'https';
        const host = request.headers['x-forwarded-host'] || request.headers.host;
        const origin = `${protocol}://${host}`;

        for (const audience of ['volunteer', 'media', 'operations']) {
            const group = subscriptions.filter(subscription => subscription.preferredAudience === audience && subscription.token);
            for (let start = 0; start < group.length; start += 500) {
                const batch = group.slice(start, start + 500);
                const result = await adminMessaging.sendEachForMulticast({
                    tokens: batch.map(subscription => subscription.token),
                    notification: { title: '🎈 New first accepted balloon', body },
                    webpush: {
                        headers: { Urgency: 'high', TTL: '3600' },
                        notification: {
                            icon: `${origin}/favicon.png`,
                            badge: `${origin}/favicon.png`,
                            requireInteraction: true,
                            renotify: true,
                            silent: false,
                            tag: `balloon-${balloonId}`,
                            vibrate: [250, 120, 250, 120, 400],
                        },
                        fcmOptions: { link: `${origin}/operations` },
                    },
                });
                const invalidSubscriptions = result.responses.flatMap((item, index) =>
                    !item.success && invalidTokenCodes.has(item.error?.code) ? [batch[index]] : []
                );
                if (invalidSubscriptions.length) {
                    const cleanup = adminDb.batch();
                    invalidSubscriptions.forEach(subscription => cleanup.delete(subscription.ref));
                    await cleanup.commit();
                }
            }
        }

        return response.status(200).json({ sent: true });
    } catch (error) {
        console.error('Push notification failed:', error);
        const status = error.code?.startsWith('auth/') ? 401 : 500;
        return response.status(status).json({ error: status === 401 ? 'Authentication required.' : 'Could not send push notifications.' });
    }
}
