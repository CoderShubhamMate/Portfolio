import * as THREE from 'three';

export class ClickSound {
    constructor(listener) {
        this.listener = listener;
        this.audioContext = listener.context;
        this.clickSound = this.createClickSound();
    }

    createClickSound() {
        const sampleRate = this.audioContext.sampleRate;
        const length = 0.1 * sampleRate; // 100ms
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            data[i] = Math.random() * 0.2; // White noise
        }

        const clickSound = new THREE.Audio(this.listener);
        clickSound.setBuffer(buffer);
        clickSound.setVolume(0.5);
        return clickSound;
    }

    play() {
        this.clickSound.play();
    }
}
