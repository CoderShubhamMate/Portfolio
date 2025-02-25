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
        
        // Set room dimensions
        this.roomWidth = 20;
        this.roomHeight = 8;
        this.roomDepth = 20;
        
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

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);
        
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0x00ffff, 1);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);
        
        // Additional point lights for atmosphere
        const colors = [0x00ffff, 0x0088ff, 0xff00ff];
        const positions = [
            new THREE.Vector3(-5, 5, -5),
            new THREE.Vector3(5, 5, -5),
            new THREE.Vector3(0, 5, 5)
        ];
        
        positions.forEach((pos, i) => {
            const light = new THREE.PointLight(colors[i], 0.5);
            light.position.copy(pos);
            this.scene.add(light);
        });
    }

    createRoom() {
        // Room dimensions
        const width = 20;
        const height = 8;
        const depth = 20;

        this.createWalls(width, height, depth);
        this.createFloor(width, depth);
        this.createWindows(width, height, depth);
        this.createFurniture();
        this.createSceneryOutside();
    }

    createWalls(width, height, depth) {
        // Create walls separately for windows
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x000066,
            metalness: 0.8,
            roughness: 0.2
        });

        // Back wall
        const backWall = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            wallMaterial.clone()
        );
        backWall.position.set(0, height/2, -depth/2);
        this.scene.add(backWall);

        // Front wall
        const frontWall = new THREE.Mesh(
            new THREE.PlaneGeometry(width, height),
            wallMaterial.clone()
        );
        frontWall.position.set(0, height/2, depth/2);
        frontWall.rotation.y = Math.PI;
        this.scene.add(frontWall);

        // Left wall
        const leftWall = new THREE.Mesh(
            new THREE.PlaneGeometry(depth, height),
            wallMaterial.clone()
        );
        leftWall.position.set(-width/2, height/2, 0);
        leftWall.rotation.y = Math.PI/2;
        this.scene.add(leftWall);

        // Right wall
        const rightWall = new THREE.Mesh(
            new THREE.PlaneGeometry(depth, height),
            wallMaterial.clone()
        );
        rightWall.position.set(width/2, height/2, 0);
        rightWall.rotation.y = -Math.PI/2;
        this.scene.add(rightWall);

        // Ceiling
        const ceiling = new THREE.Mesh(
            new THREE.PlaneGeometry(width, depth),
            wallMaterial.clone()
        );
        ceiling.position.set(0, height, 0);
        ceiling.rotation.x = Math.PI/2;
        this.scene.add(ceiling);
    }

    createFloor(width, depth) {
        // Create floor with glowing grid
        const floorGeometry = new THREE.PlaneGeometry(width, depth, 40, 40);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            metalness: 0.5,
            roughness: 0.5,
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        this.scene.add(floor);

        // Add reflective floor beneath the grid
        const solidFloorGeometry = new THREE.PlaneGeometry(width, depth);
        const solidFloorMaterial = new THREE.MeshStandardMaterial({
            color: 0x000033,
            metalness: 0.9,
            roughness: 0.1,
            envMap: this.createEnvironmentMap()
        });
        const solidFloor = new THREE.Mesh(solidFloorGeometry, solidFloorMaterial);
        solidFloor.rotation.x = -Math.PI / 2;
        solidFloor.position.y = -0.01; // Slightly below the grid
        this.scene.add(solidFloor);
    }

    createWindows(width, height, depth) {
        // Window dimensions
        const windowWidth = 4;
        const windowHeight = 3;
        const windowY = height/2;

        // Create window frames and glass
        const createWindow = (x, z, rotationY) => {
            // Window frame
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(windowWidth + 0.2, windowHeight + 0.2, 0.2),
                createGlowMaterial(0x0088ff)
            );
            frame.position.set(x, windowY, z);
            frame.rotation.y = rotationY;
            this.scene.add(frame);

            // Window glass
            const glass = new THREE.Mesh(
                new THREE.PlaneGeometry(windowWidth, windowHeight),
                new THREE.MeshPhysicalMaterial({
                    color: 0x88ccff,
                    metalness: 0.9,
                    roughness: 0.1,
                    transparent: true,
                    opacity: 0.3,
                    envMap: this.createEnvironmentMap()
                })
            );
            glass.position.set(x, windowY, z);
            glass.rotation.y = rotationY;
            this.scene.add(glass);
        };

        // Create windows on walls
        createWindow(-width/2 + 0.1, -depth/4, Math.PI/2); // Left wall
        createWindow(-width/2 + 0.1, depth/4, Math.PI/2);  // Left wall
        createWindow(width/2 - 0.1, -depth/4, -Math.PI/2); // Right wall
        createWindow(width/2 - 0.1, depth/4, -Math.PI/2);  // Right wall
    }

    createFurniture() {
        // Create a modern desk
        const desk = new THREE.Group();
        
        // Desk top
        const deskTop = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.1, 1.5),
            createGlowMaterial(0x0088ff)
        );
        desk.add(deskTop);

        // Desk legs
        const legGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
        const legMaterial = createGlowMaterial(0x0088ff);
        [-1.4, 1.4].forEach(x => {
            [-0.6, 0.6].forEach(z => {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(x, -0.5, z);
                desk.add(leg);
            });
        });

        // Add holographic screen
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 1.2),
            createHolographicMaterial(0x00ffff)
        );
        screen.position.set(0, 0.8, 0);
        desk.add(screen);

        // Position the desk
        desk.position.set(-5, 1, -3);
        this.scene.add(desk);

        // Create futuristic chairs
        this.createChair(-5, 1, -2);
        this.createChair(5, 1, -2);

        // Create floating shelves
        this.createFloatingShelf(-8, 3, -8);
        this.createFloatingShelf(-8, 4, -8);
        this.createFloatingShelf(-8, 5, -8);
    }

    createChair(x, y, z) {
        const chair = new THREE.Group();

        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.1, 0.8),
            createGlowMaterial(0x0088ff)
        );
        chair.add(seat);

        // Back
        const back = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1.2, 0.1),
            createGlowMaterial(0x0088ff)
        );
        back.position.set(0, 0.6, -0.35);
        chair.add(back);

        chair.position.set(x, y, z);
        this.scene.add(chair);
    }

    createFloatingShelf(x, y, z) {
        const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.1, 0.5),
            createGlowMaterial(0x0088ff)
        );
        shelf.position.set(x, y, z);
        this.scene.add(shelf);

        // Add some holographic items on the shelf
        const item = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.3, 0.3),
            createHolographicMaterial(0x00ffff)
        );
        item.position.set(x + 0.5, y + 0.2, z);
        this.scene.add(item);
    }

    createSceneryOutside() {
        // Create a large sphere for the space environment
        const spaceGeometry = new THREE.SphereGeometry(100, 64, 64);
        const spaceMaterial = new THREE.MeshBasicMaterial({
            map: this.createSpaceTexture(),
            side: THREE.BackSide
        });
        const space = new THREE.Mesh(spaceGeometry, spaceMaterial);
        this.scene.add(space);

        // Add some distant floating structures
        this.createFloatingStructure(-50, 0, -50);
        this.createFloatingStructure(50, 20, -80);
        this.createFloatingStructure(-30, -10, -100);
    }

    createSpaceTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        // Create space background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(1, '#000066');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add stars
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
            ctx.fill();
        }

        // Add nebula-like effects
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 200 + 100;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgba(0, 255, 255, ${Math.random() * 0.2})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createFloatingStructure(x, y, z) {
        const structure = new THREE.Group();

        // Create main body
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(10, 5, 10),
            createGlowMaterial(0x0088ff)
        );
        structure.add(body);

        // Add some details
        for (let i = 0; i < 5; i++) {
            const detail = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                createHolographicMaterial(0x00ffff)
            );
            detail.position.set(
                Math.random() * 10 - 5,
                Math.random() * 5 - 2.5,
                Math.random() * 10 - 5
            );
            structure.add(detail);
        }

        structure.position.set(x, y, z);
        this.scene.add(structure);
    }

    createEnvironmentMap() {
        const format = '.jpg';
        const urls = [
            'px' + format, 'nx' + format,
            'py' + format, 'ny' + format,
            'pz' + format, 'nz' + format
        ];

        const reflectionCube = new THREE.CubeTextureLoader()
            .setPath('assets/textures/skybox/')
            .load(urls);

        return reflectionCube;
    }
}
