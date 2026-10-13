# AV Presenter 0.4.0

AV Presenter is a lightweight Windows and macOS desktop application for video and image playback with live clock, countdown, and text overlays. It is designed for small exhibitions, corporate events, conference rooms, break screens, and return monitors.

This is a public testing release. It supports a simple operator workflow: prepare a scene in Preview, check it, and press **TAKE** to send it to Program.

## Download and run

1. Download **AV-Presenter-Windows-x64-0.4.0.zip** from the Assets section below.
2. Extract the entire archive to a local folder.
3. Open the **win-unpacked** folder and run **AV Presenter.exe**.

No Node.js installation is required. Keep all files and folders beside the executable together. Windows 11 x64 is the primary target. The application is unsigned.

**AV-Presenter-Source-0.4.0.zip** contains the source code. **SHA256SUMS.txt** contains checksums for the downloadable ZIP files.

## macOS download and installation

- **Apple Silicon (M series):** download `AV-Presenter-macOS-arm64-0.4.0.dmg`.
- **Intel Mac:** download `AV-Presenter-macOS-x64-0.4.0.dmg`.
- macOS 12 Monterey or later is required. Native builds and launch tests run on macOS 15; older systems remain to be verified on physical Macs.
- Open the disk image and drag **AV Presenter.app** into **Applications**. Eject the disk image and launch the installed app. ZIP bundles are also available for each architecture.
- Testing apps have **ad-hoc local signatures**, without Apple Developer ID signing or notarization. If Gatekeeper blocks the downloaded app, try opening it, then use **System Settings → Privacy & Security → Open Anyway** when available. Managed Macs may need administrator approval.

macOS includes the same Preview/Program workflow, TAKE video playback, text/clock/countdown with 8 positions each, decimal positioning, saved scenes, exhibition restore, and control-video load reduction. External multi-display Output uses a borderless full-display window without creating a native fullscreen Space. Mac application/edit/window menus support standard editing shortcuts and Command-Q.

Install the app in its final Applications location before enabling **Start automatically at login**. macOS login startup and external-display behavior still require physical testing. See **MACOS-VALIDATION.md** in the repository or inside the app bundle for the full checklist.

## Preview cue behavior

Importing or selecting media now cues Preview paused at its first frame. Re-selecting the same video also returns Preview to its first frame and pauses it. Press **TAKE** when ready: the selected video starts playing on Program even if Preview is paused. Preview keeps its own prepared playback state. Taking the same video again starts or resumes playback without resetting its position, unless it was explicitly restarted or re-cued. Countdown start/pause controls remain separate; saved exhibition playback settings continue to restore as saved.

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
- Press **TAKE** to copy the prepared scene to Program and start or resume the selected video.
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

- Display multiline text above background media, repeated at up to 8 independently styled positions.
- Adjust visibility, text content, font family, size, weight, alignment, color, X/Y position, padding, and optional background color/opacity.
- Use positioning presets for corners, top/bottom center, or the center of the screen.

### Multiple display positions

- Repeat the same text, clock, or countdown at up to **8 positions per overlay**.
- Click **Add position**, then choose a position in **Edit position** to adjust its font, size, color, alignment, X/Y coordinates, padding, and background independently.
- New positions copy the selected style with a small vertical offset. Remove additional positions with **Remove position**; the original position remains.
- Enter content once: every text position updates together, every clock position shows the same system time, and every countdown position uses the same timer.
- Prepare changes in Preview and press **TAKE** to send all positions to Program. **CLEAR OVERLAYS** hides all Program positions while media continues.
- Save and restore every position for exhibition startup. Existing 0.2 settings remain compatible and load with one position per overlay.

For example, show “Next stage starts at 10:00” at both the top and bottom of a screen with different font sizes while maintaining one shared message.

### Fine position adjustment

- Enter decimal percentages in X/Y position fields, such as **2.5%** or **25.55%**.
- Use the field arrows to adjust coordinates in **0.01%** increments, within 0–100%.
- Fine positioning works for every text, clock, and countdown position, including additional positions.
- TAKE and saved-settings restoration preserve decimal coordinates.

### Output performance controls

- Overlay text is written only when the displayed value changes, avoiding repeated updates of static messages and unchanged clock/countdown values.
- Overlay edits no longer repeatedly request video playback.
- Control video previews preload metadata; active Output retains full video preloading.
- Hidden or minimized Control pauses its own videos and overlay updates while external Output continues independently.
- Enable **Reduce control video load while output is active** below the Control monitors to pause both Control video previews while Output is open. This avoids their additional continuous video decoding; external video, audio, resolution, and overlays continue normally.
- Visible Control still updates text, clock, and countdown in this mode. TAKE and Program transport continue to operate external Output.
- Disable the option or stop Output to resume Control video previews. The preference is remembered and is off by default, including for existing settings.

For 4K playback, compare the same media with this option off/on and with Control minimized. Actual improvement depends on the CPU, GPU, codec, frame rate, and display refresh rate; hardware-specific 4K performance has not yet been measured.

### Interface languages

Choose **English**, **Japanese**, **Traditional Chinese**, or **Simplified Chinese** from the language menu. The selection is remembered. Changing the interface language does not translate your overlay text or change Program content.

### Saved settings and exhibition startup

- **SAVE CURRENT SETTINGS** saves Preview and Program scenes, overlay styles, countdown state, media references, and the selected output display.
- **Restore current state on next launch** automatically saves subsequent changes and restores the saved state when the application starts.
- Previously playing media resumes its saved play/loop settings from the beginning of the video. Previously active output reopens on the saved display.
- Countdowns resume from their saved remaining time; time while the application was closed is excluded.
- **Start automatically at login** registers the installed application to launch after the Windows or macOS user logs in.

For daily exhibition use, place the application and media in fixed locations, prepare the intended scene, TAKE it to Program, start output, and enable both restore and login startup. If you move the application later, disable and re-enable login startup from its new location.

## Current scope and limitations

- One Program output with one shared text source, one clock, and one countdown; each supports up to 8 display positions.
- Rendering uses a 1920 × 1080 logical canvas and scales proportionally; displays with other aspect ratios may show black bars.
- Video restarts from the beginning when output is reopened or the application restarts; exact playback position is not saved.
- PowerPoint playback, PDF slides, transitions, NDI, DeckLink/SDI, and professional frame synchronization are not included.
- Automatic startup requires a user login. The application does not configure power recovery or automatic OS login.

## Validation and feedback

TypeScript compilation and 20 automated tests covering state, settings, languages, multiple-position rendering, playback suspension, and redundant-update avoidance pass locally. The release workflow packages Windows x64 and native macOS arm64/x64 builds. Each Mac build verifies the local signature and runs a packaged-app smoke test covering launch, IPC, image decoding, multi-position TAKE, Output, and saved-state restoration before publishing. Gatekeeper behavior on downloaded apps, login startup, physical multi-monitor behavior, video/audio playback, and 4K performance still require real-machine validation.

See **WINDOWS-VALIDATION.md** or **MACOS-VALIDATION.md** for your platform for the acceptance checklist. When reporting a problem, include the steps to reproduce it, expected and actual behavior, Windows version, display resolutions and scaling, media format, and any error shown in Control.
