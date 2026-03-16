class QuantumSimulator {
    constructor() {
        this.numQubits = 2;
        this.quantumState = new ComplexArray(4);
        this.circuit = [];
        this.gates = new Map();
        this.draggedGate = null;
        this.gatePositions = new Map();
        
        this.initializeQuantumState();
        this.initializeGates();
        this.setupEventListeners();
        this.createQuantumWires();
        this.updateVisualization();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').classList.add('hide');
        }, 1000);
    }

    initializeQuantumState() {
        // Initialize to |00⟩ state
        this.quantumState.set(0, new Complex(1, 0));
        this.quantumState.set(1, new Complex(0, 0));
        this.quantumState.set(2, new Complex(0, 0));
        this.quantumState.set(3, new Complex(0, 0));
    }

    initializeGates() {
        // Define quantum gates
        this.gates.set('H', new ComplexMatrix([
            [new Complex(1/Math.sqrt(2), 0), new Complex(1/Math.sqrt(2), 0)],
            [new Complex(1/Math.sqrt(2), 0), new Complex(-1/Math.sqrt(2), 0)]
        ]));
        
        this.gates.set('X', new ComplexMatrix([
            [new Complex(0, 0), new Complex(1, 0)],
            [new Complex(1, 0), new Complex(0, 0)]
        ]));
        
        this.gates.set('Y', new ComplexMatrix([
            [new Complex(0, 0), new Complex(0, -1)],
            [new Complex(0, 1), new Complex(0, 0)]
        ]));
        
        this.gates.set('Z', new ComplexMatrix([
            [new Complex(1, 0), new Complex(0, 0)],
            [new Complex(0, 0), new Complex(-1, 0)]
        ]));
        
        this.gates.set('CNOT', new ComplexMatrix([
            [new Complex(1, 0), new Complex(0, 0), new Complex(0, 0), new Complex(0, 0)],
            [new Complex(0, 0), new Complex(1, 0), new Complex(0, 0), new Complex(0, 0)],
            [new Complex(0, 0), new Complex(0, 0), new Complex(0, 0), new Complex(1, 0)],
            [new Complex(0, 0), new Complex(0, 0), new Complex(1, 0), new Complex(0, 0)]
        ]));
    }

    createQuantumWires() {
        const wiresContainer = document.getElementById('quantumWires');
        wiresContainer.innerHTML = '';
        
        for (let i = 0; i < this.numQubits; i++) {
            const wire = document.createElement('div');
            wire.className = 'quantum-wire';
            wire.dataset.qubit = i;
            
            const label = document.createElement('div');
            label.className = 'wire-label';
            label.textContent = `q${i}`;
            wire.appendChild(label);
            
            wiresContainer.appendChild(wire);
        }
    }

    setupEventListeners() {
        // Gate palette buttons
        document.querySelectorAll('.gate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const gateType = e.target.dataset.gate;
                this.createDraggableGate(gateType);
            });
        });
        
        // Circuit canvas drop zone
        const circuitCanvas = document.querySelector('.circuit-canvas');
        circuitCanvas.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        circuitCanvas.addEventListener('drop', (e) => {
            e.preventDefault();
            if (this.draggedGate) {
                const rect = circuitCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.placeGate(x, y);
            }
        });
        
        // Action buttons
        document.getElementById('runBtn').addEventListener('click', () => this.runCircuit());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCircuit());
    }

    createDraggableGate(gateType) {
        const gate = document.createElement('div');
        gate.className = `gate ${gateType.toLowerCase()}`;
        gate.textContent = gateType;
        gate.draggable = true;
        gate.dataset.gateType = gateType;
        
        gate.addEventListener('dragstart', (e) => {
            this.draggedGate = gateType;
            e.dataTransfer.effectAllowed = 'copy';
        });
        
        // Add to circuit canvas temporarily
        const circuitCanvas = document.querySelector('.circuit-canvas');
        circuitCanvas.appendChild(gate);
        
        // Position it at mouse and start dragging
        gate.style.position = 'absolute';
        gate.style.left = '50px';
        gate.style.top = '50px';
        
        // Auto-remove after drag or timeout
        setTimeout(() => {
            if (gate.parentNode) {
                gate.remove();
            }
        }, 5000);
    }

    placeGate(x, y) {
        const wires = document.querySelectorAll('.quantum-wire');
        const wireHeight = 60; // Height between wires
        const circuitCanvas = document.querySelector('.circuit-canvas');
        const rect = circuitCanvas.getBoundingClientRect();
        
        // Find which qubit wire this gate is placed on
        let targetQubit = -1;
        for (let i = 0; i < wires.length; i++) {
            const wire = wires[i];
            const wireRect = wire.getBoundingClientRect();
            const wireY = wireRect.top - rect.top + wireRect.height / 2;
            
            if (Math.abs(y - wireY) < wireHeight / 2) {
                targetQubit = i;
                break;
            }
        }
        
        if (targetQubit === -1) return;
        
        // Create the gate element
        const gate = document.createElement('div');
        gate.className = `gate ${this.draggedGate.toLowerCase()}`;
        gate.textContent = this.draggedGate;
        gate.dataset.gateType = this.draggedGate;
        gate.dataset.qubit = targetQubit;
        gate.style.position = 'absolute';
        gate.style.left = x + 'px';
        gate.style.top = (y - 30) + 'px';
        
        // Add double-click to remove
        gate.addEventListener('dblclick', () => {
            gate.remove();
            this.removeGateFromCircuit(gate);
        });
        
        circuitCanvas.appendChild(gate);
        
        // Add to circuit
        this.addGateToCircuit(this.draggedGate, targetQubit, gate);
        
        // Reset dragged gate
        this.draggedGate = null;
    }

    addGateToCircuit(gateType, qubit, element) {
        const gateInfo = {
            type: gateType,
            qubit: qubit,
            element: element,
            position: this.circuit.length
        };
        
        this.circuit.push(gateInfo);
        this.gatePositions.set(element, gateInfo);
    }

    removeGateFromCircuit(element) {
        const gateInfo = this.gatePositions.get(element);
        if (gateInfo) {
            const index = this.circuit.indexOf(gateInfo);
            if (index > -1) {
                this.circuit.splice(index, 1);
            }
            this.gatePositions.delete(element);
        }
    }

    runCircuit() {
        // Reset to initial state
        this.initializeQuantumState();
        
        // Apply each gate in sequence
        for (const gateInfo of this.circuit) {
            this.applyGate(gateInfo.type, gateInfo.qubit);
        }
        
        // Update visualization
        this.updateVisualization();
        
        // Show results
        this.showResults();
    }

    applyGate(gateType, qubit) {
        const gate = this.gates.get(gateType);
        if (!gate) return;
        
        if (gateType === 'CNOT') {
            // CNOT acts on 2 qubits
            this.quantumState = gate.multiply(this.quantumState);
        } else {
            // Single qubit gates
            if (qubit === 0) {
                // Apply to first qubit
                const newState = new ComplexArray(4);
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < 2; j++) {
                        const amplitude = gate.get(i, j).multiply(this.quantumState.get(j));
                        newState.set(i, newState.get(i).add(amplitude));
                        newState.set(i + 2, newState.get(i + 2).add(amplitude));
                    }
                }
                this.quantumState = newState;
            } else if (qubit === 1) {
                // Apply to second qubit
                const newState = new ComplexArray(4);
                for (let i = 0; i < 2; i++) {
                    for (let j = 0; j < 2; j++) {
                        const amplitude = gate.get(i, j).multiply(this.quantumState.get(i * 2 + j));
                        newState.set(i * 2, newState.get(i * 2).add(amplitude));
                        newState.set(i * 2 + 1, newState.get(i * 2 + 1).add(amplitude));
                    }
                }
                this.quantumState = newState;
            }
        }
    }

    clearCircuit() {
        // Remove all gate elements
        document.querySelectorAll('.gate').forEach(gate => gate.remove());
        
        // Clear circuit data
        this.circuit = [];
        this.gatePositions.clear();
        
        // Reset quantum state
        this.initializeQuantumState();
        
        // Update visualization
        this.updateVisualization();
    }

    updateVisualization() {
        this.updateStateDisplay();
        this.updateBlochSphere();
    }

    updateStateDisplay() {
        const stateDisplay = document.getElementById('stateDisplay');
        const states = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
        
        stateDisplay.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            const amplitude = this.quantumState.get(i);
            const probability = amplitude.magnitudeSquared();
            
            const amplitudeDiv = document.createElement('div');
            amplitudeDiv.className = 'state-amplitude';
            
            const stateLabel = document.createElement('span');
            stateLabel.textContent = states[i];
            
            const probabilityBar = document.createElement('div');
            probabilityBar.className = 'probability-bar';
            
            const probabilityFill = document.createElement('div');
            probabilityFill.className = 'probability-fill';
            probabilityFill.style.width = (probability * 100) + '%';
            
            const probabilityText = document.createElement('span');
            probabilityText.textContent = probability.toFixed(3);
            
            probabilityBar.appendChild(probabilityFill);
            amplitudeDiv.appendChild(stateLabel);
            amplitudeDiv.appendChild(probabilityBar);
            amplitudeDiv.appendChild(probabilityText);
            
            stateDisplay.appendChild(amplitudeDiv);
        }
    }

    updateBlochSphere() {
        // For simplicity, show first qubit on Bloch sphere
        const alpha = this.quantumState.get(0);
        const beta = this.quantumState.get(1);
        
        // Calculate Bloch sphere coordinates
        const theta = 2 * Math.acos(alpha.magnitude());
        const phi = Math.atan2(beta.imaginary, beta.real) - Math.atan2(alpha.imaginary, alpha.real);
        
        const x = Math.sin(theta) * Math.cos(phi);
        const y = Math.sin(theta) * Math.sin(phi);
        const z = Math.cos(theta);
        
        // Update Bloch sphere visualization
        const blochVector = document.getElementById('blochVector');
        const sphereRadius = 80;
        
        const vectorX = x * sphereRadius;
        const vectorY = -y * sphereRadius; // Negative because canvas Y is inverted
        const vectorZ = z * sphereRadius;
        
        // Project 3D to 2D (simple orthographic projection)
        blochVector.style.left = (100 + vectorX * 0.7 + vectorZ * 0.3) + 'px';
        blochVector.style.top = (100 - vectorY * 0.7 + vectorZ * 0.3) + 'px';
    }

    showResults() {
        // Calculate measurement probabilities
        const probabilities = [];
        for (let i = 0; i < 4; i++) {
            probabilities.push(this.quantumState.get(i).magnitudeSquared());
        }
        
        // Find most likely outcome
        const maxProb = Math.max(...probabilities);
        const mostLikely = probabilities.indexOf(maxProb);
        const states = ['|00⟩', '|01⟩', '|10⟩', '|11⟩'];
        
        // Show notification
        this.showNotification(`Most likely measurement: ${states[mostLikely]} (${(maxProb * 100).toFixed(1)}%)`, 'success');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00d4ff, #0099cc);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 212, 255, 0.4);
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}

