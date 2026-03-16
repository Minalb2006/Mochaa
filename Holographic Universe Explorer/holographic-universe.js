class HolographicUniverse {
    constructor() {
        this.canvas = document.getElementById('universe');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.time = 0;
        this.isPaused = false;
        this.currentMode = 'hologram';
        
        // 4D spacetime coordinates
        this.position4D = { x: 0, y: 0, z: 0, w: 0 };
        this.rotation4D = { x: 0, y: 0, z: 0, w: 0 };
        
        // Physics parameters
        this.timeDilation = 1.0;
        this.gravityStrength = 50;
        this.quantumFluctuation = 30;
        this.rotationSpeed = 20;
        
        // Particles for visualization
        this.particles = [];
        this.maxParticles = 1000;
        this.wormholeParticles = [];
        this.blackHoleParticles = [];
        
        // Holographic layers
        this.hologramLayers = [];
        this.maxLayers = 5;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeParticles();
        this.initializeHologramLayers();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hide');
        }, 2000);
    }

    setupEventListeners() {
        // Sliders
        document.getElementById('timeDilation').addEventListener('input', (e) => {
            this.timeDilation = parseFloat(e.target.value);
            document.getElementById('timeValue').textContent = this.timeDilation.toFixed(1);
        });
        
        document.getElementById('gravityStrength').addEventListener('input', (e) => {
            this.gravityStrength = parseInt(e.target.value);
            document.getElementById('gravityValue').textContent = this.gravityStrength;
        });
        
        document.getElementById('quantumFlux').addEventListener('input', (e) => {
            this.quantumFluctuation = parseInt(e.target.value);
            document.getElementById('quantumValue').textContent = this.quantumFluctuation;
        });
        
        document.getElementById('rotationSpeed').addEventListener('input', (e) => {
            this.rotationSpeed = parseInt(e.target.value);
            document.getElementById('rotationValue').textContent = this.rotationSpeed;
        });
        
        // Visualization modes
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentMode = e.target.dataset.mode;
                this.resetVisualization();
            });
        });
        
        // Control buttons
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            document.getElementById('pauseBtn').textContent = this.isPaused ? '▶️ Play' : '⏸️ Pause';
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetVisualization();
        });
        
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });
        
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportVisualization();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        });
        
        // Mouse movement for 4D navigation
        this.canvas.addEventListener('mousemove', (e) => {
            this.position4D.x = (e.clientX - this.width / 2) / 100;
            this.position4D.y = (e.clientY - this.height / 2) / 100;
            this.updateCoordinates();
        });
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    this.position4D.z += 0.1;
                    break;
                case 'ArrowDown':
                    this.position4D.z -= 0.1;
                    break;
                case 'ArrowLeft':
                    this.position4D.w -= 0.1;
                    break;
                case 'ArrowRight':
                    this.position4D.w += 0.1;
                    break;
            }
            this.updateCoordinates();
        });
    }

    initializeParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                z: Math.random() * 200 - 100,
                w: Math.random() * 200 - 100,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                vz: (Math.random() - 0.5) * 2,
                vw: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: `hsl(${Math.random() * 60 + 180}, 100%, 50%)`,
                life: 1
            });
        }
    }

    initializeHologramLayers() {
        for (let i = 0; i < this.maxLayers; i++) {
            this.hologramLayers.push({
                offset: i * 0.2,
                opacity: 1 - (i * 0.15),
                scale: 1 + (i * 0.1),
                rotation: i * 0.1
            });
        }
    }

    resetVisualization() {
        this.particles = [];
        this.wormholeParticles = [];
        this.blackHoleParticles = [];
        this.initializeParticles();
        this.time = 0;
    }

    updateCoordinates() {
        document.getElementById('coordX').textContent = this.position4D.x.toFixed(2);
        document.getElementById('coordY').textContent = this.position4D.y.toFixed(2);
        document.getElementById('coordZ').textContent = this.position4D.z.toFixed(2);
        document.getElementById('coordW').textContent = this.position4D.w.toFixed(2);
    }

    project4DTo3D(point4D) {
        // 4D to 3D projection using stereographic projection
        const w = 1 / (3 - point4D.w);
        return {
            x: point4D.x * w,
            y: point4D.y * w,
            z: point4D.z * w
        };
    }

    project3DTo2D(point3D) {
        // 3D to 2D perspective projection
        const perspective = 500;
        const scale = perspective / (perspective + point3D.z);
        return {
            x: point3D.x * scale + this.width / 2,
            y: point3D.y * scale + this.height / 2,
            scale: scale
        };
    }

    animate() {
        if (!this.isPaused) {
            this.time += this.timeDilation * 0.01;
            this.update();
            this.render();
        }
        requestAnimationFrame(() => this.animate());
    }

    update() {
        // Update 4D rotation
        this.rotation4D.x += this.rotationSpeed * 0.001;
        this.rotation4D.y += this.rotationSpeed * 0.0015;
        this.rotation4D.z += this.rotationSpeed * 0.0008;
        this.rotation4D.w += this.rotationSpeed * 0.0012;
        
        // Update particles based on current mode
        switch(this.currentMode) {
            case 'hologram':
                this.updateHologramMode();
                break;
            case 'wormhole':
                this.updateWormholeMode();
                break;
            case 'blackhole':
                this.updateBlackHoleMode();
                break;
            case 'quantum':
                this.updateQuantumMode();
                break;
            case 'strings':
                this.updateStringMode();
                break;
            case 'multiverse':
                this.updateMultiverseMode();
                break;
        }
    }

    updateHologramMode() {
        this.particles.forEach(particle => {
            // Apply 4D rotation
            const rotated4D = this.rotate4D({
                x: particle.x - this.width/2,
                y: particle.y - this.height/2,
                z: particle.z,
                w: particle.w
            });
            
            // Apply quantum fluctuations
            const flux = this.quantumFluctuation / 100;
            rotated4D.x += Math.sin(this.time + particle.x * 0.01) * flux * 10;
            rotated4D.y += Math.cos(this.time + particle.y * 0.01) * flux * 10;
            
            // Project to 2D
            const projected3D = this.project4DTo3D(rotated4D);
            const projected2D = this.project3DTo2D(projected3D);
            
            particle.projectedX = projected2D.x;
            particle.projectedY = projected2D.y;
            particle.projectedScale = projected2D.scale;
        });
    }

    updateWormholeMode() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.particles.forEach(particle => {
            // Calculate distance from center
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Wormhole effect - spiral inward
            const angle = Math.atan2(dy, dx) + this.time * 2;
            const newDistance = distance * (1 - this.gravityStrength / 1000);
            
            particle.x = centerX + Math.cos(angle) * newDistance;
            particle.y = centerY + Math.sin(angle) * newDistance;
            particle.z = Math.sin(this.time * 3 + distance * 0.01) * 50;
            
            // Reset particles that go too close to center
            if (newDistance < 10) {
                particle.x = Math.random() * this.width;
                particle.y = Math.random() * this.height;
                particle.z = Math.random() * 200 - 100;
            }
            
            particle.projectedX = particle.x;
            particle.projectedY = particle.y;
            particle.projectedScale = 1;
        });
    }

    updateBlackHoleMode() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const eventHorizon = 50;
        
        this.particles.forEach(particle => {
            const dx = centerX - particle.x;
            const dy = centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > eventHorizon) {
                // Gravitational pull
                const force = (this.gravityStrength / 100) * (1000 / (distance * distance));
                particle.vx += (dx / distance) * force;
                particle.vy += (dy / distance) * force;
                
                // Apply velocity with damping
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vx *= 0.98;
                particle.vy *= 0.98;
                
                // Accretion disk effect
                particle.z = Math.sin(this.time * 2 + distance * 0.05) * 30;
            } else {
                // Particle crossed event horizon
                particle.x = Math.random() * this.width;
                particle.y = Math.random() * this.height;
                particle.vx = (Math.random() - 0.5) * 2;
                particle.vy = (Math.random() - 0.5) * 2;
            }
            
            particle.projectedX = particle.x;
            particle.projectedY = particle.y;
            particle.projectedScale = Math.max(0.1, distance / 200);
        });
    }

    updateQuantumMode() {
        const flux = this.quantumFluctuation / 100;
        
        this.particles.forEach(particle => {
            // Quantum superposition - particles exist in multiple states
            particle.x += (Math.random() - 0.5) * flux * 20;
            particle.y += (Math.random() - 0.5) * flux * 20;
            particle.z += (Math.random() - 0.5) * flux * 20;
            particle.w += (Math.random() - 0.5) * flux * 20;
            
            // Wave function collapse observation
            if (Math.random() < 0.01) {
                particle.x = Math.random() * this.width;
                particle.y = Math.random() * this.height;
            }
            
            // Quantum entanglement visualization
            const entanglement = Math.sin(this.time * 5 + particle.x * 0.01) * 0.5 + 0.5;
            particle.opacity = entanglement;
            
            particle.projectedX = particle.x;
            particle.projectedY = particle.y;
            particle.projectedScale = 1 + Math.sin(this.time * 3) * 0.5;
        });
    }

    updateStringMode() {
        // String theory visualization - vibrating strings
        this.particles.forEach((particle, i) => {
            const stringPhase = this.time * 2 + i * 0.1;
            const vibration = Math.sin(stringPhase) * this.quantumFluctuation / 10;
            
            particle.x += particle.vx + vibration;
            particle.y += particle.vy + Math.cos(stringPhase) * vibration;
            particle.z = Math.sin(stringPhase * 2) * 50;
            
            // String connections
            if (i > 0) {
                const prevParticle = this.particles[i - 1];
                const dx = prevParticle.x - particle.x;
                const dy = prevParticle.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 100) {
                    particle.vx += dx * 0.001;
                    particle.vy += dy * 0.001;
                }
            }
            
            // Boundary conditions
            if (particle.x < 0 || particle.x > this.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.height) particle.vy *= -1;
            
            particle.projectedX = particle.x;
            particle.projectedY = particle.y;
            particle.projectedScale = 1;
        });
    }

    updateMultiverseMode() {
        // Multiple parallel universes visualization
        const universes = 5;
        const universeWidth = this.width / universes;
        
        this.particles.forEach((particle, i) => {
            const universeIndex = Math.floor(i / (this.maxParticles / universes));
            const universeOffset = universeIndex * universeWidth;
            
            // Parallel universe drift
            particle.x += particle.vx + Math.sin(this.time + universeIndex) * 2;
            particle.y += particle.vy + Math.cos(this.time + universeIndex) * 2;
            
            // Universe boundaries
            if (particle.x < universeOffset || particle.x > universeOffset + universeWidth) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > this.height) {
                particle.vy *= -1;
            }
            
            // Inter-universe tunneling
            if (Math.random() < 0.001) {
                const newUniverse = Math.floor(Math.random() * universes);
                particle.x = newUniverse * universeWidth + Math.random() * universeWidth;
            }
            
            particle.universe = universeIndex;
            particle.projectedX = particle.x;
            particle.projectedY = particle.y;
            particle.projectedScale = 1;
        });
    }

    rotate4D(point4D) {
        // 4D rotation matrices
        let { x, y, z, w } = point4D;
        
        // Rotate in XY plane
        const cosXY = Math.cos(this.rotation4D.x);
        const sinXY = Math.sin(this.rotation4D.x);
        const newX = x * cosXY - y * sinXY;
        const newY = x * sinXY + y * cosXY;
        x = newX; y = newY;
        
        // Rotate in XZ plane
        const cosXZ = Math.cos(this.rotation4D.y);
        const sinXZ = Math.sin(this.rotation4D.y);
        const newX2 = x * cosXZ - z * sinXZ;
        const newZ = x * sinXZ + z * cosXZ;
        x = newX2; z = newZ;
        
        // Rotate in XW plane
        const cosXW = Math.cos(this.rotation4D.z);
        const sinXW = Math.sin(this.rotation4D.z);
        const newX3 = x * cosXW - w * sinXW;
        const newW = x * sinXW + w * cosXW;
        x = newX3; w = newW;
        
        return { x, y, z, w };
    }

    render() {
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render based on current mode
        switch(this.currentMode) {
            case 'hologram':
                this.renderHologramMode();
                break;
            case 'wormhole':
                this.renderWormholeMode();
                break;
            case 'blackhole':
                this.renderBlackHoleMode();
                break;
            case 'quantum':
                this.renderQuantumMode();
                break;
            case 'strings':
                this.renderStringMode();
                break;
            case 'multiverse':
                this.renderMultiverseMode();
                break;
        }
    }

    renderHologramMode() {
        // Render holographic layers
        this.hologramLayers.forEach((layer, layerIndex) => {
            this.ctx.save();
            this.ctx.globalAlpha = layer.opacity * 0.3;
            this.ctx.translate(this.width / 2, this.height / 2);
            this.ctx.rotate(layer.rotation + this.time * 0.5);
            this.ctx.scale(layer.scale, layer.scale);
            this.ctx.translate(-this.width / 2, -this.height / 2);
            
            this.particles.forEach(particle => {
                if (particle.projectedX && particle.projectedY) {
                    const gradient = this.ctx.createRadialGradient(
                        particle.projectedX, particle.projectedY, 0,
                        particle.projectedX, particle.projectedY, particle.size * particle.projectedScale * 5
                    );
                    gradient.addColorStop(0, particle.color);
                    gradient.addColorStop(1, 'transparent');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.projectedX, particle.projectedY, 
                               particle.size * particle.projectedScale * 2, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
            
            this.ctx.restore();
        });
    }

    renderWormholeMode() {
        // Draw wormhole center
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(100, 0, 200, 0.5)');
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw particles with trails
        this.particles.forEach(particle => {
            if (particle.projectedX && particle.projectedY) {
                this.ctx.strokeStyle = particle.color;
                this.ctx.lineWidth = particle.projectedScale * 2;
                this.ctx.globalAlpha = particle.projectedScale;
                
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(particle.projectedX, particle.projectedY);
                this.ctx.stroke();
                
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.projectedX, particle.projectedY, 
                           particle.size * particle.projectedScale, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }

    renderBlackHoleMode() {
        // Draw black hole
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const eventHorizon = 50;
        
        // Event horizon
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, eventHorizon, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Accretion disk
        for (let i = 0; i < 5; i++) {
            const radius = eventHorizon + i * 20;
            const gradient = this.ctx.createRadialGradient(centerX, centerY, eventHorizon, centerX, centerY, radius);
            gradient.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw particles
        this.particles.forEach(particle => {
            if (particle.projectedX && particle.projectedY) {
                this.ctx.fillStyle = particle.color;
                this.ctx.globalAlpha = particle.projectedScale;
                this.ctx.beginPath();
                this.ctx.arc(particle.projectedX, particle.projectedY, 
                           particle.size * particle.projectedScale * 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }

    renderQuantumMode() {
        // Draw quantum foam
        this.particles.forEach((particle, i) => {
            if (particle.projectedX && particle.projectedY) {
                // Quantum uncertainty visualization
                for (let j = 0; j < 3; j++) {
                    const offsetX = (Math.random() - 0.5) * 20;
                    const offsetY = (Math.random() - 0.5) * 20;
                    
                    this.ctx.fillStyle = particle.color;
                    this.ctx.globalAlpha = particle.opacity * 0.3;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.projectedX + offsetX, particle.projectedY + offsetY, 
                               particle.size * particle.projectedScale, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                // Main particle
                this.ctx.fillStyle = particle.color;
                this.ctx.globalAlpha = particle.opacity;
                this.ctx.beginPath();
                this.ctx.arc(particle.projectedX, particle.projectedY, 
                           particle.size * particle.projectedScale * 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }

    renderStringMode() {
        // Draw string connections
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        for (let i = 1; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const prevParticle = this.particles[i - 1];
            
            if (particle.projectedX && prevParticle.projectedX) {
                this.ctx.beginPath();
                this.ctx.moveTo(prevParticle.projectedX, prevParticle.projectedY);
                this.ctx.lineTo(particle.projectedX, particle.projectedY);
                this.ctx.stroke();
            }
        }
        
        // Draw particles
        this.particles.forEach(particle => {
            if (particle.projectedX && particle.projectedY) {
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.projectedX, particle.projectedY, 
                           particle.size * particle.projectedScale, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    renderMultiverseMode() {
        const universes = 5;
        const universeWidth = this.width / universes;
        
        // Draw universe boundaries
        for (let i = 1; i < universes; i++) {
            const x = i * universeWidth;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        // Draw particles with universe-specific colors
        const universeColors = ['#ff00ff', '#00ffff', '#ffff00', '#ff00aa', '#00ff00'];
        
        this.particles.forEach(particle => {
            if (particle.projectedX && particle.projectedY) {
                this.ctx.fillStyle = universeColors[particle.universe % universes];
                this.ctx.globalAlpha = 0.8;
                this.ctx.beginPath();
                this.ctx.arc(particle.projectedX, particle.projectedY, 
                           particle.size * particle.projectedScale, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }

    exportVisualization() {
        const link = document.createElement('a');
        link.download = `holographic-universe-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }
}

// Initialize the holographic universe when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HolographicUniverse();
});
