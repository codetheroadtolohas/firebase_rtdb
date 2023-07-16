import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  connectDatabaseEmulator,
} from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { Particle } from "./particle.js";

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

const auth = getAuth(firebase);
const db = getDatabase();

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const color = ["blue", "yellow", "red"];

onAuthStateChanged(auth, (user) => {
  // const users = ref(db, "users");
  // push(users, "Jeff");
  console.log("user's Id is " + user.uid);

  let init = {
    x: Math.random() * 100 + 1,
    y: Math.random() * 100 + 1,
    color: color[Math.floor(Math.random() * 2 + 1)],
  };
  let p = new Particle(init.x, init.y);
  p.draw(ctx, init.color);

  set(ref(db, "players/" + user.uid), init);
});

signInAnonymously(auth)
  .then(() => {})
  .catch((error) => {
    console.log(error.code);
    console.log(error.message);
  });

// const db = getDatabase(firebase);
// if (location.hostname === "localhost") {
//   connectDatabaseEmulator(db, "127.0.0.1", 9000);
// }
