// Othello Sound Manager using Web Audio API
class SoundManager {
    constructor() {
        this.enabled = true;
        this.audioCtx = null;
        this.volume = 0.3;
    }

    getContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Play a tone with given frequency, duration, and type
    playTone(freq, duration, type = 'sine', startTime = 0, vol = this.volume) {
        if (!this.enabled) return;
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    }

    // Sound when placing a disc
    place() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(this.volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    }

    // Sound when flipping a disc
    flip() {
        if (!this.enabled) return;
        const ctx = this.getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
    }

    // Sound when a player must pass
    pass() {
        if (!this.enabled) return;
        this.playTone(440, 0.15, 'sine', 0, this.volume * 0.6);
        this.playTone(330, 0.2, 'sine', 0.12, this.volume * 0.6);
    }

    // Victory sound - ascending cheerful arpeggio
    win() {
        if (!this.enabled) return;
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            this.playTone(freq, 0.2, 'sine', i * 0.12, this.volume * 0.7);
        });
    }

    // Defeat sound - descending minor notes
    lose() {
        if (!this.enabled) return;
        const notes = [440, 370, 330, 262]; // A4, F#4, E4, C4
        notes.forEach((freq, i) => {
            this.playTone(freq, 0.25, 'sine', i * 0.15, this.volume * 0.6);
        });
    }

    // Draw sound - neutral two-tone
    draw() {
        if (!this.enabled) return;
        this.playTone(440, 0.2, 'sine', 0, this.volume * 0.6);
        this.playTone(440, 0.2, 'sine', 0.25, this.volume * 0.6);
    }

    // Invalid move attempt
    invalid() {
        if (!this.enabled) return;
        this.playTone(200, 0.1, 'square', 0, this.volume * 0.3);
        this.playTone(160, 0.12, 'square', 0.08, this.volume * 0.3);
    }
}
