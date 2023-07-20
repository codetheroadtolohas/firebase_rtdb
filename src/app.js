import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  set,
  child,
  onValue,
  connectDatabaseEmulator,
  onChildAdded,
  onDisconnect,
  update,
  get,
} from "firebase/database";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  connectAuthEmulator,
} from "firebase/auth";
import { mouse, Particle } from "./particle";

const config = {
  apiKey: "AIzaSyAC-MrvYQrVekLmIypYa1z4rjYq0aQe-HA",
  authDomain: "realtime-db-4615e.firebaseapp.com",
  databaseURL:
    "https://realtime-db-4615e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "realtime-db-4615e",
  storageBucket: "realtime-db-4615e.appspot.com",
  messagingSenderId: "242795240849",
  appId: "1:242795240849:web:076dd4c6986ceb9dd5ce30",
};

const firebase = initializeApp(config);
const db = getDatabase();
const auth = getAuth();

if (location.hostname === "localhost") {
  connectDatabaseEmulator(db, "127.0.0.1", 9000);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}

const colors = ["grey", "lightblue", "lightgreen", "maroon"];
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let playerId;
let playerRef;
let particles = {};

function initGame() {
  let playersRef = ref(db, "players/");

  document.addEventListener("keyup", function (e) {
    let updates = {};

    if (e.key === "ArrowRight") {
      updates["/" + playerId + "/x"] = particles[playerId].x + 5;
      get(child(playerRef, "/x")).then((snapshot) => {
        console.log(snapshot.val());
      });
      update(playersRef, updates);
    }
  });

  onValue(playersRef, (snapshot) => {
    let data = Object.entries(snapshot.val());
    data.forEach(function (datum) {
      if (particles[datum[0]]) {
        particles[datum[0]].x = datum[1].x;
        particles[datum[0]].y = datum[1].y;
      } else {
        delete particles[datum[0]];
      }
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    data.forEach(function (datum) {
      particles[datum[0]].draw(ctx);
    });
  });

  onChildAdded(playersRef, (snapshot) => {
    let player = snapshot.val();
    if (player.id === playerId) {
      player.color = "black";
    }
    let particle = new Particle(player.id, player.x, player.y, player.color);
    particles[player.id] = particle;
    particle.draw(ctx);
  });
}

// add current player to database
onAuthStateChanged(auth, (player) => {
  let currentColor;
  playerId = player.uid;
  console.log(playerId);
  playerRef = ref(db, "players/" + playerId);
  currentColor = colors[Math.floor(Math.random() * colors.length + 1)];
  set(playerRef, {
    id: playerId,
    color: currentColor,
    x: Math.floor(Math.random() * 100 + 1),
    y: Math.floor(Math.random() * 100 + 1),
  });

  onDisconnect(playerRef).remove();

  initGame();
});

// sign-in anonymously
signInAnonymously(auth).catch((error) => {
  console.log(error.code);
  console.log(error.message);
});
