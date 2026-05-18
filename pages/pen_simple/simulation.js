class PendulumSimulation {
    constructor() {
        // Constants
        this.g = 9.8; // Gravitational acceleration (m/s²)
        this.timeStep = 0.02; // Simulation time step in seconds
        
        // Configurable parameters (with their real values hidden from user)
        this.length = 1.0; // in meters (100 cm)
        this.realLength = 1.0; // Hidden real value
        this.mass = 0.1; // in kg (100 g)
        this.realMass = 0.1; // Hidden real value
        this.angle = 15 * (Math.PI / 180); // in radians (15 degrees)
        this.realAngle = 15 * (Math.PI / 180); // Hidden real value
        
        // Simulation state
        this.currentAngle = this.angle;
        this.angularVelocity = 0;
        this.time = 0;
        this.elapsedTime = 0;
        this.running = false;
        this.isSimplified = true; // Calculation mode: true for simplified, false for exact
        this.useRandomErrors = true; // Whether to apply random errors
        
        // DOM elements
        this.pendulumString = document.getElementById('string');
        this.pendulumBob = document.getElementById('bob');
        
        // Animation frame ID for cancellation
        this.animationId = null;
        
        this.updatePendulumDisplay();
    }
    
    // Setter methods with error simulation
    setLength(lengthCm) {
        this.realLength = lengthCm / 100; // Convert cm to m
        if (this.useRandomErrors) {
            // Add random error with gaussian distribution (±1%)
            const error = this.normalSample(0, 0.01 * this.realLength);
            this.length = this.realLength + error;
        } else {
            this.length = this.realLength;
        }
        this.updatePendulumDisplay();
    }
    
    setMass(massG) {
        this.realMass = massG / 1000; // Convert g to kg
        if (this.useRandomErrors) {
            // Add random error with gaussian distribution (±2%)
            const error = this.normalSample(0, 0.02 * this.realMass);
            this.mass = this.realMass + error;
        } else {
            this.mass = this.realMass;
        }
        this.updatePendulumDisplay();
    }
    
    setAngle(angleDeg) {
        this.realAngle = angleDeg * (Math.PI / 180); // Convert degrees to radians
        if (this.useRandomErrors) {
            // Add random error with gaussian distribution (±5%)
            const error = this.normalSample(0, 0.05 * this.realAngle);
            this.angle = this.realAngle + error;
        } else {
            this.angle = this.realAngle;
        }
        this.currentAngle = this.angle;
        this.updatePendulumDisplay();
    }
    
    setCalculationMode(isSimplified) {
        this.isSimplified = isSimplified;
    }
    
    setRandomErrors(useRandomErrors) {
        this.useRandomErrors = useRandomErrors;
        // Recalculate parameters with/without errors
        this.setLength(this.realLength * 100);
        this.setMass(this.realMass * 1000);
        this.setAngle(this.realAngle * (180 / Math.PI));
    }
    
    // Calculation of pendulum period
    calculatePeriod() {
        if (this.isSimplified) {
            // Simplified formula: T = 2π√(L/g)
            return 2 * Math.PI * Math.sqrt(this.length / this.g);
        } else {

            const k = Math.sin(this.angle/2);
            const T0= 2 * Math.PI * Math.sqrt(this.length / this.g);
            let T = T0 * (1 + (Math.pow(k, 2)/4) + ((9/64)*Math.pow(k, 4)) + ((225/2304)*Math.pow(k,6)) + ((1225/16384)*Math.pow(k,8)));
            return  T;
        }
    }
    // Start pendulum oscillation and timer
    startSimulation() {
        if (this.running) return;
        
        this.running = true;
        this.currentAngle = this.angle;
        this.angularVelocity = 0;
        this.time = 0;
        this.elapsedTime = 0;
        
        this.animate();
    }
    
    // Stop simulation and recording
    stopSimulation() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        return this.elapsedTime;
    }
    
    // Reset simulation
    resetSimulation() {
        this.stopSimulation();
        this.currentAngle = this.angle;
        this.angularVelocity = 0;
        this.time = 0;
        this.elapsedTime = 0;
        this.updatePendulumDisplay();
    }
    
    // Animation loop
    animate() {
        if (!this.running) return;
        
        // Update time
        this.time += this.timeStep;
        this.elapsedTime += this.timeStep;
        
        // Calculate next angle
        if (this.isSimplified) {
            // Simplified differential equation: d²θ/dt² = -(g/L)θ
            const angularAcceleration = -(this.g / this.length) * Math.sin(this.currentAngle);
            this.angularVelocity += angularAcceleration * this.timeStep;
            this.currentAngle += this.angularVelocity * this.timeStep;
        } else {
            // Exact differential equation: d²θ/dt² = -(g/L)sin(θ)
            const angularAcceleration = -(this.g / this.length) * Math.sin(this.currentAngle);
            this.angularVelocity += angularAcceleration * this.timeStep;
            this.currentAngle += this.angularVelocity * this.timeStep;
        }
        
        // Update pendulum display
        this.updatePendulumDisplay();
        
        // Continue animation loop
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    // Update the visual representation of the pendulum
    updatePendulumDisplay() {
        // Scale length for visual representation (pixels)
        const scaledLength = Math.min(300, this.length * 200); // Scale meter to pixels with limit
        
        // Scale mass for visual representation (bob size)
        const scaledMass = 20 + (this.mass * 200); // Base size + scaled mass
        
        // Update string length
        this.pendulumString.style.height = `${scaledLength}px`;
        
        // Update bob size and position
        this.pendulumBob.style.width = `${scaledMass}px`;
        this.pendulumBob.style.height = `${scaledMass}px`;
        
        // Calculate rotation for string
        const stringRotation = -this.currentAngle * (180 / Math.PI); // Negative angle for vertical mirror effect
        
        // Apply rotation to string based on current angle
        this.pendulumString.style.transform = `translateX(-50%) rotate(${stringRotation}deg)`;
        
        // Calculate bob position based on string length and angle
        const bobX = Math.sin(this.currentAngle) * scaledLength;
        const bobY = Math.cos(this.currentAngle) * scaledLength; // Ecuacion de esfera
        
        // Position bob at end of string (calculate exact position from pivot point)
        const pivotTop = 15; // Pivot point Y position
        this.pendulumBob.style.left = `calc(50% + ${bobX}px)`;
        this.pendulumBob.style.top = `${pivotTop + bobY}px`;
        
        // Ensure visibility on mobile - force display properties
        this.pendulumString.style.display = 'block';
        this.pendulumBob.style.display = 'block';
        this.pendulumString.style.visibility = 'visible';
        this.pendulumBob.style.visibility = 'visible';
    }
    
    // Get real values for admin panel
    getRealValues() {
        return {
            length: this.realLength * 100, // Convert back to cm
            mass: this.realMass * 1000, // Convert back to g
            angle: this.realAngle * (180 / Math.PI), // Convert back to degrees
            appliedLength: this.length * 100,
            appliedMass: this.mass * 1000,
            appliedAngle: this.angle * (180 / Math.PI)
        };
    }

    // Add this method to replace jstat functionality
    normalSample(mean, std) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return mean + z0 * std;
    }
}

export default PendulumSimulation;