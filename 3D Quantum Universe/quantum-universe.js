class QuantumUniverse {
    constructor() {
        this.canvas = document.getElementById('quantumCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Quantum parameters
        this.particleEnergy = 50;
        this.entanglement = 30;
        this.waveCollapse = 40;
        this.uncertainty = 60;
        this.currentParticleType = 'quarks';
        this.isPaused = false;
        
        // 3D camera
        this.camera = {
            x: 0,
            y: 0,
            z: 500,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0
        };
        
        // Particles
        this.particles = [];
        this.entangledPairs = [];
        this.quantumFields = [];
        this.waveFunctions = [];
        
        // Stats
        this.particleCount = 0;
        this.entangledPairsCount = 0;
        this.quantumState = 0;
        this.energyLevel = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeParticles();
        this.initializeQuantumFields();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hide');
        }, 2000);
    }

    setupEventListeners() {
        // Sliders
        document.getElementById('particleEnergy').addEventListener('input', (e) => {
            this.particleEnergy = parseInt(e.target.value);
            document.getElementById('energyValue').textContent = this.particleEnergy;
            this.updateParticleEnergy();
        });
        
        document.getElementById('entanglement').addEventListener('input', (e) => {
            this.entanglement = parseInt(e.target.value);
            document.getElementById('entanglementValue').textContent = this.entanglement;
            this.updateEntanglement();
        });
        
        document.getElementById('waveCollapse').addEventListener('input', (e) => {
            this.waveCollapse = parseInt(e.target.value);
            document.getElementById('waveValue').textContent = this.waveCollapse;
            this.updateWaveCollapse();
        });
        
        document.getElementById('uncertainty').addEventListener('input', (e) => {
            this.uncertainty = parseInt(e.target.value);
            document.getElementById('uncertaintyValue').textContent = this.uncertainty;
            this.updateUncertainty();
        });
        
        // Particle types
        document.querySelectorAll('[data-particle]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-particle]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentParticleType = e.target.dataset.particle;
                this.switchParticleType(this.currentParticleType);
            });
        });
        
        // Action buttons
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetQuantumUniverse();
        });
        
        document.getElementById('entangleBtn').addEventListener('click', () => {
            this.createEntangledPairs();
        });
        
        document.getElementById('observeBtn').addEventListener('click', () => {
            this.observeParticles();
        });
        
        document.getElementById('collapseBtn').addEventListener('click', () => {
            this.collapseWaveFunction();
        });
        
        // Mouse controls for 3D camera
        this.setupMouseControls();
        
        // Window resize
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        });
    }

    setupMouseControls() {
        let isDragging = false;
        let previousMouseX = 0;
        let previousMouseY = 0;
        
        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMouseX;
                const deltaY = e.clientY - previousMouseY;
                
                this.camera.rotationY += deltaX * 0.01;
                this.camera.rotationX += deltaY * 0.01;
                
                previousMouseX = e.clientX;
                previousMouseY = e.clientY;
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        this.canvas.addEventListener('wheel', (e) => {
            this.camera.z += e.deltaY * 0.5;
            this.camera.z = Math.max(100, Math.min(1000, this.camera.z));
        });
    }

    initializeParticles() {
        // Create quantum particles based on type
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(this.createParticle());
        }
        
        this.particleCount = this.particles.length;
    }

    createParticle() {
        const particle = {
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            z: (Math.random() - 0.5) * 400,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            vz: (Math.random() - 0.5) * 2,
            energy: Math.random() * 100,
            spin: Math.random() * Math.PI * 2,
            charge: Math.random() > 0.5 ? 1 : -1,
            mass: Math.random() * 10 + 1,
            color: this.getParticleColor(),
            entangled: null,
            observed: false,
            waveFunction: Math.random() * Math.PI * 2,
            quantumState: Math.random()
        };
        
        return particle;
    }

    getParticleColor() {
        const colors = {
            quarks: '#ff0000',
            leptons: '#00ff00',
            bosons: '#0000ff',
            hadrons: '#ffff00',
            mesons: '#ff00ff',
            baryons: '#00ffff'
        };
        
        return colors[this.currentParticleType] || '#ffffff';
    }

    initializeQuantumFields() {
        // Create quantum field grid
        const gridSize = 20;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                for (let k = 0; k < gridSize; k++) {
                    this.quantumFields.push({
                        x: (i - gridSize/2) * 50,
                        y: (j - gridSize/2) * 50,
                        z: (k - gridSize/2) * 50,
                        intensity: Math.random() * 0.5,
                        phase: Math.random() * Math.PI * 2,
                        frequency: Math.random() * 0.1 + 0.05
                    });
                }
            }
        }
    }

    updateParticleEnergy() {
        this.particles.forEach(particle => {
            particle.energy = this.particleEnergy;
            const speed = this.particleEnergy / 25;
            particle.vx = (Math.random() - 0.5) * speed;
            particle.vy = (Math.random() - 0.5) * speed;
            particle.vz = (Math.random() - 0.5) * speed;
        });
        
        this.energyLevel = this.particleEnergy;
    }

    updateEntanglement() {
        // Update entanglement probability
        if (this.entanglement > 50 && Math.random() < (this.entanglement - 50) / 100) {
            this.createEntangledPairs();
        }
    }

    updateWaveCollapse() {
        // Update wave function collapse probability
        if (this.waveCollapse > 70 && Math.random() < (this.waveCollapse - 70) / 100) {
            this.collapseWaveFunction();
        }
    }

    updateUncertainty() {
        // Update Heisenberg uncertainty
        this.particles.forEach(particle => {
            const uncertaintyFactor = this.uncertainty / 100;
            particle.vx += (Math.random() - 0.5) * uncertaintyFactor * 0.5;
            particle.vy += (Math.random() - 0.5) * uncertaintyFactor * 0.5;
            particle.vz += (Math.random() - 0.5) * uncertaintyFactor * 0.5;
        });
    }

    switchParticleType(type) {
        // Switch particle type and update colors
        this.particles.forEach(particle => {
            particle.color = this.getParticleColor();
            particle.mass = this.getParticleMass(type);
        });
    }

    getParticleMass(type) {
        const masses = {
            quarks: Math.random() * 5 + 1,
            leptons: Math.random() * 2 + 0.5,
            bosons: Math.random() * 10 + 5,
            hadrons: Math.random() * 15 + 10,
            mesons: Math.random() * 8 + 5,
            baryons: Math.random() * 12 + 8
        };
        
        return masses[type] || 5;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? '▶️ Resume' : '⏸️ Pause';
    }

    resetQuantumUniverse() {
        // Reset all parameters
        this.particleEnergy = 50;
        this.entanglement = 30;
        this.waveCollapse = 40;
        this.uncertainty = 60;
        
        // Reset particles
        this.particles = [];
        this.entangledPairs = [];
        this.initializeParticles();
        
        // Reset UI
        document.getElementById('particleEnergy').value = 50;
        document.getElementById('entanglement').value = 30;
        document.getElementById('waveCollapse').value = 40;
        document.getElementById('uncertainty').value = 60;
        
        document.getElementById('energyValue').textContent = 50;
        document.getElementById('entanglementValue').textContent = 30;
        document.getElementById('waveValue').textContent = 40;
        document.getElementById('uncertaintyValue').textContent = 60;
    }

    createEntangledPairs() {
        // Create quantum entangled pairs
        const availableParticles = this.particles.filter(p => !p.entangled);
        
        for (let i = 0; i < Math.min(10, availableParticles.length / 2); i++) {
            const particle1 = availableParticles[i * 2];
            const particle2 = availableParticles[i * 2 + 1];
            
            if (particle1 && particle2) {
                particle1.entangled = particle2;
                particle2.entangled = particle1;
                
                // Opposite spins for entangled particles
                particle1.spin = Math.random() * Math.PI * 2;
                particle2.spin = particle1.spin + Math.PI;
                
                this.entangledPairs.push([particle1, particle2]);
            }
        }
        
        this.entangledPairsCount = this.entangledPairs.length;
    }

    observeParticles() {
        // Observe particles (collapse wave function locally)
        this.particles.forEach(particle => {
            if (Math.random() < 0.1) {
                particle.observed = true;
                particle.waveFunction = 0; // Collapse wave function
            }
        });
        
        this.quantumState = this.particles.filter(p => p.observed).length;
    }

    collapseWaveFunction() {
        // Collapse all wave functions
        this.particles.forEach(particle => {
            particle.waveFunction = 0;
            particle.observed = true;
            
            // Random position after collapse
            particle.x = (Math.random() - 0.5) * 400;
            particle.y = (Math.random() - 0.5) * 400;
            particle.z = (Math.random() - 0.5) * 400;
        });
        
        // Create collapse effect
        this.createCollapseEffect();
    }

    createCollapseEffect() {
        // Visual effect for wave function collapse
        const centerX = 0;
        const centerY = 0;
        const centerZ = 0;
        
        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 2;
            const speed = Math.random() * 10 + 5;
            
            this.particles.push({
                x: centerX,
                y: centerY,
                z: centerZ,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                vz: (Math.random() - 0.5) * speed,
                energy: 100,
                spin: Math.random() * Math.PI * 2,
                charge: 0,
                mass: 1,
                color: '#ffffff',
                entangled: null,
                observed: true,
                waveFunction: 0,
                quantumState: 1,
                collapse: true,
                lifetime: 100
            });
        }
    }

    project3DTo2D(x, y, z) {
        // Apply camera transformations
        const cosX = Math.cos(this.camera.rotationX);
        const sinX = Math.sin(this.camera.rotationX);
        const cosY = Math.cos(this.camera.rotationY);
        const sinY = Math.sin(this.camera.rotationY);
        const cosZ = Math.cos(this.camera.rotationZ);
        const sinZ = Math.sin(this.camera.rotationZ);
        
        // Rotate around X axis
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;
        
        // Rotate around Y axis
        let x1 = x * cosY + z1 * sinY;
        let z2 = -x * sinY + z1 * cosY;
        
        // Rotate around Z axis
        let x2 = x1 * cosZ - y1 * sinZ;
        let y2 = x1 * sinZ + y1 * cosZ;
        
        // Perspective projection
        const scale = this.camera.z / (this.camera.z + z2);
        const projectedX = x2 * scale + this.width / 2;
        const projectedY = y2 * scale + this.height / 2;
        
        return { x: projectedX, y: projectedY, scale: scale };
    }

    updateStats() {
        document.getElementById('particleCount').textContent = this.particles.length;
        document.getElementById('entangledPairs').textContent = this.entangledPairsCount;
        document.getElementById('quantumState').textContent = this.quantumState;
        document.getElementById('energyLevel').textContent = Math.round(this.energyLevel);
    }

    animate() {
        if (!this.isPaused) {
            // Clear canvas
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Auto-rotate camera
            this.camera.rotationY += 0.005;
            
            // Update particles
            this.updateParticles();
            
            // Update quantum fields
            this.updateQuantumFields();
            
            // Render quantum fields
            this.renderQuantumFields();
            
            // Render particles
            this.renderParticles();
            
            // Render entanglement connections
            this.renderEntanglements();
            
            // Update stats
            this.updateStats();
        }
        
        requestAnimationFrame(() => this.animate());
    }

    updateParticles() {
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.z += particle.vz;
            
            // Update wave function
            if (!particle.observed) {
                particle.waveFunction += 0.1;
                particle.quantumState = Math.sin(particle.waveFunction) * 0.5 + 0.5;
            }
            
            // Update spin
            particle.spin += 0.05;
            
            // Boundary conditions
            if (Math.abs(particle.x) > 500) particle.vx *= -1;
            if (Math.abs(particle.y) > 500) particle.vy *= -1;
            if (Math.abs(particle.z) > 500) particle.vz *= -1;
            
            // Heisenberg uncertainty
            if (this.uncertainty > 0) {
                particle.vx += (Math.random() - 0.5) * this.uncertainty / 1000;
                particle.vy += (Math.random() - 0.5) * this.uncertainty / 1000;
                particle.vz += (Math.random() - 0.5) * this.uncertainty / 1000;
            }
            
            // Remove collapse particles
            if (particle.collapse) {
                particle.lifetime--;
                if (particle.lifetime <= 0) {
                    this.particles.splice(index, 1);
                }
            }
        });
    }

    updateQuantumFields() {
        this.quantumFields.forEach(field => {
            field.phase += field.frequency;
            field.intensity = Math.sin(field.phase) * 0.5 + 0.5;
        });
    }

    renderQuantumFields() {
        // Render quantum field grid
        this.quantumFields.forEach(field => {
            const projected = this.project3DTo2D(field.x, field.y, field.z);
            
            if (projected.scale > 0) {
                const size = 2 * projected.scale;
                const opacity = field.intensity * 0.3 * projected.scale;
                
                this.ctx.fillStyle = `rgba(0, 255, 255, ${opacity})`;
                this.ctx.beginPath();
                this.ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    renderParticles() {
        // Sort particles by z-depth for proper rendering
        const sortedParticles = [...this.particles].sort((a, b) => {
            const aZ = a.z * Math.cos(this.camera.rotationY) - a.x * Math.sin(this.camera.rotationY);
            const bZ = b.z * Math.cos(this.camera.rotationY) - b.x * Math.sin(this.camera.rotationY);
            return bZ - aZ;
        });
        
        sortedParticles.forEach(particle => {
            const projected = this.project3DTo2D(particle.x, particle.y, particle.z);
            
            if (projected.scale > 0) {
                // Particle glow
                const glowSize = 20 * projected.scale;
                const gradient = this.ctx.createRadialGradient(
                    projected.x, projected.y, 0,
                    projected.x, projected.y, glowSize
                );
                
                if (particle.collapse) {
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                    gradient.addColorStop(1, 'transparent');
                } else {
                    gradient.addColorStop(0, particle.color);
                    gradient.addColorStop(0.5, `${particle.color}88`);
                    gradient.addColorStop(1, 'transparent');
                }
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(projected.x, projected.y, glowSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Particle core
                const coreSize = 5 * projected.scale;
                this.ctx.fillStyle = particle.collapse ? '#ffffff' : particle.color;
                this.ctx.beginPath();
                this.ctx.arc(projected.x, projected.y, coreSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Wave function visualization
                if (!particle.observed) {
                    const waveSize = particle.quantumState * 15 * projected.scale;
                    this.ctx.strokeStyle = `${particle.color}44`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.arc(projected.x, projected.y, waveSize, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            }
        });
    }

    renderEntanglements() {
        // Render entanglement connections
        this.entangledPairs.forEach(pair => {
            const [particle1, particle2] = pair;
            
            const projected1 = this.project3DTo2D(particle1.x, particle1.y, particle1.z);
            const projected2 = this.project3DTo2D(particle2.x, particle2.y, particle2.z);
            
            if (projected1.scale > 0 && projected2.scale > 0) {
                // Quantum entanglement visualization
                const gradient = this.ctx.createLinearGradient(
                    projected1.x, projected1.y,
                    projected2.x, projected2.y
                );
                gradient.addColorStop(0, 'rgba(255, 0, 255, 0.5)');
                gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.5)');
                gradient.addColorStop(1, 'rgba(255, 0, 255, 0.5)');
                
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                
                this.ctx.beginPath();
                this.ctx.moveTo(projected1.x, projected1.y);
                this.ctx.lineTo(projected2.x, projected2.y);
                this.ctx.stroke();
                
                this.ctx.setLineDash([]);
            }
        });
    }
}

// Initialize the quantum universe when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuantumUniverse();
});
