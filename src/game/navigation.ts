export {
  BOARD_DESCRIPTORS_V5 as BOARD_DESCRIPTORS,
  getBoardAvailabilityV5 as getBoardAvailability,
  getBoardDescriptorV5 as getBoardDescriptor,
  resolveActiveBoardV5 as resolveActiveBoard,
} from "./navigationV5.ts";

export type {
  BoardAvailabilityV5 as BoardAvailability,
  BoardDescriptorV5 as BoardDescriptor,
  BoardIconName,
  BoardResolutionV5 as BoardResolution,
  RegisteredBoardIdV5 as RegisteredBoardId,
} from "./navigationV5.ts";

import { getBoardDescriptorV5 } from "./navigationV5.ts";
import type { RegisteredBoardIdV5 } from "./navigationV5.ts";

export function isRegisteredBoardId(
  boardId: unknown,
): boardId is RegisteredBoardIdV5 {
  return getBoardDescriptorV5(boardId) !== null;
}
