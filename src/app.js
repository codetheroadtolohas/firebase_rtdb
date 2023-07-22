// Import firebase/app
import { initializeApp } from "firebase/app";

// Import db functionalities
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

// Import auth functionalities
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  connectAuthEmulator,
  EmailAuthProvider,
  linkWithCredential,
} from "firebase/auth";

// Import in-house ultility functionalities
import { mouse, Particle } from "./particle";

// Set this firebase app config
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

const inputEmail = document.querySelector("#email");
const inputPassword = document.querySelector("#password");
const btnSignUp = document.querySelector("#sign-up");
const btnSignIn = document.querySelector("#sign-in");
const btnSignOut = document.querySelector("#sign-out");
const colors = ["grey", "lightblue", "lightgreen", "maroon"];
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let playerId;
let playerRef;
let particles = {};

// Init game
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

// Add current player (anonymous or signed-in) to db
onAuthStateChanged(auth, (player) => {
  console.log(auth.currentUser.uid);
  let currentColor = colors[Math.floor(Math.random() * colors.length + 1)];
  playerId = player.uid;
  playerRef = ref(db, "players/" + playerId);
  set(playerRef, {
    id: playerId,
    color: currentColor,
    x: Math.floor(Math.random() * 100 + 1),
    y: Math.floor(Math.random() * 100 + 1),
  });

  onDisconnect(playerRef).remove();

  initGame();
});

// Sign-in anonymously
signInAnonymously(auth).catch((error) => {
  console.log(error.code);
  console.log(error.message);
});

// Upgrade current anonymous user to a permanent account
btnSignUp.addEventListener("click", function () {
  let email = inputEmail.value;
  let password = inputPassword.value;
  let credential = EmailAuthProvider.credential(email, password);

  linkWithCredential(auth.currentUser, credential)
    .then((usercred) => {
      console.log(usercred.user.uid);
    })
    .catch((error) => {
      console.log("Error upgrading anonymous account", error);
    });
});
