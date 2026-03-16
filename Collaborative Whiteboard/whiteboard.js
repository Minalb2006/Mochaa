class CollaborativeWhiteboard {
    constructor() {
        this.canvas = document.getElementById('whiteboard');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'pen';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.users = new Map();
        this.currentUser = null;
        this.drawingHistory = [];
        this.socket = null;
        this.roomId = this.generateRoomId();
        
        this.userColors = [
            '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', 
            '#f7dc6f', '#bb8fce', '#85c1e2', '#f8b739'
        ];
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.initializeUser();
        this.connectToRoom();
        this.updateShareLink();
    }

    setupCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Set initial canvas background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.ctx.putImageData(imageData, 0, 0);
        });
    }

    initializeUser() {
        const userName = prompt('Enter your name:') || `User${Math.floor(Math.random() * 1000)}`;
        const userColor = this.userColors[Math.floor(Math.random() * this.userColors.length)];
        
        this.currentUser = {
            id: this.generateUserId(),
            name: userName,
            color: userColor,
            cursor: { x: 0, y: 0 }
        };
        
        this.users.set(this.currentUser.id, this.currentUser);
        this.updateUsersList();
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    generateRoomId() {
        return 'room_' + Math.random().toString(36).substr(2, 6);
    }

    connectToRoom() {
        // Simulate connection (in real app, this would use WebSocket/WebRTC)
        this.simulateConnection();
    }

    simulateConnection() {
        // Simulate connection delay
        setTimeout(() => {
            this.updateConnectionStatus(true);
            this.showNotification('Connected to collaborative session', 'success');
            
            // Simulate other users joining
            this.simulateOtherUsers();
        }, 1500);
    }

    simulateOtherUsers() {
        // Simulate random users joining (for demo purposes)
        const simulatedUsers = [
            { name: 'Alice', color: '#ff6b6b' },
            { name: 'Bob', color: '#4ecdc4' },
            { name: 'Charlie', color: '#45b7d1' }
        ];
        
        // Add one simulated user after delay
        setTimeout(() => {
            const randomUser = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
            const simulatedUser = {
                id: this.generateUserId(),
                name: randomUser.name,
                color: randomUser.color,
                cursor: { x: 0, y: 0 },
                isSimulated: true
            };
            
            this.users.set(simulatedUser.id, simulatedUser);
            this.updateUsersList();
            this.showNotification(`${randomUser.name} joined the session`, 'info');
            
            // Simulate cursor movement
            this.simulateCursorMovement(simulatedUser);
        }, 3000);
    }

    simulateCursorMovement(user) {
        if (!user.isSimulated) return;
        
        setInterval(() => {
            if (Math.random() > 0.7) {
                user.cursor.x = Math.random() * this.canvas.width;
                user.cursor.y = Math.random() * this.canvas.height;
                this.updateUserCursor(user);
            }
        }, 2000);
    }

    updateConnectionStatus(connected) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        
        if (connected) {
            statusDot.classList.add('connected');
            statusText.textContent = `Connected - ${this.users.size} users`;
        } else {
            statusDot.classList.remove('connected');
            statusText.textContent = 'Connecting...';
        }
    }

    setupEventListeners() {
        // Drawing events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTool = e.target.dataset.tool;
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
        brushSizeSlider.addEventListener('input', (e) => {
            this.brushSize = e.target.value;
            document.getElementById('sizeValue').textContent = e.target.value;
        });
        
        // Action buttons
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCanvas());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadCanvas());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyShareLink());
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        // Update cursor position
        this.currentUser.cursor = { x, y };
        this.updateUserCursor(this.currentUser);
        
        // Broadcast drawing start (in real app)
        this.broadcastDrawingStart(x, y);
    }

    draw(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update cursor position
        this.currentUser.cursor = { x, y };
        this.updateUserCursor(this.currentUser);
        
        if (!this.isDrawing) return;
        
        this.ctx.globalAlpha = 1;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        if (this.currentTool === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.currentColor;
        }
        
        if (this.currentTool === 'brush') {
            this.ctx.lineWidth = this.brushSize * 2;
            this.ctx.globalAlpha = 0.7;
        }
        
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        // Broadcast drawing (in real app)
        this.broadcastDrawing(x, y);
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.ctx.beginPath();
            
            // Broadcast drawing stop (in real app)
            this.broadcastDrawingStop();
        }
    }

    updateUserCursor(user) {
        let cursorElement = document.getElementById(`cursor-${user.id}`);
        
        if (!cursorElement) {
            cursorElement = document.createElement('div');
            cursorElement.id = `cursor-${user.id}`;
            cursorElement.className = 'user-cursor';
            cursorElement.style.background = user.color;
            
            const label = document.createElement('div');
            label.className = 'user-label';
            label.textContent = user.name;
            cursorElement.appendChild(label);
            
            document.getElementById('userCursors').appendChild(cursorElement);
        }
        
        cursorElement.style.left = user.cursor.x + 'px';
        cursorElement.style.top = user.cursor.y + 'px';
    }

    updateUsersList() {
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = '';
        
        this.users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            userItem.innerHTML = `
                <div class="user-avatar" style="background: ${user.color}">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <div class="user-name">${user.name}</div>
                <div class="user-status"></div>
            `;
            
            usersList.appendChild(userItem);
        });
        
        this.updateConnectionStatus(true);
    }

    updateShareLink() {
        const shareLink = `${window.location.origin}${window.location.pathname}?room=${this.roomId}`;
        document.getElementById('shareLink').value = shareLink;
    }

    copyShareLink() {
        const shareLink = document.getElementById('shareLink');
        shareLink.select();
        document.execCommand('copy');
        this.showNotification('Share link copied to clipboard!', 'success');
    }

    clearCanvas() {
        if (confirm('Are you sure you want to clear the canvas? This will affect all users.')) {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.showNotification('Canvas cleared', 'info');
            
            // Broadcast clear (in real app)
            this.broadcastClear();
        }
    }

    downloadCanvas() {
        const link = document.createElement('a');
        link.download = `whiteboard-${this.roomId}-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        this.showNotification('Canvas downloaded!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Simulated broadcasting methods (in real app, these would use WebSocket/WebRTC)
    broadcastDrawingStart(x, y) {
        // Simulate network delay
        setTimeout(() => {
            // In real app, send to server
            console.log('Broadcast drawing start:', { x, y, user: this.currentUser.id });
        }, 50);
    }

    broadcastDrawing(x, y) {
        // Simulate network delay
        setTimeout(() => {
            // In real app, send to server
            console.log('Broadcast drawing:', { x, y, user: this.currentUser.id });
        }, 50);
    }

    broadcastDrawingStop() {
        // Simulate network delay
        setTimeout(() => {
            // In real app, send to server
            console.log('Broadcast drawing stop:', { user: this.currentUser.id });
        }, 50);
    }

    broadcastClear() {
        // Simulate network delay
        setTimeout(() => {
            // In real app, send to server
            console.log('Broadcast clear:', { user: this.currentUser.id });
        }, 50);
    }

    // Simulate receiving drawing from other users
    simulateRemoteDrawing() {
        setInterval(() => {
            if (Math.random() > 0.95) {
                // Simulate another user drawing
                const users = Array.from(this.users.values()).filter(u => u.isSimulated);
                if (users.length > 0) {
                    const randomUser = users[Math.floor(Math.random() * users.length)];
                    this.simulateUserDrawing(randomUser);
                }
            }
        }, 5000);
    }

    simulateUserDrawing(user) {
        // Simulate a simple drawing from another user
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        
        this.ctx.strokeStyle = user.color;
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = 0.6;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
        
        this.showNotification(`${user.name} drew something`, 'info');
    }
}

// Initialize the whiteboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const whiteboard = new CollaborativeWhiteboard();
    
    // Check for room ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    
    if (roomId) {
        // Join existing room
        console.log('Joining room:', roomId);
    }
});
