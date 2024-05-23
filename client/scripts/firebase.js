// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBw8X7vJ9HnyAs1QJSFCb-9IjvOqYZqkcw",
    authDomain: "spaces-23336.firebaseapp.com",
    projectId: "spaces-23336",
    storageBucket: "spaces-23336.appspot.com",
    messagingSenderId: "868299178198",
    appId: "1:868299178198:web:524cd80fce114330850977",
    measurementId: "G-D9M0VW8LF3",
    databaseURL: "https://spaces-23336-default-rtdb.asia-southeast1.firebasedatabase.app"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
var storage = firebase.storage();

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
} else {
    firebase.app(); // 如果已經初始化，就使用現有的實例
}
        