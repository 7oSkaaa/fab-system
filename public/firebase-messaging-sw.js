/* global clients, importScripts */
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const targetUrl = event.notification.data?.FCM_MSG?.fcmOptions?.link
        || event.notification.data?.url
        || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            const existingClient = windowClients.find(client => client.url === targetUrl);
            if (existingClient) return existingClient.focus();
            return clients.openWindow(targetUrl);
        })
    );
});

/* global firebase */
importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging-compat.js');

const config = Object.fromEntries(new URL(self.location.href).searchParams);
firebase.initializeApp(config);
firebase.messaging();
