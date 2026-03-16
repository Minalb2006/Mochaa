class VoiceMusicVisualizer {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.animationId = null;
        this.currentMode = 'wave';
        this.particles = [];
        this.sensitivity = 50;
        this.smoothing = 0.8;
        this.colorIntensity = 0.7;
        this.colorScheme = 0;
        this.voiceRecognition = null;
        this.isListening = false;
        
        this.colorSchemes = [
            ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'],
            ['#f72585', '#b5179e', '#7209b7', '#560bad'],
            ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec'],
            ['#264653', '#2a9d8f', '#e9c46a', '#f4a261'],
            ['#e63946', '#f1faee', '#a8dadc', '#457b9d']
        ];
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupAudioContext();
        this.setupEventListeners();
        this.setupVoiceRecognition();
        this.createFrequencyBars();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').classList.add('hide');
        }, 1000);
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    setupAudioContext() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = this.smoothing;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    }

    setupEventListeners() {
        // Microphone button
        document.getElementById('micBtn').addEventListener('click', () => {
            this.startMicrophone();
        });
        
        // Stop button
        document.getElementById('stopBtn').addEventListener('click', () => {
            this.stopAudio();
        });
        
        // File input
        document.getElementById('audioFile').addEventListener('change', (e) => {
            this.loadAudioFile(e.target.files[0]);
        });
        
        // Visualization modes
        document.querySelectorAll('.viz-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.viz-mode').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentMode = e.target.dataset.mode;
                document.getElementById('currentMode').textContent = 
                    e.target.textContent;
            });
        });
        
        // Sliders
        document.getElementById('sensitivity').addEventListener('input', (e) => {
            this.sensitivity = e.target.value;
            document.getElementById('sensitivityValue').textContent = e.target.value;
        });
        
        document.getElementById('smoothing').addEventListener('input', (e) => {
            this.smoothing = e.target.value / 100;
            this.analyser.smoothingTimeConstant = this.smoothing;
            document.getElementById('smoothingValue').textContent = e.target.value;
        });
        
        document.getElementById('colorIntensity').addEventListener('input', (e) => {
            this.colorIntensity = e.target.value / 100;
            document.getElementById('colorValue').textContent = e.target.value;
        });
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = true;
            this.voiceRecognition.interimResults = true;
            this.voiceRecognition.lang = 'en-US';
            
            this.voiceRecognition.onresult = (event) => {
                const last = event.results.length - 1;
                const command = event.results[last][0].transcript.toLowerCase();
                this.processVoiceCommand(command);
            };
            
            this.voiceRecognition.onerror = (event) => {
                console.error('Voice recognition error:', event.error);
                this.updateVoiceStatus('Voice recognition error');
            };
            
            this.voiceRecognition.onend = () => {
                if (this.isListening) {
                    this.voiceRecognition.start();
                }
            };
        }
    }

    startVoiceRecognition() {
        if (this.voiceRecognition && !this.isListening) {
            this.isListening = true;
            this.voiceRecognition.start();
            this.updateVoiceStatus('Voice recognition active');
            document.getElementById('voiceIndicator').classList.add('active');
        }
    }

    stopVoiceRecognition() {
        if (this.voiceRecognition && this.isListening) {
            this.isListening = false;
            this.voiceRecognition.stop();
            this.updateVoiceStatus('Voice recognition inactive');
            document.getElementById('voiceIndicator').classList.remove('active');
        }
    }

    updateVoiceStatus(status) {
        document.getElementById('voiceStatus').textContent = status;
    }

    processVoiceCommand(command) {
        console.log('Voice command:', command);
        
        // Visualization mode commands
        const modes = ['wave', 'spiral', 'explode', 'particles', 'bars', 'circular'];
        modes.forEach(mode => {
            if (command.includes(mode)) {
                this.switchToMode(mode);
            }
        });
        
        // Sensitivity commands
        if (command.includes('sensitivity up')) {
            this.adjustSensitivity(10);
        } else if (command.includes('sensitivity down')) {
            this.adjustSensitivity(-10);
        }
        
        // Color commands
        if (command.includes('colors') || command.includes('colour')) {
            this.changeColorScheme();
        }
        
        // Start/stop commands
        if (command.includes('start microphone') || command.includes('mic on')) {
            this.startMicrophone();
        } else if (command.includes('stop') || command.includes('mic off')) {
            this.stopAudio();
        }
    }

    switchToMode(mode) {
        document.querySelectorAll('.viz-mode').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        this.currentMode = mode;
        document.getElementById('currentMode').textContent = 
            mode.charAt(0).toUpperCase() + mode.slice(1);
    }

    adjustSensitivity(delta) {
        this.sensitivity = Math.max(1, Math.min(100, this.sensitivity + delta));
        document.getElementById('sensitivity').value = this.sensitivity;
        document.getElementById('sensitivityValue').textContent = this.sensitivity;
    }

    changeColorScheme() {
        this.colorScheme = (this.colorScheme + 1) % this.colorSchemes.length;
    }

    async startMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.setupAudioSource(stream);
            this.startVoiceRecognition();
            document.getElementById('micBtn').classList.add('active');
        } catch (error) {
            console.error('Microphone access denied:', error);
            alert('Microphone access denied. Please allow microphone access to use this feature.');
        }
    }

    loadAudioFile(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const audioBuffer = await this.audioContext.decodeAudioData(e.target.result);
                this.setupAudioSourceBuffer(audioBuffer);
            } catch (error) {
                console.error('Error loading audio file:', error);
                alert('Error loading audio file. Please try a different file.');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    setupAudioSource(stream) {
        if (this.source) {
            this.source.disconnect();
        }
        
        this.source = this.audioContext.createMediaStreamSource(stream);
        this.source.connect(this.analyser);
    }

    setupAudioSourceBuffer(audioBuffer) {
        if (this.source) {
            this.source.disconnect();
        }
        
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = audioBuffer;
        this.source.connect(this.analyser);
        this.source.connect(this.audioContext.destination);
        this.source.start();
    }

    stopAudio() {
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        this.stopVoiceRecognition();
        document.getElementById('micBtn').classList.remove('active');
    }

    createFrequencyBars() {
        const container = document.getElementById('frequencyBars');
        for (let i = 0; i < 16; i++) {
            const bar = document.createElement('div');
            bar.className = 'frequency-bar';
            container.appendChild(bar);
        }
    }

    updateFrequencyBars() {
        const bars = document.querySelectorAll('.frequency-bar');
        const barCount = bars.length;
        const samplesPerBar = Math.floor(this.bufferLength / barCount);
        
        bars.forEach((bar, index) => {
            let sum = 0;
            for (let i = 0; i < samplesPerBar; i++) {
                sum += this.dataArray[index * samplesPerBar + i];
            }
            const average = sum / samplesPerBar;
            const height = (average / 255) * 100;
            bar.style.height = `${height}%`;
        });
    }

    getColor(index, alpha = 1) {
        const colors = this.colorSchemes[this.colorScheme];
        const color = colors[index % colors.length];
        const rgb = this.hexToRgb(color);
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (!this.analyser) return;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        this.updateFrequencyBars();
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw visualization based on current mode
        switch (this.currentMode) {
            case 'wave':
                this.drawWave();
                break;
            case 'spiral':
                this.drawSpiral();
                break;
            case 'explode':
                this.drawExplode();
                break;
            case 'particles':
                this.drawParticles();
                break;
            case 'bars':
                this.drawBars();
                break;
            case 'circular':
                this.drawCircular();
                break;
        }
    }

    drawWave() {
        const sliceWidth = this.canvas.width / this.bufferLength;
        let x = 0;
        
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.getColor(0, this.colorIntensity);
        this.ctx.beginPath();
        
        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 255.0;
            const y = this.canvas.height / 2 + (v - 0.5) * this.canvas.height * (this.sensitivity / 50);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
    }

    drawSpiral() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY) - 50;
        
        this.ctx.beginPath();
        
        for (let i = 0; i < this.bufferLength; i += 4) {
            const amplitude = this.dataArray[i] / 255.0;
            const angle = (i / this.bufferLength) * Math.PI * 8;
            const radius = (i / this.bufferLength) * maxRadius * (1 + amplitude * this.sensitivity / 50);
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.strokeStyle = this.getColor(1, this.colorIntensity);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawExplode() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < this.bufferLength; i += 10) {
            const amplitude = this.dataArray[i] / 255.0;
            const angle = (i / this.bufferLength) * Math.PI * 2;
            const distance = amplitude * this.sensitivity * 5;
            
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            const size = amplitude * 10;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.getColor(i % 4, this.colorIntensity);
            this.ctx.fill();
        }
    }

    drawParticles() {
        // Add new particles based on audio
        for (let i = 0; i < this.bufferLength; i += 50) {
            const amplitude = this.dataArray[i] / 255.0;
            if (amplitude > 0.5 && this.particles.length < 200) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: this.canvas.height,
                    vx: (Math.random() - 0.5) * 4,
                    vy: -amplitude * 10,
                    size: amplitude * 20,
                    color: i % 4,
                    life: 1
                });
            }
        }
        
        // Update and draw particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // gravity
            particle.life -= 0.02;
            
            if (particle.life > 0) {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
                this.ctx.fillStyle = this.getColor(particle.color, particle.life * this.colorIntensity);
                this.ctx.fill();
                return true;
            }
            return false;
        });
    }

    drawBars() {
        const barWidth = this.canvas.width / this.bufferLength * 2.5;
        let x = 0;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.dataArray[i] / 255) * this.canvas.height * (this.sensitivity / 50);
            
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, this.canvas.height - barHeight);
            gradient.addColorStop(0, this.getColor(0, this.colorIntensity));
            gradient.addColorStop(1, this.getColor(1, this.colorIntensity * 0.5));
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }

    drawCircular() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 100;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const amplitude = this.dataArray[i] / 255.0;
            const angle = (i / this.bufferLength) * Math.PI * 2;
            const barHeight = amplitude * this.sensitivity * 2;
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.strokeStyle = this.getColor(i % 4, this.colorIntensity);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
}

// Initialize the visualizer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VoiceMusicVisualizer();
});
