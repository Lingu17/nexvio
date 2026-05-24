export type BrowserMediaDevice = {
  deviceId: string;
  kind: MediaDeviceKind;
  label: string;
};

type ExtendedWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export type SpeechRecognitionConstructor = new () => SpeechRecognition;

export type SpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

export type SpeechRecognitionErrorEvent = Event & {
  error: string;
  message?: string;
};

export async function requestBrowserStream(options: {
  audio: boolean | MediaTrackConstraints;
  video: boolean | MediaTrackConstraints;
}) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not support camera and microphone access.");
  }

  return navigator.mediaDevices.getUserMedia({
    audio: options.audio,
    video: options.video,
  });
}

export async function enumerateBrowserDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return [];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.map<BrowserMediaDevice>((device, index) => ({
    deviceId: device.deviceId,
    kind: device.kind,
    label: device.label || `${device.kind} ${index + 1}`,
  }));
}

export function stopBrowserStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function getSpeechRecognitionCtor() {
  const extendedWindow = window as ExtendedWindow;
  return extendedWindow.SpeechRecognition || extendedWindow.webkitSpeechRecognition || null;
}

export function speakWithBrowserVoice(text: string, voiceName?: string) {
  if (!("speechSynthesis" in window)) return null;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const preferredVoice =
    voices.find((voice) => voice.name.includes(voiceName ?? "")) ||
    voices.find((voice) => /en/i.test(voice.lang)) ||
    voices[0];

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function playSpeakerTest(voiceName?: string) {
  return speakWithBrowserVoice("This is a Nexvio speaker test. Your interview audio is ready.", voiceName);
}
