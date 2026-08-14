import type { CampaignStateV5, PlayerId } from "./campaignState.ts";
import type { GameRegistryV2, PlayerProfile } from "./model.ts";

export function addPlayerToRegistryV2(
  registry: GameRegistryV2,
  player: PlayerProfile,
): GameRegistryV2 {
  return {
    ...registry,
    players: [...registry.players, player],
    lastActivePlayerId: player.id,
  };
}

export function selectPlayerInRegistryV2(
  registry: GameRegistryV2,
  playerId: PlayerId,
): GameRegistryV2 {
  return { ...registry, lastActivePlayerId: playerId };
}

export function activateCampaignV2(
  registry: GameRegistryV2,
  playerId: PlayerId,
  game: CampaignStateV5,
  activityAt: string,
): GameRegistryV2 {
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

export function storeCampaignV2(
  registry: GameRegistryV2,
  game: CampaignStateV5,
): GameRegistryV2 {
  return {
    ...registry,
    games: { ...registry.games, [game.playerId]: game },
  };
}

export function removePlayerAndCampaignV2(
  registry: GameRegistryV2,
  playerId: PlayerId,
): GameRegistryV2 {
  const players = registry.players.filter((player) => player.id !== playerId);
  const games = { ...registry.games };
  delete games[playerId];
  const lastActivePlayerId =
    registry.lastActivePlayerId === playerId
      ? players[0]?.id ?? null
      : registry.lastActivePlayerId;
  return { ...registry, players, games, lastActivePlayerId };
}

export function stampCampaignModificationV5(
  game: CampaignStateV5,
  modifiedAt: string,
): CampaignStateV5 {
  return game.updatedAt === modifiedAt
    ? game
    : { ...game, updatedAt: modifiedAt };
}
