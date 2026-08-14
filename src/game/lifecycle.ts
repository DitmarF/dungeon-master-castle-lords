import type {
  GameRegistry,
  GameSave,
  PlayerId,
  PlayerProfile,
} from "./model.ts";

export function addPlayerToRegistry(
  registry: GameRegistry,
  player: PlayerProfile,
): GameRegistry {
  return {
    ...registry,
    players: [...registry.players, player],
    lastActivePlayerId: player.id,
  };
}

export function selectPlayerInRegistry(
  registry: GameRegistry,
  playerId: PlayerId,
): GameRegistry {
  return { ...registry, lastActivePlayerId: playerId };
}

export function activateCampaign(
  registry: GameRegistry,
  playerId: PlayerId,
  game: GameSave,
  activityAt: string,
): GameRegistry {
  return {
    ...registry,
    players: registry.players.map((player) =>
      player.id === playerId
        ? { ...player, lastPlayedAt: activityAt }
        : player,
    ),
    games: { ...registry.games, [playerId]: game },
    lastActivePlayerId: playerId,
  };
}

export function storeCampaign(
  registry: GameRegistry,
  game: GameSave,
): GameRegistry {
  return {
    ...registry,
    games: { ...registry.games, [game.playerId]: game },
  };
}

export function removePlayerAndCampaign(
  registry: GameRegistry,
  playerId: PlayerId,
): GameRegistry {
  const players = registry.players.filter((player) => player.id !== playerId);
  const games = { ...registry.games };
  delete games[playerId];
  const lastActivePlayerId =
    registry.lastActivePlayerId === playerId
      ? players[0]?.id ?? null
      : registry.lastActivePlayerId;

  return { ...registry, players, games, lastActivePlayerId };
}

export function stampCampaignModification(
  game: GameSave,
  modifiedAt: string,
): GameSave {
  return game.updatedAt === modifiedAt
    ? game
    : { ...game, updatedAt: modifiedAt };
}
