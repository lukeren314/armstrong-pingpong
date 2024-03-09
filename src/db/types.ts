type Player = {
  name: string;
  points: number;
};

type Match = {
  player1: Player;
  player2: Player;
  score1: number;
  score2: number;
  timestamp: number;
  player1OldPoints: number;
  player2OldPoints: number;
  player1NewPoints: number;
  player2NewPoints: number;
};


export { type Player, type Match };