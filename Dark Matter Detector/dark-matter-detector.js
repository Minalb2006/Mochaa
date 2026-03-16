class DarkMatterDetector {
    constructor() {
        this.canvas = document.getElementById('cosmosCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Detection parameters
        this.sensitivity = 70;
        this.detectionRange = 500;
        this.darkMatterDensity = 30;
        this.cosmicRayIntensity = 50;
        this.currentMode = 'gravitational';
        this.isScanning = true;
        
        // Visualization elements
        this.stars = [];
        this.cosmicRays = [];
        this.darkMatterParticles = [];
        this.gravitationalLenses = [];
        this.detectionSignals = [];
        this.anomalies = [];
        
        // Stats
        this.detectionCount = 0;
        this.darkMatterMass = 0;
        this.scanProgress = 0;
        this.anomalyLevel = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCosmos();
        this.initializeDarkMatter();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hide');
        }, 2000);
    }

    setupEventListeners() {
        // Sliders
        document.getElementById('sensitivity').addEventListener('input', (e) => {
            this.sensitivity = parseInt(e.target.value);
            document.getElementById('sensitivityValue').textContent = this.sensitivity;
            this.updateDetectionSensitivity();
        });
        
        document.getElementById('detectionRange').addEventListener('input', (e) => {
            this.detectionRange = parseInt(e.target.value);
            document.getElementById('rangeValue').textContent = this.detectionRange;
            this.updateDetectionRange();
        });
        
        document.getElementById('darkMatterDensity').addEventListener('input', (e) => {
            this.darkMatterDensity = parseInt(e.target.value);
            document.getElementById('densityValue').textContent = this.darkMatterDensity;
            this.updateDarkMatterDensity();
        });
        
        document.getElementById('cosmicRayIntensity').addEventListener('input', (e) => {
            this.cosmicRayIntensity = parseInt(e.target.value);
            document.getElementById('intensityValue').textContent = this.cosmicRayIntensity;
            this.updateCosmicRayIntensity();
        });
        
        // Detection modes
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentMode = e.target.dataset.mode;
                this.switchDetectionMode(this.currentMode);
            });
        });
        
        // Action buttons
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.toggleScanning();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetDetector();
        });
        
        document.getElementById('alertBtn').addEventListener('click', () => {
            this.triggerDetectionAlert();
        });
        
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportDetectionData();
        });
        
        document.getElementById('scanBtn').addEventListener('click', () => {
            this.performDeepScan();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        });
    }

    initializeCosmos() {
        // Create background stars
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random(),
                twinkle: Math.random() * Math.PI * 2
            });
        }
        
        // Initialize cosmic rays
        for (let i = 0; i < 50; i++) {
            this.cosmicRays.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                energy: Math.random() * 100,
                wavelength: Math.random() * 700 + 300,
                lifetime: Math.random() * 100
            });
        }
    }

    initializeDarkMatter() {
        // Create dark matter concentrations
        for (let i = 0; i < 5; i++) {
            this.darkMatterParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                mass: Math.random() * 1000 + 500,
                radius: Math.random() * 50 + 30,
                gravitationalField: Math.random() * 200 + 100,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02
            });
        }
        
        // Create gravitational lenses
        for (let i = 0; i < 8; i++) {
            this.gravitationalLenses.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                strength: Math.random() * 2 + 0.5,
                radius: Math.random() * 100 + 50,
                distortion: Math.random() * 0.5 + 0.5
            });
        }
    }

    updateDetectionSensitivity() {
        // Adjust detection threshold based on sensitivity
        this.anomalies.forEach(anomaly => {
            anomaly.detected = anomaly.strength > (100 - this.sensitivity);
        });
    }

    updateDetectionRange() {
        // Update detection range for all sensors
        this.darkMatterParticles.forEach(particle => {
            particle.detectionRange = this.detectionRange;
        });
    }

    updateDarkMatterDensity() {
        // Adjust dark matter density
        const targetDensity = this.darkMatterDensity / 100;
        this.darkMatterParticles.forEach(particle => {
            particle.opacity = Math.min(1, particle.mass / 1000 * targetDensity);
        });
    }

    updateCosmicRayIntensity() {
        // Update cosmic ray intensity
        this.cosmicRays.forEach(ray => {
            ray.intensity = this.cosmicRayIntensity / 100;
        });
    }

    switchDetectionMode(mode) {
        // Switch between different detection modes
        switch(mode) {
            case 'gravitational':
                this.enableGravitationalLensing();
                break;
            case 'particle':
                this.enableParticleDetection();
                break;
            case 'radiation':
                this.enableRadiationMapping();
                break;
            case 'quantum':
                this.enableQuantumFluctuation();
                break;
            case 'wavelength':
                this.enableWavelengthAnalysis();
                break;
            case 'dimensional':
                this.enableDimensionalRift();
                break;
        }
    }

    enableGravitationalLensing() {
        // Visualize gravitational lensing effects
        this.gravitationalLenses.forEach(lens => {
            lens.active = true;
            lens.effect = 'lensing';
        });
    }

    enableParticleDetection() {
        // Enable particle detection mode
        this.darkMatterParticles.forEach(particle => {
            particle.detectionMode = 'particle';
            particle.particleTrail = [];
        });
    }

    enableRadiationMapping() {
        // Enable radiation mapping
        this.cosmicRays.forEach(ray => {
            ray.radiationType = this.classifyRadiation(ray.wavelength);
            ray.radiationMap = true;
        });
    }

    enableQuantumFluctuation() {
        // Enable quantum fluctuation detection
        this.darkMatterParticles.forEach(particle => {
            particle.quantumState = Math.random();
            particle.fluctuation = Math.sin(Date.now() * 0.001) * 0.5;
        });
    }

    enableWavelengthAnalysis() {
        // Enable wavelength analysis
        this.cosmicRays.forEach(ray => {
            ray.spectrum = this.analyzeSpectrum(ray.wavelength);
            ray.wavelengthAnalysis = true;
        });
    }

    enableDimensionalRift() {
        // Enable dimensional rift detection
        this.anomalies.forEach(anomaly => {
            anomaly.dimensional = true;
            anomaly.riftStrength = Math.random();
        });
    }

    classifyRadiation(wavelength) {
        // Classify radiation type based on wavelength
        if (wavelength < 400) return 'ultraviolet';
        if (wavelength < 700) return 'visible';
        if (wavelength < 1000) return 'infrared';
        return 'radio';
    }

    analyzeSpectrum(wavelength) {
        // Analyze spectrum composition
        return {
            primary: wavelength,
            harmonics: [wavelength * 2, wavelength * 3, wavelength / 2],
            intensity: Math.random()
        };
    }

    toggleScanning() {
        this.isScanning = !this.isScanning;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isScanning ? '⏸️ Pause Scan' : '▶️ Resume Scan';
    }

    resetDetector() {
        this.detectionCount = 0;
        this.darkMatterMass = 0;
        this.scanProgress = 0;
        this.anomalyLevel = 0;
        
        // Reset visualization
        this.anomalies = [];
        this.detectionSignals = [];
        this.initializeDarkMatter();
        
        this.updateStats();
    }

    triggerDetectionAlert() {
        // Trigger a detection alert
        const alert = document.getElementById('alertPanel');
        alert.classList.add('show');
        
        // Create detection effect
        this.createDetectionEffect();
        
        setTimeout(() => {
            alert.classList.remove('show');
        }, 3000);
    }

    createDetectionEffect() {
        // Visual effect for detection
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            
            this.cosmicRays.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                energy: 100,
                wavelength: 500,
                lifetime: 100,
                detection: true
            });
        }
    }

    performDeepScan() {
        // Perform deep scan
        this.scanProgress = 0;
        const scanInterval = setInterval(() => {
            if (this.scanProgress < 100) {
                this.scanProgress += 2;
                this.updateStats();
                
                // Simulate detection during scan
                if (Math.random() < 0.1) {
                    this.detectDarkMatter();
                }
            } else {
                clearInterval(scanInterval);
                this.showScanResults();
            }
        }, 50);
    }

    detectDarkMatter() {
        // Simulate dark matter detection
        const detection = {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            mass: Math.random() * 5000 + 1000,
            confidence: Math.random() * 0.5 + 0.5,
            timestamp: Date.now()
        };
        
        this.anomalies.push(detection);
        this.detectionCount++;
        this.darkMatterMass += detection.mass;
        this.anomalyLevel = Math.min(100, this.anomalyLevel + 10);
        
        this.updateStats();
    }

    showScanResults() {
        // Show scan results
        console.log(`Deep scan complete! Detected ${this.detectionCount} anomalies.`);
    }

    exportDetectionData() {
        // Export detection data
        const data = {
            detections: this.anomalies,
            darkMatterMass: this.darkMatterMass,
            scanProgress: this.scanProgress,
            timestamp: Date.now()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dark-matter-detection-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    updateStats() {
        document.getElementById('detectionCount').textContent = this.detectionCount;
        document.getElementById('darkMatterMass').textContent = Math.round(this.darkMatterMass);
        document.getElementById('scanProgress').textContent = this.scanProgress + '%';
        document.getElementById('anomalyLevel').textContent = this.anomalyLevel;
    }

    animate() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Update scan progress
        if (this.isScanning) {
            this.scanProgress = (this.scanProgress + 0.1) % 100;
        }
        
        // Render based on current mode
        switch(this.currentMode) {
            case 'gravitational':
                this.renderGravitationalLensing();
                break;
            case 'particle':
                this.renderParticleDetection();
                break;
            case 'radiation':
                this.renderRadiationMapping();
                break;
            case 'quantum':
                this.renderQuantumFluctuation();
                break;
            case 'wavelength':
                this.renderWavelengthAnalysis();
                break;
            case 'dimensional':
                this.renderDimensionalRift();
                break;
        }
        
        // Always render base elements
        this.renderStars();
        this.renderCosmicRays();
        this.renderDarkMatter();
        
        requestAnimationFrame(() => this.animate());
    }

    renderStars() {
        this.stars.forEach(star => {
            star.twinkle += 0.05;
            const brightness = star.brightness * (Math.sin(star.twinkle) * 0.5 + 0.5);
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    renderCosmicRays() {
        this.cosmicRays.forEach((ray, index) => {
            // Update ray
            ray.x += ray.vx;
            ray.y += ray.vy;
            ray.lifetime--;
            
            // Boundary conditions
            if (ray.x < 0 || ray.x > this.width) ray.vx *= -1;
            if (ray.y < 0 || ray.y > this.height) ray.vy *= -1;
            
            // Render ray
            const opacity = Math.min(1, ray.lifetime / 50) * ray.intensity;
            
            if (ray.detection) {
                // Detection effect
                this.ctx.strokeStyle = `rgba(255, 0, 0, ${opacity})`;
                this.ctx.lineWidth = 3;
            } else {
                // Normal ray
                const hue = (ray.wavelength - 300) / 400 * 360;
                this.ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${opacity})`;
                this.ctx.lineWidth = 1;
            }
            
            this.ctx.beginPath();
            this.ctx.moveTo(ray.x, ray.y);
            this.ctx.lineTo(ray.x - ray.vx * 10, ray.y - ray.vy * 10);
            this.ctx.stroke();
            
            // Render spectrum analysis if enabled
            if (ray.wavelengthAnalysis && ray.spectrum) {
                this.renderSpectrum(ray, opacity);
            }
        });
        
        // Remove dead rays
        this.cosmicRays = this.cosmicRays.filter(r => r.lifetime > 0);
        
        // Add new rays
        if (this.cosmicRays.length < 50 && Math.random() < 0.1) {
            this.cosmicRays.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                energy: Math.random() * 100,
                wavelength: Math.random() * 700 + 300,
                lifetime: Math.random() * 100 + 50
            });
        }
    }

    renderSpectrum(ray, opacity) {
        if (!ray.spectrum) return;
        
        const x = ray.x;
        const y = ray.y;
        const barWidth = 2;
        const barHeight = 20;
        const spacing = 3;
        
        // Render spectrum bars
        ray.spectrum.harmonics.forEach((wavelength, index) => {
            const hue = (wavelength - 300) / 400 * 360;
            const barX = x + (index - 1.5) * (barWidth + spacing);
            
            this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${opacity * 0.5})`;
            this.ctx.fillRect(barX, y - barHeight/2, barWidth, barHeight);
        });
    }

    renderDarkMatter() {
        this.darkMatterParticles.forEach(particle => {
            particle.rotation += particle.rotationSpeed;
            
            // Dark matter gravitational effect
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            
            // Gravitational field
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.gravitationalField);
            gradient.addColorStop(0, 'rgba(138, 43, 226, 0.3)');
            gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.1)');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.gravitationalField, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Dark matter core
            this.ctx.fillStyle = `rgba(75, 0, 130, ${particle.opacity || 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Quantum fluctuation effect
            if (particle.fluctuation !== undefined) {
                this.ctx.strokeStyle = `rgba(0, 255, 255, ${Math.abs(particle.fluctuation)})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.radius + 10, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }

    renderGravitationalLensing() {
        this.gravitationalLenses.forEach(lens => {
            if (!lens.active) return;
            
            // Lens distortion effect
            this.ctx.save();
            this.ctx.translate(lens.x, lens.y);
            
            // Draw lens rings
            for (let i = 0; i < 3; i++) {
                const radius = lens.radius * (1 - i * 0.3);
                this.ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 - i * 0.05})`;
                this.ctx.lineWidth = 2 - i * 0.5;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }

    renderParticleDetection() {
        // Render particle trails and detection
        this.darkMatterParticles.forEach(particle => {
            if (particle.detectionMode !== 'particle') return;
            
            // Update particle trail
            if (particle.particleTrail) {
                particle.particleTrail.push({ x: particle.x, y: particle.y });
                if (particle.particleTrail.length > 20) {
                    particle.particleTrail.shift();
                }
                
                // Render trail
                this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                particle.particleTrail.forEach((point, index) => {
                    if (index === 0) {
                        this.ctx.moveTo(point.x, point.y);
                    } else {
                        this.ctx.lineTo(point.x, point.y);
                    }
                });
                this.ctx.stroke();
            }
        });
    }

    renderRadiationMapping() {
        // Render radiation mapping overlay
        this.ctx.fillStyle = 'rgba(255, 0, 255, 0.05)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render radiation zones
        this.cosmicRays.forEach(ray => {
            if (!ray.radiationMap) return;
            
            let color;
            switch(ray.radiationType) {
                case 'ultraviolet':
                    color = 'rgba(138, 43, 226, 0.2)';
                    break;
                case 'visible':
                    color = 'rgba(0, 255, 0, 0.1)';
                    break;
                case 'infrared':
                    color = 'rgba(255, 0, 0, 0.2)';
                    break;
                case 'radio':
                    color = 'rgba(0, 0, 255, 0.1)';
                    break;
            }
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(ray.x, ray.y, 30, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    renderQuantumFluctuation() {
        // Render quantum fluctuation visualization
        this.darkMatterParticles.forEach(particle => {
            if (particle.fluctuation === undefined) return;
            
            // Quantum state visualization
            const fluctuation = Math.sin(Date.now() * 0.001 + particle.quantumState * Math.PI * 2);
            
            this.ctx.strokeStyle = `rgba(255, 0, 255, ${Math.abs(fluctuation)})`;
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius + fluctuation * 20, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        });
    }

    renderWavelengthAnalysis() {
        // Enhanced wavelength visualization already handled in renderCosmicRays
        // Add additional analysis overlays here if needed
    }

    renderDimensionalRift() {
        // Render dimensional rift effects
        this.anomalies.forEach(anomaly => {
            if (!anomaly.dimensional) return;
            
            const riftStrength = Math.sin(Date.now() * 0.001) * anomaly.riftStrength;
            
            this.ctx.save();
            this.ctx.translate(anomaly.x, anomaly.y);
            
            // Rift effect
            this.ctx.strokeStyle = `rgba(255, 0, 0, ${Math.abs(riftStrength)})`;
            this.ctx.lineWidth = 2;
            
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + Date.now() * 0.001;
                const x = Math.cos(angle) * 50;
                const y = Math.sin(angle) * 50;
                
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
    }
}

// Initialize the dark matter detector when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DarkMatterDetector();
});
