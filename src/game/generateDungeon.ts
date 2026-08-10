import type {
  CellPosition,
  DungeonRoom,
  DungeonState,
} from "./campaignState.ts";

const COLUMNS = 20;
const ROWS = 12;

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function integer(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function keyOf(position: CellPosition): string {
  return `${position.x},${position.y}`;
}

function centerOf(room: DungeonRoom): CellPosition {
  return {
    x: room.x + Math.floor(room.width / 2),
    y: room.y + Math.floor(room.height / 2),
  };
}

export function discoverAround(
  position: CellPosition,
  columns: number,
  rows: number,
  radius = 1,
): string[] {
  const cells: string[] = [];
  for (let y = position.y - radius; y <= position.y + radius; y += 1) {
    for (let x = position.x - radius; x <= position.x + radius; x += 1) {
      if (x >= 0 && x < columns && y >= 0 && y < rows) {
        cells.push(keyOf({ x, y }));
      }
    }
  }
  return cells;
}

export function createDungeonLevel(seed = Math.floor(Math.random() * 2_147_483_647)): DungeonState {
  const random = mulberry32(seed);
  const tiles = Array.from({ length: ROWS }, () => Array(COLUMNS).fill("#"));
  const rooms: DungeonRoom[] = [];

  for (let index = 0; index < 5; index += 1) {
    const bandStart = index * 4;
    const width = integer(random, 3, 4);
    const height = integer(random, 3, 4);
    const x = bandStart + integer(random, 0, 4 - width);
    const upperRoom = index % 2 === 1;
    const y = upperRoom
      ? integer(random, 1, Math.max(1, 4 - height + 1))
      : integer(random, 7, Math.max(7, ROWS - height - 1));

    rooms.push({ id: index + 1, x, y, width, height });
  }

  function carve(x: number, y: number) {
    if (x >= 0 && x < COLUMNS && y >= 0 && y < ROWS) tiles[y][x] = ".";
  }

  rooms.forEach((room) => {
    for (let y = room.y; y < room.y + room.height; y += 1) {
      for (let x = room.x; x < room.x + room.width; x += 1) carve(x, y);
    }
  });

  function corridor(from: CellPosition, to: CellPosition) {
    const horizontalFirst = random() > 0.5;
    if (horizontalFirst) {
      for (let x = Math.min(from.x, to.x); x <= Math.max(from.x, to.x); x += 1) carve(x, from.y);
      for (let y = Math.min(from.y, to.y); y <= Math.max(from.y, to.y); y += 1) carve(to.x, y);
    } else {
      for (let y = Math.min(from.y, to.y); y <= Math.max(from.y, to.y); y += 1) carve(from.x, y);
      for (let x = Math.min(from.x, to.x); x <= Math.max(from.x, to.x); x += 1) carve(x, to.y);
    }
  }

  for (let index = 1; index < rooms.length; index += 1) {
    corridor(centerOf(rooms[index - 1]), centerOf(rooms[index]));
  }

  // Two cross-links keep the route useful while every carved cell remains connected.
  corridor(centerOf(rooms[0]), centerOf(rooms[2]));
  corridor(centerOf(rooms[2]), centerOf(rooms[4]));

  const start = centerOf(rooms[0]);
  const heart = centerOf(rooms[rooms.length - 1]);

  return {
    level: 1,
    day: 1,
    treasury: 100,
    grid: { columns: COLUMNS, rows: ROWS },
    seed,
    rooms,
    tiles: tiles.map((row) => row.join("")),
    start,
    heart,
    discovered: [],
    heartReached: false,
    settlementClaimed: false,
  };
}

export function isWalkable(dungeon: DungeonState, position: CellPosition): boolean {
  return dungeon.tiles[position.y]?.[position.x] === ".";
}

export function cellKey(position: CellPosition): string {
  return keyOf(position);
}
