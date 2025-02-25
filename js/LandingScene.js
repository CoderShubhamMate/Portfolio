import * as THREE from 'three';
import { 
    createGlowMaterial, 
    createHolographicMaterial, 
    createParticles, 
    animateParticles, 
    createTextSprite,
    createSkybox,
    createFloatingStructure
} from './utils.js';

export class LandingScene {
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.particles = null;
        this.door = null;
        this.doorText = null;
        this.floatingStructures = [];
        this.isAnimating = false;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Bind methods
        this.onMouseMove = this.onMouseMove.bind(this);
        
        // Add mouse move listener
        window.addEventListener('mousemove', this.onMouseMove);

        this.init();
    }

    init() {
        // Add skybox
        const skybox = createSkybox();
        this.scene.add(skybox);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Add point lights for atmosphere
        const colors = [0x00ffff, 0xff00ff, 0x0088ff];
        const positions = [
            [-10, 5, -10],
            [10, 5, -10],
            [0, 5, 10]
        ];

        positions.forEach((pos, i) => {
            const light = new THREE.PointLight(colors[i], 0.5);
            light.position.set(...pos);
            this.scene.add(light);
        });

        // Create enhanced grid floor
        this.createGridFloor();

        // Create particles
        this.particles = createParticles(2000, 50, 0x00ffff);
        this.scene.add(this.particles);

        // Create floating structures
        this.createFloatingStructures();

        // Create door
        this.createDoor();

        // Position camera
        this.camera.position.set(0, 2, 8);
        this.camera.lookAt(0, 2, 0);
    }

    createGridFloor() {
        // Create main grid
        const gridHelper = new THREE.GridHelper(100, 100, 0x00ffff, 0x0088ff);
        this.scene.add(gridHelper);

        // Create glowing plane underneath
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshStandardMaterial({
            color: 0x000066,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.5
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.1;
        this.scene.add(plane);

        // Add glowing lines
        const lineGeometry = new THREE.BoxGeometry(100, 0.05, 0.05);
        const lineMaterial = createGlowMaterial(0x00ffff);
        
        for (let i = -5; i <= 5; i++) {
            const lineX = new THREE.Mesh(lineGeometry, lineMaterial.clone());
            lineX.position.set(0, 0.01, i * 10);
            this.scene.add(lineX);

            const lineZ = new THREE.Mesh(lineGeometry, lineMaterial.clone());
            lineZ.rotation.y = Math.PI / 2;
            lineZ.position.set(i * 10, 0.01, 0);
            this.scene.add(lineZ);
        }
    }

    createFloatingStructures() {
        // Create billboards
        const billboardPositions = [
            [-8, 3, -5],
            [8, 4, -6],
            [-6, 5, -8]
        ];

        billboardPositions.forEach(pos => {
            const billboard = createFloatingStructure('billboard');
            billboard.position.set(...pos);
            billboard.rotation.y = Math.random() * Math.PI * 2;
            this.floatingStructures.push(billboard);
            this.scene.add(billboard);
        });

        // Create drones
        const dronePositions = [
            [-4, 4, -4],
            [4, 3, -3],
            [0, 5, -6]
        ];

        dronePositions.forEach(pos => {
            const drone = createFloatingStructure('drone');
            drone.position.set(...pos);
            this.floatingStructures.push(drone);
            this.scene.add(drone);
        });
    }

    createDoor() {
        // Door frame geometry with more detail
        const frameGeometry = new THREE.BoxGeometry(2.2, 4.2, 0.2);
        const frameMaterial = createGlowMaterial(0x0088ff);
        this.door = new THREE.Mesh(frameGeometry, frameMaterial);
        this.door.position.set(0, 2, 0);
        this.scene.add(this.door);

        // Inner frame with different color
        const innerFrame = new THREE.Mesh(
            new THREE.BoxGeometry(2, 4, 0.3),
            createGlowMaterial(0x00ffff)
        );
        this.door.add(innerFrame);

        // Door energy field
        const energyGeometry = new THREE.PlaneGeometry(1.8, 3.8);
        const energyMaterial = createHolographicMaterial(0x00ffff);
        const energyField = new THREE.Mesh(energyGeometry, energyMaterial);
        energyField.position.set(0, 0, 0.15);
        this.door.add(energyField);

        // Add vertical energy bars
        for (let i = -0.8; i <= 0.8; i += 0.4) {
            const barGeometry = new THREE.BoxGeometry(0.05, 3.6, 0.05);
            const barMaterial = createGlowMaterial(0x00ffff);
            const bar = new THREE.Mesh(barGeometry, barMaterial);
            bar.position.set(i, 0, 0.15);
            this.door.add(bar);
        }

        // Add text sprite with enhanced styling
        this.doorText = createTextSprite("ENTER ARCHIVE", {
            fontFace: 'Orbitron',
            fontSize: 32,
            textColor: '#00ffff',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
        });
        this.doorText.position.set(0, 3, 0.2);
        this.door.add(this.doorText);
    }

    async animateDoorOpen() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        console.log("Starting door animation");

        const swirlingParticles = this.createSwirlingParticles();
        const duration = 2000;
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            if (!this.door) {
                console.error("Door object not found");
                this.isAnimating = false;
                reject(new Error("Door object not found"));
                return;
            }

            const animate = () => {
                const currentTime = Date.now();
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Animate door
                const scale = 1 - progress;
                this.door.scale.set(scale, scale, scale);
                this.door.rotation.y = progress * Math.PI;
                this.door.material.opacity = 1 - progress;

                // Animate particles
                if (swirlingParticles) {
                    const positions = swirlingParticles.geometry.attributes.position.array;
                    for (let i = 0; i < positions.length; i += 3) {
                        const angle = progress * Math.PI * 2;
                        const radius = 2 * (1 - progress);
                        positions[i] = Math.cos(angle + i) * radius;
                        positions[i + 1] = Math.sin(angle + i) * radius;
                        positions[i + 2] = (Math.random() - 0.5) * progress;
                    }
                    swirlingParticles.geometry.attributes.position.needsUpdate = true;
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.isAnimating = false;
                    this.scene.remove(swirlingParticles);
                    resolve();
                }
            };

            animate();
        });
    }

    createSwirlingParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        const color1 = new THREE.Color(0x00ffff);
        const color2 = new THREE.Color(0xff00ff);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 2;
            positions[i + 1] = (Math.random() - 0.5) * 2;
            positions[i + 2] = (Math.random() - 0.5) * 2;

            const mixFactor = Math.random();
            const mixedColor = new THREE.Color().lerpColors(color1, color2, mixFactor);
            colors[i] = mixedColor.r;
            colors[i + 1] = mixedColor.g;
            colors[i + 2] = mixedColor.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        const particleSystem = new THREE.Points(geometry, material);
        this.scene.add(particleSystem);
        return particleSystem;
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.door, true);

        if (intersects.length > 0) {
            this.door.material.emissiveIntensity = 2.0;
            document.body.style.cursor = 'pointer';
        } else {
            this.door.material.emissiveIntensity = 0.5;
            document.body.style.cursor = 'default';
        }
    }

    render() {
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();

        // Animate particles
        if (this.particles) {
            animateParticles(this.particles, delta);
        }

        // Update holographic materials
        this.scene.traverse(child => {
            if (child.material && child.material.uniforms) {
                if (child.material.uniforms.time) {
                    child.material.uniforms.time.value = time;
                }
            }
        });

        // Animate floating structures
        this.floatingStructures.forEach((structure, i) => {
            // Gentle floating motion
            structure.position.y += Math.sin(time * 0.5 + i) * 0.001;
            
            // Rotate drones
            if (structure.userData.rotors) {
                structure.userData.rotors.forEach((rotor, j) => {
                    rotor.rotation.y = time * (5 + j) + i;
                });
            }
        });

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}
