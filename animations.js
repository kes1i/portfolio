document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    initThreeJSBackground();
    initHero3DScene();
    initContact3DScene();
    
    implementSmoothScroll();
    highlightActiveNavOnScroll();
    animateProgressBars();
    
    // Typing effect
    const heroText = document.querySelector('.hero h1');
    if (heroText) {
        const baseText = "Hello, I'm ";
        const highlightText = "Kunal";
        heroText.innerHTML = ""; 
        let index = 0;
        const fullText = baseText + highlightText;
        
        function type() {
            if (index < fullText.length) {
                if (index < baseText.length) {
                    heroText.innerHTML = fullText.substring(0, index + 1) + '<span class="highlight-text"></span>';
                } else {
                    heroText.innerHTML = baseText + '<span class="highlight-text">' + fullText.substring(baseText.length, index + 1) + '</span>';
                }
                index++;
                setTimeout(type, 100);
            }
        }
        type();
    }
});

// Background Animation with Particle Trail
function initThreeJSBackground() {
    const canvas = document.getElementById('bg-canvas');
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    const dotsGroup = new THREE.Group();
    scene.add(dotsGroup);
    
    const numDots = 400;
    const dotSize = 0.08;
    const areaSize = 50;
    
    const baseColors = [
        new THREE.Color(0x43bdfa),
        new THREE.Color(0x6b5cfa),
        new THREE.Color(0x4ECCA3),
        new THREE.Color(0xF4C430),
        new THREE.Color(0xff6b6b)
    ];
    
    for (let i = 0; i < numDots; i++) {
        const geometry = new THREE.SphereGeometry(dotSize, 8, 8);
        const startColorIndex = Math.floor(Math.random() * baseColors.length);
        const nextColorIndex = (startColorIndex + 1) % baseColors.length;
        
        const material = new THREE.MeshBasicMaterial({
            color: baseColors[startColorIndex],
            transparent: true,
            opacity: 0.4 + Math.random() * 0.6
        });
        
        const dot = new THREE.Mesh(geometry, material);
        
        dot.position.x = (Math.random() - 0.5) * areaSize;
        dot.position.y = (Math.random() - 0.5) * areaSize;
        dot.position.z = (Math.random() - 0.5) * (areaSize / 2);
        
        dot.userData = {
            originalPos: dot.position.clone(),
            speed: 0.01 + Math.random() * 0.03,
            delay: Math.random() * Math.PI * 2,
            amplitude: 0.5 + Math.random() * 1.5,
            currentColor: baseColors[startColorIndex].clone(),
            targetColor: baseColors[nextColorIndex].clone(),
            colorTransitionProgress: 0,
            colorTransitionSpeed: 0.001 + Math.random() * 0.002,
            colorIndex: startColorIndex,
            nextColorIndex: nextColorIndex
        };
        
        dotsGroup.add(dot);
    }
    
    const trailGroup = new THREE.Group();
    scene.add(trailGroup);
    
    const trailParticles = [];
    const maxTrailParticles = 30;
    let lastTrailSpawnTime = 0;
    const trailSpawnInterval = 0.05;
    
    function spawnTrailParticle(mousePos) {
        if (trailParticles.length >= maxTrailParticles) {
            const oldestParticle = trailParticles.shift();
            trailGroup.remove(oldestParticle);
        }
        
        const size = 0.1 + Math.random() * 0.1;
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: baseColors[Math.floor(Math.random() * baseColors.length)],
            transparent: true,
            opacity: 1.0
        });
        
        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(mousePos);
        
        particle.userData = {
            life: 1.0,
            decayRate: 0.02 + Math.random() * 0.01,
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            )
        };
        
        trailParticles.push(particle);
        trailGroup.add(particle);
    }
    
    const mouse = new THREE.Vector2(0, 0);
    const mouseInfluenceRadius = 10;
    const mouseInfluenceStrength = 3;
    let isMouseActive = false;
    const mousePosInScene = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        isMouseActive = true;
        
        clearTimeout(mouseTimeout);
        const mouseTimeout = setTimeout(() => {
            isMouseActive = false;
        }, 2000);
    });
    
    window.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
            mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            isMouseActive = true;
            
            clearTimeout(mouseTimeout);
            const mouseTimeout = setTimeout(() => {
                isMouseActive = false;
            }, 2000);
            
            event.preventDefault();
        }
    }, { passive: false });
    
    const clock = new THREE.Clock();
    let animationFrame;
    
    function animate() {
        animationFrame = requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        
        if (isMouseActive) {
            raycaster.setFromCamera(mouse, camera);
            mousePosInScene.copy(raycaster.ray.direction).multiplyScalar(20).add(camera.position);
            
            if (elapsedTime - lastTrailSpawnTime >= trailSpawnInterval) {
                spawnTrailParticle(mousePosInScene);
                lastTrailSpawnTime = elapsedTime;
            }
        }
        
        dotsGroup.children.forEach((dot) => {
            const { 
                originalPos, speed, delay, amplitude, 
                currentColor, targetColor, colorTransitionProgress, 
                colorTransitionSpeed, colorIndex, nextColorIndex 
            } = dot.userData;
            
            dot.position.x = originalPos.x + Math.sin(elapsedTime * speed + delay) * amplitude;
            dot.position.y = originalPos.y + Math.cos(elapsedTime * speed + delay * 1.5) * amplitude;
            dot.position.z = originalPos.z + Math.sin(elapsedTime * speed * 0.5 + delay * 2) * amplitude * 0.5;
            
            if (isMouseActive) {
                const distanceToMouse = dot.position.distanceTo(mousePosInScene);
                
                if (distanceToMouse < mouseInfluenceRadius) {
                    const direction = new THREE.Vector3().subVectors(dot.position, mousePosInScene).normalize();
                    const strength = (1 - distanceToMouse / mouseInfluenceRadius) * mouseInfluenceStrength;
                    dot.position.add(direction.multiplyScalar(strength * 0.05));
                }
            }
            
            dot.userData.colorTransitionProgress += colorTransitionSpeed;
            
            if (dot.userData.colorTransitionProgress >= 1) {
                dot.userData.colorTransitionProgress = 0;
                const newColorIndex = (dot.userData.nextColorIndex + 1) % baseColors.length;
                dot.userData.colorIndex = dot.userData.nextColorIndex;
                dot.userData.nextColorIndex = newColorIndex;
                dot.userData.currentColor.copy(baseColors[dot.userData.colorIndex]);
                dot.userData.targetColor.copy(baseColors[dot.userData.nextColorIndex]);
            }
            
            const color = new THREE.Color();
            color.copy(dot.userData.currentColor).lerp(dot.userData.targetColor, dot.userData.colorTransitionProgress);
            dot.material.color = color;
        });
        
        for (let i = trailParticles.length - 1; i >= 0; i--) {
            const particle = trailParticles[i];
            const { velocity, decayRate } = particle.userData;
            
            particle.position.add(velocity);
            particle.userData.life -= decayRate;
            particle.material.opacity = particle.userData.life;
            
            if (particle.userData.life <= 0) {
                trailGroup.remove(particle);
                trailParticles.splice(i, 1);
            }
        }
        
        dotsGroup.rotation.y += 0.0005;
        dotsGroup.rotation.x += 0.0002;
        
        renderer.render(scene, camera);
    }
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else {
            animate();
        }
    });
    
    animate();
}

