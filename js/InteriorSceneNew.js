import * as THREE from 'three';
import { createGlowMaterial, createHolographicMaterial } from './utils.js';
import { ClickSound } from './ClickSound.js';

export class InteriorScene {
    constructor(camera, renderer, audioManager) {
        this.camera = camera;
        this.renderer = renderer;
        this.audioManager = audioManager;
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.moveSpeed = 0.1;
        this.rotationSpeed = 0.02;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.clickSound = new ClickSound(this.audioManager.listener);
        
        // Movement state
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };
        this.moveVector = new THREE.Vector3();
        this.init();
    }

    init() {
        // Set up scene
        this.scene.background = new THREE.Color(0x000033);
        
        // Add lights
        this.setupLights();
        
        // Create room
        this.createRoom();
        
        // Create interactive elements
        this.createTerminal();
        this.createDisplayWall();
        
        // Add click event listener
        this.renderer.domElement.addEventListener('click', this.onClick.bind(this));
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Reset camera position
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 2, -5);

        // Bind event handlers to maintain correct 'this' context
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Set up keyboard event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(event) {
        const key = event.key;
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = true;
        }
    }

    handleKeyUp(event) {
        const key = event.key;
        if (this.keys.hasOwnProperty(key)) {
            this.keys[key] = false;
        }
    }

    updateCamera() {
        // Calculate movement based on key states
        const moveSpeed = this.moveSpeed;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

        // WASD or Arrow keys
        if (this.keys.w || this.keys.ArrowUp) this.camera.position.addScaledVector(forward, moveSpeed);
        if (this.keys.s || this.keys.ArrowDown) this.camera.position.addScaledVector(forward, -moveSpeed);
        if (this.keys.a || this.keys.ArrowLeft) this.camera.position.addScaledVector(right, -moveSpeed);
        if (this.keys.d || this.keys.ArrowRight) this.camera.position.addScaledVector(right, moveSpeed);

        // Keep camera within room bounds
        this.constrainToRoom();
    }

    createTerminal() {
        // Project data
        this.projects = [
            {
                title: "Project Alpha",
                description: "A cutting-edge web application built with React and Node.js",
                technologies: ["React", "Node.js", "MongoDB"],
                link: "https://github.com/username/project-alpha"
            },
            {
                title: "Project Beta",
                description: "Machine learning model for predictive analytics",
                technologies: ["Python", "TensorFlow", "scikit-learn"],
                link: "https://github.com/username/project-beta"
            },
            {
                title: "Project Gamma",
                description: "Real-time data visualization dashboard",
                technologies: ["D3.js", "Vue.js", "Firebase"],
                link: "https://github.com/username/project-gamma"
            }
        ];

        this.currentProject = 0;

        // Create terminal base
        const terminalBase = new THREE.Group();
        
        // Terminal stand
        const stand = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, 1.2, 8),
            createGlowMaterial(0x0088ff)
        );
        stand.position.y = 0.6;
        terminalBase.add(stand);

        // Terminal screen
        const screen = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2, 0.1),
            createGlowMaterial(0x0088ff)
        );
        screen.position.y = 1.5;
        terminalBase.add(screen);

        // Holographic display
        const display = new THREE.Mesh(
            new THREE.PlaneGeometry(2.8, 1.8),
            createHolographicMaterial(0x00ffff)
        );
        display.position.set(0, 1.5, 0.06);
        terminalBase.add(display);

        // Position the terminal
        terminalBase.position.set(0, 0, -8);
        this.scene.add(terminalBase);

        // Make terminal interactive
        display.userData.interactive = true;
        display.userData.type = 'terminal';

        // Update display with initial project
        this.updateTerminalDisplay();
    }

    createDisplayWall() {
        // Skills and achievements data
        this.skills = [
            {
                category: "Frontend Development",
                items: ["HTML5", "CSS3", "JavaScript", "React", "Vue.js"]
            },
            {
                category: "Backend Development",
                items: ["Node.js", "Python", "Java", "SQL", "MongoDB"]
            },
            {
                category: "Tools & Technologies",
                items: ["Git", "Docker", "AWS", "Jenkins", "Kubernetes"]
            },
            {
                category: "Achievements",
                items: [
                    "Best Developer Award 2023",
                    "5+ Years Experience",
                    "100+ Projects Completed",
                    "Open Source Contributor"
                ]
            }
        ];

        // Create wall panels
        const panelWidth = 2;
        const panelHeight = 1.5;
        const gap = 0.5;
        const startX = -6;
        const startY = 2;

        this.panels = [];

        this.skills.forEach((skill, index) => {
            const panel = new THREE.Group();

            // Panel background
            const background = new THREE.Mesh(
                new THREE.PlaneGeometry(panelWidth, panelHeight),
                createGlowMaterial(0x0088ff)
            );
            panel.add(background);

            // Holographic display
            const display = new THREE.Mesh(
                new THREE.PlaneGeometry(panelWidth - 0.2, panelHeight - 0.2),
                createHolographicMaterial(0x00ffff)
            );
            display.position.z = 0.01;
            panel.add(display);

            // Position panel
            const row = Math.floor(index / 2);
            const col = index % 2;
            panel.position.set(
                startX + col * (panelWidth + gap),
                startY + row * (panelHeight + gap),
                -9.5
            );

            // Make panel interactive
            display.userData.interactive = true;
            display.userData.type = 'panel';
            display.userData.index = index;

            this.panels.push(panel);
            this.scene.add(panel);
        });

        // Update initial panel displays
        this.panels.forEach((panel, index) => {
            this.updatePanelDisplay(panel, this.skills[index]);
        });
    }

    updateTerminalDisplay() {
        const project = this.projects[this.currentProject];
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Set up text styling
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '24px "Orbitron"';
        ctx.fillStyle = '#00ffff';
        ctx.textAlign = 'center';

        // Draw project information
        ctx.fillText(project.title, canvas.width/2, 100);
        
        // Description (word wrap)
        const words = project.description.split(' ');
        let line = '';
        let y = 160;
        for (const word of words) {
            const testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > canvas.width - 40) {
                ctx.fillText(line, canvas.width/2, y);
                line = word + ' ';
                y += 30;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, canvas.width/2, y);

        // Technologies
        y += 60;
        ctx.fillText('Technologies:', canvas.width/2, y);
        y += 30;
        ctx.font = '20px "Exo 2"';
        ctx.fillText(project.technologies.join(' • '), canvas.width/2, y);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    updatePanelDisplay(panel, skillData) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Set up text styling
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '24px "Orbitron"';
        ctx.fillStyle = '#00ffff';
        ctx.textAlign = 'center';

        // Draw category
        ctx.fillText(skillData.category, canvas.width/2, 100);

        // Draw items
        ctx.font = '20px "Exo 2"';
        let y = 160;
        for (const item of skillData.items) {
            ctx.fillText(item, canvas.width/2, y);
            y += 40;
        }

        const texture = new THREE.CanvasTexture(canvas);
        panel.children[1].material.uniforms.texture.value = texture;
    }

    onClick(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Calculate objects intersecting the picking ray
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        for (const intersect of intersects) {
            if (intersect.object.userData.interactive) {
                if (this.clickSound) {
                    this.clickSound.play();
                }

                if (intersect.object.userData.type === 'terminal') {
                    this.currentProject = (this.currentProject + 1) % this.projects.length;
                    this.updateTerminalDisplay();
                } else if (intersect.object.userData.type === 'panel') {
                    const index = intersect.object.userData.index;
                    if (index < this.skills.length) {
                        this.updatePanelDisplay(this.panels[index], this.skills[index]);
                    }
                }
                break;
            }
        }
    }

    onMouseMove(event) {
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    render() {
        const delta = this.clock.getDelta();
        
        // Update camera position based on input
        this.updateCamera();
        
        // Update holographic materials
        this.scene.traverse((child) => {
            if (child.material && child.material.uniforms) {
                child.material.uniforms.time.value += delta;
            }
        });
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        // Handle hover effects
        this.scene.traverse((child) => {
            if (child.material && child.material.uniforms && child.material.uniforms.hovered) {
                child.material.uniforms.hovered.value = false;
            }
        });
        
        for (const intersect of intersects) {
            if (intersect.object.userData.interactive) {
                intersect.object.material.uniforms.hovered.value = true;
                break;
            }
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    cleanup() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        this.renderer.domElement.removeEventListener('click', this.onClick);
        this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
    }
}
