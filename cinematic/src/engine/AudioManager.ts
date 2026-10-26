/**
 * Synthesised night-forest ambience (wind + low drone + distant crickets), ported from the
 * classic site. Silent until the visitor turns it on, which also satisfies autoplay rules.
 *
 * shortcut: no recorded audio exists yet, so this uses Web Audio synthesis instead of Howler.js;
 * switch to Howler sprites once real forest/rain/footstep recordings are added to public/assets/audio.
 */
export class AudioManager {
  private context: AudioContext | undefined;
  private master: GainNode | undefined;
  private wind: BiquadFilterNode | undefined;

  private build(): void {
    if (this.context) return;
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);

    const noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    const wind = context.createBiquadFilter();
    wind.type = 'lowpass';
    wind.frequency.value = 420;
    const windGain = context.createGain();
    windGain.gain.value = 0.05;
    source.connect(wind).connect(windGain).connect(master);
    source.start();

    const drone = context.createOscillator();
    drone.frequency.value = 73;
    const droneGain = context.createGain();
    droneGain.gain.value = 0.014;
    drone.connect(droneGain).connect(master);
    drone.start();

    // Crickets: a high tone gated by a fast square LFO, gated again by a slow one.
    const cricket = context.createOscillator();
    cricket.frequency.value = 4400;
    const chirp = context.createGain();
    chirp.gain.value = 0;
    const lfo = context.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 28;
    const lfoDepth = context.createGain();
    lfoDepth.gain.value = 0.004;
    lfo.connect(lfoDepth).connect(chirp.gain);
    cricket.connect(chirp).connect(master);
    cricket.start();
    lfo.start();

    this.context = context;
    this.master = master;
    this.wind = wind;
  }

  async setEnabled(on: boolean): Promise<void> {
    if (on) this.build();
    if (!this.context || !this.master) return;
    await this.context.resume();
    this.master.gain.setTargetAtTime(on ? 0.6 : 0, this.context.currentTime, 0.4);
  }

  /** Wind opens up as the forest comes out of darkness. */
  setAtmosphere(darkness: number): void {
    if (!this.context || !this.wind) return;
    this.wind.frequency.setTargetAtTime(300 + (1 - darkness) * 380, this.context.currentTime, 0.5);
  }

  dispose(): void {
    void this.context?.close();
    this.context = undefined;
  }
}
