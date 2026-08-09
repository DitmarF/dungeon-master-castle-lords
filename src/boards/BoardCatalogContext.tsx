"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { GameSave } from "../game/model";
import type {
  BoardAvailability,
  RegisteredBoardId,
  RegisteredBoardModule,
} from "./registry";

interface BoardCatalogValue {
  catalog: readonly RegisteredBoardModule[];
  getAvailability: (
    boardId: RegisteredBoardId,
    game: Readonly<GameSave>,
  ) => BoardAvailability;
}

const BoardCatalogContext = createContext<BoardCatalogValue | null>(null);

interface BoardCatalogProviderProps {
  catalog: readonly RegisteredBoardModule[];
  getAvailability: BoardCatalogValue["getAvailability"];
  children: ReactNode;
}

export function BoardCatalogProvider({
  catalog,
  getAvailability,
  children,
}: BoardCatalogProviderProps) {
  const value = useMemo(
    () => ({ catalog, getAvailability }),
    [catalog, getAvailability],
  );

  return (
    <BoardCatalogContext.Provider value={value}>
      {children}
    </BoardCatalogContext.Provider>
  );
}

export function useBoardCatalog(): BoardCatalogValue {
  const value = useContext(BoardCatalogContext);
  if (!value) {
    throw new Error("useBoardCatalog must be used inside BoardCatalogProvider");
  }
  return value;
}
