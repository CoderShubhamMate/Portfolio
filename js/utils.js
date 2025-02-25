import * as THREE from 'three';

export function createGlowMaterial(color) {
    return new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        emissive: color,
        emissiveIntensity: 0.5,
        side: THREE.DoubleSide
    });
}

export function createHolographicMaterial(color) {
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float time;
        uniform vec3 color;
        uniform bool hovered;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
            // Scanline effect
            float scanline = 0.5 + 0.5 * sin(vUv.y * 50.0 + time * 2.0);
            
            // Vertical noise
            float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453123);
            float verticalNoise = noise * 0.1 * sin(time * 5.0 + vUv.y * 20.0);
            
            // Flicker effect
            float flicker = 0.95 + 0.05 * sin(time * 10.0);
            
            // Edge glow
            float edgeGlow = 1.0 - smoothstep(0.4, 0.5, abs(vUv.x - 0.5));
            edgeGlow *= 1.0 - smoothstep(0.4, 0.5, abs(vUv.y - 0.5));
            
            // Combine effects
            vec3 baseColor = color * (0.7 + 0.3 * scanline + verticalNoise) * flicker;
            baseColor += color * edgeGlow * 0.5;
            
            float alpha = 0.6 + 0.2 * scanline + edgeGlow * 0.2;
            
            if (hovered) {
                baseColor *= 1.5;
                alpha = min(1.0, alpha * 1.2);
            }
            
            gl_FragColor = vec4(baseColor, alpha);
        }
    `;

    return new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(color) },
            hovered: { value: false }
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        side: THREE.DoubleSide
    });
}

export function createSkybox() {
    const geometry = new THREE.BoxGeometry(1000, 1000, 1000);
    const vertexShader = `
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform float time;
        varying vec3 vPosition;

        float rand(vec2 n) { 
            return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }

        void main() {
            vec3 baseColor = vec3(0.0, 0.05, 0.1);
            
            // Star field
            vec2 pos = vPosition.xy * 0.5;
            float brightness = rand(floor(pos * 50.0));
            vec3 stars = vec3(step(0.99, brightness));
            
            // Nebula effect
            float nebula = sin(vPosition.x * 0.02 + time * 0.1) * 
                          cos(vPosition.y * 0.02 + time * 0.15) *
                          sin(vPosition.z * 0.02);
            vec3 nebulaColor = vec3(0.0, 0.5, 1.0) * max(0.0, nebula);
            
            // Combine effects
            vec3 finalColor = baseColor + stars * 0.8 + nebulaColor * 0.3;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader,
        fragmentShader,
        side: THREE.BackSide
    });

    return new THREE.Mesh(geometry, material);
}

export function createParticles(count, spread, color) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const color1 = new THREE.Color(color);
    const color2 = new THREE.Color(0xff00ff);

    for (let i = 0; i < count * 3; i += 3) {
        // Position
        positions[i] = (Math.random() - 0.5) * spread;
        positions[i + 1] = (Math.random() - 0.5) * spread;
        positions[i + 2] = (Math.random() - 0.5) * spread;

        // Velocity
        velocities[i] = (Math.random() - 0.5) * 0.02;
        velocities[i + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i + 2] = (Math.random() - 0.5) * 0.02;

        // Color mix
        const mixFactor = Math.random();
        const mixedColor = new THREE.Color().lerpColors(color1, color2, mixFactor);
        colors[i] = mixedColor.r;
        colors[i + 1] = mixedColor.g;
        colors[i + 2] = mixedColor.b;

        // Size
        sizes[i/3] = (Math.random() * 0.1) + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.velocities = velocities;

    return particles;
}

export function animateParticles(particles, delta) {
    const positions = particles.geometry.attributes.position.array;
    const velocities = particles.userData.velocities;

    for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * delta * 60;
        positions[i + 1] += velocities[i + 1] * delta * 60;
        positions[i + 2] += velocities[i + 2] * delta * 60;

        // Reset particles that go too far
        const distance = Math.sqrt(
            positions[i] * positions[i] +
            positions[i + 1] * positions[i + 1] +
            positions[i + 2] * positions[i + 2]
        );

        if (distance > 25) {
            positions[i] *= 0.1;
            positions[i + 1] *= 0.1;
            positions[i + 2] *= 0.1;
        }
    }

    particles.geometry.attributes.position.needsUpdate = true;
}

export function createTextSprite(text, parameters = {}) {
    const {
        fontFace = 'Arial',
        fontSize = 18,
        textColor = '#ffffff',
        backgroundColor = 'rgba(0, 0, 0, 0.8)'
    } = parameters;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontSize}px ${fontFace}`;

    // Get text width
    const textWidth = context.measureText(text).width;

    // Set canvas size
    canvas.width = textWidth + 20;
    canvas.height = fontSize + 20;

    // Draw background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    context.font = `${fontSize}px ${fontFace}`;
    context.fillStyle = textColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    // Create texture
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    // Create sprite material
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });

    // Create sprite
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(canvas.width / 50, canvas.height / 50, 1);

    return sprite;
}

export function createFloatingStructure(type = 'billboard') {
    const group = new THREE.Group();

    if (type === 'billboard') {
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2, 0.1),
            createGlowMaterial(0x0088ff)
        );

        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(2.8, 1.8),
            createHolographicMaterial(0x00ffff)
        );
        screen.position.z = 0.06;

        group.add(frame);
        group.add(screen);
    } else if (type === 'drone') {
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8),
            createGlowMaterial(0x0088ff)
        );

        const rotors = [];
        for (let i = 0; i < 4; i++) {
            const rotor = new THREE.Mesh(
                new THREE.TorusGeometry(0.2, 0.05, 8, 16),
                createGlowMaterial(0x00ffff)
            );
            rotor.position.set(
                Math.cos(i * Math.PI/2) * 0.4,
                0,
                Math.sin(i * Math.PI/2) * 0.4
            );
            rotors.push(rotor);
            group.add(rotor);
        }

        group.add(body);
        group.userData.rotors = rotors;
    }

    return group;
}

export function createFuturisticFurniture(type = 'desk') {
    const group = new THREE.Group();

    if (type === 'desk') {
        // Create desk surface
        const surface = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.1, 1),
            new THREE.MeshStandardMaterial({
                color: 0x0088ff,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        group.add(surface);

        // Add glowing edges
        const edges = [
            { pos: [1, -0.05, 0.5], scale: [0.1, 0.8, 0.1] },
            { pos: [-1, -0.05, 0.5], scale: [0.1, 0.8, 0.1] },
            { pos: [1, -0.05, -0.5], scale: [0.1, 0.8, 0.1] },
            { pos: [-1, -0.05, -0.5], scale: [0.1, 0.8, 0.1] }
        ];

        edges.forEach(edge => {
            const leg = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.8, 0.1),
                createGlowMaterial(0x00ffff)
            );
            leg.position.set(...edge.pos);
            group.add(leg);
        });

        // Add holographic display
        const display = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5, 0.8),
            createHolographicMaterial(0x00ffff)
        );
        display.position.set(0, 0.5, 0);
        display.rotation.x = -Math.PI / 6;
        group.add(display);
    }

    return group;
}
