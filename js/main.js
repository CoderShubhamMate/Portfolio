import * as THREE from 'three';
import { LandingScene } from './LandingScene.js';
import { InteriorScene } from './InteriorScene.js';
import { AudioManager } from './AudioManager.js';

class SciFiPortfolio {
    constructor() {
        // Ensure DOM is loaded before accessing elements
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                try {
                    await this.initialize();
                } catch (error) {
                    console.error('Failed to initialize:', error);
                    this.showError('Failed to initialize application: ' + error.message);
                }
            });
        } else {
            this.initialize().catch(error => {
                console.error('Failed to initialize:', error);
                this.showError('Failed to initialize application: ' + error.message);
            });
        }
    }

    showError(message) {
        const errorOverlay = document.getElementById('error-overlay');
        const errorMessage = document.getElementById('error-message');
        if (errorOverlay && errorMessage) {
            errorMessage.textContent = message;
            errorOverlay.classList.remove('hidden');
        }
    }

    async initialize() {
        try {
            console.log('Initializing application...');
            
            // Get DOM elements
            this.canvas = document.getElementById('scene');
            this.loadingOverlay = document.getElementById('loading-overlay');
            this.enterInstruction = document.getElementById('enter-instruction');
            this.welcomeOverlay = document.getElementById('welcome-overlay');
            this.errorOverlay = document.getElementById('error-overlay');

            if (!this.canvas) throw new Error('Canvas element not found');
            if (!this.loadingOverlay || !this.enterInstruction || !this.welcomeOverlay || !this.errorOverlay) {
                throw new Error('Required overlay elements not found');
            }

            // Show loading screen first
            this.showLoadingScreen();

            // Initialize Three.js components
            this.initThreeJS();
            
            // Initialize audio and scenes
            await this.setupScenes();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start animation loop
            this.animate();
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showError('Failed to initialize application: ' + error.message);
        }
    }


    initThreeJS() {
        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Initialize camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
    }

    async setupScenes() {
        try {
            // Initialize audio
            this.audioManager = new AudioManager();
            await this.audioManager.init(this.camera);
            
            // Initialize scenes
            this.landingScene = new LandingScene(this.camera, this.renderer, this.audioManager);
            this.interiorScene = new InteriorScene(this.camera, this.renderer, this.audioManager);
            this.currentScene = this.landingScene;
            
            console.log("Scenes initialized, current scene:", this.currentScene === this.landingScene ? "Landing" : "Interior");
        } catch (error) {
            console.error("Error setting up scenes:", error);
            throw error;
        }
    }

    setupEventListeners() {
        // Bind the methods to preserve 'this' context
        this.handleResize = this.handleResize.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleEnterClick = this.handleEnterClick.bind(this);
        
        // Add event listeners
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Add click handler for enter button
        const enterButton = document.getElementById('enter-button');
        if (enterButton) {
            enterButton.addEventListener('click', this.handleEnterClick);
        }
        
        console.log("Event listeners set up");
        
        // Mobile touch controls
        if ('ontouchstart' in window) {
            this.setupMobileControls();
        }
    }

    setupMobileControls() {
        const options = {
            zone: document.body,
            mode: 'static',
            position: { left: '50%', bottom: '50px' },
            color: 'white'
        };

        const joystick = nipplejs.create(options);
        joystick.on('move', (evt, data) => {
            if (this.currentScene === this.interiorScene) {
                this.interiorScene.handleJoystickMove(data);
            }
        });
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    async handleEnterClick() {
        console.log('Enter button clicked');
        if (this.currentScene === this.landingScene) {
            console.log('In landing scene, starting transition...');
            await this.transitionToInterior();
        }
    }

    async handleKeyDown(event) {
        console.log(`Key pressed: ${event.key}`);
        console.log('Current scene:', this.currentScene === this.landingScene ? 'Landing' : 'Interior');
        
        if (event.key === 'Enter' || event.code === 'Enter' || event.key === 'e') {
            console.log('Enter key detected:', event.key, event.code, event.keyCode);
            if (this.currentScene === this.landingScene) {
                console.log('In landing scene, starting transition...');
                await this.transitionToInterior();
            } else {
                console.log('Not in landing scene, ignoring Enter key');
            }
        } else if (event.key === 'Escape') {
            console.log('Escape key detected');
            if (this.currentScene === this.interiorScene) {
                console.log('In interior scene, transitioning to landing...');
                this.transitionToLanding();
            } else {
                console.log('Not in interior scene, ignoring Escape key');
            }
        }
    }

    async transitionToInterior() {
        try {
            console.log("Starting transition to interior...");
            
            if (!this.landingScene || !this.interiorScene) {
                throw new Error("Required scenes not initialized");
            }

            // Hide enter instruction
            this.enterInstruction.classList.add('hidden');

            // Animate door opening
            console.log("Triggering door animation...");
            await this.landingScene.animateDoorOpen();
            console.log("Door animation completed");

            // Fade out landing scene audio
            if (this.audioManager) {
                this.audioManager.playAmbient('ambientInterior', 1.0);
            }

            // Switch scenes
            console.log("Switching to interior scene...");
            this.currentScene = this.interiorScene;

            // Reset camera position for interior scene
            this.camera.position.set(0, 2, 5);
            this.camera.lookAt(0, 2, -5);

            // Show welcome overlay
            console.log("Showing welcome overlay...");
            this.welcomeOverlay.classList.remove('hidden');

            // Setup dismiss button
            const dismissButton = document.getElementById('welcome-dismiss');
            if (!dismissButton) {
                throw new Error("Welcome dismiss button not found");
            }
            
            dismissButton.onclick = () => {
                console.log("Dismissing welcome overlay...");
                this.welcomeOverlay.classList.add('hidden');
            };
            
            console.log("Transition completed successfully");
        } catch (error) {
            console.error("Transition error:", error);
            this.showError('Failed to transition to interior scene: ' + error.message, error);
        }
    }

    transitionToLanding() {
        this.interiorScene.cleanup(); // Clean up the interior scene
        this.currentScene = this.landingScene;
        this.enterInstruction.classList.remove('hidden');
    }

    showLoadingScreen() {
        this.loadingOverlay.classList.remove('hidden');
        
        // Simulate loading progress
        let progress = 0;
        const progressText = document.querySelector('.progress-text');
        
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.hideLoadingScreen();
            }
            progressText.textContent = `Portal Stabilization: ${Math.floor(progress)}%`;
        }, 200);
    }

    hideLoadingScreen() {
        this.loadingOverlay.classList.add('hidden');
        this.enterInstruction.classList.remove('hidden');
    }

    showError(message, error) {
        console.error(error);
        this.errorOverlay.classList.remove('hidden');
        document.getElementById('error-message').textContent = message;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.currentScene.render();
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SciFiPortfolio();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        document.getElementById('error-overlay').classList.remove('hidden');
        document.getElementById('error-message').textContent = 
            'Failed to initialize application. Please check console for details.';
    }
});
