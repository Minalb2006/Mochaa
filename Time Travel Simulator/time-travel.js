class TimeTravelSimulator {
    constructor() {
        this.canvas = document.getElementById('timelineCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Time parameters
        this.currentTime = 2024;
        this.targetTime = 2024;
        this.timeSpeed = 50;
        this.paradoxRisk = 30;
        this.timelineStability = 70;
        this.isPaused = false;
        
        // Timeline visualization
        this.timelineEvents = [];
        this.timeParticles = [];
        this.alternateTimelines = [];
        this.pastEvents = [];
        this.futureEvents = [];
        
        // Visual effects
        this.timeWarp = 0;
        this.paradoxEffect = 0;
        this.timelineGlitch = 0;
        
        // Stats
        this.activeTimelines = 1;
        this.timeEventCount = 0;
        this.paradoxCount = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTimeline();
        this.initializeTimeParticles();
        this.generateHistoricalEvents();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hide');
        }, 2000);
    }

    setupEventListeners() {
        // Timeline slider
        document.getElementById('timelineSlider').addEventListener('input', (e) => {
            this.targetTime = parseInt(e.target.value);
            this.updateTimeDisplay();
        });
        
        // Parameter sliders
        document.getElementById('timeSpeed').addEventListener('input', (e) => {
            this.timeSpeed = parseInt(e.target.value);
            document.getElementById('timeSpeedValue').textContent = this.timeSpeed;
        });
        
        document.getElementById('paradoxRisk').addEventListener('input', (e) => {
            this.paradoxRisk = parseInt(e.target.value);
            document.getElementById('paradoxValue').textContent = this.paradoxRisk;
        });
        
        document.getElementById('timelineStability').addEventListener('input', (e) => {
            this.timelineStability = parseInt(e.target.value);
            document.getElementById('stabilityValue').textContent = this.timelineStability;
        });
        
        // Time period buttons
        document.querySelectorAll('[data-year]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-year]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.targetTime = parseInt(e.target.dataset.year);
                document.getElementById('timelineSlider').value = this.targetTime;
                this.initiateTimeJump();
            });
        });
        
        // Action buttons
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePauseTime();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetTimeline();
        });
        
        document.getElementById('paradoxBtn').addEventListener('click', () => {
            this.createParadox();
        });
        
        document.getElementById('recordBtn').addEventListener('click', () => {
            this.recordTimeline();
        });
        
        document.getElementById('travelBtn').addEventListener('click', () => {
            this.initiateTimeJump();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        });
    }

    initializeTimeline() {
        // Create main timeline
        this.timelineEvents = [];
        
        // Add major historical events
        const majorEvents = [
            { year: -3000, title: "Ancient Egypt", color: "#ff6b6b" },
            { year: -776, title: "First Olympics", color: "#4ecdc4" },
            { year: -100, title: "Roman Empire", color: "#45b7d1" },
            { year: 476, title: "Fall of Rome", color: "#96ceb4" },
            { year: 1066, title: "Norman Conquest", color: "#feca57" },
            { year: 1492, title: "Columbus Voyage", color: "#ff9ff3" },
            { year: 1776, title: "American Independence", color: "#54a0ff" },
            { year: 1969, title: "Moon Landing", color: "#5f27cd" },
            { year: 2024, title: "Present Day", color: "#00d2d3" },
            { year: 3000, title: "Future Colony", color: "#ff9f43" }
        ];
        
        majorEvents.forEach(event => {
            this.timelineEvents.push({
                year: event.year,
                title: event.title,
                color: event.color,
                x: this.mapYearToX(event.year),
                y: this.height / 2,
                radius: 8,
                pulse: 0
            });
        });
    }

    initializeTimeParticles() {
        for (let i = 0; i < 100; i++) {
            this.timeParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: this.getTimeParticleColor(),
                temporalPhase: Math.random() * Math.PI * 2,
                lifetime: Math.random() * 100
            });
        }
    }

    generateHistoricalEvents() {
        // Generate random historical events
        for (let i = 0; i < 50; i++) {
            const year = Math.floor(Math.random() * 10000) - 5000;
            this.pastEvents.push({
                year: year,
                title: `Event ${i + 1}`,
                description: `Historical event from ${year}`,
                x: this.mapYearToX(year),
                y: this.height / 2 + (Math.random() - 0.5) * 200,
                opacity: Math.random() * 0.7 + 0.3
            });
        }
    }

    mapYearToX(year) {
        // Map year (-5000 to 5000) to canvas width
        const normalizedYear = (year + 5000) / 10000;
        return normalizedYear * this.width;
    }

    mapXToYear(x) {
        const normalizedX = x / this.width;
        return Math.floor(normalizedX * 10000 - 5000);
    }

    getTimeParticleColor() {
        const colors = ['#00ffff', '#ff00ff', '#ffff00', '#ff6b6b', '#4ecdc4'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateTimeDisplay() {
        const yearDisplay = document.getElementById('yearDisplay');
        const currentTimeDisplay = document.getElementById('currentTime');
        
        yearDisplay.textContent = this.targetTime;
        
        if (this.targetTime < 0) {
            currentTimeDisplay.textContent = `Current: ${Math.abs(this.targetTime)} BCE`;
        } else {
            currentTimeDisplay.textContent = `Current: ${this.targetTime} CE`;
        }
    }

    togglePauseTime() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.isPaused ? '▶️ Resume Time' : '⏸️ Pause Time';
    }

    resetTimeline() {
        this.currentTime = 2024;
        this.targetTime = 2024;
        this.paradoxCount = 0;
        this.timeEventCount = 0;
        this.activeTimelines = 1;
        this.alternateTimelines = [];
        this.timeWarp = 0;
        this.paradoxEffect = 0;
        
        document.getElementById('timelineSlider').value = 2024;
        this.updateTimeDisplay();
        this.updateStats();
        
        // Hide paradox warning
        document.getElementById('paradoxWarning').classList.remove('show');
    }

    createParadox() {
        this.paradoxCount++;
        this.paradoxEffect = 100;
        
        // Show paradox warning
        const warning = document.getElementById('paradoxWarning');
        warning.classList.add('show');
        
        // Create alternate timeline
        this.alternateTimelines.push({
            year: this.currentTime,
            divergence: Math.random() * 100 - 50,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            opacity: 1
        });
        
        this.activeTimelines++;
        
        // Hide warning after 3 seconds
        setTimeout(() => {
            warning.classList.remove('show');
        }, 3000);
        
        this.updateStats();
    }

    recordTimeline() {
        // Record current timeline state
        const recording = {
            year: this.currentTime,
            events: [...this.timelineEvents],
            particles: [...this.timeParticles],
            timestamp: Date.now()
        };
        
        // Create visual feedback
        this.createRecordingEffect();
        
        // Show notification (in real app, would save to server)
        console.log('Timeline recorded:', recording);
    }

    createRecordingEffect() {
        // Visual recording effect
        for (let i = 0; i < 20; i++) {
            this.timeParticles.push({
                x: this.width / 2 + (Math.random() - 0.5) * 100,
                y: this.height / 2 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                size: Math.random() * 5 + 2,
                color: '#ffff00',
                temporalPhase: Math.random() * Math.PI * 2,
                lifetime: 50
            });
        }
    }

    initiateTimeJump() {
        this.timeWarp = 100;
        this.timeEventCount++;
        
        // Create time jump effect
        this.createTimeJumpEffect();
        
        this.updateStats();
    }

    createTimeJumpEffect() {
        // Create visual effect for time jump
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 2;
            const speed = Math.random() * 10 + 5;
            
            this.timeParticles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: '#00ffff',
                temporalPhase: Math.random() * Math.PI * 2,
                lifetime: 100
            });
        }
    }

    updateStats() {
        document.getElementById('timelineCount').textContent = this.activeTimelines;
        document.getElementById('eventCount').textContent = this.timeEventCount;
        document.getElementById('paradoxCount').textContent = this.paradoxCount;
    }

    animate() {
        // Update time
        if (!this.isPaused) {
            const timeDiff = this.targetTime - this.currentTime;
            this.currentTime += timeDiff * (this.timeSpeed / 1000);
            
            // Apply timeline stability
            if (this.timelineStability < 50) {
                this.timelineGlitch = Math.random() * 10;
                this.currentTime += (Math.random() - 0.5) * this.timelineGlitch;
            }
        }
        
        // Update visual effects
        this.timeWarp *= 0.95;
        this.paradoxEffect *= 0.9;
        this.timelineGlitch *= 0.9;
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render timeline
        this.renderTimeline();
        
        // Render time particles
        this.updateAndRenderParticles();
        
        // Render alternate timelines
        this.renderAlternateTimelines();
        
        // Apply effects
        this.applyTimeEffects();
        
        requestAnimationFrame(() => this.animate());
    }

    renderTimeline() {
        // Main timeline
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height / 2);
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();
        
        // Timeline events
        this.timelineEvents.forEach(event => {
            event.pulse += 0.05;
            const pulseSize = event.radius + Math.sin(event.pulse) * 3;
            
            // Event glow
            const gradient = this.ctx.createRadialGradient(
                event.x, event.y, 0,
                event.x, event.y, pulseSize * 3
            );
            gradient.addColorStop(0, event.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(event.x, event.y, pulseSize * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Event core
            this.ctx.fillStyle = event.color;
            this.ctx.beginPath();
            this.ctx.arc(event.x, event.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Highlight current time
            const currentX = this.mapYearToX(this.currentTime);
            if (Math.abs(event.year - this.currentTime) < 100) {
                this.ctx.strokeStyle = event.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(currentX, this.height / 2);
                this.ctx.lineTo(event.x, event.y);
                this.ctx.stroke();
            }
        });
        
        // Current time indicator
        const currentX = this.mapYearToX(this.currentTime);
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(currentX, 0);
        this.ctx.lineTo(currentX, this.height);
        this.ctx.stroke();
        
        // Target time indicator
        const targetX = this.mapYearToX(this.targetTime);
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(targetX, 0);
        this.ctx.lineTo(targetX, this.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    renderAlternateTimelines() {
        this.alternateTimelines.forEach((timeline, index) => {
            timeline.opacity *= 0.995;
            
            if (timeline.opacity > 0.01) {
                this.ctx.strokeStyle = timeline.color;
                this.ctx.globalAlpha = timeline.opacity * 0.3;
                this.ctx.lineWidth = 2;
                
                const y = this.height / 2 + timeline.divergence;
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.width, y);
                this.ctx.stroke();
                
                this.ctx.globalAlpha = 1;
            }
        });
        
        // Remove faded timelines
        this.alternateTimelines = this.alternateTimelines.filter(t => t.opacity > 0.01);
    }

    updateAndRenderParticles() {
        this.timeParticles.forEach((particle, index) => {
            // Update particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.temporalPhase += 0.1;
            particle.lifetime--;
            
            // Time effects on particles
            if (this.timeWarp > 0) {
                particle.vx *= 1.1;
                particle.vy *= 1.1;
            }
            
            if (this.paradoxEffect > 0) {
                particle.vx += (Math.random() - 0.5) * this.paradoxEffect / 10;
                particle.vy += (Math.random() - 0.5) * this.paradoxEffect / 10;
            }
            
            // Boundary conditions
            if (particle.x < 0 || particle.x > this.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.height) particle.vy *= -1;
            
            // Render particle
            const opacity = Math.min(1, particle.lifetime / 50);
            this.ctx.globalAlpha = opacity;
            
            const pulse = Math.sin(particle.temporalPhase) * 0.5 + 0.5;
            const size = particle.size * (1 + pulse * 0.5);
            
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, size * 2
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
        
        // Remove dead particles
        this.timeParticles = this.timeParticles.filter(p => p.lifetime > 0);
        
        // Add new particles
        if (this.timeParticles.length < 100 && Math.random() < 0.1) {
            this.timeParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: this.getTimeParticleColor(),
                temporalPhase: Math.random() * Math.PI * 2,
                lifetime: Math.random() * 100 + 50
            });
        }
    }

    applyTimeEffects() {
        // Time warp effect
        if (this.timeWarp > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.timeWarp / 100 * 0.3;
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.restore();
        }
        
        // Paradox effect
        if (this.paradoxEffect > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.paradoxEffect / 100 * 0.2;
            this.ctx.fillStyle = '#ff0000';
            
            // Glitch effect
            for (let i = 0; i < 5; i++) {
                const y = Math.random() * this.height;
                const height = Math.random() * 50;
                this.ctx.fillRect(0, y, this.width, height);
            }
            
            this.ctx.restore();
        }
        
        // Timeline glitch effect
        if (this.timelineGlitch > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.timelineGlitch / 10 * 0.1;
            
            for (let i = 0; i < 3; i++) {
                const x = Math.random() * this.width;
                const width = Math.random() * 100;
                this.ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
                this.ctx.fillRect(x, 0, width, this.height);
            }
            
            this.ctx.restore();
        }
    }
}

// Initialize the time travel simulator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TimeTravelSimulator();
});
