# AV Presenter 0.2.1

AV Presenter is a lightweight Windows desktop application for video and image playback with live clock, countdown, and text overlays. It is designed for small exhibitions, corporate events, conference rooms, break screens, and return monitors.

This is a public testing release. It supports a simple operator workflow: prepare a scene in Preview, check it, and press **TAKE** to send it to Program.

## Download and run

1. Download **AV-Presenter-Windows-x64-0.2.1.zip** from the Assets section below.
2. Extract the entire archive to a local folder.
3. Open the **win-unpacked** folder and run **AV Presenter.exe**.

No Node.js installation is required. Keep all files and folders beside the executable together. Windows 11 x64 is the primary target. The application is unsigned.

**AV-Presenter-Source-0.2.1.zip** contains the source code. **SHA256SUMS.txt** contains checksums for the downloadable ZIP files.

## Preview cue behavior in 0.2.1

Importing or selecting media now cues Preview paused at its first frame. Re-selecting the same video also returns Preview to its first frame and pauses it. Press Preview **Play** when ready. **TAKE** keeps the prepared play/pause state; saved exhibition playback settings continue to restore as saved.

## Features

### Separate control and output windows

- Operate the application from the Control window on your primary display.
- Select a display for clean, borderless fullscreen Program output.
- Move output to another display without restarting the application.
- Use windowed output when only one display is available.
- View output connection status and stop or reopen the output window from Control.
- Receive display-disconnection notices; restored output waits for its saved display to reconnect.

### Preview / Program operation

- Prepare media and overlays in Preview while Program keeps its current scene.
- Press **TAKE** to copy the prepared scene to Program.
- Press **CLEAR OVERLAYS** to hide Program text, clock, and countdown while background playback continues.
- See Preview and a separate Program confidence view in Control.

### Media playback

- Import MP4 and WebM videos, plus JPG, JPEG, and PNG images, through the native file picker.
- Maintain a simple media list and select media for Preview.
- Prepare a black background without media.
- Play, pause, restart, and loop video using separate Preview and Program controls.
- Play audio from the Output window; Control previews are muted.
- Receive missing-file and media-loading errors in Control.

Media remains at its original file path and is not copied into the application. MP4 codec compatibility depends on Electron's supported codecs; H.264 MP4 is the intended starting point.

### Live clock overlay

- Display local system time independently of video playback.
- Choose **HH:mm**, **HH:mm:ss**, or **YYYY/MM/DD HH:mm**.
- Adjust visibility, font family, size, weight, color, alignment, X/Y position, padding, and background color/opacity.

### Countdown overlay

- Set a duration using **MM:SS** or **HH:MM:SS**.
- Start, pause, or reset a countdown in Preview, then send it to Program with TAKE.
- Use dedicated on-air controls to start, pause, or reset the Program countdown immediately.
- Adjust the same position and styling options as the other overlays.
- Keep the current Program countdown timing when taking unrelated text or style edits.

### Text overlay

- Display one multiline text overlay above background media.
- Adjust visibility, text content, font family, size, weight, alignment, color, X/Y position, padding, and optional background color/opacity.
- Use positioning presets for corners, top/bottom center, or the center of the screen.

### Interface languages

Choose **English**, **Japanese**, **Traditional Chinese**, or **Simplified Chinese** from the language menu. The selection is remembered. Changing the interface language does not translate your overlay text or change Program content.

### Saved settings and exhibition startup

- **SAVE CURRENT SETTINGS** saves Preview and Program scenes, overlay styles, countdown state, media references, and the selected output display.
- **Restore current state on next launch** automatically saves subsequent changes and restores the saved state when the application starts.
- Previously playing media resumes its saved play/loop settings from the beginning of the video. Previously active output reopens on the saved display.
- Countdowns resume from their saved remaining time; time while the application was closed is excluded.
- **Start automatically at Windows login** registers the application to launch after the Windows user logs in.

For daily exhibition use, place the application and media in fixed locations, prepare the intended scene, TAKE it to Program, start output, and enable both restore and Windows login startup. If you move the application later, disable and re-enable login startup from its new location.

## Current scope and limitations

- One Program output, one text overlay, one clock, and one countdown.
- Rendering uses a 1920 × 1080 logical canvas and scales proportionally; displays with other aspect ratios may show black bars.
- Video restarts from the beginning when output is reopened or the application restarts; exact playback position is not saved.
- PowerPoint playback, PDF slides, transitions, NDI, DeckLink/SDI, and professional frame synchronization are not included.
- Automatic startup requires a Windows user login. The application does not configure BIOS power recovery or Windows automatic login.

## Validation and feedback

The GitHub Windows build, TypeScript compilation, and 10 automated state, settings, and language tests have passed. Interactive Windows operation, physical multi-monitor behavior, media playback, and login startup still require real-machine validation.

See **WINDOWS-VALIDATION.md** inside the download for the acceptance checklist. When reporting a problem, include the steps to reproduce it, expected and actual behavior, Windows version, display resolutions and scaling, media format, and any error shown in Control.
