// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('js/firebase-5.7.0-app.js');
importScripts('js/firebase-5.7.0-messaging.js');
importScripts('js/environment.js');

console.log(env);

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp(env.firebaseConfig);

// // Retrieve an instance of Firebase Messaging so that it can handle background
// // messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
	// console.log('[firebase-messaging-sw.js] Received background message ', payload);
// 	// Customize notification here
	var notificationTitle = 'Background Message Title';
	var notificationOptions = {
		body: 'Background Message body.'
	};
	// chrome.notifications.create("from_options", {
	// 	type: 'basic',
	// 	iconUrl: 'images/icon_notif.png',
	// 	title: 'From Options',
	// 	message: 'Test msg',
	// 	priority: 1
	// });
	// console.log("Last error:", chrome.runtime.lastError);

	return self.registration.showNotification(notificationTitle,notificationOptions);
});