export interface DisplayInfo { id: number; label: string; width: number; height: number; primary: boolean }
export interface OutputStatus { open: boolean; displayId?: number; message: string }
export interface MediaItem { id: string; name: string; url: string; type: 'video' | 'image' }
export interface OverlayStyle {
 enabled: boolean; x: number; y: number; fontSize: number; fontFamily: string; fontWeight: number;
 color: string; align: 'left' | 'center' | 'right'; backgroundEnabled: boolean;
 backgroundColor: string; backgroundOpacity: number; padding: number;
}
export interface Countdown extends OverlayStyle { durationMs: number; remainingMs: number; running: boolean; deadline: number | null; revision: number }
export interface Scene {
 media: { item: MediaItem | null; playing: boolean; loop: boolean; restartToken: number };
 clock: OverlayStyle & { format: 'HH:mm' | 'HH:mm:ss' | 'YYYY/MM/DD HH:mm' };
 countdown: Countdown;
 text: OverlayStyle & { text: string };
}
export interface Preferences { restoreOnLaunch:boolean; startAtLogin:boolean; language:'en'|'ja'|'zh-Hant'|'zh-Hans' }
export interface StartupSettings { preferences:Preferences; preview:Scene; selectedDisplayId?:number; savedAt:string|null; loginSupported:boolean }
export interface Snapshot { program: Scene; media: MediaItem[]; output: OutputStatus; error: string | null }
export type TimerAction = 'start' | 'pause' | 'reset';
export type PlaybackAction = 'play' | 'pause' | 'restart' | 'loop';
export interface DesktopAPI {
 getStartupSettings():Promise<StartupSettings>; updatePreferences(value:Preferences):Promise<StartupSettings>;
 updatePreview(scene:Scene):Promise<void>; saveSettings(scene:Scene,displayId:number):Promise<StartupSettings>;
 getDisplays(): Promise<DisplayInfo[]>; getSnapshot(): Promise<Snapshot>;
 startOutput(id: number): Promise<OutputStatus>; stopOutput(): Promise<void>;
 addMedia(): Promise<MediaItem[]>; removeMedia(id: string): Promise<void>;
 take(scene: Scene): Promise<void>; clear(): Promise<void>;
 playback(action: PlaybackAction): Promise<void>; timer(action: TimerAction): Promise<void>;
 reportMediaError(id: string): void; reportEnded(id: string, restartToken: number): void;
 onDisplays(callback: (displays: DisplayInfo[]) => void): () => void;
 onSnapshot(callback: (snapshot: Snapshot) => void): () => void;
}
declare global { interface Window { av: DesktopAPI } }
