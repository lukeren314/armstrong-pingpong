import {
  AppShell,
  Burger,
  Button,
  Grid,
  GridCol,
  Group,
  Loader,
  NumberInput,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Match, Player } from "./db/types";
import { getPlayersRanked, addPlayer, isPlayerExists } from "./db/player";
import { useEffect, useState } from "react";
import { MAX_SCORE, addMatch, getMatches } from "./db/match";
import Section from "./components/Section";
export function App() {
  const [opened, { toggle }] = useDisclosure();
  const [playerName, setPlayerName] = useState<string>("");
  const [playersLoading, setPlayersLoading] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState<boolean>(false);

  const [player1Name, setPlayer1Name] = useState<string>("");
  const [player2Name, setPlayer2Name] = useState<string>("");
  const [score1, setScore1] = useState<string | number>(0);
  const [score2, setScore2] = useState<string | number>(0);

  async function loadPlayers() {
    setPlayersLoading(true);
    const players = await getPlayersRanked();
    setPlayers(players);
    setPlayersLoading(false);
  }
  useEffect(() => {
    loadPlayers();
  }, []);

  async function addNewPlayer(playerName: string) {
    if (playersLoading) {
      return;
    }
    if (await isPlayerExists(playerName)) {
      alert("Player name already exists");
      return;
    }
    setPlayersLoading(true);
    await addPlayer(playerName);
    loadPlayers();
    setPlayersLoading(false);
  }

  async function loadMatches() {
    setMatchesLoading(true);
    const matches = await getMatches();
    // get first 50 matches
    setMatches(matches.slice(0, 50));
    setMatchesLoading(false);
  }

  useEffect(() => {
    loadMatches();
  }, []);

  async function addNewMatch(
    player1Name: string,
    player2Name: string,
    score1: number | string,
    score2: number | string
  ) {
    if (matchesLoading) {
      return;
    }
    if (player1Name === "" || player2Name === "") {
      alert("Player names cannot be empty");
      return;
    }
    if (player1Name === player2Name) {
      alert("Players cannot be the same");
      return;
    }
    if (!(await isPlayerExists(player1Name))) {
      alert("Player 1 does not exist");
      return;
    }
    if (!(await isPlayerExists(player2Name))) {
      alert("Player 2 does not exist");
      return;
    }
    if (typeof score1 !== "number" || typeof score2 !== "number") {
      alert("Score cannot be empty");
      return;
    }
    if (score1 < 0 || score2 < 0) {
      alert("Score cannot be negative");
      return;
    }
    if (score1 > MAX_SCORE || score2 > MAX_SCORE) {
      alert(`Score cannot be greater than ${MAX_SCORE}`);
      return;
    }
    if (score1 === score2) {
      alert("Scores cannot be equal");
      return;
    }
    setMatchesLoading(true);
    await addMatch(player1Name, player2Name, score1, score2);
    loadMatches();
    loadPlayers();
    setMatchesLoading(false);
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <div>🏓 Armstrong Ping Pong</div>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack>
          <Section header="Add New Match">
            <Stack p={"md"}>
              <Text>Player 1</Text>
              <TextInput
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
              />
              <Text>Player 2</Text>
              <TextInput
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
              />
              <Text>Score 1</Text>
              <NumberInput value={score1} onChange={setScore1} />
              <Text>Score 2</Text>
              <NumberInput value={score2} onChange={setScore2} />
              <Button
                onClick={async () =>
                  await addNewMatch(player1Name, player2Name, score1, score2)
                }
              >
                Add
              </Button>
            </Stack>
          </Section>
          <Section header="Add New Player">
            <Stack p={"md"}>
              <Text>Name</Text>
              <TextInput
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
              <Button onClick={async () => await addNewPlayer(playerName)}>
                Add
              </Button>
            </Stack>
          </Section>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>
        <Grid>
          <GridCol span={6}>
            <Section header="Ranking">
              {playersLoading && <Loader />}
              {players.length === 0 && <Text>No players found</Text>}
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Rank</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Points</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {players.map((player, index) => (
                    <Table.Tr key={player.name}>
                      <Table.Td>{index + 1}</Table.Td>
                      <Table.Td>{player.name}</Table.Td>
                      <Table.Td>{player.points}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Section>
          </GridCol>
          <GridCol span={6}>
            <Section header="Match History (last 50 games)">
              {matchesLoading && <Loader />}
              {matches.length === 0 ? (
                <Text p={12}>No matches found</Text>
              ) : (
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Player 1</Table.Th>
                      <Table.Th>Player 2</Table.Th>
                      <Table.Th>Score 1</Table.Th>
                      <Table.Th>Score 2</Table.Th>
                      <Table.Th>New Points 1</Table.Th>
                      <Table.Th>New Points 2</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {matches.map((match, index) => (
                      <Table.Tr key={index}>
                        <Table.Td>{match.player1.name}</Table.Td>
                        <Table.Td>{match.player2.name}</Table.Td>
                        <Table.Td>{match.score1}</Table.Td>
                        <Table.Td>{match.score2}</Table.Td>
                        <Table.Td>
                          {match.player1NewPoints} (
                          {match.player1OldPoints <= match.player1NewPoints
                            ? "+"
                            : ""}
                          {match.player1NewPoints - match.player1OldPoints})
                        </Table.Td>
                        <Table.Td>
                          {match.player2NewPoints} (
                          {match.player2OldPoints <= match.player2NewPoints
                            ? "+"
                            : ""}
                          {match.player2NewPoints - match.player2OldPoints})
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Section>
          </GridCol>
        </Grid>
      </AppShell.Main>
    </AppShell>
  );
}
export default App;
