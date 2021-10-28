importScripts('https://www.gstatic.com/firebasejs/7.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.10.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyDcOtiTrTHU9aO5xhzkoNVRpsFFr3TisBw",
  authDomain: "test-browser-notificatio-73561.firebaseapp.com",
  projectId: "test-browser-notificatio-73561",
  storageBucket: "test-browser-notificatio-73561.appspot.com",
  messagingSenderId: "670007743519",
  appId: "1:670007743519:web:42e1c5a23c614f5023f12a",
  measurementId: "G-PGW2WNW6LN"
});

const messaging = firebase.messaging();
messaging.usePublicVapidKey('BA5SQjqzuGnfPua1I_U7TI_4jVe9JiwpM1c3j7j3bd_uxLxlD-CWBO8nWmbeqfl_8zNdVpxdQnEFq-7_lSPdumo');

self.addEventListener('push', async event => {
	const db = await getDb();
	const tx = this.db.transaction('jokes', 'readwrite');
	const store = tx.objectStore('jokes');

	const data = event.data.json().data;
	data.id = parseInt(data.id);
	store.put(data);

	tx.oncomplete = async e => {
		const allClients = await clients.matchAll({ includeUncontrolled: true });
		for (const client of allClients) {
			client.postMessage('newData');
		}
	};
});

async function getDb() {
	if (this.db) {
		return Promise.resolve(this.db);
	}

	return new Promise(resolve => {
		const openRequest = indexedDB.open("Chuck", 1);

		openRequest.onupgradeneeded = event => {
			const db = event.target.result;
			db.createObjectStore('jokes', { keyPath: 'id' });
		};

		openRequest.onsuccess = event => {
			this.db = event.target.result;
			resolve(this.db);
		}
	});
}


messaging.setBackgroundMessageHandler(function(payload) {
  const notificationTitle = 'Background Title (client)';
  const notificationOptions = {
    body: 'Background Body (client)',
    icon: '/mail.png'
  };

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});


const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
	'/index.html',
	'/index.js',
	'/mail.png',
	'/mail2.png',
	'/manifest.json'
];

self.addEventListener('install', event => {
	event.waitUntil(caches.open(CACHE_NAME)
		.then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request)
			.then(response => {
				if (response) {
					return response;
				}
				return fetch(event.request);
			}
			)
	);
});