// Complex number class
class Complex {
    constructor(real, imaginary) {
        this.real = real;
        this.imaginary = imaginary;
    }
    
    magnitude() {
        return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
    }
    
    magnitudeSquared() {
        return this.real * this.real + this.imaginary * this.imaginary;
    }
    
    add(other) {
        return new Complex(this.real + other.real, this.imaginary + other.imaginary);
    }
    
    multiply(other) {
        if (other instanceof Complex) {
            const real = this.real * other.real - this.imaginary * other.imaginary;
            const imaginary = this.real * other.imaginary + this.imaginary * other.real;
            return new Complex(real, imaginary);
        } else {
            return new Complex(this.real * other, this.imaginary * other);
        }
    }
}

// Complex array class
class ComplexArray {
    constructor(size) {
        this.data = new Array(size);
        for (let i = 0; i < size; i++) {
            this.data[i] = new Complex(0, 0);
        }
    }
    
    get(index) {
        return this.data[index];
    }
    
    set(index, value) {
        this.data[index] = value;
    }
}

// Complex matrix class
class ComplexMatrix {
    constructor(data) {
        this.data = data;
        this.rows = data.length;
        this.cols = data[0].length;
    }
    
    get(row, col) {
        return this.data[row][col];
    }
    
    multiply(vector) {
        const result = new ComplexArray(this.rows);
        
        for (let i = 0; i < this.rows; i++) {
            let sum = new Complex(0, 0);
            for (let j = 0; j < this.cols; j++) {
                sum = sum.add(this.get(i, j).multiply(vector.get(j)));
            }
            result.set(i, sum);
        }
        
        return result;
    }
}

// Initialize the quantum simulator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuantumSimulator();
});
