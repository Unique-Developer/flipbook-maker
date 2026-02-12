/**
 * Page flip sound effect using Web Audio API
 * Creates a realistic paper flip sound
 */
export function playPageFlipSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create multiple oscillators for realistic sound
    const duration = 0.15;
    const now = audioContext.currentTime;
    
    // Low frequency thud (paper hitting surface)
    const lowOsc = audioContext.createOscillator();
    const lowGain = audioContext.createGain();
    lowOsc.connect(lowGain);
    lowGain.connect(audioContext.destination);
    
    lowOsc.frequency.setValueAtTime(80, now);
    lowOsc.type = 'sawtooth';
    lowGain.gain.setValueAtTime(0.15, now);
    lowGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    // Mid frequency rustle (paper movement)
    const midOsc = audioContext.createOscillator();
    const midGain = audioContext.createGain();
    midOsc.connect(midGain);
    midGain.connect(audioContext.destination);
    
    midOsc.frequency.setValueAtTime(200, now);
    midOsc.type = 'sine';
    midGain.gain.setValueAtTime(0.1, now);
    midGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.7);
    
    // High frequency swish (air movement)
    const highOsc = audioContext.createOscillator();
    const highGain = audioContext.createGain();
    highOsc.connect(highGain);
    highGain.connect(audioContext.destination);
    
    highOsc.frequency.setValueAtTime(400, now);
    highOsc.frequency.exponentialRampToValueAtTime(300, now + duration);
    highOsc.type = 'sine';
    highGain.gain.setValueAtTime(0.08, now);
    highGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    // Start all oscillators
    lowOsc.start(now);
    midOsc.start(now);
    highOsc.start(now);
    
    // Stop all oscillators
    lowOsc.stop(now + duration);
    midOsc.stop(now + duration);
    highOsc.stop(now + duration);
  } catch (error) {
    // Silently fail if audio context is not available
    console.debug('Audio context not available:', error);
  }
}

