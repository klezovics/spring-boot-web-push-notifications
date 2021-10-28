async function init() {

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
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
  messaging.useServiceWorker(registration);

  try {
    await messaging.requestPermission();
  } catch (e) {
    console.log('Unable to get permission', e);
    return;
  }

  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data === 'newData') {
      showData();
    }
  });

  const currentToken = await messaging.getToken();
  fetch('/register', { method: 'post', body: currentToken });
  showData();

  messaging.onTokenRefresh(async () => {
    console.log('token refreshed');
    const newToken = await messaging.getToken();
    fetch('/register', { method: 'post', body: currentToken });
  });

}

async function showData() {
  const db = await getDb();
  const tx = db.transaction('jokes', 'readonly');
  const store = tx.objectStore('jokes');
  store.getAll().onsuccess = e => showJokes(e.target.result);
}

function showJokes(jokes) {
  const table = document.getElementById('outTable');

  jokes.sort((a, b) => parseInt(b.ts) - parseInt(a.ts));
  const html = [];
  jokes.forEach(j => {
    const date = new Date(parseInt(j.ts));
    html.push(`<div><div class="header">${date.toISOString()} ${j.id} (${j.seq})</div><div class="joke">${j.joke}</div></div>`);
  });
  table.innerHTML = html.join('');
}

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

init();
