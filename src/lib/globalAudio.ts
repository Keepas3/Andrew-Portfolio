export interface GlobalTrack {
  title: string;
  artist: string;
  album: string;
  durationString?: string;
  image: string;
  src: string;
}

export interface GlobalAudioProgress {
  src: string;
  currentTime: number;
  duration: number;
}

export function playGlobalTrack(track: GlobalTrack) {
  window.dispatchEvent(new CustomEvent("play-global-track", { detail: track }));
}

export function toggleGlobalAudio() {
  window.dispatchEvent(new CustomEvent("toggle-global-audio"));
}

export function seekGlobalAudio(time: number) {
  window.dispatchEvent(new CustomEvent("seek-global-audio", { detail: { time } }));
}
