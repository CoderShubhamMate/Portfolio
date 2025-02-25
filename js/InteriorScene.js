import * as THREE from 'three';
import { createGlowMaterial, createHolographicMaterial, createFuturisticFurniture } from './utils.js';
import resumeData from './ResumeData.js';

export class InteriorScene {
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.moveSpeed = 0.1;
        this.rotationSpeed = 0.02;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.resumeDisplays = [];
        
        // Movement state
        this.keys = {
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
        
        // Set room dimensions
        this.roomWidth = 20;
        this.roomHeight = 8;
        this.roomDepth = 20;
        
        // Create room
        this.createRoom();
        
        // Add event listeners
        this.renderer.domElement.addEventListener('click', this.onClick.bind(this));
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Reset camera position
        this.camera.position.set(0, 2, 5);
        this.camera.lookAt(0, 2, -5);

        // Bind event handlers
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Set up keyboard event listeners
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);

        // Create resume displays
        this.createResumeDisplays();
    }

    setupLights() {
        // Ambient light with increased intensity
        const ambientLight = new THREE.AmbientLight(0x444444);
        this.scene.add(ambientLight);
        
        // Main directional light with shadows
        const mainLight = new THREE.DirectionalLight(0x00ffff, 1.5);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        this.scene.add(mainLight);
        
        // Additional point lights for atmosphere
        const colors = [0x00ffff, 0x0088ff, 0xff00ff];
        const positions = [
            new THREE.Vector3(-5, 5, -5),
            new THREE.Vector3(5, 5, -5),
            new THREE.Vector3(0, 5, 5)
        ];
        
        positions.forEach((pos, i) => {
            const light = new THREE.PointLight(colors[i], 0.8);
            light.position.copy(pos);
            light.castShadow = true;
            this.scene.add(light);
        });

        // Add rect area lights for wall illumination
        const rectLights = [
            { pos: [0, 4, -9.5], rot: [0, 0, 0], color: 0x0088ff },
            { pos: [0, 4, 9.5], rot: [0, Math.PI, 0], color: 0x0088ff },
            { pos: [-9.5, 4, 0], rot: [0, Math.PI/2, 0], color: 0x00ffff },
            { pos: [9.5, 4, 0], rot: [0, -Math.PI/2, 0], color: 0x00ffff }
        ];

        rectLights.forEach(config => {
            const rectLight = new THREE.RectAreaLight(config.color, 2, 8, 2);
            rectLight.position.set(...config.pos);
            rectLight.rotation.set(...config.rot);
            this.scene.add(rectLight);
        });
    }

    createRoom() {
        const width = this.roomWidth;
        const height = this.roomHeight;
        const depth = this.roomDepth;

        // Create basic room structure with enhanced materials
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x000066,
            metalness: 0.8,
            roughness: 0.2,
            envMapIntensity: 1.5
        });

        // Create walls with panels
        const walls = [
            { // Back wall
                position: [0, height/2, -depth/2],
                rotation: [0, 0, 0],
                dimensions: [width, height, 0.5]
            },
            { // Front wall
                position: [0, height/2, depth/2],
                rotation: [0, Math.PI, 0],
                dimensions: [width, height, 0.5]
            },
            { // Left wall
                position: [-width/2, height/2, 0],
                rotation: [0, Math.PI/2, 0],
                dimensions: [depth, height, 0.5]
            },
            { // Right wall
                position: [width/2, height/2, 0],
                rotation: [0, -Math.PI/2, 0],
                dimensions: [depth, height, 0.5]
            }
        ];

        walls.forEach(wall => {
            // Main wall
            const geometry = new THREE.BoxGeometry(...wall.dimensions);
            const mesh = new THREE.Mesh(geometry, wallMaterial.clone());
            mesh.position.set(...wall.position);
            mesh.rotation.set(...wall.rotation);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
        });

        // Enhanced floor with grid pattern
        const floorGeometry = new THREE.PlaneGeometry(width, depth, 40, 40);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x000033,
            metalness: 0.9,
            roughness: 0.1,
            envMapIntensity: 1.5
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Add glowing grid lines to floor
        const gridSize = 2;
        for (let x = -width/2; x <= width/2; x += gridSize) {
            const lineGeometry = new THREE.BoxGeometry(0.02, 0.02, depth);
            const lineMaterial = createGlowMaterial(0x00ffff);
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(x, 0.01, 0);
            this.scene.add(line);
        }
        for (let z = -depth/2; z <= depth/2; z += gridSize) {
            const lineGeometry = new THREE.BoxGeometry(width, 0.02, 0.02);
            const lineMaterial = createGlowMaterial(0x00ffff);
            const line = new THREE.Mesh(lineGeometry, lineMaterial);
            line.position.set(0, 0.01, z);
            this.scene.add(line);
        }

        // Enhanced ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
        const ceiling = new THREE.Mesh(ceilingGeometry, wallMaterial.clone());
        ceiling.position.y = height;
        ceiling.rotation.x = Math.PI / 2;
        ceiling.receiveShadow = true;
        this.scene.add(ceiling);
    }

    createResumeDisplays() {
        // Personal Info Display
        this.createHolographicPanel(
            -8, 2, -9,
            3, 2,
            "Personal Info",
            [
                `Name: ${resumeData.personalInfo.name}`,
                `Email: ${resumeData.personalInfo.email}`,
                `Contact: ${resumeData.personalInfo.contact}`,
                `LinkedIn: ${resumeData.personalInfo.linkedin}`
            ],
            0x00ffff
        );

        // Skills Display
        this.createHolographicPanel(
            0, 2, -9,
            3, 2,
            "Technical Skills",
            [
                "Programming Languages:",
                ...resumeData.technicalSkills.programmingLanguages,
                "",
                "Tools & Technologies:",
                ...resumeData.technicalSkills.tools
            ],
            0x0088ff
        );

        // Experience Display
        this.createHolographicPanel(
            8, 2, -9,
            3, 2,
            "Experience",
            [
                `${resumeData.experience[0].position} at ${resumeData.experience[0].company}`,
                `${resumeData.experience[0].period}`,
                "",
                ...resumeData.experience[0].achievements
            ],
            0xff00ff
        );

        // Education Display
        this.createHolographicPanel(
            -8, 2, 0,
            3, 2,
            "Education",
            [
                resumeData.education[0].institution,
                resumeData.education[0].degree,
                "",
                "Major Subjects:",
                ...resumeData.education[0].majorSubjects
            ],
            0x00ff88
        );

        // Projects Display
        this.createHolographicPanel(
            8, 2, 0,
            3, 2,
            "Projects",
            [
                resumeData.education[1].projects[0].name,
                "",
                ...resumeData.education[1].projects[0].details
            ],
            0xff8800
        );

        // Additional Info Display
        this.createHolographicPanel(
            0, 2, 9,
            3, 2,
            "Additional Info",
            resumeData.additional,
            0x88ff00
        );
    }

    createHolographicPanel(x, y, z, width, height, title, content, color) {
        const group = new THREE.Group();
        
        // Create frame
        const frameGeometry = new THREE.BoxGeometry(width + 0.2, height + 0.2, 0.1);
        const frameMaterial = createGlowMaterial(color);
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        group.add(frame);

        // Create display
        const displayGeometry = new THREE.PlaneGeometry(width, height);
        const displayMaterial = createHolographicMaterial(color);
        const display = new THREE.Mesh(displayGeometry, displayMaterial);
        display.position.z = 0.06;
        group.add(display);

        // Add title
        const titleCanvas = document.createElement('canvas');
        const ctx = titleCanvas.getContext('2d');
        titleCanvas.width = 512;
        titleCanvas.height = 64;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, titleCanvas.width, titleCanvas.height);
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#00ffff';
        ctx.textAlign = 'center';
        ctx.fillText(title, titleCanvas.width/2, titleCanvas.height/2 + 10);

        const titleTexture = new THREE.CanvasTexture(titleCanvas);
        const titleMaterial = new THREE.MeshBasicMaterial({
            map: titleTexture,
            transparent: true
        });
        
        const titleGeometry = new THREE.PlaneGeometry(width, height/4);
        const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
        titleMesh.position.y = height/2 + 0.2;
        titleMesh.position.z = 0.07;
        group.add(titleMesh);

        // Add content
        const contentCanvas = document.createElement('canvas');
        const contentCtx = contentCanvas.getContext('2d');
        contentCanvas.width = 512;
        contentCanvas.height = 512;
        
        contentCtx.fillStyle = '#000000';
        contentCtx.fillRect(0, 0, contentCanvas.width, contentCanvas.height);
        contentCtx.font = '24px Arial';
        contentCtx.fillStyle = '#00ffff';
        contentCtx.textAlign = 'left';
        
        content.forEach((line, index) => {
            contentCtx.fillText(line, 20, 40 + index * 30);
        });

        const contentTexture = new THREE.CanvasTexture(contentCanvas);
        const contentMaterial = new THREE.MeshBasicMaterial({
            map: contentTexture,
            transparent: true
        });
        
        const contentGeometry = new THREE.PlaneGeometry(width - 0.2, height - 0.4);
        const contentMesh = new THREE.Mesh(contentGeometry, contentMaterial);
        contentMesh.position.z = 0.07;
        group.add(contentMesh);

        // Position the group
        group.position.set(x, y, z);
        
        // Store reference
        this.resumeDisplays.push(group);
        
        // Add to scene
        this.scene.add(group);
    }

    handleKeyDown(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = true;
        }
    }

    handleKeyUp(event) {
        if (this.keys.hasOwnProperty(event.key)) {
            this.keys[event.key] = false;
        }
    }

    update() {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // Reset move vector
        this.moveVector.set(0, 0, 0);

        // Forward/Backward
        if (this.keys.ArrowUp) this.moveVector.z -= this.moveSpeed;
        if (this.keys.ArrowDown) this.moveVector.z += this.moveSpeed;

        // Left/Right rotation
        if (this.keys.ArrowLeft) this.camera.rotation.y += this.rotationSpeed;
        if (this.keys.ArrowRight) this.camera.rotation.y -= this.rotationSpeed;

        // Apply movement in camera's direction
        if (this.moveVector.length() > 0) {
            this.moveVector.applyQuaternion(this.camera.quaternion);
            const newPosition = this.camera.position.clone().add(this.moveVector);

            // Collision detection with room boundaries
            newPosition.x = Math.max(-this.roomWidth/2 + 1, Math.min(this.roomWidth/2 - 1, newPosition.x));
            newPosition.z = Math.max(-this.roomDepth/2 + 1, Math.min(this.roomDepth/2 - 1, newPosition.z));
            
            this.camera.position.copy(newPosition);
        }

        // Update holographic materials
        this.scene.traverse((child) => {
            if (child.material && child.material.type === 'ShaderMaterial') {
                if (child.material.uniforms && child.material.uniforms.time) {
                    child.material.uniforms.time.value = time;
                }
            }
        });

        // Animate resume displays
        this.resumeDisplays.forEach((display, index) => {
            display.position.y += Math.sin(time * 2 + index) * 0.0005;
            display.rotation.y = Math.sin(time * 0.5 + index) * 0.02;
        });
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        // Reset all object highlights
        this.scene.traverse((child) => {
            if (child.material && child.material.emissiveIntensity) {
                child.material.emissiveIntensity = 0.5;
            }
        });

        // Highlight intersected object
        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.material && object.material.emissiveIntensity) {
                object.material.emissiveIntensity = 2.0;
            }
        }
    }

    onClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.interactive) {
                console.log('Clicked interactive object');
            }
        }
    }

    render() {
        this.update();
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
