"use client";

import { useState, type FormEvent } from "react";
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
    <main className="start-view">
      <header className="start-appbar">
        <div className="brand" aria-label="Dungeon Master and Castle Lords">
          <span className="brand__mark">
            <GameIcon name="castle" size={22} />
          </span>
          <span className="brand__wordmark">
            <strong>Dungeon Master</strong>
            <small>&amp; Castle Lords</small>
          </span>
        </div>
        <span className="prototype-badge">
          <span className="status-dot" /> Prototype
        </span>
      </header>

      <div className="start-content">
        <section className="start-copy" aria-labelledby="start-title">
          <span className="section-kicker">Campaign zero</span>
          <h1 id="start-title">Choose a ruler.<br />Enter the dungeon.</h1>
          <p>
            Create a local player or continue a saved campaign. Your progress
            remains on this device.
          </p>
          <ul className="start-features" aria-label="Prototype features">
            <li><GameIcon name="user" size={16} /> Player profiles</li>
            <li><GameIcon name="grid" size={16} /> Modular boards</li>
            <li><GameIcon name="save" size={16} /> Automatic local save</li>
          </ul>
        </section>

        <div className="start-sheets">
          <section className="start-sheet" aria-labelledby="players-title">
            <header className="sheet-heading">
              <div>
                <span className="section-kicker">Player</span>
                <h2 id="players-title">
                  {isCreating ? "Create a ruler" : "Choose a ruler"}
                </h2>
              </div>
              {!isCreating ? (
                <span className="count-badge">{players.length}</span>
              ) : null}
            </header>

            {isCreating ? (
              <form className="create-player" onSubmit={handleCreate}>
                <label className="field-label" htmlFor="player-name">
                  Ruler name
                </label>
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
                {formError ? (
                  <p className="field-error" id="name-error">
                    {formError}
                  </p>
                ) : null}

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
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </button>
                  ) : null}
                  <button type="submit" className="button button--primary">
                    Create player <GameIcon name="arrow" size={17} />
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="player-list" role="list" aria-label="Saved players">
                  {players.map((player) => {
                    const selected = player.id === selectedPlayer?.id;
                    const hasSave = Boolean(
                      selected ? selectedGame : player.lastPlayedAt,
                    );
                    return (
                      <button
                        type="button"
                        className={`player-card${
                          selected ? " player-card--selected" : ""
                        }`}
                        onClick={() => selectPlayer(player.id)}
                        key={player.id}
                        aria-pressed={selected}
                      >
                        <Crest color={player.bannerColor} />
                        <span className="player-card__copy">
                          <strong>{player.name}</strong>
                          <small>{formatLastPlayed(player)}</small>
                        </span>
                        <span className="player-card__state">
                          {hasSave ? "Saved" : "New"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="add-player-button"
                  onClick={() => setIsCreating(true)}
                >
                  <GameIcon name="plus" size={17} /> Add player
                </button>
              </>
            )}
          </section>

          {!isCreating && selectedPlayer ? (
            <section className="campaign-sheet" aria-labelledby="campaign-title">
              <header className="campaign-sheet__identity">
                <Crest color={selectedPlayer.bannerColor} size="lg" />
                <span>
                  <small>Selected ruler</small>
                  <h2 id="campaign-title">{selectedPlayer.name}</h2>
                  <p>
                    {selectedGame
                      ? selectedGame.setupComplete
                        ? `Level ${selectedGame.dungeon.level} · Day ${selectedGame.dungeon.day}`
                        : "Hero setup in progress"
                      : "Ready for a new campaign"}
                  </p>
                </span>
                <button
                  type="button"
                  className="icon-button icon-button--danger"
                  onClick={() => setDeleteTarget(selectedPlayer)}
                  aria-label={`Delete ${selectedPlayer.name}`}
                  title="Delete player"
                >
                  <GameIcon name="trash" size={19} />
                </button>
              </header>

              <div className="campaign-actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={handleNewGame}
                >
                  <GameIcon name="plus" size={18} /> New game
                </button>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => loadGame(selectedPlayer.id)}
                  disabled={!selectedGame}
                >
                  {selectedGame ? "Continue" : "No saved game"}
                  {selectedGame ? <GameIcon name="arrow" size={18} /> : null}
                </button>
              </div>
            </section>
          ) : null}

          <p className="storage-note">
            <GameIcon name="lock" size={14} /> Saves stay in this browser on
            this device.
          </p>
        </div>
      </div>

      {deleteTarget ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setDeleteTarget(null)}
        >
          <section
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="dialog-icon dialog-icon--danger">
              <GameIcon name="trash" size={23} />
            </span>
            <h2 id="delete-title">Delete {deleteTarget.name}?</h2>
            <p>This permanently removes the player and their local campaign.</p>
            <div className="dialog-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setDeleteTarget(null)}
              >
                Keep player
              </button>
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
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setReplaceTarget(null)}
        >
          <section
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="replace-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="dialog-icon">
              <GameIcon name="plus" size={23} />
            </span>
            <h2 id="replace-title">Begin a new campaign?</h2>
            <p>{replaceTarget.name}&apos;s current save will be replaced.</p>
            <div className="dialog-actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setReplaceTarget(null)}
              >
                Cancel
              </button>
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
    </main>
  );
}
