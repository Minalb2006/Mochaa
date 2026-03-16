class AIDrawingCanvas {
    constructor() {
        this.drawingCanvas = document.getElementById('drawingCanvas');
        this.styleCanvas = document.getElementById('styleCanvas');
        this.drawingCtx = this.drawingCanvas.getContext('2d');
        this.styleCtx = this.styleCanvas.getContext('2d');
        
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.opacity = 1;
        this.currentStyle = 'original';
        
        this.setupCanvas();
        this.setupEventListeners();
        this.initializeStyleFilters();
    }

    setupCanvas() {
        // Set canvas dimensions
        const rect = this.drawingCanvas.getBoundingClientRect();
        this.drawingCanvas.width = rect.width;
        this.drawingCanvas.height = 400;
        this.styleCanvas.width = rect.width;
        this.styleCanvas.height = 400;
        
        // Set initial canvas background
        this.drawingCtx.fillStyle = 'white';
        this.drawingCtx.fillRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.styleCtx.fillStyle = 'white';
        this.styleCtx.fillRect(0, 0, this.styleCanvas.width, this.styleCanvas.height);
    }

    setupEventListeners() {
        // Drawing events
        this.drawingCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.drawingCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.drawingCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.drawingCanvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events for mobile
        this.drawingCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.drawingCanvas.dispatchEvent(mouseEvent);
        });
        
        this.drawingCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.drawingCanvas.dispatchEvent(mouseEvent);
        });
        
        this.drawingCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.drawingCanvas.dispatchEvent(mouseEvent);
        });
        
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTool = e.target.dataset.tool;
            });
        });
        
        // Style buttons
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentStyle = e.target.dataset.style;
                this.applyStyle();
            });
        });
        
        // Color picker
        document.querySelectorAll('.color-option').forEach(color => {
            color.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.currentColor = e.target.dataset.color;
            });
        });
        
        // Sliders
        const brushSizeSlider = document.getElementById('brushSize');
        const opacitySlider = document.getElementById('opacity');
        
        brushSizeSlider.addEventListener('input', (e) => {
            this.brushSize = e.target.value;
            document.getElementById('sizeValue').textContent = e.target.value;
        });
        
        opacitySlider.addEventListener('input', (e) => {
            this.opacity = e.target.value / 100;
            document.getElementById('opacityValue').textContent = e.target.value;
        });
        
        // Action buttons
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCanvas());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadImage());
        
        // Window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.drawingCtx.beginPath();
        this.drawingCtx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.drawingCtx.globalAlpha = this.opacity;
        this.drawingCtx.lineWidth = this.brushSize;
        this.drawingCtx.lineCap = 'round';
        this.drawingCtx.lineJoin = 'round';
        
        if (this.currentTool === 'eraser') {
            this.drawingCtx.globalCompositeOperation = 'destination-out';
        } else {
            this.drawingCtx.globalCompositeOperation = 'source-over';
            this.drawingCtx.strokeStyle = this.currentColor;
        }
        
        this.drawingCtx.lineTo(x, y);
        this.drawingCtx.stroke();
        this.drawingCtx.beginPath();
        this.drawingCtx.moveTo(x, y);
        
        // Apply style in real-time
        this.applyStyle();
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.drawingCtx.beginPath();
        }
    }

    initializeStyleFilters() {
        // Predefined style filters for different artistic effects
        this.styleFilters = {
            original: (imageData) => imageData,
            
            vangogh: (imageData) => {
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    // Van Gogh style: enhanced colors and texture
                    data[i] = Math.min(255, data[i] * 1.3);     // Red
                    data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green
                    data[i + 2] = Math.min(255, data[i + 2] * 0.9); // Blue
                    
                    // Add texture effect
                    const noise = Math.random() * 20 - 10;
                    data[i] = Math.max(0, Math.min(255, data[i] + noise));
                    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
                    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
                }
                return imageData;
            },
            
            picasso: (imageData) => {
                const data = imageData.data;
                const width = imageData.width;
                const height = imageData.height;
                
                // Create a copy for pixel manipulation
                const originalData = new Uint8ClampedArray(data);
                
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const i = (y * width + x) * 4;
                        
                        // Picasso style: geometric distortion
                        const sourceX = (x + Math.sin(y * 0.1) * 10) % width;
                        const sourceY = (y + Math.cos(x * 0.1) * 10) % height;
                        const sourceI = (Math.floor(sourceY) * width + Math.floor(sourceX)) * 4;
                        
                        if (sourceI >= 0 && sourceI < data.length) {
                            data[i] = originalData[sourceI];
                            data[i + 1] = originalData[sourceI + 1];
                            data[i + 2] = originalData[sourceI + 2];
                        }
                    }
                }
                return imageData;
            },
            
            monet: (imageData) => {
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    // Monet style: soft, dreamy colors
                    data[i] = Math.min(255, data[i] * 1.2);     // Red
                    data[i + 1] = Math.min(255, data[i + 1] * 1.4); // Green
                    data[i + 2] = Math.min(255, data[i + 2] * 1.3); // Blue
                    
                    // Add soft blur effect
                    if (i > 0 && i < data.length - 4) {
                        data[i] = (data[i] + data[i - 4] + data[i + 4]) / 3;
                        data[i + 1] = (data[i + 1] + data[i - 3] + data[i + 5]) / 3;
                        data[i + 2] = (data[i + 2] + data[i - 2] + data[i + 6]) / 3;
                    }
                }
                return imageData;
            },
            
            kandinsky: (imageData) => {
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    // Kandinsky style: abstract, vibrant colors
                    const hue = (i / 4) % 360;
                    const rgb = this.hslToRgb(hue / 360, 0.8, 0.6);
                    
                    // Blend with original
                    data[i] = (data[i] + rgb[0]) / 2;
                    data[i + 1] = (data[i + 1] + rgb[1]) / 2;
                    data[i + 2] = (data[i + 2] + rgb[2]) / 2;
                }
                return imageData;
            },
            
            warhol: (imageData) => {
                const data = imageData.data;
                const width = imageData.width;
                const height = imageData.height;
                
                // Warhol style: pop art color blocks
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const i = (y * width + x) * 4;
                        const blockX = Math.floor(x / (width / 4));
                        const blockY = Math.floor(y / (height / 4));
                        const blockIndex = blockY * 4 + blockX;
                        
                        const colors = [
                            [255, 0, 0],     // Red
                            [0, 255, 0],     // Green
                            [0, 0, 255],     // Blue
                            [255, 255, 0],   // Yellow
                            [255, 0, 255],   // Magenta
                            [0, 255, 255],   // Cyan
                            [255, 128, 0],   // Orange
                            [128, 0, 255]    // Purple
                        ];
                        
                        const color = colors[blockIndex % colors.length];
                        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        
                        data[i] = (brightness / 255) * color[0];
                        data[i + 1] = (brightness / 255) * color[1];
                        data[i + 2] = (brightness / 255) * color[2];
                    }
                }
                return imageData;
            }
        };
    }

    hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    applyStyle() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.classList.add('show');
        
        // Use setTimeout to show loading animation
        setTimeout(() => {
            const imageData = this.drawingCtx.getImageData(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
            const styledData = this.styleFilters[this.currentStyle](imageData);
            
            this.styleCtx.putImageData(styledData, 0, 0);
            loadingIndicator.classList.remove('show');
        }, 100);
    }

    clearCanvas() {
        this.drawingCtx.fillStyle = 'white';
        this.drawingCtx.fillRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        this.styleCtx.fillStyle = 'white';
        this.styleCtx.fillRect(0, 0, this.styleCanvas.width, this.styleCanvas.height);
    }

    downloadImage() {
        const link = document.createElement('a');
        link.download = `ai-drawing-${this.currentStyle}-${Date.now()}.png`;
        link.href = this.styleCanvas.toDataURL();
        link.click();
    }
}

// Initialize the canvas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIDrawingCanvas();
});
