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
  onChildRemoved,
} from "firebase/database";

// Import auth functionalities
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  signOut,
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

// App config
const firebase = initializeApp(config);
const db = getDatabase();
const auth = getAuth();

if (location.hostname === "localhost") {
  connectDatabaseEmulator(db, "127.0.0.1", 9000);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
}

// DOM elements
const inputEmail = document.querySelector("#email");
const inputPassword = document.querySelector("#password");
const btnSignUp = document.querySelector("#sign-up");
const btnSignIn = document.querySelector("#sign-in");
const btnSignOut = document.querySelector("#sign-out");
const colors = ["grey", "lightblue", "lightgreen", "maroon"];
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const currentlyOnlinePlayers = document.querySelector(
  "#currently-online-players"
);

// player state
const players = {};

// DB refs - current player
let playerId;
let playerRef;
let playerConnectionsRef;
let playerPositionRef;

// DB refs - top level
const playersRef = ref(db, "players");
const playersConnectionsRef = ref(db, "playersConnections");
const playersPositionRef = ref(db, "playersPosition");
const playerConnectedRef = ref(db, ".info/connected");

function initGame() {
  // Initiate DB ref for current player
  playerConnectionsRef = child(playersConnectionsRef, playerId);

  // Initiate current player state
  players[playerId] = {};

  onValue(playerConnectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      let con = push(playerConnectionsRef);
      onDisconnect(con).remove();
      set(con, true);
    }
  });

  onChildAdded(playersConnectionsRef, (snapshot) => {
    const row = document.createElement("tr");
    const onlinePlayerId = document.createElement("td");

    row.setAttribute("data-onlineplayer-id", playerId);
    onlinePlayerId.textContent = playerId;

    row.appendChild(onlinePlayerId);
    currentlyOnlinePlayers.appendChild(row);
  });

  // onChildAdded();
  // onValue();
  // onDisconnect();
  // onChildRemoved(playersRef);
}

onAuthStateChanged(auth, (player) => {
  let isAnonymous = player.isAnonymous;

  playerId = player.uid;
  playerRef = child(playersRef, playerId);
  playerPositionRef = child(playersPositionRef, playerId);

  if (isAnonymous) {
    console.log("Welcome, guest!");
    console.log(playerId);

    set(playerPositionRef, {
      x: Math.floor(Math.random() * canvas.width + 1),
      y: Math.floor(Math.random() * canvas.height + 1),
    });
  } else {
    console.log("Welcome, " + playerId);

    get(playerPositionRef).then((snapshot) => {
      if (!snapshot.exists()) {
        set(playerPositionRef, {
          x: 30,
          y: 20,
        });
      } else {
        console.log("playerPositionRef Data exists!");
      }
    });
  }

  initGame();
});

signInAnonymously(auth);

btnSignIn.addEventListener("click", function () {
  let email = inputEmail.value;
  let password = inputPassword.value;

  signOut(auth);
  signInWithEmailAndPassword(auth, email, password);
});

btnSignUp.addEventListener("click", function () {
  let email = inputEmail.value;
  let password = inputPassword.value;
  let credential = EmailAuthProvider.credential(email, password);

  linkWithCredential(auth.currentUser, credential).then((userCred) => {
    const user = userCred.user;
    console.log("Anonymous account successfully upgraded: ", user);
  });
});
