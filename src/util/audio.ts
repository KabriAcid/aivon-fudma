export default function playBeep(frequency = 440, duration = 100) {
  try {
    const audioContent = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContent.createOscillator();
    const gain = audioContent.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(audioContent.destination);

    gain.gain.setValueAtTime(0.1, audioContent.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContent.currentTime + duration / 1000);

    oscillator.start();
    oscillator.stop(audioContent.currentTime + duration / 1000);
  } catch (e) {
    console.error("Audio beep failed", e);
  }
}

// DTMF Frequencies
export const DTMF_FREQS: Record<string, [number, number]> = {
  "1": [697, 1209],
  "2": [697, 1336],
  "3": [697, 1477],
  "4": [770, 1209],
  "5": [770, 1336],
  "6": [770, 1477],
  "7": [852, 1209],
  "8": [852, 1336],
  "9": [852, 1477],
  "*": [941, 1209],
  "0": [941, 1336],
  "#": [941, 1477],
};

export function playDTMF(digit: string) {
  const freqs = DTMF_FREQS[digit];
  if (!freqs) return;

  try {
    const audioContent = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    [freqs[0], freqs[1]].forEach(f => {
      const osc = audioContent.createOscillator();
      const gain = audioContent.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.connect(gain);
      gain.connect(audioContent.destination);
      gain.gain.setValueAtTime(0.05, audioContent.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContent.currentTime + 0.15);
      osc.start();
      osc.stop(audioContent.currentTime + 0.15);
    });
  } catch (e) {
    console.error("DTMF failed", e);
  }
}
