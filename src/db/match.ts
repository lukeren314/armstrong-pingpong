import db from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { type Match } from "./types";
import { convertPlayer, getPlayer, updatePlayerPoints } from "./player";
const K_FACTOR = 32;
const MAX_SCORE = 11;

async function getMatches(): Promise<Match[]> {
  const matchesRef = collection(db, "matches");
  const q = query(matchesRef, orderBy("timestamp", "asc"));
  const matchesSnapshot = await getDocs(q);
  const matchesList = matchesSnapshot.docs.map((doc) => doc.data());
  const matches = convertMatches(matchesList);
  return matches;
}

function convertMatches(documentData: any[]): Match[] {
  return documentData.map((doc) => convertMatch(doc));
}

function convertMatch(documentData: any): Match {
  return {
    player1: documentData.player1,
    player2: documentData.player2,
    score1: documentData.score1,
    score2: documentData.score2,
    timestamp: documentData.timestamp,
    player1OldPoints: documentData.player1OldPoints,
    player2OldPoints: documentData.player2OldPoints,
    player1NewPoints: documentData.player1NewPoints,
    player2NewPoints: documentData.player2NewPoints,
  };
}

async function addMatch(
  player1Name: string,
  player2Name: string,
  score1: number,
  score2: number
) {
  const matchesRef = collection(db, "matches");
  const player1 = await getPlayer(player1Name);
  const player2 = await getPlayer(player2Name);
  const player1OldPoints = player1.points;
  const player2OldPoints = player2.points;

  const { player1NewPoints, player2NewPoints } = calculateNewPoints(
    player1OldPoints,
    player2OldPoints,
    score1,
    score2
  );
  updatePlayerPoints(player1Name, player1NewPoints);
  updatePlayerPoints(player2Name, player2NewPoints);

  const newMatch = await addDoc(matchesRef, {
    player1: player1,
    player2: player2,
    score1: score1,
    score2: score2,
    timestamp: Date.now(),
    player1OldPoints: player1OldPoints,
    player2OldPoints: player2OldPoints,
    player1NewPoints: player1NewPoints,
    player2NewPoints: player2NewPoints,
  });

  const match = convertMatch(newMatch);
  return match;
}

function calculateNewPoints(
  player1OldPoints: number,
  player2OldPoints: number,
  score1: number,
  score2: number
): { player1NewPoints: number; player2NewPoints: number } {
  // calculate the new points using elo
  const K = K_FACTOR; // K-factor determines the sensitivity of rating changes
  const expectedScore1 =
    1 / (1 + Math.pow(10, (player2OldPoints - player1OldPoints) / 400));
  const expectedScore2 =
    1 / (1 + Math.pow(10, (player1OldPoints - player2OldPoints) / 400));

  const actualScore1 = score1 > score2 ? 1 : score1 < score2 ? 0 : 0.5;
  const actualScore2 = 1 - actualScore1;

  const player1NewPoints =
    player1OldPoints + K * (actualScore1 - expectedScore1);
  const player2NewPoints =
    player2OldPoints + K * (actualScore2 - expectedScore2);

  // round to nearest int
  const player1NewPointsRounded = Math.round(player1NewPoints);
  const player2NewPointsRounded = Math.round(player2NewPoints);

  // if below zero, return 0
  return {
    player1NewPoints: Math.max(player1NewPointsRounded, 0),
    player2NewPoints: Math.max(player2NewPointsRounded, 0),
  };
}

export { getMatches, addMatch, MAX_SCORE };
