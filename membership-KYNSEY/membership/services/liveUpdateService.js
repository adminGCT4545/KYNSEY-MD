// Placeholder for connected clients
const clients = new Set();

export function addClient(client) {
    clients.add(client);
}

export async function initNotificationListener() {
    return null; // Simplified implementation
}
