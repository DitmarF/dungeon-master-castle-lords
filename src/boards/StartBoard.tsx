"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useGame } from "../game/GameProvider";
import type { PlayerProfile } from "../game/model";
import { Crest } from "../ui/Crest";
import { GameIcon } from "../ui/GameIcon";

const BANNER_COLORS = [
  { name: "Indigo", value: "rgba(59,71,204,1)" },
  { name: "Vermilion", value: "rgba(204,103,59,1)" },
  { name: "Amber", value: "rgba(204,173,59,1)" },
  { name: "Green", value: "rgba(59,204,98,1)" },
  { name: "Violet", value: "rgba(122,59,204,1)" },
];

function formatLastPlayed(player: PlayerProfile): string {
  if (!player.lastPlayedAt) return "No campaign yet";

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(player.lastPlayedAt));
}

export function StartBoard() {
  const {
    players,
    selectedPlayer,
    selectedGame,
    createPlayer,
    selectPlayer,
    deletePlayer,
    startNewGame,
    loadGame,
  } = useGame();
  const [isCreating, setIsCreating] = useState(players.length === 0);
  const [name, setName] = useState("");
  const [bannerColor, setBannerColor] = useState(BANNER_COLORS[0].value);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlayerProfile | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<PlayerProfile | null>(null);

  const rosterLabel = useMemo(
    () => `${players.length} ${players.length === 1 ? "lord" : "lords"}`,
    [players.length],
  );

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = createPlayer(name, bannerColor);
    if (!result.ok) {
      setFormError(result.error ?? "Could not create that player.");
      return;
    }

    setName("");
    setFormError(null);
    setIsCreating(false);
  }

  function handleNewGame() {
    if (!selectedPlayer) return;
    if (selectedGame) {
      setReplaceTarget(selectedPlayer);
      return;
    }
    startNewGame(selectedPlayer.id);
  }

  return (
    <main className="start-board">
      <header className="start-header">
        <a className="brand" href="#top" aria-label="Dungeon Master home">
          <span className="brand__mark">
            <GameIcon name="castle" size={24} />
          </span>
          <span className="brand__wordmark">
            <strong>Dungeon Master</strong>
            <small>&amp; Castle Lords</small>
          </span>
        </a>
        <div className="prototype-badge">
          <span className="prototype-badge__dot" />
          Prototype · Local save
        </div>
      </header>

      <div className="start-layout" id="top">
        <section className="intro-panel" aria-labelledby="game-title">
          <div className="intro-panel__eyebrow">
            <span>Campaign zero</span>
            <span className="eyebrow-line" />
          </div>
          <div>
            <h1 id="game-title">
              Build below.
              <br />
              Rule above.
            </h1>
            <p>
              Claim a name, raise your banner, and shape a dungeon one chamber
              at a time.
            </p>
          </div>

          <div className="intro-map" aria-hidden="true">
            <svg viewBox="0 0 480 180" role="presentation">
              <defs>
                <pattern id="start-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" className="start-grid-line" />
                </pattern>
              </defs>
              <rect width="480" height="180" fill="url(#start-grid)" />
              <path d="M60 140h72V92h48v-36h96v48h60v36h84" className="map-path" />
              <circle cx="180" cy="56" r="8" className="map-node map-node--active" />
              <circle cx="336" cy="104" r="6" className="map-node" />
              <path d="M164 56h32M180 40v32" className="map-cross" />
            </svg>
          </div>

          <ul className="system-notes" aria-label="Prototype features">
            <li><GameIcon name="shield" size={16} /> Separate player saves</li>
            <li><GameIcon name="grid" size={16} /> Modular game boards</li>
            <li><GameIcon name="save" size={16} /> Device autosave</li>
          </ul>
        </section>

        <section className="registry-panel" aria-labelledby="registry-title">
          <div className="registry-heading">
            <div>
              <span className="section-kicker">Choose your ruler</span>
              <h2 id="registry-title">Player registry</h2>
            </div>
            <span className="roster-count">{rosterLabel}</span>
          </div>

          {isCreating ? (
            <form className="create-player" onSubmit={handleCreate}>
              <div className="create-player__heading">
                <div className="crest-outline"><GameIcon name="user" size={24} /></div>
                <div>
                  <h3>Register a new lord</h3>
                  <p>Your profile owns one current campaign save.</p>
                </div>
              </div>
              <label className="field-label" htmlFor="player-name">Lord&apos;s name</label>
              <div className="name-field">
                <input
                  id="player-name"
                  name="playerName"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setFormError(null);
                  }}
                  placeholder="Enter a name"
                  autoComplete="off"
                  autoFocus
                  maxLength={24}
                  aria-describedby={formError ? "name-error" : undefined}
                />
                <span>{name.length}/24</span>
              </div>
              {formError ? <p className="field-error" id="name-error">{formError}</p> : null}

              <fieldset className="banner-picker">
                <legend>Banner color</legend>
                <div>
                  {BANNER_COLORS.map((color) => (
                    <label key={color.name} title={color.name}>
                      <input
                        type="radio"
                        name="bannerColor"
                        value={color.value}
                        checked={bannerColor === color.value}
                        onChange={() => setBannerColor(color.value)}
                      />
                      <span style={{ background: color.value }} />
                      <b>{color.name}</b>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="form-actions">
                {players.length > 0 ? (
                  <button type="button" className="button button--ghost" onClick={() => setIsCreating(false)}>
                    Cancel
                  </button>
                ) : null}
                <button type="submit" className="button button--primary">
                  Create lord <GameIcon name="arrow" size={18} />
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="player-list" role="list" aria-label="Saved players">
                {players.map((player) => {
                  const isSelected = player.id === selectedPlayer?.id;
                  const hasSave = Boolean(
                    player.id === selectedPlayer?.id ? selectedGame : player.lastPlayedAt,
                  );
                  return (
                    <button
                      type="button"
                      className={`player-card${isSelected ? " player-card--selected" : ""}`}
                      onClick={() => selectPlayer(player.id)}
                      key={player.id}
                      aria-pressed={isSelected}
                    >
                      <Crest color={player.bannerColor} />
                      <span className="player-card__copy">
                        <strong>{player.name}</strong>
                        <small>{formatLastPlayed(player)}</small>
                      </span>
                      <span className={`save-state${hasSave ? " save-state--ready" : ""}`}>
                        {hasSave ? "Save ready" : "New"}
                      </span>
                      <GameIcon name="arrow" size={18} />
                    </button>
                  );
                })}
              </div>

              {selectedPlayer ? (
                <div className="selected-actions">
                  <div className="selected-actions__identity">
                    <span>Selected ruler</span>
                    <strong>{selectedPlayer.name}</strong>
                  </div>
                  <button
                    type="button"
                    className="icon-button icon-button--danger"
                    onClick={() => setDeleteTarget(selectedPlayer)}
                    aria-label={`Delete ${selectedPlayer.name}`}
                    title="Delete player"
                  >
                    <GameIcon name="trash" size={19} />
                  </button>
                  <div className="selected-actions__buttons">
                    <button type="button" className="button button--secondary" onClick={handleNewGame}>
                      <GameIcon name="plus" size={18} /> New game
                    </button>
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={() => loadGame(selectedPlayer.id)}
                      disabled={!selectedGame}
                    >
                      Load game <GameIcon name="arrow" size={18} />
                    </button>
                  </div>
                </div>
              ) : null}

              <button type="button" className="add-player-button" onClick={() => setIsCreating(true)}>
                <GameIcon name="plus" size={18} /> Create another player
              </button>
            </>
          )}

          <p className="storage-note">
            <GameIcon name="lock" size={14} /> Saves stay in this browser on this device.
          </p>
        </section>
      </div>

      {deleteTarget ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setDeleteTarget(null)}>
          <section
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="dialog-icon dialog-icon--danger"><GameIcon name="trash" size={23} /></span>
            <h2 id="delete-title">Delete {deleteTarget.name}?</h2>
            <p>This permanently removes the player and their local campaign save.</p>
            <div className="dialog-actions">
              <button type="button" className="button button--ghost" onClick={() => setDeleteTarget(null)}>Keep player</button>
              <button
                type="button"
                className="button button--danger"
                onClick={() => {
                  deletePlayer(deleteTarget.id);
                  setDeleteTarget(null);
                  if (players.length <= 1) setIsCreating(true);
                }}
              >
                Delete player
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {replaceTarget ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setReplaceTarget(null)}>
          <section
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="replace-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="dialog-icon"><GameIcon name="plus" size={23} /></span>
            <h2 id="replace-title">Begin a new campaign?</h2>
            <p>{replaceTarget.name}&apos;s current save will be replaced with an empty dungeon.</p>
            <div className="dialog-actions">
              <button type="button" className="button button--ghost" onClick={() => setReplaceTarget(null)}>Cancel</button>
              <button
                type="button"
                className="button button--primary"
                onClick={() => {
                  startNewGame(replaceTarget.id);
                  setReplaceTarget(null);
                }}
              >
                Start new game
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <div className="portrait-hint" role="status">
        <GameIcon name="layers" size={18} /> Rotate to landscape for the full game board.
      </div>
    </main>
  );
}
