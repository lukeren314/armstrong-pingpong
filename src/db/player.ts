import db from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  where,
  updateDoc,
} from "firebase/firestore";
import { type Player } from "./types";

const DEFAULT_POINTS = 100;

async function getPlayersRanked(): Promise<Player[]> {
  const playersRef = collection(db, "players");
  const q = query(playersRef, orderBy("points", "desc"));
  const playersSnapshot = await getDocs(q);
  const playersList = playersSnapshot.docs.map((doc) => doc.data());
  const players = convertPlayers(playersList);
  return players;
}

async function isPlayerExists(playerName: string): Promise<boolean> {
  const playersRef = collection(db, "players");
  const q = query(playersRef, where("name", "==", playerName));
  const querySnapshot = await getDocs(q);
  return querySnapshot.size > 0;
}

async function getPlayer(playerName: string): Promise<Player> {
  const playersRef = collection(db, "players");
  const q = query(playersRef, where("name", "==", playerName));
  const playerSnapshot = await getDocs(q);
  const player = convertPlayer(playerSnapshot.docs[0].data());
  return player;
}

async function addPlayer(playerName: string): Promise<Player> {
  // store a list of cities in your database
  const playersRef = collection(db, "players");
  const newPlayer = await addDoc(playersRef, {
    name: playerName,
    points: DEFAULT_POINTS,
  });
  const player = convertPlayer(newPlayer);
  return player;
}

function convertPlayers(documentData: any[]): Player[] {
  return documentData.map((doc) => convertPlayer(doc));
}

function convertPlayer(documentData: any): Player {
  return {
    name: documentData.name,
    points: documentData.points,
  };
}

async function updatePlayerPoints(playerName: string, points: number) {
  const playersRef = collection(db, "players");
  const q = query(playersRef, where("name", "==", playerName));
  const playerSnapshot = await getDocs(q);
  const playerRef = playerSnapshot.docs[0].ref;
  await updateDoc(playerRef, { points: points });
}

export {
  isPlayerExists,
  getPlayer,
  getPlayersRanked,
  addPlayer,
  convertPlayer,
  updatePlayerPoints,
};
