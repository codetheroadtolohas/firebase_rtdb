import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  connectDatabaseEmulator,
} from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { Particle } from "./particle";

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
const db = getDatabase(firebase);

const colors = ["grey", "lightyellow", "lightgreen", "maroon"];
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let playerId;
let playerRef;
let playersRef;

// sign-in anonymously
signInAnonymously(auth)
  .then(() => {})
  .catch((error) => {
    console.log(error.code);
    console.log(error.message);
  });

// update database
onAuthStateChanged(auth, (player) => {
  playerId = player.uid;
  console.log("playerId: " + playerId);
  playerRef = ref(db, "players/" + playerId);
  set(playerRef, {
    id: playerId,
    name: player.displayName,
    color: colors[Math.floor(Math.random() * colors.length + 1)],
    x: Math.floor(Math.random() * 100 + 1),
    y: Math.floor(Math.random() * 100 + 1),
  });
});

// init game and draw all particles
playersRef = ref(db, "players/");
onValue(playersRef, (snapshot) => {
  const data = Object.entries(snapshot.val());
  for (let i = 0; i < data.length; i++) {
    let particle = new Particle(data[i][1].x, data[i][1].y);
    ctx.fillStyle = data[i][1].color;
    particle.draw(ctx);
  }
});

// if (location.hostname === "localhost") {
//   connectDatabaseEmulator(db, "127.0.0.1", 9000);
// }
// const users = ref(db, "users");
// push(users, "Jeff");
