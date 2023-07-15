import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  connectDatabaseEmulator,
} from "firebase/database";

const firebase = initializeApp({
  apiKey: "AIzaSyAC-MrvYQrVekLmIypYa1z4rjYq0aQe-HA",
  authDomain: "realtime-db-4615e.firebaseapp.com",
  databaseURL:
    "https://realtime-db-4615e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "realtime-db-4615e",
  storageBucket: "realtime-db-4615e.appspot.com",
  messagingSenderId: "242795240849",
  appId: "1:242795240849:web:076dd4c6986ceb9dd5ce30",
});

const db = getDatabase(firebase);
if (location.hostname === "localhost") {
  connectDatabaseEmulator(db, "127.0.0.1", 9000);
}
const users = ref(db, "users");
push(users, "Jeff");