// Hero section 3D animation
function initHero3DScene() {
    const container = document.getElementById('hero-3d-container');
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // Wave background
    const waveGeometry = new THREE.PlaneGeometry(50, 50, 32, 32);
    const waveMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            color1: { value: new THREE.Color(0x43bdfa) },
            color2: { value: new THREE.Color(0x121212) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 pos = position;
                pos.z += sin(pos.x * 0.1 + time * 0.5) * cos(pos.y * 0.1 + time * 0.3) * 2.0;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec3 color1;
            uniform vec3 color2;
            varying vec2 vUv;
            void main() {
                float wave = sin(vUv.x * 10.0 + time * 0.5) * cos(vUv.y * 10.0 + time * 0.3) * 0.5 + 0.5;
                vec3 color = mix(color2, color1, wave * 0.4);
                gl_FragColor = vec4(color, 0.6);
            }
        `,
        transparent: true
    });
    const wavePlane = new THREE.Mesh(waveGeometry, waveMaterial);
    wavePlane.position.z = -10;
    scene.add(wavePlane);
    
    // Particle effects system
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);
    const particles = [];
    
    function spawnParticleBurst(position, count = 15) {
        for (let i = 0; i < count; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: [0x43bdfa, 0x6b5cfa, 0x4ECCA3, 0xF4C430][Math.floor(Math.random() * 4)],
                transparent: true,
                opacity: 1.0
            });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.copy(position || new THREE.Vector3(0, 0, 0));
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                ),
                life: 1.5,
                decayRate: 0.03
            };
            
            particles.push(particle);
            particleGroup.add(particle);
        }
    }
    
    // Spawn burst on hover
    container.addEventListener('mouseenter', () => {
        spawnParticleBurst(new THREE.Vector3(0, 0, 3), 20);
    });
    
    // Setup camera
    camera.position.z = 15;
    
    // Animation loop
    let animationFrame;
    
    function animate() {
        animationFrame = requestAnimationFrame(animate);
        
        const time = Date.now() * 0.001;
        
        // Update wave background
        waveMaterial.uniforms.time.value = time;
        
        // Handle particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.position.add(particle.userData.velocity);
            particle.userData.life -= particle.userData.decayRate;
            particle.material.opacity = particle.userData.life / 1.5;
            if (particle.userData.life <= 0) {
                particleGroup.remove(particle);
                particles.splice(i, 1);
            }
        }
        
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    // Pause animation when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else {
            animate();
        }
    });
    
    animate();
}

// Contact section 3D animation 
function initContact3DScene() {
    const container = document.getElementById('contact-3d-container');
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    const mouse = new THREE.Vector2();
    let isMouseOver = false;
    const mousePosInScene = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x43bdfa,
        transparent: true,
        opacity: 0.9
    });
    const centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(centralSphere);
    
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);
    
    const particles = [];
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const size = 0.05 + Math.random() * 0.1;
        const geometry = new THREE.SphereGeometry(size, 8, 8);
        const material = new THREE.MeshBasicMaterial({
            color: [0x43bdfa, 0x6b5cfa, 0x4ECCA3, 0xF4C430][Math.floor(Math.random() * 4)],
            transparent: true,
            opacity: 0.6
        });
        
        const particle = new THREE.Mesh(geometry, material);
        
        const radius = 7 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
        particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
        particle.position.z = radius * Math.cos(phi);
        
        particle.userData = {
            originalPos: particle.position.clone(),
            speed: 0.002 + Math.random() * 0.003,
            amplitude: 0.5 + Math.random() * 0.5,
            offset: Math.random() * Math.PI * 2,
            gravitySpeed: 0.05 + Math.random() * 0.03
        };
        
        particles.push(particle);
        particlesGroup.add(particle);
    }
    
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        linewidth: 2
    });
    
    const connectionLines = [];
    for (let i = 0; i < particleCount; i += 3) {
        const points = [
            centralSphere.position,
            particles[i].position
        ];
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData = {
            startIndex: i,
            pulseEffect: {
                progress: Math.random(),
                speed: 0.01 + Math.random() * 0.01
            }
        };
        
        connectionLines.push(line);
        scene.add(line);
    }
    
    const chatBubbleGroup = new THREE.Group();
    scene.add(chatBubbleGroup);
    
    const chatBubbles = [];
    const maxChatBubbles = 5;
    const icons = [
        { type: 'email', color: 0x43bdfa, shape: 'box' },
        { type: 'linkedin', color: 0x0077B5, shape: 'plane' },
        { type: 'github', color: 0xFFFFFF, shape: 'octahedron' }
    ];
    
    function spawnChatBubble() {
        if (chatBubbles.length >= maxChatBubbles) {
            const oldestBubble = chatBubbles.shift();
            chatBubbleGroup.remove(oldestBubble.group);
        }
        
        const bubbleGroup = new THREE.Group();
        
        const bubbleGeometry = new THREE.BoxGeometry(2, 1, 0.5, 4, 4, 4);
        const bubbleMaterial = new THREE.MeshBasicMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.8
        });
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        bubbleGroup.add(bubble);
        
        const iconData = icons[Math.floor(Math.random() * icons.length)];
        let iconGeometry;
        switch (iconData.shape) {
            case 'box': iconGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5, 2, 2, 2); break;
            case 'plane': iconGeometry = new THREE.PlaneGeometry(0.5, 0.5, 2, 2); break;
            case 'octahedron': iconGeometry = new THREE.OctahedronGeometry(0.3, 0); break;
        }
        const iconMaterial = new THREE.MeshBasicMaterial({
            color: iconData.color,
            transparent: true,
            opacity: 0.9
        });
        const icon = new THREE.Mesh(iconGeometry, iconMaterial);
        icon.position.x = -0.5;
        bubbleGroup.add(icon);
        
        const radius = 5 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        bubbleGroup.position.x = radius * Math.sin(phi) * Math.cos(theta);
        bubbleGroup.position.y = radius * Math.sin(phi) * Math.sin(theta);
        bubbleGroup.position.z = radius * Math.cos(phi);
        
        bubbleGroup.userData = {
            life: 5 + Math.random() * 3,
            speed: 0.01 + Math.random() * 0.02,
            offset: Math.random() * Math.PI * 2
        };
        
        chatBubbles.push({ group: bubbleGroup, icon });
        chatBubbleGroup.add(bubbleGroup);
    }
    
    camera.position.z = 15;
    
    container.addEventListener('mouseenter', () => { isMouseOver = true; });
    container.addEventListener('mouseleave', () => { isMouseOver = false; });
    container.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
    });
    container.addEventListener('touchstart', () => { isMouseOver = true; });
    container.addEventListener('touchend', () => { isMouseOver = false; });
    container.addEventListener('touchmove', (event) => {
        if (event.touches.length > 0) {
            const rect = container.getBoundingClientRect();
            mouse.x = ((event.touches[0].clientX - rect.left) / container.clientWidth) * 2 - 1;
            mouse.y = -((event.touches[0].clientY - rect.top) / container.clientHeight) * 2 + 1;
        }
    });
    
    let lastBubbleSpawnTime = 0;
    const bubbleSpawnInterval = 1;
    let animationFrame;
    
    function animate() {
        animationFrame = requestAnimationFrame(animate);
        
        const time = Date.now() * 0.001;
        
        if (isMouseOver) {
            raycaster.setFromCamera(mouse, camera);
            mousePosInScene.copy(raycaster.ray.direction).multiplyScalar(10).add(camera.position);
        }
        
        const pulseFrequency = isMouseOver ? 5 : 3;
        const pulseIntensity = isMouseOver ? 0.2 : 0.15;
        const pulseFactor = 1 + Math.sin(time * pulseFrequency) * pulseIntensity;
        centralSphere.scale.set(pulseFactor, pulseFactor, pulseFactor);
        sphereMaterial.opacity = (isMouseOver ? 0.7 : 0.6) + Math.sin(time * pulseFrequency) * 0.2;
        
        particlesGroup.rotation.y += 0.001;
        
        particles.forEach((particle, index) => {
            const { originalPos, speed, amplitude, offset, gravitySpeed } = particle.userData;
            
            let targetX, targetY, targetZ;
            
            if (isMouseOver) {
                const direction = new THREE.Vector3().subVectors(mousePosInScene, particle.position).normalize();
                const distanceToMouse = particle.position.distanceTo(mousePosInScene);
                const gravityFactor = Math.min(1, distanceToMouse / 10);
                targetX = particle.position.x + direction.x * gravitySpeed * gravityFactor;
                targetY = particle.position.y + direction.y * gravitySpeed * gravityFactor;
                targetZ = particle.position.z + direction.z * gravitySpeed * gravityFactor;
                
                const newPosition = new THREE.Vector3(targetX, targetY, targetZ);
                if (newPosition.distanceTo(mousePosInScene) < 1) {
                    const minDirection = new THREE.Vector3().subVectors(newPosition, mousePosInScene).normalize().multiplyScalar(1);
                    targetX = mousePosInScene.x + minDirection.x;
                    targetY = mousePosInScene.y + minDirection.y;
                    targetZ = mousePosInScene.z + minDirection.z;
                }
            } else {
                targetX = originalPos.x + Math.sin(time * speed + offset) * amplitude;
                targetY = originalPos.y + Math.cos(time * speed * 1.2 + offset) * amplitude;
                targetZ = originalPos.z + Math.sin(time * speed * 0.7 + offset * 0.5) * amplitude;
                
                const returnSpeed = 0.03;
                targetX = particle.position.x + (targetX - particle.position.x) * returnSpeed + Math.sin(time * speed) * 0.05;
                targetY = particle.position.y + (targetY - particle.position.y) * returnSpeed + Math.cos(time * speed * 1.2) * 0.05;
                targetZ = particle.position.z + (targetZ - particle.position.z) * returnSpeed;
            }
            
            particle.position.set(targetX, targetY, targetZ);
            
            const particlePulse = 1 + Math.sin(time * 2 + index) * 0.2;
            particle.scale.set(particlePulse, particlePulse, particlePulse);
            particle.material.opacity = isMouseOver ? 0.8 : 0.6;
        });
        
        connectionLines.forEach(line => {
            const particleIndex = line.userData.startIndex;
            const points = [centralSphere.position, particles[particleIndex].position];
            line.geometry.dispose();
            line.geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            line.userData.pulseEffect.progress += line.userData.pulseEffect.speed;
            if (line.userData.pulseEffect.progress > 1) line.userData.pulseEffect.progress = 0;
            
            const baseOpacity = isMouseOver ? 0.5 : 0.2;
            line.material.opacity = baseOpacity + Math.sin(time * 3 + line.userData.pulseEffect.progress * Math.PI) * 0.2;
        });
        
        if (time - lastBubbleSpawnTime >= bubbleSpawnInterval) {
            spawnChatBubble();
            lastBubbleSpawnTime = time;
        }
        
        for (let i = chatBubbles.length - 1; i >= 0; i--) {
            const bubble = chatBubbles[i];
            const { group, icon } = bubble;
            const { speed, offset, life } = group.userData;
            
            group.position.y += Math.sin(time * speed + offset) * 0.05;
            group.rotation.z = Math.sin(time * speed) * 0.1;
            
            group.userData.life -= 0.008;
            const opacity = Math.max(0, Math.min(1, group.userData.life / 5));
            group.children[0].material.opacity = opacity * 0.8;
            icon.material.opacity = opacity * 0.9;
            
            if (group.userData.life <= 0) {
                chatBubbleGroup.remove(group);
                chatBubbles.splice(i, 1);
            }
        }
        
        renderer.render(scene, camera);
    }
    
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else {
            animate();
        }
    });
    
    animate();
}

// Animate progress bars
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.animated-progress');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.classList.contains('html-progress') ? '90%' : 
                                          entry.target.classList.contains('css-progress') ? '50%' : 
                                          entry.target.classList.contains('js-progress') ? '30%' : 
                                          entry.target.classList.contains('c-progress') ? '50%' : 
                                          entry.target.classList.contains('python-progress') ? '40%' : 
                                          entry.target.classList.contains('sql-progress') ? '5%' : '0%';
                entry.target.style.transition = 'width 1.5s ease-in-out';
            }
        });
    }, { threshold: 0.2 });
    
    progressBars.forEach(bar => {
        bar.style.width = '0%';
        observer.observe(bar);
    });
}

// Smooth scrolling for navigation
function implementSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Highlight active nav item on scroll
function highlightActiveNavOnScroll() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}