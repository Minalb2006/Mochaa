class NeuralDreamGenerator {
    constructor() {
        this.canvas = document.getElementById('dreamCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlayCanvas = document.getElementById('neuralOverlay');
        this.overlayCtx = this.overlayCanvas.getContext('2d');
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.overlayCanvas.width = this.width;
        this.overlayCanvas.height = this.height;
        
        this.time = 0;
        this.neurons = [];
        this.connections = [];
        this.dreamParticles = [];
        this.maxNeurons = 150;
        this.maxConnections = 300;
        this.maxParticles = 200;
        
        // Neural parameters
        this.creativity = 70;
        this.emotionalIntensity = 50;
        this.clarity = 60;
        this.abstractLevel = 40;
        this.currentEmotion = 'neutral';
        
        // Dream state
        this.dreamText = '';
        this.dreamKeywords = [];
        this.isGenerating = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeNeuralNetwork();
        this.initializeDreamParticles();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loadingScreen').classList.add('hide');
        }, 2500);
    }

    setupEventListeners() {
        // Sliders
        document.getElementById('creativity').addEventListener('input', (e) => {
            this.creativity = parseInt(e.target.value);
            document.getElementById('creativityValue').textContent = this.creativity;
            this.updateNeuralActivity();
        });
        
        document.getElementById('emotionalIntensity').addEventListener('input', (e) => {
            this.emotionalIntensity = parseInt(e.target.value);
            document.getElementById('emotionalValue').textContent = this.emotionalIntensity;
            this.updateEmotionalState();
        });
        
        document.getElementById('clarity').addEventListener('input', (e) => {
            this.clarity = parseInt(e.target.value);
            document.getElementById('clarityValue').textContent = this.clarity;
            this.updateDreamClarity();
        });
        
        document.getElementById('abstractLevel').addEventListener('input', (e) => {
            this.abstractLevel = parseInt(e.target.value);
            document.getElementById('abstractValue').textContent = this.abstractLevel;
            this.updateAbstractness();
        });
        
        // Emotion buttons
        document.querySelectorAll('[data-emotion]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-emotion]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentEmotion = e.target.dataset.emotion;
                this.applyEmotionFilter();
            });
        });
        
        // Action buttons
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateDream();
        });
        
        document.getElementById('randomDreamBtn').addEventListener('click', () => {
            this.generateRandomDream();
        });
        
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearDream();
        });
        
        // Dream input
        document.getElementById('dreamInput').addEventListener('input', (e) => {
            this.dreamText = e.target.value;
            this.extractKeywords();
            this.updateNeuralActivity();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.overlayCanvas.width = this.width;
            this.overlayCanvas.height = this.height;
        });
    }

    initializeNeuralNetwork() {
        // Create neurons
        for (let i = 0; i < this.maxNeurons; i++) {
            this.neurons.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 4 + 2,
                activation: Math.random(),
                color: this.getNeuronColor(i),
                connections: [],
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
        
        // Create connections
        for (let i = 0; i < this.maxConnections; i++) {
            const neuron1 = Math.floor(Math.random() * this.neurons.length);
            const neuron2 = Math.floor(Math.random() * this.neurons.length);
            
            if (neuron1 !== neuron2) {
                this.connections.push({
                    from: neuron1,
                    to: neuron2,
                    strength: Math.random(),
                    pulsePhase: Math.random() * Math.PI * 2
                });
                
                this.neurons[neuron1].connections.push(neuron2);
            }
        }
    }

    initializeDreamParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.dreamParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: this.getDreamParticleColor(),
                life: 1,
                type: Math.random() > 0.5 ? 'organic' : 'geometric',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }

    getNeuronColor(index) {
        const colors = [
            '#8a2be2', '#ff1493', '#00bfff', '#ff69b4', '#9370db',
            '#4169e1', '#ff6347', '#32cd32', '#ffd700', '#ff4500'
        ];
        return colors[index % colors.length];
    }

    getDreamParticleColor() {
        const emotionColors = {
            happy: ['#ffeb3b', '#ffc107', '#ff9800', '#ff5722'],
            sad: ['#2196f3', '#03a9f4', '#00bcd4', '#009688'],
            mysterious: ['#9c27b0', '#673ab7', '#3f51b5', '#2196f3'],
            chaotic: ['#f44336', '#e91e63', '#9c27b0', '#ff5722'],
            peaceful: ['#4caf50', '#8bc34a', '#cddc39', '#ffeb3b'],
            nightmare: ['#000000', '#424242', '#616161', '#9e9e9e'],
            neutral: ['#ffffff', '#f5f5f5', '#e0e0e0', '#bdbdbd']
        };
        
        const colors = emotionColors[this.currentEmotion] || emotionColors.neutral;
        return colors[Math.floor(Math.random() * colors.length)];
    }

    extractKeywords() {
        // Simple keyword extraction from dream text
        const words = this.dreamText.toLowerCase().split(/\s+/);
        const keywords = words.filter(word => 
            word.length > 3 && 
            !['the', 'and', 'for', 'are', 'with', 'that', 'this', 'from'].includes(word)
        );
        this.dreamKeywords = keywords.slice(0, 10);
    }

    updateNeuralActivity() {
        // Update neuron activation based on dream content
        this.neurons.forEach((neuron, index) => {
            const keywordInfluence = this.dreamKeywords.length > 0 ? 
                Math.random() * this.creativity / 100 : 0;
            
            neuron.activation = Math.min(1, neuron.activation + keywordInfluence * 0.1);
            neuron.activation *= 0.95; // Decay
            
            // Update neuron movement
            neuron.vx += (Math.random() - 0.5) * this.creativity / 100;
            neuron.vy += (Math.random() - 0.5) * this.creativity / 100;
            neuron.vx *= 0.98;
            neuron.vy *= 0.98;
            
            neuron.x += neuron.vx;
            neuron.y += neuron.vy;
            
            // Boundary conditions
            if (neuron.x < 0 || neuron.x > this.width) neuron.vx *= -1;
            if (neuron.y < 0 || neuron.y > this.height) neuron.vy *= -1;
        });
        
        this.updateStats();
    }

    updateEmotionalState() {
        // Update neural connections based on emotional intensity
        this.connections.forEach(connection => {
            connection.strength = Math.min(1, connection.strength + 
                (Math.random() - 0.5) * this.emotionalIntensity / 1000);
            connection.strength = Math.max(0.1, connection.strength);
        });
        
        document.getElementById('emotionLevel').textContent = 
            Math.round(this.emotionalIntensity);
    }

    updateDreamClarity() {
        // Update particle clarity and definition
        this.dreamParticles.forEach(particle => {
            particle.opacity = this.clarity / 100;
        });
    }

    updateAbstractness() {
        // Update particle shapes and movements
        this.dreamParticles.forEach(particle => {
            particle.abstractness = this.abstractLevel / 100;
            if (Math.random() < this.abstractLevel / 100) {
                particle.type = particle.type === 'organic' ? 'geometric' : 'organic';
            }
        });
    }

    applyEmotionFilter() {
        // Apply emotion-specific visual effects
        this.dreamParticles.forEach(particle => {
            particle.color = this.getDreamParticleColor();
            
            switch(this.currentEmotion) {
                case 'happy':
                    particle.vy -= 0.1; // Float upward
                    break;
                case 'sad':
                    particle.vy += 0.1; // Fall downward
                    break;
                case 'chaotic':
                    particle.vx += (Math.random() - 0.5) * 2;
                    particle.vy += (Math.random() - 0.5) * 2;
                    break;
                case 'peaceful':
                    particle.vx *= 0.95;
                    particle.vy *= 0.95;
                    break;
            }
        });
    }

    generateDream() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.textContent = '🔄 Generating...';
        
        // Simulate dream generation
        setTimeout(() => {
            this.createDreamVisualization();
            this.isGenerating = false;
            generateBtn.textContent = '🚀 Generate Dream';
        }, 2000);
    }

    generateRandomDream() {
        const randomDreams = [
            "Flying through clouds of neon light",
            "Walking in a forest made of crystal",
            "Swimming in an ocean of stars",
            "Dancing with shadows in moonlight",
            "Exploring a city made of memories",
            "Floating in zero gravity with colorful thoughts",
            "Running through fields of singing flowers",
            "Climbing mountains made of books"
        ];
        
        const randomDream = randomDreams[Math.floor(Math.random() * randomDreams.length)];
        document.getElementById('dreamInput').value = randomDream;
        this.dreamText = randomDream;
        this.extractKeywords();
        this.generateDream();
    }

    createDreamVisualization() {
        // Create intense dream visualization
        const burstCount = 50;
        for (let i = 0; i < burstCount; i++) {
            this.dreamParticles.push({
                x: this.width / 2 + (Math.random() - 0.5) * 100,
                y: this.height / 2 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 8 + 2,
                color: this.getDreamParticleColor(),
                life: 1,
                type: Math.random() > 0.5 ? 'organic' : 'geometric',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }
        
        // Limit particles
        if (this.dreamParticles.length > this.maxParticles * 2) {
            this.dreamParticles = this.dreamParticles.slice(-this.maxParticles * 2);
        }
        
        // Boost neural activity
        this.neurons.forEach(neuron => {
            neuron.activation = Math.min(1, neuron.activation + 0.5);
        });
    }

    clearDream() {
        this.dreamText = '';
        document.getElementById('dreamInput').value = '';
        this.dreamKeywords = [];
        this.dreamParticles = [];
        this.initializeDreamParticles();
        
        // Reset neural state
        this.neurons.forEach(neuron => {
            neuron.activation = Math.random() * 0.3;
        });
    }

    updateStats() {
        const activeNeurons = this.neurons.filter(n => n.activation > 0.5).length;
        const activeConnections = this.connections.filter(c => c.strength > 0.5).length;
        const dreamDepth = Math.round((this.creativity + this.emotionalIntensity) / 2);
        
        document.getElementById('neuronCount').textContent = activeNeurons;
        document.getElementById('connectionCount').textContent = activeConnections;
        document.getElementById('dreamDepth').textContent = dreamDepth;
    }

    animate() {
        this.time += 0.01;
        
        // Clear canvases
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.overlayCtx.clearRect(0, 0, this.width, this.height);
        
        // Update and render dream particles
        this.updateAndRenderParticles();
        
        // Update and render neural network
        this.updateAndRenderNeuralNetwork();
        
        // Apply dream effects
        this.applyDreamEffects();
        
        requestAnimationFrame(() => this.animate());
    }

    updateAndRenderParticles() {
        this.dreamParticles.forEach((particle, index) => {
            // Update particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.rotation += particle.rotationSpeed;
            particle.life *= 0.995;
            
            // Apply abstractness
            if (particle.abstractness > 0.5) {
                particle.vx += (Math.random() - 0.5) * 0.5;
                particle.vy += (Math.random() - 0.5) * 0.5;
            }
            
            // Apply gravity based on emotion
            if (this.currentEmotion === 'happy') {
                particle.vy -= 0.05;
            } else if (this.currentEmotion === 'sad') {
                particle.vy += 0.05;
            }
            
            // Boundary conditions
            if (particle.x < 0 || particle.x > this.width) particle.vx *= -0.8;
            if (particle.y < 0 || particle.y > this.height) particle.vy *= -0.8;
            
            // Render particle
            this.ctx.save();
            this.ctx.translate(particle.x, particle.y);
            this.ctx.rotate(particle.rotation);
            
            const opacity = particle.life * (particle.opacity || 1);
            this.ctx.globalAlpha = opacity;
            
            if (particle.type === 'organic') {
                // Organic shape
                const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
                gradient.addColorStop(0, particle.color);
                gradient.addColorStop(1, 'transparent');
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Geometric shape
                this.ctx.strokeStyle = particle.color;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                
                const sides = Math.floor(Math.random() * 4) + 3;
                for (let i = 0; i < sides; i++) {
                    const angle = (i / sides) * Math.PI * 2;
                    const x = Math.cos(angle) * particle.size;
                    const y = Math.sin(angle) * particle.size;
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.closePath();
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
        
        // Remove dead particles
        this.dreamParticles = this.dreamParticles.filter(p => p.life > 0.01);
        
        // Add new particles occasionally
        if (this.dreamParticles.length < this.maxParticles && Math.random() < 0.1) {
            this.dreamParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: this.getDreamParticleColor(),
                life: 1,
                type: Math.random() > 0.5 ? 'organic' : 'geometric',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }

    updateAndRenderNeuralNetwork() {
        // Render connections
        this.overlayCtx.strokeStyle = 'rgba(138, 43, 226, 0.2)';
        this.overlayCtx.lineWidth = 1;
        
        this.connections.forEach(connection => {
            const from = this.neurons[connection.from];
            const to = this.neurons[connection.to];
            
            if (from && to) {
                const pulse = Math.sin(this.time * 2 + connection.pulsePhase) * 0.5 + 0.5;
                this.overlayCtx.globalAlpha = connection.strength * pulse * 0.3;
                
                this.overlayCtx.beginPath();
                this.overlayCtx.moveTo(from.x, from.y);
                this.overlayCtx.lineTo(to.x, to.y);
                this.overlayCtx.stroke();
            }
        });
        
        // Render neurons
        this.neurons.forEach(neuron => {
            const pulse = Math.sin(this.time * 3 + neuron.pulsePhase) * 0.5 + 0.5;
            const size = neuron.size + pulse * neuron.activation * 5;
            
            // Neuron glow
            const gradient = this.overlayCtx.createRadialGradient(
                neuron.x, neuron.y, 0,
                neuron.x, neuron.y, size * 3
            );
            gradient.addColorStop(0, neuron.color);
            gradient.addColorStop(1, 'transparent');
            
            this.overlayCtx.globalAlpha = neuron.activation * 0.5;
            this.overlayCtx.fillStyle = gradient;
            this.overlayCtx.beginPath();
            this.overlayCtx.arc(neuron.x, neuron.y, size * 3, 0, Math.PI * 2);
            this.overlayCtx.fill();
            
            // Neuron core
            this.overlayCtx.globalAlpha = neuron.activation;
            this.overlayCtx.fillStyle = neuron.color;
            this.overlayCtx.beginPath();
            this.overlayCtx.arc(neuron.x, neuron.y, size, 0, Math.PI * 2);
            this.overlayCtx.fill();
        });
        
        this.overlayCtx.globalAlpha = 1;
    }

    applyDreamEffects() {
        // Apply post-processing effects based on parameters
        
        // Clarity effect
        if (this.clarity < 50) {
            this.ctx.fillStyle = `rgba(10, 10, 10, ${0.1 * (1 - this.clarity / 50)})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Emotional intensity overlay
        if (this.emotionalIntensity > 70) {
            const emotionColors = {
                happy: 'rgba(255, 235, 59, 0.05)',
                sad: 'rgba(33, 150, 243, 0.05)',
                mysterious: 'rgba(156, 39, 176, 0.05)',
                chaotic: 'rgba(244, 67, 54, 0.05)',
                peaceful: 'rgba(76, 175, 80, 0.05)',
                nightmare: 'rgba(0, 0, 0, 0.1)'
            };
            
            this.ctx.fillStyle = emotionColors[this.currentEmotion] || 'rgba(255, 255, 255, 0.02)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
        
        // Abstract level distortion
        if (this.abstractLevel > 60) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.02;
            this.ctx.filter = `blur(${this.abstractLevel / 20}px)`;
            this.ctx.drawImage(this.canvas, 0, 0);
            this.ctx.restore();
        }
    }
}

// Initialize the neural dream generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NeuralDreamGenerator();
});
