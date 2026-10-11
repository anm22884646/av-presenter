# AV Presenter

Windows-first Electron + TypeScript MVP for event playback, Preview/Program cues, and overlays.

Download the Windows validation build from [GitHub Releases](https://github.com/anm22884646/av-presenter/releases). Unzip the entire folder and run `AV Presenter.exe`.
See [Windows validation](WINDOWS-VALIDATION.md) for acceptance steps and current limitations.

## Development on Windows 11 x64

Install Node.js 24 LTS, then run:

```powershell
npm ci
npm start
```

```powershell
npm test
npm run pack:win
```

The packaging command produces portable and NSIS targets in `release/`. Local builds are unsigned unless signing credentials are configured.

## Structure

- `src/main`: Electron windows, display management, authoritative Program state, native media dialog, allowlisted media protocol, IPC validation.
- `src/preload`: narrow typed IPC bridge; no Node APIs exposed to renderers.
- `src/shared`: explicit scene types and countdown / cue state functions.
- `src/renderer`: shared DOM compositor with independent Preview, Program confidence view, and Output instances.

TAKE deep-copies Preview into Program. CLEAR disables only Program overlays. A countdown deadline survives unrelated cue edits. Output requests the current state at initialization, so it does not depend on receiving an earlier IPC broadcast.

Current settings persist in the application user-data directory when saved; optional restore and Windows login startup are available. Frame-perfect sync is not included. Windows runtime and real multi-monitor verification remain pending; see validation notes.

## Language and exhibition startup (0.3.0)

The header language menu offers English, 日本語, 正體中文, and 简体中文. Language is independent of overlay text and scene state.

Prepare Preview, TAKE the intended exhibit content, start output on the intended display, then choose:

- **SAVE CURRENT SETTINGS**: saves Preview, Program, overlay styles, timer, media references, and selected display without changing Program.
- **Restore current state on next launch**: automatically saves subsequent edits and restores the scene, playback, and previously active output at launch.
- **Start automatically at Windows login**: available in packaged Windows builds; registers the current executable with Windows login startup.

Countdowns resume from their last saved remaining time; powered-off time is excluded. Video starts at its beginning, with the saved play/pause and loop flags. Missing displays wait for reconnection rather than redirecting output to the primary monitor. Media must stay at its saved path.

Settings are stored as `settings.json` in Electron's userData folder (`%APPDATA%/av-presenter` by default). Move the application before enabling login startup; if its folder changes later, disable and re-enable that option from the new location. Automatic startup requires a Windows user login; the application does not configure BIOS power recovery or Windows automatic login.

Selecting or importing media cues Preview paused at the first frame. Press Preview Play to start it; TAKE starts video playback on Program, even when Preview is paused. Re-selecting the same item cues it back to its first frame. Saved exhibition playback settings still restore as saved.

## Multiple overlay positions (0.3.0)

Text, clock, and countdown each support up to 8 display positions sharing one content source. Enable the overlay, enter its text or time settings, then click **Add position**. Choose the position in **Edit position** and adjust its font, size, color, alignment, X/Y coordinates, padding, or background. New positions copy the selected style and start slightly offset so they are easy to locate. **Remove position** removes an additional position; the original position always remains.

For example, enter “Next stage starts at 10:00” once and place it at both the top and bottom of the screen. Editing that text updates every position in Preview. Clock positions share system time; countdown positions share a single timer. Press **TAKE** to apply your prepared positions to Program. **CLEAR OVERLAYS** hides every Program position while preserving media playback and timer state.

All positions are included in saved settings and exhibition startup restore. Existing 0.2 settings load as one position per overlay.

TAKE always starts or resumes the selected video on Program. Taking overlay edits for the same video keeps its current playback position unless you explicitly restart or re-cue it. Preview stays in its prepared play/pause state; countdown start/pause remains controlled separately.
