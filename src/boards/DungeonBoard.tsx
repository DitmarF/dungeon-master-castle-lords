"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { cellKey } from "../game/generateDungeon";
import { useGame } from "../game/GameProvider";
import type { DungeonMoveDirectionV5 } from "../game/campaignTransitionsV5";
import { GameIcon } from "../ui/GameIcon";
import {
  ActionButton,
  GameToken,
  GridCell,
} from "../ui/GamePrimitives";
import { GameShell } from "../ui/GameShell";

const CELL_SIZE = 48;
const MAX_ZOOM = 3.5;

const DIRECTIONS = {
  w: { direction: "north", arrow: "↑" },
  a: { direction: "west", arrow: "←" },
  s: { direction: "south", arrow: "↓" },
  d: { direction: "east", arrow: "→" },
} as const;

interface ScreenPoint {
  x: number;
  y: number;
}

interface MapView {
  zoom: number;
  x: number;
  y: number;
}

interface PinchStart {
  distance: number;
  midpoint: ScreenPoint;
  view: MapView;
}

function midpoint(first: ScreenPoint, second: ScreenPoint): ScreenPoint {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

function pointDistance(first: ScreenPoint, second: ScreenPoint): number {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function DungeonBoard() {
  const {
    activeGame,
    moveHeroInDungeon,
    selectedPlayer,
  } = useGame();
  const foundation = activeGame?.foundation;
  const explorationContext = foundation?.hero.explorationContext;
  const dungeon = explorationContext
    ? foundation?.regionalDungeons["location:regional-dungeon"]
    : null;
  const hero = useMemo(
    () =>
      foundation && explorationContext
        ? {
            ...foundation.hero,
            faction: foundation.rootFactionId,
            position: explorationContext.cell,
            visionRadius: 1,
          }
        : null,
    [explorationContext, foundation],
  );
  const [heartPromptOpen, setHeartPromptOpen] = useState(false);
  const [moveNote, setMoveNote] = useState("Use the arrows or WASD to explore.");
  const [mapView, setMapView] = useState<MapView>({ zoom: 1, x: 0, y: 0 });
  const [baseScale, setBaseScale] = useState(1);
  const [minimumZoom, setMinimumZoom] = useState(1);
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const mapViewRef = useRef(mapView);
  const baseScaleRef = useRef(baseScale);
  const minimumZoomRef = useRef(minimumZoom);
  const worldSizeRef = useRef({
    width: (dungeon?.grid.columns ?? 20) * CELL_SIZE,
    height: (dungeon?.grid.rows ?? 12) * CELL_SIZE,
  });
  const positionedMapRef = useRef(false);
  const pointersRef = useRef(new Map<number, ScreenPoint>());
  const dragRef = useRef<{
    pointerId: number;
    point: ScreenPoint;
    view: MapView;
  } | null>(null);
  const pinchRef = useRef<PinchStart | null>(null);

  const clampMapView = useCallback((candidate: MapView): MapView => {
    const viewport = mapViewportRef.current;
    const zoom = clamp(candidate.zoom, minimumZoomRef.current, MAX_ZOOM);
    if (!viewport) return { ...candidate, zoom };

    const rect = viewport.getBoundingClientRect();
    const scaledWidth = worldSizeRef.current.width * baseScaleRef.current * zoom;
    const scaledHeight = worldSizeRef.current.height * baseScaleRef.current * zoom;
    const maxX = Math.max(0, (scaledWidth - rect.width) / 2);
    const maxY = Math.max(0, (scaledHeight - rect.height) / 2);

    return {
      zoom,
      x: clamp(candidate.x, -maxX, maxX),
      y: clamp(candidate.y, -maxY, maxY),
    };
  }, []);

  const commitMapView = useCallback(
    (candidate: MapView) => {
      const next = clampMapView(candidate);
      mapViewRef.current = next;
      setMapView(next);
    },
    [clampMapView],
  );

  useEffect(() => {
    worldSizeRef.current = {
      width: (dungeon?.grid.columns ?? 20) * CELL_SIZE,
      height: (dungeon?.grid.rows ?? 12) * CELL_SIZE,
    };
    positionedMapRef.current = false;
  }, [
    dungeon?.grid.columns,
    dungeon?.grid.rows,
  ]);

  useEffect(() => {
    const viewport = mapViewportRef.current;
    if (!viewport || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      const rect = viewport.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const { width, height } = worldSizeRef.current;
      const fitScale = Math.min(rect.width / width, rect.height / height);
      const portraitMap = rect.height > rect.width * 1.15;
      const nextBaseScale = portraitMap
        ? Math.max(rect.width / width, rect.height / height)
        : fitScale;
      const nextMinimumZoom = Math.min(1, fitScale / nextBaseScale);

      baseScaleRef.current = nextBaseScale;
      minimumZoomRef.current = nextMinimumZoom;
      setBaseScale(nextBaseScale);
      setMinimumZoom(nextMinimumZoom);

      if (!positionedMapRef.current && hero) {
        positionedMapRef.current = true;
        const heroCenterX = (hero.position.x + 0.5) * CELL_SIZE;
        const heroCenterY = (hero.position.y + 0.5) * CELL_SIZE;
        commitMapView({
          zoom: 1,
          x: -(heroCenterX - width / 2) * nextBaseScale,
          y: -(heroCenterY - height / 2) * nextBaseScale,
        });
        return;
      }

      commitMapView(mapViewRef.current);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [hero, commitMapView]);

  useEffect(() => {
    const viewport = mapViewportRef.current;
    if (!viewport || !hero || !positionedMapRef.current) return;

    const rect = viewport.getBoundingClientRect();
    const { width, height } = worldSizeRef.current;
    const current = mapViewRef.current;
    const effectiveScale = baseScaleRef.current * current.zoom;
    const heroScreenX =
      rect.width / 2 +
      current.x +
      ((hero.position.x + 0.5) * CELL_SIZE - width / 2) * effectiveScale;
    const heroScreenY =
      rect.height / 2 +
      current.y +
      ((hero.position.y + 0.5) * CELL_SIZE - height / 2) * effectiveScale;
    const safeX = Math.min(96, rect.width * 0.22);
    const safeY = Math.min(96, rect.height * 0.22);
    let nextX = current.x;
    let nextY = current.y;

    if (heroScreenX < safeX) nextX += safeX - heroScreenX;
    if (heroScreenX > rect.width - safeX) {
      nextX -= heroScreenX - (rect.width - safeX);
    }
    if (heroScreenY < safeY) nextY += safeY - heroScreenY;
    if (heroScreenY > rect.height - safeY) {
      nextY -= heroScreenY - (rect.height - safeY);
    }

    if (Math.abs(nextX - current.x) > 0.5 || Math.abs(nextY - current.y) > 0.5) {
      commitMapView({ ...current, x: nextX, y: nextY });
    }
  }, [hero, commitMapView]);

  const zoomAt = useCallback(
    (clientPoint: ScreenPoint, requestedZoom: number) => {
      const viewport = mapViewportRef.current;
      if (!viewport) return;

      const rect = viewport.getBoundingClientRect();
      const current = mapViewRef.current;
      const nextZoom = clamp(
        requestedZoom,
        minimumZoomRef.current,
        MAX_ZOOM,
      );
      const localX = clientPoint.x - rect.left;
      const localY = clientPoint.y - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const ratio = nextZoom / current.zoom;

      commitMapView({
        zoom: nextZoom,
        x: localX - centerX - ratio * (localX - centerX - current.x),
        y: localY - centerY - ratio * (localY - centerY - current.y),
      });
    },
    [commitMapView],
  );

  const changeZoom = useCallback(
    (delta: number) => {
      const viewport = mapViewportRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      zoomAt(
        { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        mapViewRef.current.zoom + delta,
      );
    },
    [zoomAt],
  );

  const resetMapView = useCallback(() => {
    const { width, height } = worldSizeRef.current;
    if (!hero) {
      commitMapView({ zoom: 1, x: 0, y: 0 });
      return;
    }

    const heroCenterX = (hero.position.x + 0.5) * CELL_SIZE;
    const heroCenterY = (hero.position.y + 0.5) * CELL_SIZE;
    commitMapView({
      zoom: 1,
      x: -(heroCenterX - width / 2) * baseScaleRef.current,
      y: -(heroCenterY - height / 2) * baseScaleRef.current,
    });
  }, [hero, commitMapView]);

  const handleWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0016);
      zoomAt(
        { x: event.clientX, y: event.clientY },
        mapViewRef.current.zoom * factor,
      );
    },
    [zoomAt],
  );

  function beginPinch() {
    const viewport = mapViewportRef.current;
    const points = [...pointersRef.current.values()];
    if (!viewport || points.length < 2) return;

    const rect = viewport.getBoundingClientRect();
    const center = midpoint(points[0], points[1]);
    pinchRef.current = {
      distance: Math.max(1, pointDistance(points[0], points[1])),
      midpoint: { x: center.x - rect.left, y: center.y - rect.top },
      view: mapViewRef.current,
    };
    dragRef.current = null;
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as Element;
    if (target.closest("button")) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);

    if (pointersRef.current.size === 1) {
      dragRef.current = {
        pointerId: event.pointerId,
        point,
        view: mapViewRef.current,
      };
    } else {
      beginPinch();
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const viewport = mapViewportRef.current;
      const points = [...pointersRef.current.values()];
      if (!viewport) return;

      const rect = viewport.getBoundingClientRect();
      const start = pinchRef.current;
      const currentMidpoint = midpoint(points[0], points[1]);
      const localMidpoint = {
        x: currentMidpoint.x - rect.left,
        y: currentMidpoint.y - rect.top,
      };
      const nextZoom = clamp(
        start.view.zoom * (pointDistance(points[0], points[1]) / start.distance),
        minimumZoomRef.current,
        MAX_ZOOM,
      );
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const contentX =
        (start.midpoint.x - centerX - start.view.x) / start.view.zoom;
      const contentY =
        (start.midpoint.y - centerY - start.view.y) / start.view.zoom;

      commitMapView({
        zoom: nextZoom,
        x: localMidpoint.x - centerX - nextZoom * contentX,
        y: localMidpoint.y - centerY - nextZoom * contentY,
      });
      return;
    }

    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    commitMapView({
      zoom: drag.view.zoom,
      x: drag.view.x + event.clientX - drag.point.x,
      y: drag.view.y + event.clientY - drag.point.y,
    });
  }

  function endPointer(event: ReactPointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;

    if (pointersRef.current.size === 1) {
      const [remaining] = [...pointersRef.current.entries()];
      dragRef.current = {
        pointerId: remaining[0],
        point: remaining[1],
        view: mapViewRef.current,
      };
    } else {
      dragRef.current = null;
    }
  }

  const moveHero = useCallback(
    (direction: DungeonMoveDirectionV5) => {
      const result = moveHeroInDungeon(direction);
      if (!result) return;
      if (!result.ok) {
        if (result.code === "blocked") {
          setMoveNote(`Stone blocks the way ${direction}.`);
        }
        return;
      }

      setMoveNote(
        result.details.reachedHeart
          ? "The Dungeon Heart answers your touch."
          : `Moved ${direction}. New ground revealed.`,
      );
      if (result.details.reachedHeart) setHeartPromptOpen(true);
    },
    [moveHeroInDungeon],
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (heartPromptOpen) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button")) return;

      const aliases: Record<string, keyof typeof DIRECTIONS> = {
        arrowup: "w",
        arrowleft: "a",
        arrowdown: "s",
        arrowright: "d",
      };
      const pressedKey = event.key.toLowerCase();
      const key = (pressedKey in DIRECTIONS
        ? pressedKey
        : aliases[pressedKey]) as keyof typeof DIRECTIONS | undefined;
      if (!key) return;

      event.preventDefault();
      const direction = DIRECTIONS[key];
      moveHero(direction.direction);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [heartPromptOpen, moveHero]);

  const discovered = useMemo(
    () => new Set(dungeon?.discovered ?? []),
    [dungeon?.discovered],
  );

  if (!dungeon || !hero || !selectedPlayer) return null;
  const discoveredFloorCount = dungeon.tiles.reduce(
    (count, row, y) =>
      count +
      [...row].filter(
        (tile, x) => tile === "." && discovered.has(`${x},${y}`),
      ).length,
    0,
  );
  const floorCount = dungeon.tiles.reduce(
    (count, row) => count + [...row].filter((tile) => tile === ".").length,
    0,
  );
  const heartVisible = discovered.has(cellKey(dungeon.heart));
  const worldWidth = dungeon.grid.columns * CELL_SIZE;
  const worldHeight = dungeon.grid.rows * CELL_SIZE;
  const locationTitle = "Regional Dungeon";
  const locationKicker = "Home-ring location";

  return (
    <GameShell
      className="exploration-view"
      title={locationTitle}
      subtitle={`Level ${dungeon.level} · ${locationKicker}`}
      icon="grid"
      stats={[
        { label: "Level", value: dungeon.level, icon: "layers" },
        {
          label: "Found",
          value: `${discoveredFloorCount}/${floorCount}`,
          icon: "eye",
        },
        { label: "Vision", value: hero.visionRadius, icon: "layers" },
      ]}
    >
      <section className="dungeon-board" aria-labelledby="dungeon-heading">
        <header className="board-summary">
          <div>
            <span className="section-kicker">Main objective</span>
            <h1 id="dungeon-heading">
              {dungeon.heartReached
                ? "The Heart is waiting"
                : "Find the Dungeon Heart"}
            </h1>
          </div>
          <button
            type="button"
            className={`objective-chip${
              dungeon.heartReached ? " objective-chip--ready" : ""
            }`}
            onClick={() => setHeartPromptOpen(true)}
            disabled={!dungeon.heartReached}
            aria-label={
              dungeon.heartReached
                ? "Review the reached Dungeon Heart"
                : "The Dungeon Heart has not been reached"
            }
          >
            <GameIcon name="heart" size={17} />
            <span>{dungeon.heartReached ? "Reached" : "Unreached"}</span>
          </button>
        </header>

        <div
          ref={mapViewportRef}
          className="map-viewport"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onDoubleClick={(event) =>
            zoomAt(
              { x: event.clientX, y: event.clientY },
              mapViewRef.current.zoom > 1.4 ? 1 : 2,
            )
          }
          aria-label="Interactive dungeon map. Drag to pan, use the mouse wheel or two fingers to zoom."
        >
          <svg
            className="dungeon-map"
            style={{
              width: worldWidth,
              height: worldHeight,
              marginLeft: -worldWidth / 2,
              marginTop: -worldHeight / 2,
              transform: `translate3d(${mapView.x}px, ${mapView.y}px, 0) scale(${baseScale * mapView.zoom})`,
            }}
            viewBox={`0 0 ${worldWidth} ${worldHeight}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`${locationTitle}, ${discoveredFloorCount} of ${floorCount} traversable cells discovered`}
          >
            <rect width="100%" height="100%" className="explore-ground" />
            {dungeon.tiles.flatMap((row, y) =>
              [...row].map((tile, x) => {
                const known = discovered.has(`${x},${y}`);
                const tileClass = known
                  ? tile === "."
                    ? "map-cell map-cell--floor"
                    : "map-cell map-cell--wall"
                  : "map-cell map-cell--unknown";
                return (
                  <GridCell
                    key={`${x}-${y}`}
                    x={x * CELL_SIZE}
                    y={y * CELL_SIZE}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    className={tileClass}
                    selected={x === hero.position.x && y === hero.position.y}
                  />
                );
              }),
            )}

            {heartVisible ? (
              <GameToken
                variant="objective"
                color="var(--fs-red)"
                className="heart-token"
                transform={`translate(${
                  dungeon.heart.x * CELL_SIZE + CELL_SIZE / 2
                } ${dungeon.heart.y * CELL_SIZE + CELL_SIZE / 2})`}
              />
            ) : null}

            <GameToken
              variant="hero"
              color={selectedPlayer.bannerColor}
              selected
              className="hero-token"
              transform={`translate(${
                hero.position.x * CELL_SIZE + CELL_SIZE / 2
              } ${hero.position.y * CELL_SIZE + CELL_SIZE / 2})`}
            />
          </svg>

          <div className="map-zoom" aria-label="Map zoom controls">
            <button
              type="button"
              onClick={() => changeZoom(-0.35)}
              disabled={mapView.zoom <= minimumZoom + 0.001}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              className="map-zoom__value"
              onClick={resetMapView}
              disabled={mapView.zoom === 1 && Math.abs(mapView.x) < 0.5 && Math.abs(mapView.y) < 0.5}
              aria-label="Reset map view"
            >
              {Math.round(mapView.zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => changeZoom(0.35)}
              disabled={mapView.zoom >= MAX_ZOOM}
              aria-label="Zoom in"
            >
              +
            </button>
          </div>

          <div className="map-gesture-hint" aria-hidden="true">
            Drag · scroll or pinch to zoom
          </div>
        </div>

        <footer className="movement-dock">
          <div className="movement-status" role="status">
            <span className="status-dot" />
            <span>{moveNote}</span>
          </div>
          <div className="movement-buttons" aria-label="Hero movement controls">
            {(["a", "w", "s", "d"] as (keyof typeof DIRECTIONS)[]).map(
              (key) => {
                const direction = DIRECTIONS[key];
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() =>
                      moveHero(direction.direction)
                    }
                    aria-label={`Move ${direction.direction}`}
                  >
                    <span>{direction.arrow}</span>
                    <small>{key.toUpperCase()}</small>
                  </button>
                );
              },
            )}
          </div>
        </footer>
      </section>

      {heartPromptOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setHeartPromptOpen(false)}
        >
          <section
            className="decision-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="heart-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="decision-sheet__icon">
              <GameIcon name="heart" size={27} />
            </span>
            <span className="section-kicker">Objective discovered</span>
            <h2 id="heart-title">The Dungeon Heart awakens.</h2>
            <p>
              Its pulse marks a regional exploration outcome. Your capital
              Village already exists; later Dungeon work will define this
              Heart&apos;s consequence.
            </p>
            <div className="decision-facts">
              <span>
                <small>Level</small>
                <strong>{dungeon.level}</strong>
              </span>
              <span>
                <small>Rooms</small>
                <strong>{dungeon.rooms.length}</strong>
              </span>
              <span>
                <small>Path</small>
                <strong>Clear</strong>
              </span>
            </div>
            <div className="dialog-actions">
              <ActionButton
                variant="primary"
                onClick={() => setHeartPromptOpen(false)}
              >
                Continue exploring
              </ActionButton>
            </div>
          </section>
        </div>
      ) : null}
    </GameShell>
  );
}
