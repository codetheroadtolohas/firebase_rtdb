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

// DB refs - top level
const playersRef = ref(db, "players");
const playersConnectionsRef = ref(db, "playersConnections");
const playerConnectedRef = ref(db, ".info/connected");

function initGame(isAnonymous) {
  playerConnectionsRef = child(playersConnectionsRef, playerId);

  onChildAdded(playersConnectionsRef, (snapshot) => {
    players[snapshot.key] = {};
    let row = document.createElement("tr");
    let onlinePlayer = document.createElement("td");

    onlinePlayer.textContent = snapshot.key;
    row.appendChild(onlinePlayer);
    row.setAttribute("data-online-player", snapshot.key);
    currentlyOnlinePlayers.appendChild(row);
  });

  onValue(playersConnectionsRef, (snapshot) => {
    let snapshotKeys = Object.keys(snapshot.val());
    let playerKeys = Object.keys(players);

    console.log(snapshotKeys);
    console.log(playerKeys);

    playerKeys.forEach(function (playerKey) {
      if (!snapshotKeys.includes(playerKey)) {
        let offlinePlayer = document.querySelector(
          'tr[data-online-player="' + playerKey + '"]'
        );
        currentlyOnlinePlayers.removeChild(offlinePlayer);
      }
    });
  });

  // onChildRemoved(playersConnectionsRef, (snapshot) => {
  //   console.log(playerConnectionsRef);
  //   // let offlinePlayer = document.querySelector(
  //   //   'tr[data-online-player=" + snapshot.key + "]'
  //   // );
  //   // console.log(offlinePlay);
  //   // let offlinePlayer = document.querySelector(
  //   //   '`tr[data-online-player="${snapshot.key}"]`'
  //   // );
  //   // currentlyOnlinePlayers.removeChild(offlinePlayer);
  //   // delete players[snapshot.key];
  // });

  onValue(playerConnectedRef, (snapshot) => {
    if (snapshot.val() === true) {
      let con = push(playerConnectionsRef);
      onDisconnect(con).remove();
      set(con, true);
    }
  });

  // onChildAdded();
  // onValue();
  // onDisconnect();
}

onAuthStateChanged(auth, (player) => {
  let isAnonymous = player.isAnonymous;
  playerId = player.uid;
  playerRef = child(playersRef, playerId);

  if (isAnonymous) {
    console.log("Welcome, guest!");
    console.log(playerId);
    set(playerRef, true);
  } else {
    console.log("Welcome, " + playerId);
    get(playerRef).then((snapshot) => {
      if (snapshot.val() === null) {
        set(playerRef, true);
      }
    });
  }

  initGame(isAnonymous);
});

signInAnonymously(auth);

btnSignIn.addEventListener("click", function () {
  let email = inputEmail.value;
  let password = inputPassword.value;

  signInWithEmailAndPassword(auth, email, password);
});
