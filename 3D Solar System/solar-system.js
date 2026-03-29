class SolarSystem {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.planets = [];
        this.orbits = [];
        this.labels = [];
        this.selectedPlanet = null;
        this.animationSpeed = 1;
        this.isPaused = false;
        this.showOrbits = true;
        this.showLabels = true;
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        
        this.planetData = [
            {
                name: 'Sun',
                radius: 5,
                distance: 0,
                speed: 0,
                color: 0xffdd00,
                info: 'The Sun is the star at the center of our Solar System. It is a nearly perfect sphere of hot plasma.',
                texture: null
            },
            {
                name: 'Mercury',
                radius: 0.3,
                distance: 10,
                speed: 4.74,
                color: 0x8c8c8c,
                info: 'Mercury is the smallest planet in our Solar System and the closest to the Sun.',
                texture: null
            },
            {
                name: 'Venus',
                radius: 0.5,
                distance: 15,
                speed: 3.5,
                color: 0xffc649,
                info: 'Venus is the second planet from the Sun and the hottest planet in our Solar System.',
                texture: null
            },
            {
                name: 'Earth',
                radius: 0.5,
                distance: 20,
                speed: 2.98,
                color: 0x2e7dff,
                info: 'Earth is the third planet from the Sun and the only astronomical object known to harbor life.',
                texture: null
            },
            {
                name: 'Mars',
                radius: 0.4,
                distance: 25,
                speed: 2.41,
                color: 0xff4444,
                info: 'Mars is the fourth planet from the Sun and is often called the "Red Planet".',
                texture: null
            },
            {
                name: 'Jupiter',
                radius: 2,
                distance: 35,
                speed: 1.31,
                color: 0xffa756,
                info: 'Jupiter is the largest planet in our Solar System and the fifth planet from the Sun.',
                texture: null
            },
            {
                name: 'Saturn',
                radius: 1.8,
                distance: 45,
                speed: 0.97,
                color: 0xf4e7d7,
                info: 'Saturn is the sixth planet from the Sun and is famous for its prominent ring system.',
                texture: null,
                hasRings: true
            },
            {
                name: 'Uranus',
                radius: 1.2,
                distance: 55,
                speed: 0.68,
                color: 0x4fd0e7,
                info: 'Uranus is the seventh planet from the Sun and has the third-largest planetary radius.',
                texture: null
            },
            {
                name: 'Neptune',
                radius: 1.1,
                distance: 65,
                speed: 0.54,
                color: 0x4b70dd,
                info: 'Neptune is the eighth and outermost planet in our Solar System.',
                texture: null
            }
        ];
        
        this.init();
    }

    init() {
        this.setupScene();
        this.createLights();
        this.createPlanets();
        this.createStars();
        this.setupControls();
        this.setupEventListeners();
        this.createPlanetList();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').classList.add('hide');
        }, 1000);
    }

    setupScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(30, 30, 50);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas'),
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    createLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Point light from sun
        const sunLight = new THREE.PointLight(0xffffff, 2, 100);
        sunLight.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
    }

    createPlanets() {
        this.planetData.forEach((planetInfo, index) => {
            // Create planet
            const geometry = new THREE.SphereGeometry(planetInfo.radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({
                color: planetInfo.color,
                shininess: planetInfo.name === 'Sun' ? 100 : 30,
                emissive: planetInfo.name === 'Sun' ? planetInfo.color : 0x000000,
                emissiveIntensity: planetInfo.name === 'Sun' ? 0.5 : 0
            });
            
            const planet = new THREE.Mesh(geometry, material);
            planet.userData = planetInfo;
            planet.castShadow = true;
            planet.receiveShadow = true;
            
            this.scene.add(planet);
            this.planets.push(planet);
            
            // Create orbit
            if (planetInfo.distance > 0) {
                const orbitGeometry = new THREE.RingGeometry(
                    planetInfo.distance - 0.1,
                    planetInfo.distance + 0.1,
                    64
                );
                const orbitMaterial = new THREE.MeshBasicMaterial({
                    color: 0x404040,
                    side: THREE.DoubleSide,
                    opacity: 0.3,
                    transparent: true
                });
                const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
                orbit.rotation.x = -Math.PI / 2;
                this.scene.add(orbit);
                this.orbits.push(orbit);
            }
            
            // Create Saturn's rings
            if (planetInfo.hasRings) {
                const ringGeometry = new THREE.RingGeometry(
                    planetInfo.radius * 1.5,
                    planetInfo.radius * 2.5,
                    32
                );
                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: 0xd4a574,
                    side: THREE.DoubleSide,
                    opacity: 0.7,
                    transparent: true
                });
                const rings = new THREE.Mesh(ringGeometry, ringMaterial);
                rings.rotation.x = -Math.PI / 2;
                planet.add(rings);
            }
            
            // Create label
            this.createLabel(planet);
        });
    }

    createLabel(planet) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = 'white';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(planet.userData.name, canvas.width / 2, canvas.height / 2 + 8);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(8, 2, 1);
        sprite.position.set(0, planet.userData.radius + 3, 0);
        
        planet.add(sprite);
        this.labels.push(sprite);
    }

    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8
        });
        
        const starsVertices = [];
        for (let i = 0; i < 10000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    setupControls() {
        this.controls = {
            mouseX: 0,
            mouseY: 0,
            targetRotationX: 0,
            targetRotationY: 0,
            isMouseDown: false,
            mouseButton: 0,
            zoom: 50
        };
        
        const canvas = document.getElementById('canvas');
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('wheel', (e) => this.onWheel(e));
        canvas.addEventListener('click', (e) => this.onMouseClick(e));
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    onMouseDown(event) {
        this.controls.isMouseDown = true;
        this.controls.mouseButton = event.button;
        this.controls.mouseX = event.clientX;
        this.controls.mouseY = event.clientY;
    }

    onMouseMove(event) {
        if (!this.controls.isMouseDown) return;
        
        const deltaX = event.clientX - this.controls.mouseX;
        const deltaY = event.clientY - this.controls.mouseY;
        
        if (this.controls.mouseButton === 0) { // Left click - rotate
            this.controls.targetRotationY += deltaX * 0.01;
            this.controls.targetRotationX += deltaY * 0.01;
        } else if (this.controls.mouseButton === 2) { // Right click - pan
            this.camera.position.x -= deltaX * 0.1;
            this.camera.position.y += deltaY * 0.1;
        }
        
        this.controls.mouseX = event.clientX;
        this.controls.mouseY = event.clientY;
    }

    onMouseUp(event) {
        this.controls.isMouseDown = false;
    }

    onWheel(event) {
        event.preventDefault();
        this.controls.zoom += event.deltaY * 0.01;
        this.controls.zoom = Math.max(10, Math.min(100, this.controls.zoom));
    }

    onMouseClick(event) {
        // Raycasting for planet selection
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.planets);
        
        if (intersects.length > 0) {
            this.selectPlanet(intersects[0].object);
        } else {
            this.deselectPlanet();
        }
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.controls.isMouseDown = true;
            this.controls.mouseX = event.touches[0].clientX;
            this.controls.mouseY = event.touches[0].clientY;
        }
    }

    onTouchMove(event) {
        if (event.touches.length === 1 && this.controls.isMouseDown) {
            const deltaX = event.touches[0].clientX - this.controls.mouseX;
            const deltaY = event.touches[0].clientY - this.controls.mouseY;
            
            this.controls.targetRotationY += deltaX * 0.01;
            this.controls.targetRotationX += deltaY * 0.01;
            
            this.controls.mouseX = event.touches[0].clientX;
            this.controls.mouseY = event.touches[0].clientY;
        }
    }

    onTouchEnd(event) {
        this.controls.isMouseDown = false;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    selectPlanet(planet) {
        this.selectedPlanet = planet;
        
        // Update UI
        document.getElementById('planetName').textContent = planet.userData.name;
        document.getElementById('planetInfo').textContent = planet.userData.info;
        document.getElementById('infoPanel').classList.add('show');
        
        // Update planet list
        document.querySelectorAll('.planet-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.planet === planet.userData.name) {
                item.classList.add('active');
            }
        });
    }

    deselectPlanet() {
        this.selectedPlanet = null;
        document.getElementById('infoPanel').classList.remove('show');
        document.querySelectorAll('.planet-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    createPlanetList() {
        const planetList = document.getElementById('planetList');
        
        this.planetData.forEach(planet => {
            const item = document.createElement('div');
            item.className = 'planet-item';
            item.dataset.planet = planet.name;
            
            item.innerHTML = `
                <div class="planet-color" style="background: #${planet.color.toString(16).padStart(6, '0')}"></div>
                <div class="planet-name">${planet.name}</div>
                <div class="planet-distance">${planet.distance} AU</div>
            `;
            
            item.addEventListener('click', () => {
                const planetObj = this.planets.find(p => p.userData.name === planet.name);
                if (planetObj) {
                    this.selectPlanet(planetObj);
                }
            });
            
            planetList.appendChild(item);
        });
    }

    setupEventListeners() {
        // Speed control
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            speedValue.textContent = this.animationSpeed.toFixed(1) + 'x';
        });
        
        // Toggle buttons
        document.getElementById('orbitToggle').addEventListener('click', (e) => {
            this.showOrbits = !this.showOrbits;
            e.target.classList.toggle('active');
            this.orbits.forEach(orbit => orbit.visible = this.showOrbits);
        });
        
        document.getElementById('labelToggle').addEventListener('click', (e) => {
            this.showLabels = !this.showLabels;
            e.target.classList.toggle('active');
            this.labels.forEach(label => label.visible = this.showLabels);
        });
        
        document.getElementById('pauseToggle').addEventListener('click', (e) => {
            this.isPaused = !this.isPaused;
            e.target.classList.toggle('active');
            e.target.textContent = this.isPaused ? 'Play' : 'Pause';
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.isPaused) {
            // Rotate planets around sun
            this.planets.forEach((planet, index) => {
                const planetInfo = planet.userData;
                if (planetInfo.distance > 0) {
                    const angle = Date.now() * 0.0001 * planetInfo.speed * this.animationSpeed;
                    planet.position.x = Math.cos(angle) * planetInfo.distance;
                    planet.position.z = Math.sin(angle) * planetInfo.distance;
                }
                
                // Rotate planet on its axis
                planet.rotation.y += 0.01 * this.animationSpeed;
            });
        }
        
        // Camera rotation
        const cameraDistance = this.controls.zoom;
        this.camera.position.x = cameraDistance * Math.sin(this.controls.targetRotationY) * Math.cos(this.controls.targetRotationX);
        this.camera.position.y = cameraDistance * Math.sin(this.controls.targetRotationX);
        this.camera.position.z = cameraDistance * Math.cos(this.controls.targetRotationY) * Math.cos(this.controls.targetRotationX);
        this.camera.lookAt(0, 0, 0);
        
        // Highlight selected planet
        this.planets.forEach(planet => {
            if (planet === this.selectedPlanet) {
                planet.material.emissive = new THREE.Color(planet.userData.color);
                planet.material.emissiveIntensity = 0.3;
            } else if (planet.userData.name !== 'Sun') {
                planet.material.emissive = new THREE.Color(0x000000);
                planet.material.emissiveIntensity = 0;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the solar system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SolarSystem();
});
