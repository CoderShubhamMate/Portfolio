import * as THREE from 'three';

export class AudioManager {
    constructor() {
        this.listener = new THREE.AudioListener();
        this.sounds = new Map();
        this.ambientSound = null;
        this.voiceEnabled = true;
        this.voiceVolume = 0.7;
        this.audioContext = this.listener.context;

        // Resume audio context on user interaction
        document.addEventListener('click', () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });

        // Also try to resume on keypress
        document.addEventListener('keydown', () => {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });
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
        this.sounds.set('click', clickSound);
    }

    async init(camera) {
        camera.add(this.listener);
        
        // Initialize sound objects
        this.sounds.set('doorOpen', new THREE.Audio(this.listener));
        this.sounds.set('doorClose', new THREE.Audio(this.listener));
        this.sounds.set('ambientLanding', new THREE.Audio(this.listener));
        this.sounds.set('ambientInterior', new THREE.Audio(this.listener));

        // Create procedural sounds
        await this.createProceduralSounds();
        
        // Create click sound
        this.createClickSound();
        
        console.log('Audio system initialized');
    }

    playUISound(name) {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const sound = this.sounds.get(name);
        if (sound && sound.buffer && this.voiceEnabled) {
            sound.setVolume(this.voiceVolume);
            sound.play();
        } else if (name === 'click') {
            const clickSound = this.sounds.get('click');
            if (clickSound) {
                clickSound.play();
            }
        }
    }

    async createProceduralSounds() {
        try {
            // Create ambient landing sound (low drone with modulation)
            const landingBuffer = await this.createDroneSound(10, 60, 0.3);
            const landingSound = this.sounds.get('ambientLanding');
            landingSound.setBuffer(landingBuffer);
            landingSound.setLoop(true);
            landingSound.setVolume(0.3);

            // Create ambient interior sound (higher pitched with more movement)
            const interiorBuffer = await this.createDroneSound(5, 120, 0.4);
            const interiorSound = this.sounds.get('ambientInterior');
            interiorSound.setBuffer(interiorBuffer);
            interiorSound.setLoop(true);
            interiorSound.setVolume(0.3);

            // Create door open sound (rising tone)
            const doorOpenBuffer = await this.createSweepSound(220, 440, 1, 'up');
            const doorOpenSound = this.sounds.get('doorOpen');
            doorOpenSound.setBuffer(doorOpenBuffer);
            doorOpenSound.setVolume(0.5);

            // Create door close sound (falling tone)
            const doorCloseBuffer = await this.createSweepSound(440, 220, 1, 'down');
            const doorCloseSound = this.sounds.get('doorClose');
            doorCloseSound.setBuffer(doorCloseBuffer);
            doorCloseSound.setVolume(0.5);
        } catch (error) {
            console.error('Error creating procedural sounds:', error);
        }
    }

    async createDroneSound(duration, baseFreq, modDepth) {
        const sampleRate = this.audioContext.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);

        // Fill both channels
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                // Base frequency
                const base = Math.sin(2 * Math.PI * baseFreq * t);
                // Modulation
                const mod = Math.sin(2 * Math.PI * 0.5 * t);
                // Combine with some noise for texture
                const noise = Math.random() * 0.1;
                data[i] = (base + mod * modDepth + noise) / (2 + modDepth);
            }
        }

        return buffer;
    }

    async createSweepSound(startFreq, endFreq, duration, direction = 'up') {
        const sampleRate = this.audioContext.sampleRate;
        const length = duration * sampleRate;
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);

        // Fill both channels
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            
            for (let i = 0; i < length; i++) {
                const t = i / sampleRate;
                const progress = t / duration;
                
                // Calculate frequency at this point
                const freq = direction === 'up' 
                    ? startFreq + (endFreq - startFreq) * progress
                    : endFreq + (startFreq - endFreq) * progress;
                
                // Generate tone
                const tone = Math.sin(2 * Math.PI * freq * t);
                
                // Apply envelope
                const envelope = Math.sin(Math.PI * progress);
                
                data[i] = tone * envelope;
            }
        }

        return buffer;
    }

    playAmbient(name, fadeDuration = 0) {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        console.log(`Playing ambient sound: ${name}`);
        
        if (this.ambientSound) {
            this.fadeOut(this.ambientSound, fadeDuration);
        }

        const newAmbient = this.sounds.get(name);
        if (newAmbient) {
            this.ambientSound = newAmbient;
            this.ambientSound.setVolume(this.voiceEnabled ? this.voiceVolume : 0);
            this.ambientSound.play();
        }
    }

    async playDoorSequence() {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        const doorOpen = this.sounds.get('doorOpen');
        const doorClose = this.sounds.get('doorClose');

        if (doorOpen) {
            doorOpen.play();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (doorClose) {
            doorClose.play();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    setVoiceEnabled(enabled) {
        this.voiceEnabled = enabled;
        this.sounds.forEach(sound => {
            if (sound.isPlaying) {
                sound.setVolume(enabled ? this.voiceVolume : 0);
            }
        });
    }

    toggleVoice() {
        this.voiceEnabled = !this.voiceEnabled;
        this.setVoiceEnabled(this.voiceEnabled);
        return this.voiceEnabled;
    }

    fadeOut(sound, duration) {
        if (!sound || !sound.isPlaying) return;

        if (duration > 0) {
            const originalVolume = sound.getVolume();
            const steps = 10;
            const stepDuration = duration / steps;
            const volumeStep = originalVolume / steps;

            let step = 0;
            const fadeInterval = setInterval(() => {
                step++;
                if (step >= steps) {
                    clearInterval(fadeInterval);
                    sound.stop();
                } else {
                    sound.setVolume(originalVolume - (volumeStep * step));
                }
            }, stepDuration);
        } else {
            sound.stop();
        }
    }

    playUISound(name) {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const sound = this.sounds.get(name);
        if (sound && sound.buffer && this.voiceEnabled) {
            sound.setVolume(this.voiceVolume);
            sound.play();
        }
    }
}
