self.addEventListener('notificationclick', event => {
    event.notification.close();
    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            const existingClient = windowClients.find(client => client.url === targetUrl);
            if (existingClient) return existingClient.focus();
            return clients.openWindow(targetUrl);
        })
    );
});
