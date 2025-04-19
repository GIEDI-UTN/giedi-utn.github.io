document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const GRAVITY = 9.8; // m/s²
    const ANIMATION_DISTANCE = 150; // pixels for animation
    const MAX_TIME = 5; // maximum simulation time in seconds
    const PASSWORD = "GIEDI610";
    const PULLEY_ROTATION_MULTIPLIER = 360; // degrees of rotation per unit of distance
    const ANIMATION_FPS = 60; // frames per second for smooth animation
    const ANIMATION_FRAME_DURATION = 1000 / ANIMATION_FPS; // ms per frame

    // DOM Elements
    const pulleyTypeInputs = document.querySelectorAll('input[name="pulley-type"]');
    const pulleyParamsDiv = document.getElementById('pulley-params');
    const pulleyMassSelect = document.getElementById('pulley-mass');
    const pulleyRadiusSelect = document.getElementById('pulley-radius');
    const mass1Select = document.getElementById('mass1-value');
    const mass2Select = document.getElementById('mass2-value');
    const fallDistanceRange = document.getElementById('fall-distance');
    const distanceValueDisplay = document.getElementById('distance-value-display');
    const randomErrorsCheckbox = document.getElementById('random-errors');
    const runBtn = document.getElementById('run-btn');
    const resetBtn = document.getElementById('reset-btn');
    const adminBtn = document.getElementById('admin-btn');
    const statsBtn = document.getElementById('stats-btn');
    const exportBtn = document.getElementById('export-btn');
    const resultsTableBody = document.querySelector('#results-table tbody');
    const statsContainer = document.getElementById('stats-container');
    const meanValue = document.getElementById('mean-value');
    const medianValue = document.getElementById('median-value');
    const stdevValue = document.getElementById('stdev-value');
    const adminModal = document.getElementById('admin-modal');
    const closeModalBtn = document.querySelector('.close');
    const passwordInput = document.getElementById('admin-password');
    const submitPasswordBtn = document.getElementById('submit-password');
    const passwordError = document.getElementById('password-error');
    const adminData = document.getElementById('admin-data');
    const truePulleyMass = document.getElementById('true-pulley-mass');
    const truePulleyRadius = document.getElementById('true-pulley-radius');
    const trueMass1 = document.getElementById('true-mass1');
    const trueMass2 = document.getElementById('true-mass2');
    const trueFallDistance = document.getElementById('true-fall-distance');
    const langToggle = document.getElementById('langToggle');

    // Additional DOM Elements
    const chartTypeSelect = document.getElementById('chart-type');
    const exportChartBtn = document.getElementById('export-chart-btn');

    // SVG elements
    const pulleySvg = document.getElementById('pulley');
    const mass1Svg = document.getElementById('mass1');
    const mass2Svg = document.getElementById('mass2');
    const ropePath = document.getElementById('rope');

    // Variables
    let currentLanguage = 'es';
    let runCount = 0;
    let timeData = [];
    let isRunning = false;
    let chart = null;
    let animationFrameId = null;
    let animationStartTime = 0;
    let currentSimulationTime = 0;
    let currentAcceleration = 0;
    let currentVelocity = 0;
    let isSlowMotion = false;
    let showTrajectory = false;
    let simulationPaused = false;
    let trajectoryPoints = [];

    // True values (with errors)
    const trueValues = {
        pulleyMass: 0,
        pulleyRadius: 0,
        mass1: 0,
        mass2: 0,
        fallDistance: 0
    };

    // Setup initial positions
    const initialPositions = {
        mass1: { x: 200 - 25 - 15, y: 250 },
        mass2: { x: 200 + 25 - 15, y: 250 }
    };

    // Initialize the setup
    initializeSetup();
    setupEventListeners();
    setupLanguage();

    // Initialize chart
    initializeChart();

    function initializeSetup() {
        // Create enhanced pulley
        createEnhancedPulley();

        // Set initial positions
        setMassPositions(initialPositions.mass1.x, initialPositions.mass1.y, initialPositions.mass2.x, initialPositions.mass2.y);

        // Generate true values with errors
        generateTrueValues();
    }

    function createEnhancedPulley() {
        // Remove old pulley
        const oldPulley = document.getElementById('pulley');
        if (oldPulley) oldPulley.remove();

        // Create pulley group
        const pulleyGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        pulleyGroup.setAttribute('id', 'pulley');
        pulleyGroup.setAttribute('transform-origin', '200 100');

        // Outer rim
        const rim = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        rim.setAttribute('cx', '200');
        rim.setAttribute('cy', '100');
        rim.setAttribute('r', '25');
        rim.setAttribute('class', 'pulley-rim');

        // Groove
        const groove = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        groove.setAttribute('cx', '200');
        groove.setAttribute('cy', '100');
        groove.setAttribute('r', '23');
        groove.setAttribute('class', 'pulley-groove');

        // Center
        const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        center.setAttribute('cx', '200');
        center.setAttribute('cy', '100');
        center.setAttribute('r', '5');
        center.setAttribute('class', 'pulley-center');

        // Spokes
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const spoke = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            spoke.setAttribute('x1', 200 + 5 * Math.cos(angle));
            spoke.setAttribute('y1', 100 + 5 * Math.sin(angle));
            spoke.setAttribute('x2', 200 + 20 * Math.cos(angle));
            spoke.setAttribute('y2', 100 + 20 * Math.sin(angle));
            spoke.setAttribute('stroke', '#444');
            spoke.setAttribute('stroke-width', '2');
            pulleyGroup.appendChild(spoke);
        }

        // Add decorative elements for more realistic appearance
        const outerRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outerRing.setAttribute('cx', '200');
        outerRing.setAttribute('cy', '100');
        outerRing.setAttribute('r', '27');
        outerRing.setAttribute('fill', 'none');
        outerRing.setAttribute('stroke', '#333');
        outerRing.setAttribute('stroke-width', '1');

        // Axle/shaft
        const axle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        axle.setAttribute('cx', '200');
        axle.setAttribute('cy', '100');
        axle.setAttribute('r', '3');
        axle.setAttribute('fill', '#222');
        axle.setAttribute('stroke', '#111');
        axle.setAttribute('stroke-width', '0.5');

        pulleyGroup.appendChild(outerRing);
        pulleyGroup.appendChild(groove);
        pulleyGroup.appendChild(rim);
        pulleyGroup.appendChild(center);
        pulleyGroup.appendChild(axle);

        // Add support structure
        const supportRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        supportRect.setAttribute('x', '195');
        supportRect.setAttribute('y', '70');
        supportRect.setAttribute('width', '10');
        supportRect.setAttribute('height', '30');
        supportRect.setAttribute('fill', '#8B4513');

        // Add to SVG
        const svg = document.getElementById('atwood-svg');
        svg.appendChild(supportRect);
        svg.appendChild(pulleyGroup);

        // Enhance masses
        enhanceMasses();

        // Add virtual guides for rope path
        addRopeGuides();
    }

    function enhanceMasses() {
        // Remove old masses
        const oldMass1 = document.getElementById('mass1');
        const oldMass2 = document.getElementById('mass2');
        if (oldMass1) oldMass1.remove();
        if (oldMass2) oldMass2.remove();

        // Create mass groups
        const mass1Group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        mass1Group.setAttribute('id', 'mass1');

        const mass2Group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        mass2Group.setAttribute('id', 'mass2');

        // Shadow for mass 1
        const mass1Shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        mass1Shadow.setAttribute('cx', '15');
        mass1Shadow.setAttribute('cy', '33');
        mass1Shadow.setAttribute('rx', '13');
        mass1Shadow.setAttribute('ry', '3');
        mass1Shadow.setAttribute('fill', 'rgba(0,0,0,0.2)');

        // Mass 1 elements
        const mass1Rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        mass1Rect.setAttribute('x', '0');
        mass1Rect.setAttribute('y', '0');
        mass1Rect.setAttribute('width', '30');
        mass1Rect.setAttribute('height', '30');
        mass1Rect.setAttribute('rx', '3');
        mass1Rect.setAttribute('ry', '3');
        mass1Rect.setAttribute('fill', '#f44336');
        mass1Rect.setAttribute('stroke', '#d32f2f');
        mass1Rect.setAttribute('stroke-width', '1');

        // Highlight on mass 1 for 3D effect
        const mass1Highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        mass1Highlight.setAttribute('x', '3');
        mass1Highlight.setAttribute('y', '3');
        mass1Highlight.setAttribute('width', '24');
        mass1Highlight.setAttribute('height', '5');
        mass1Highlight.setAttribute('rx', '2');
        mass1Highlight.setAttribute('ry', '2');
        mass1Highlight.setAttribute('fill', 'rgba(255,255,255,0.3)');

        const mass1Label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mass1Label.setAttribute('x', '15');
        mass1Label.setAttribute('y', '18');
        mass1Label.setAttribute('class', 'mass-label');
        mass1Label.textContent = 'M1';

        // Shadow for mass 2
        const mass2Shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        mass2Shadow.setAttribute('cx', '15');
        mass2Shadow.setAttribute('cy', '33');
        mass2Shadow.setAttribute('rx', '13');
        mass2Shadow.setAttribute('ry', '3');
        mass2Shadow.setAttribute('fill', 'rgba(0,0,0,0.2)');

        // Mass 2 elements
        const mass2Rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        mass2Rect.setAttribute('x', '0');
        mass2Rect.setAttribute('y', '0');
        mass2Rect.setAttribute('width', '30');
        mass2Rect.setAttribute('height', '30');
        mass2Rect.setAttribute('rx', '3');
        mass2Rect.setAttribute('ry', '3');
        mass2Rect.setAttribute('fill', '#2196F3');
        mass2Rect.setAttribute('stroke', '#1976D2');
        mass2Rect.setAttribute('stroke-width', '1');

        // Highlight on mass 2 for 3D effect
        const mass2Highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        mass2Highlight.setAttribute('x', '3');
        mass2Highlight.setAttribute('y', '3');
        mass2Highlight.setAttribute('width', '24');
        mass2Highlight.setAttribute('height', '5');
        mass2Highlight.setAttribute('rx', '2');
        mass2Highlight.setAttribute('ry', '2');
        mass2Highlight.setAttribute('fill', 'rgba(255,255,255,0.3)');

        const mass2Label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mass2Label.setAttribute('x', '15');
        mass2Label.setAttribute('y', '18');
        mass2Label.setAttribute('class', 'mass-label');
        mass2Label.textContent = 'M2';

        // Add elements to groups
        mass1Group.appendChild(mass1Shadow);
        mass1Group.appendChild(mass1Rect);
        mass1Group.appendChild(mass1Highlight);
        mass1Group.appendChild(mass1Label);

        mass2Group.appendChild(mass2Shadow);
        mass2Group.appendChild(mass2Rect);
        mass2Group.appendChild(mass2Highlight);
        mass2Group.appendChild(mass2Label);

        // Position the groups - adjust to be tangential to pulley
        // Mass positions will be exactly one pulley diameter apart (measuring from centers)
        const pulleyRadius = 25; // Matches the outer pulley radius
        mass1Group.setAttribute('transform', `translate(${200 - pulleyRadius - 15}, ${initialPositions.mass1.y})`);
        mass2Group.setAttribute('transform', `translate(${200 + pulleyRadius - 15}, ${initialPositions.mass2.y})`);

        // Update initial positions to match new positions
        initialPositions.mass1.x = 200 - pulleyRadius - 15;
        initialPositions.mass2.x = 200 + pulleyRadius - 15;

        // Add to SVG
        const svg = document.getElementById('atwood-svg');
        svg.appendChild(mass1Group);
        svg.appendChild(mass2Group);

        // Add hook connectors to masses
        addHookConnectors();
    }

    function addRopeGuides() {
        // Create virtual guides for rope to bend around pulley
        const svg = document.getElementById('atwood-svg');

        // Guide points around pulley (hidden)
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI + (Math.PI * i) / 9);
            const guidePoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            guidePoint.setAttribute('cx', 200 + 23 * Math.cos(angle));
            guidePoint.setAttribute('cy', 100 + 23 * Math.sin(angle));
            guidePoint.setAttribute('r', '1');
            guidePoint.setAttribute('fill', 'transparent');
            guidePoint.setAttribute('id', `guide-${i}`);
            svg.appendChild(guidePoint);
        }
    }

    function addHookConnectors() {
        // Add hook connectors to masses
        const svg = document.getElementById('atwood-svg');

        // Hook for mass 1
        const hook1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hook1.setAttribute('d', 'M15,0 Q15,-10 15,-10');
        hook1.setAttribute('stroke', '#999');
        hook1.setAttribute('stroke-width', '2');
        hook1.setAttribute('fill', 'none');
        hook1.setAttribute('id', 'hook1');

        // Hook for mass 2
        const hook2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hook2.setAttribute('d', 'M15,0 Q15,-10 15,-10');
        hook2.setAttribute('stroke', '#999');
        hook2.setAttribute('stroke-width', '2');
        hook2.setAttribute('fill', 'none');
        hook2.setAttribute('id', 'hook2');

        // Append hooks to masses
        const mass1 = document.getElementById('mass1');
        const mass2 = document.getElementById('mass2');

        mass1.appendChild(hook1);
        mass2.appendChild(hook2);
    }

    function setupEventListeners() {
        // Pulley type selection
        pulleyTypeInputs.forEach(input => {
            input.addEventListener('change', () => {
                pulleyParamsDiv.style.display = input.value === 'massive' ? 'block' : 'none';
                generateTrueValues();
            });
        });

        // Parameter changes
        [pulleyMassSelect, pulleyRadiusSelect, mass1Select, mass2Select, fallDistanceRange].forEach(select => {
            select.addEventListener('change', generateTrueValues);
        });

        // Update distance display
        fallDistanceRange.addEventListener('input', function() {
            distanceValueDisplay.textContent = fallDistanceRange.value + ' cm';
            generateTrueValues();
        });

        // Button actions
        runBtn.addEventListener('click', runExperiment);
        resetBtn.addEventListener('click', resetExperiment);
        adminBtn.addEventListener('click', openAdminModal);
        statsBtn.addEventListener('click', calculateStatistics);
        exportBtn.addEventListener('click', exportData);
        closeModalBtn.addEventListener('click', closeAdminModal);
        submitPasswordBtn.addEventListener('click', verifyPassword);
        langToggle.addEventListener('click', toggleLanguage);

        // Animation control buttons
        document.getElementById('pause-btn').addEventListener('click', togglePauseSimulation);
        document.getElementById('slow-motion-btn').addEventListener('click', toggleSlowMotion);
        document.getElementById('show-trajectory-btn').addEventListener('click', toggleTrajectory);

        // Modal click outside
        window.addEventListener('click', (event) => {
            if (event.target === adminModal) {
                closeAdminModal();
            }
        });
    }

    function generateTrueValues() {
        // Add random error of 1% to pulley parameters
        const pulleyMass = parseFloat(pulleyMassSelect.value);
        const pulleyRadius = parseFloat(pulleyRadiusSelect.value);

        // Mass values
        const mass1 = parseFloat(mass1Select.value);
        const mass2 = parseFloat(mass2Select.value);

        // Fall distance in meters (convert from cm)
        const fallDistance = parseFloat(fallDistanceRange.value) / 100;

        // Generate true values with errors
        trueValues.pulleyMass = addError(pulleyMass, 0.01);
        trueValues.pulleyRadius = addError(pulleyRadius, 0.01);
        trueValues.mass1 = addError(mass1, getToleranceForMass(mass1));
        trueValues.mass2 = addError(mass2, getToleranceForMass(mass2));
        trueValues.fallDistance = addGaussianError(fallDistance, 0.02); // 2% error

        // Update admin panel
        updateAdminPanel();
    }

    function addError(value, errorPercentage) {
        const error = value * errorPercentage;
        // Random error between -error and +error
        return value + (Math.random() * 2 - 1) * error;
    }

    function addGaussianError(value, errorPercentage) {
        // Box-Muller transform for Gaussian distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        // Scale the random value by the error percentage and value
        const error = value * errorPercentage * z0 * 0.5; // 0.5 to make it similar to addError range
        return value + error;
    }

    function getToleranceForMass(mass) {
        // Standard tolerances for masses (simplified)
        if (mass < 0.2) return 0.005; // 0.5%
        if (mass < 1.0) return 0.003; // 0.3%
        return 0.002; // 0.2%
    }

    function updateAdminPanel() {
        truePulleyMass.textContent = trueValues.pulleyMass.toFixed(6) + ' kg';
        truePulleyRadius.textContent = trueValues.pulleyRadius.toFixed(6) + ' m';
        trueMass1.textContent = trueValues.mass1.toFixed(6) + ' kg';
        trueMass2.textContent = trueValues.mass2.toFixed(6) + ' kg';
        trueFallDistance.textContent = trueValues.fallDistance.toFixed(6) + ' m';
    }

    function runExperiment() {
        if (isRunning) return;
        isRunning = true;
        simulationPaused = false;
        runBtn.disabled = true;
        document.getElementById('pause-btn').disabled = false;

        // Reset positions and animation state
        setMassPositions(initialPositions.mass1.x, initialPositions.mass1.y, initialPositions.mass2.x, initialPositions.mass2.y);
        trajectoryPoints = [];

        // Calculate theoretical acceleration
        const isPulleyMassive = document.getElementById('massive-pulley').checked;

        // Determine which mass goes down
        const m1 = trueValues.mass1;
        const m2 = trueValues.mass2;
        let acceleration;

        if (isPulleyMassive) {
            // Calculate with pulley inertia
            const mp = trueValues.pulleyMass;
            const r = trueValues.pulleyRadius;
            const I = mp * r * r / 2; // Moment of inertia for disk

            acceleration = Math.abs(m1 - m2) * GRAVITY / (m1 + m2 + I / (r * r));
        } else {
            // Simple calculation without pulley mass
            acceleration = Math.abs(m1 - m2) * GRAVITY / (m1 + m2);
        }

        // If masses are equal (within a small tolerance), set a very small acceleration
        if (Math.abs(m1 - m2) < 0.001) {
            acceleration = 0.01; // Just to show a very slight movement
        }

        // Determine which mass goes down
        const m1Down = trueValues.mass1 > trueValues.mass2;

        // Calculate theoretical time using the true fall distance
        const distance = trueValues.fallDistance; // Use true distance with error
        let time = Math.sqrt(2 * distance / acceleration);

        // Add random error if enabled
        if (randomErrorsCheckbox.checked) {
            time = addGaussianError(time, 0.05); // 5% error
        }

        // Cap time to prevent very long animations
        time = Math.min(time, MAX_TIME);

        // Store calculated values for animation
        currentAcceleration = acceleration;
        currentVelocity = 0;
        currentSimulationTime = 0;
        animationStartTime = Date.now();

        // Play pulley sound
        const pulleySound = new Audio('data:audio/wav;base64,UklGRl9CAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTtCAACBgIF/gn6Df4B+gn6Df4F+gX2CfIJ8g3qEeYZ3iHWJc4pwi26Na4xoimmJZohjiGCJXopcilmLV4xTjVCOS49IkEWRQpI/kzyUOJU1ljGXLpgqmSaJJZclliWVJZQlkiWRJY8ljiWMJA==');
        pulleySound.volume = 0.3;
        pulleySound.loop = true;
        pulleySound.play();

        // Start physics-based animation
        startPhysicsAnimation(m1Down, acceleration, time, pulleySound);

        // Store results
        runCount++;
        timeData.push(time);

        // Add to table
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${runCount}</td>
            <td>${mass1Select.value}</td>
            <td>${mass2Select.value}</td>
            <td>${fallDistanceRange.value}</td>
            <td>${time.toFixed(3)}</td>
            <td>${acceleration.toFixed(3)}</td>
        `;
        resultsTableBody.appendChild(row);

        // Update chart
        updateChart();

        // Show real-time data display
        document.getElementById('realtime-data').style.display = 'block';
    }

    function startPhysicsAnimation(mass1Down, acceleration, totalTime, pulleySound) {
        let lastFrameTime = Date.now();
        const direction = mass1Down ? 1 : -1;
        const maxDistance = ANIMATION_DISTANCE;
        const timeScaleFactor = 1.0; // For slow motion: 0.5 would be half speed

        // Create physics-based animation function
        function animatePhysics() {
            if (simulationPaused) {
                animationFrameId = requestAnimationFrame(animatePhysics);
                return;
            }

            const currentTime = Date.now();
            let deltaTime = (currentTime - lastFrameTime) / 1000; // in seconds

            // Apply slow motion if enabled
            if (isSlowMotion) {
                deltaTime *= 0.3; // 30% normal speed
            }

            lastFrameTime = currentTime;

            // Update simulation time
            currentSimulationTime += deltaTime;

            // Calculate current velocity (v = a*t)
            currentVelocity = acceleration * currentSimulationTime;

            // Calculate distance using physics equation: d = 0.5*a*t^2
            let distance = 0.5 * acceleration * Math.pow(currentSimulationTime, 2);

            // Scale distance to fit animation area
            const pixelDistance = Math.min(distance * (maxDistance / (0.5 * acceleration * Math.pow(totalTime, 2))), maxDistance);

            // Apply direction
            const adjustedDistance = direction * pixelDistance;

            // Update real-time display
            updateRealTimeDisplay(currentSimulationTime, currentVelocity, distance);

            // Record trajectory point if enabled
            if (showTrajectory && currentSimulationTime > 0.1) {
                if (trajectoryPoints.length === 0 ||
                    currentTime - trajectoryPoints[trajectoryPoints.length - 1].time > 100) { // Record every 100ms

                    const mass1 = document.getElementById('mass1');
                    const mass2 = document.getElementById('mass2');

                    if (mass1 && mass2) {
                        const m1Transform = mass1.getAttribute('transform');
                        const m2Transform = mass2.getAttribute('transform');

                        const m1y = parseFloat(m1Transform.split(',')[1].split(')')[0]);
                        const m2y = parseFloat(m2Transform.split(',')[1].split(')')[0]);

                        trajectoryPoints.push({
                            time: currentTime,
                            m1y: m1y,
                            m2y: m2y
                        });

                        // Draw trajectory points
                        drawTrajectoryPoints();
                    }
                }
            }

            // Move masses
            setMassPositions(
                initialPositions.mass1.x,
                initialPositions.mass1.y + adjustedDistance,
                initialPositions.mass2.x,
                initialPositions.mass2.y - adjustedDistance
            );

            // Rotate pulley based on distance moved
            const pulley = document.getElementById('pulley');
            const rotationAngle = adjustedDistance * (PULLEY_ROTATION_MULTIPLIER / maxDistance) * -1; // Negative to rotate correctly
            pulley.style.transform = `rotate(${rotationAngle}deg)`;

            // Add a slight oscillation/wobble effect to the pulley at the beginning/end
            if (currentSimulationTime < 0.3 || currentSimulationTime > totalTime - 0.3) {
                const wobbleAmount = 1.5 * Math.sin(currentSimulationTime * 30);
                pulley.style.transform = `rotate(${rotationAngle + wobbleAmount}deg)`;
            }

            // Continue animation until time is up
            if (currentSimulationTime < totalTime) {
                animationFrameId = requestAnimationFrame(animatePhysics);
            } else {
                // End animation with a slight oscillation
                finishAnimation(pulleySound, direction, adjustedDistance);
            }
        }

        // Start animation
        animationFrameId = requestAnimationFrame(animatePhysics);
    }

    function finishAnimation(pulleySound, direction, finalDistance) {
        let oscillationTime = 0;
        const oscillationDuration = 1.5; // seconds
        const startTime = Date.now();
        const finalRotationAngle = finalDistance * (PULLEY_ROTATION_MULTIPLIER / ANIMATION_DISTANCE) * -1;

        // Oscillation animation function
        function animateOscillation() {
            const currentTime = Date.now();
            oscillationTime = (currentTime - startTime) / 1000;

            // Damped oscillation formula
            const dampingFactor = Math.exp(-3 * oscillationTime);
            const oscillation = dampingFactor * 5 * Math.sin(10 * oscillationTime);

            // Apply oscillation to masses
            setMassPositions(
                initialPositions.mass1.x,
                initialPositions.mass1.y + finalDistance + (direction * oscillation),
                initialPositions.mass2.x,
                initialPositions.mass2.y - finalDistance - (direction * oscillation)
            );

            // Apply oscillation to pulley
            const pulley = document.getElementById('pulley');
            pulley.style.transform = `rotate(${finalRotationAngle + oscillation}deg)`;

            // Fade out sound
            pulleySound.volume = Math.max(0, 0.3 - (oscillationTime / oscillationDuration) * 0.3);

            if (oscillationTime < oscillationDuration) {
                animationFrameId = requestAnimationFrame(animateOscillation);
            } else {
                // Stop sound completely
                pulleySound.pause();
                pulleySound.currentTime = 0;

                // Reset animation state
                isRunning = false;
                runBtn.disabled = false;
                document.getElementById('pause-btn').disabled = true;

                // Hide real-time display after delay
                setTimeout(() => {
                    document.getElementById('realtime-data').style.display = 'none';
                }, 2000);
            }
        }

        // Start oscillation animation
        animationFrameId = requestAnimationFrame(animateOscillation);
    }

    function updateRealTimeDisplay(time, velocity, distance) {
        document.getElementById('time-value').textContent = time.toFixed(2) + ' s';
        document.getElementById('velocity-value').textContent = velocity.toFixed(2) + ' m/s';
        document.getElementById('distance-value').textContent = distance.toFixed(2) + ' m';

        // Update progress bar
        const progressBar = document.getElementById('simulation-progress');
        const progress = Math.min(time / MAX_TIME, 1) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function drawTrajectoryPoints() {
        // Remove old trajectory lines
        const oldTrajectories = document.querySelectorAll('.trajectory-line');
        oldTrajectories.forEach(el => el.remove());

        if (trajectoryPoints.length < 2) return;

        // Create path for mass 1 trajectory
        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d1 = `M${initialPositions.mass1.x + 15},${trajectoryPoints[0].m1y + 15}`;

        // Create path for mass 2 trajectory
        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d2 = `M${initialPositions.mass2.x + 15},${trajectoryPoints[0].m2y + 15}`;

        // Add points to paths
        for (let i = 1; i < trajectoryPoints.length; i++) {
            d1 += ` L${initialPositions.mass1.x + 15},${trajectoryPoints[i].m1y + 15}`;
            d2 += ` L${initialPositions.mass2.x + 15},${trajectoryPoints[i].m2y + 15}`;
        }

        // Set path attributes
        path1.setAttribute('d', d1);
        path1.setAttribute('stroke', 'rgba(244, 67, 54, 0.5)');
        path1.setAttribute('stroke-width', '2');
        path1.setAttribute('fill', 'none');
        path1.setAttribute('stroke-dasharray', '3,2');
        path1.setAttribute('class', 'trajectory-line');

        path2.setAttribute('d', d2);
        path2.setAttribute('stroke', 'rgba(33, 150, 243, 0.5)');
        path2.setAttribute('stroke-width', '2');
        path2.setAttribute('fill', 'none');
        path2.setAttribute('stroke-dasharray', '3,2');
        path2.setAttribute('class', 'trajectory-line');

        // Add to SVG
        const svg = document.getElementById('atwood-svg');
        svg.appendChild(path1);
        svg.appendChild(path2);
    }

    function togglePauseSimulation() {
        if (!isRunning) return;

        simulationPaused = !simulationPaused;
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.textContent = simulationPaused ?
            (currentLanguage === 'es' ? 'Continuar' : 'Resume') :
            (currentLanguage === 'es' ? 'Pausar' : 'Pause');
    }

    function toggleSlowMotion() {
        isSlowMotion = !isSlowMotion;
        const slowMotionBtn = document.getElementById('slow-motion-btn');
        slowMotionBtn.classList.toggle('active');
    }

    function toggleTrajectory() {
        showTrajectory = !showTrajectory;
        const trajectoryBtn = document.getElementById('show-trajectory-btn');
        trajectoryBtn.classList.toggle('active');

        // Clear trajectory points if disabled
        if (!showTrajectory) {
            const trajectories = document.querySelectorAll('.trajectory-line');
            trajectories.forEach(el => el.remove());
        }
    }

    function updateRope() {
        const pulleyX = 200;
        const pulleyY = 100;
        const pulleyRadius = 23; // Matches the groove radius

        const mass1 = document.getElementById('mass1');
        const mass2 = document.getElementById('mass2');

        if (!mass1 || !mass2) return;

        // Get transform matrix values
        const mass1Transform = mass1.getAttribute('transform');
        const mass2Transform = mass2.getAttribute('transform');

        const mass1X = parseFloat(mass1Transform.split('(')[1].split(',')[0]) + 15; // center of mass
        const mass1Y = parseFloat(mass1Transform.split(',')[1].split(')')[0]);
        const mass2X = parseFloat(mass2Transform.split('(')[1].split(',')[0]) + 15; // center of mass
        const mass2Y = parseFloat(mass2Transform.split(',')[1].split(')')[0]);

        // Create tangent points where rope leaves pulley
        const left_tangent_angle = Math.PI;
        const right_tangent_angle = 0;

        const leftTangentX = pulleyX + pulleyRadius * Math.cos(left_tangent_angle);
        const leftTangentY = pulleyY + pulleyRadius * Math.sin(left_tangent_angle);
        const rightTangentX = pulleyX + pulleyRadius * Math.cos(right_tangent_angle);
        const rightTangentY = pulleyY + pulleyRadius * Math.sin(right_tangent_angle);

        // Get guide points around pulley for the arc section
        const guidePoints = [];
        for (let i = 0; i < 10; i++) {
            const guideEl = document.getElementById(`guide-${i}`);
            if (guideEl) {
                guidePoints.push({
                    x: parseFloat(guideEl.getAttribute('cx')),
                    y: parseFloat(guideEl.getAttribute('cy'))
                });
            }
        }

        // Create rope path with straight vertical sections and arc around pulley
        const rope = document.getElementById('rope');

        // Start at mass1
        let pathD = `M${mass1X},${mass1Y - 10} `;

        // Straight line to left tangent point
        pathD += `L${leftTangentX},${leftTangentY} `;

        // Add curved section around pulley using guide points
        for (let i = 1; i < guidePoints.length; i++) {
            pathD += `L${guidePoints[i].x},${guidePoints[i].y} `;
        }

        // Straight line from right tangent to mass2
        pathD += `L${rightTangentX},${rightTangentY} `;
        pathD += `L${mass2X},${mass2Y - 10}`;

        rope.setAttribute('d', pathD);
        rope.setAttribute('stroke', '#333');
        rope.setAttribute('stroke-width', '2');
        rope.setAttribute('fill', 'none');
    }

    function resetExperiment() {
        // Cancel any ongoing animation
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }

        // Reset simulation state
        runCount = 0;
        timeData = [];
        isRunning = false;
        simulationPaused = false;
        trajectoryPoints = [];
        currentSimulationTime = 0;
        currentVelocity = 0;

        // Clear UI elements
        resultsTableBody.innerHTML = '';
        statsContainer.style.display = 'none';
        document.getElementById('realtime-data').style.display = 'none';
        document.getElementById('pause-btn').textContent = currentLanguage === 'es' ? 'Pausar' : 'Pause';
        document.getElementById('pause-btn').disabled = true;

        // Remove trajectory lines
        const trajectories = document.querySelectorAll('.trajectory-line');
        trajectories.forEach(el => el.remove());

        // Reset positions
        setMassPositions(initialPositions.mass1.x, initialPositions.mass1.y, initialPositions.mass2.x, initialPositions.mass2.y);

        // Reset pulley rotation
        const pulley = document.getElementById('pulley');
        if (pulley) pulley.style.transform = 'rotate(0deg)';

        // Reset chart
        if (chart) {
            chart.data.labels = [];
            chart.data.datasets[0].data = [];
            chart.update();
        }

        // Re-enable run button
        runBtn.disabled = false;
    }

    function calculateStatistics() {
        if (timeData.length === 0) return;

        // Sort data for median
        const sortedData = [...timeData].sort((a, b) => a - b);

        // Calculate mean
        const mean = timeData.reduce((acc, val) => acc + val, 0) / timeData.length;

        // Calculate median
        let median;
        if (sortedData.length % 2 === 0) {
            median = (sortedData[sortedData.length / 2 - 1] + sortedData[sortedData.length / 2]) / 2;
        } else {
            median = sortedData[Math.floor(sortedData.length / 2)];
        }

        // Calculate standard deviation
        const variance = timeData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / timeData.length;
        const stdev = Math.sqrt(variance);

        // Update UI
        meanValue.textContent = mean.toFixed(4) + ' s';
        medianValue.textContent = median.toFixed(4) + ' s';
        stdevValue.textContent = stdev.toFixed(4) + ' s';
        statsContainer.style.display = 'block';
    }

    function exportData() {
        if (resultsTableBody.rows.length === 0) return;

        // Create text content
        let content = "Simulador Didáctico de Máquina de Atwood\n";
        content += "Autor: Rodrigo Agosta | Grupo de Investigación: GIEDI | Institución: Facultad Regional Santa Fe\n\n";
        content += "RESULTADOS DEL EXPERIMENTO\n";
        content += "==========================\n\n";

        // Add parameters
        content += "Parámetros utilizados:\n";
        content += `Tipo de polea: ${document.getElementById('massless-pulley').checked ? 'Masa despreciable' : 'Con masa'}\n`;
        if (document.getElementById('massive-pulley').checked) {
            content += `Masa de polea: ${pulleyMassSelect.value} kg\n`;
            content += `Radio de polea: ${pulleyRadiusSelect.value} m\n`;
        }
        content += `Distancia de caída: ${fallDistanceRange.value} cm\n`;
        content += `Errores aleatorios: ${randomErrorsCheckbox.checked ? 'Activados' : 'Desactivados'}\n\n`;

        // Add table header
        content += "Corrida\tMasa 1 (kg)\tMasa 2 (kg)\tDistancia (cm)\tTiempo (s)\tAceleración (m/s²)\n";

        // Add table data
        for (let i = 0; i < resultsTableBody.rows.length; i++) {
            const row = resultsTableBody.rows[i];
            const rowData = Array.from(row.cells).map(cell => cell.textContent);
            content += rowData.join('\t') + '\n';
        }

        // Add statistics if available
        if (statsContainer.style.display !== 'none') {
            content += "\nESTADÍSTICAS DESCRIPTIVAS\n";
            content += "==========================\n";
            content += `Media: ${meanValue.textContent}\n`;
            content += `Mediana: ${medianValue.textContent}\n`;
            content += `Desviación Estándar: ${stdevValue.textContent}\n`;
        }

        // Create and download file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'atwood_results.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function openAdminModal() {
        adminModal.style.display = 'block';
        adminData.style.display = 'none';
        passwordInput.value = '';
        passwordError.textContent = '';
    }

    function closeAdminModal() {
        adminModal.style.display = 'none';
    }

    function verifyPassword() {
        if (passwordInput.value === PASSWORD) {
            adminData.style.display = 'block';
            passwordError.textContent = '';
        } else {
            adminData.style.display = 'none';
            passwordError.textContent = currentLanguage === 'es' ? 'Contraseña incorrecta.' : 'Incorrect password.';
        }
    }

    function initializeChart() {
        const ctx = document.getElementById('results-chart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Distribución de tiempos',
                    data: [],
                    backgroundColor: 'rgba(63, 81, 181, 0.6)',
                    borderColor: 'rgba(63, 81, 181, 1)',
                    borderWidth: 1,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Frecuencia',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            precision: 0
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Tiempo (s)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(tooltipItems) {
                                return 'Tiempo: ' + tooltipItems[0].label + ' s';
                            }
                        }
                    },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy'
                        }
                    }
                }
            }
        });

        // Chart type change event
        chartTypeSelect.addEventListener('change', updateChartType);

        // Export chart button
        exportChartBtn.addEventListener('click', exportChart);
    }

    function updateChartType() {
        const type = chartTypeSelect.value;

        // Configure chart based on type
        switch (type) {
            case 'bar':
                chart.config.type = 'bar';
                chart.data.datasets[0].tension = 0;
                chart.data.datasets[0].showLine = false;
                break;

            case 'line':
                chart.config.type = 'line';
                chart.data.datasets[0].tension = 0.4;
                chart.data.datasets[0].fill = true;
                chart.data.datasets[0].pointRadius = 3;
                break;

            case 'scatter':
                chart.config.type = 'scatter';
                chart.data.datasets[0].tension = 0;
                chart.data.datasets[0].showLine = false;
                chart.data.datasets[0].pointRadius = 5;
                break;
        }

        // Update chart
        chart.update();
    }

    function exportChart() {
        const canvas = document.getElementById('results-chart');

        // Create an off-screen canvas with white background
        const offScreenCanvas = document.createElement('canvas');
        offScreenCanvas.width = canvas.width;
        offScreenCanvas.height = canvas.height;
        const offCtx = offScreenCanvas.getContext('2d');

        // Fill with white background
        offCtx.fillStyle = 'white';
        offCtx.fillRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);

        // Draw the chart
        offCtx.drawImage(canvas, 0, 0);

        // Convert to image
        const imageURL = offScreenCanvas.toDataURL('image/png');

        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = imageURL;
        downloadLink.download = 'atwood_chart.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    function updateChart() {
        if (timeData.length === 0) return;

        // Create histogram bins
        const min = Math.min(...timeData) * 0.95; // Add some margin
        const max = Math.max(...timeData) * 1.05;
        const binCount = Math.min(15, Math.ceil(Math.sqrt(timeData.length)));
        const binWidth = (max - min) / binCount;

        // Create bins with more readable labels
        const bins = Array(binCount).fill(0);
        const binLabels = [];
        const rawData = [];

        for (let i = 0; i < binCount; i++) {
            const lowerBound = min + i * binWidth;
            const upperBound = min + (i + 1) * binWidth;
            binLabels.push(lowerBound.toFixed(3));
            rawData.push({
                x: (lowerBound + upperBound) / 2,
                y: 0
            });
        }

        // Count occurrences in each bin
        timeData.forEach(time => {
            const binIndex = Math.min(binCount - 1, Math.floor((time - min) / binWidth));
            bins[binIndex]++;
            rawData[binIndex].y++;
        });

        // Update chart data based on type
        if (chart.config.type === 'scatter') {
            // For scatter, use actual time data points
            chart.data.datasets[0].data = timeData.map((time, index) => ({
                x: time,
                y: index + 1
            }));
        } else {
            // For bar and line charts
            chart.data.labels = binLabels;

            if (chart.config.type === 'line') {
                chart.data.datasets[0].data = rawData;
            } else {
                chart.data.datasets[0].data = bins;
            }
        }

        // Update labels based on language
        chart.options.scales.x.title.text = currentLanguage === 'es' ? 'Tiempo (s)' : 'Time (s)';
        chart.options.scales.y.title.text = currentLanguage === 'es' ? 'Frecuencia' : 'Frequency';
        chart.data.datasets[0].label = currentLanguage === 'es' ? 'Distribución de tiempos' : 'Time Distribution';

        // Update the chart
        chart.update();
    }

    function toggleLanguage() {
        currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
        setupLanguage();
    }

    function setupLanguage() {
        const translations = {
            es: {
                title: "Simulador Didáctico de Máquina de Atwood",
                langBtn: "English",
                pulleyTypeLabel: "Tipo de Polea",
                masslessPulley: "Polea de masa despreciable",
                massivePulley: "Polea con masa considerable",
                pulleyParamsLabel: "Parámetros de la Polea",
                pulleyMassLabel: "Masa (kg):",
                pulleyRadiusLabel: "Radio (m):",
                massesLabel: "Masas en los Platos (kg)",
                mass1Label: "Masa 1:",
                mass2Label: "Masa 2:",
                distanceLabel: "Distancia de Caída (cm)",
                errorOptionsLabel: "Opciones de Error",
                randomErrorsLabel: "Habilitar errores aleatorios",
                runBtn: "Ejecutar Experimento",
                resetBtn: "Reiniciar",
                adminBtn: "Administrador",
                resultsLabel: "Resultados",
                runColumn: "Corrida",
                mass1Column: "Masa 1 (kg)",
                mass2Column: "Masa 2 (kg)",
                distanceColumn: "Distancia (cm)",
                timeColumn: "Tiempo (s)",
                accelerationColumn: "Aceleración (m/s²)",
                statsBtn: "Calcular Estadísticas",
                exportBtn: "Exportar Datos",
                statsLabel: "Estadísticas Descriptivas",
                meanLabel: "Media:",
                medianLabel: "Mediana:",
                stdevLabel: "Desviación Estándar:",
                authorInfo: "Autor: Rodrigo Agosta | Grupo de Investigación: GIEDI | Institución: Facultad Regional Santa Fe",
                adminTitle: "Modo Administrador",
                passwordLabel: "Contraseña:",
                submitPassword: "Ingresar",
                trueValuesLabel: "Valores Verdaderos",
                truePulleyMassLabel: "Masa de la Polea:",
                truePulleyRadiusLabel: "Radio de la Polea:",
                trueMass1Label: "Masa 1:",
                trueMass2Label: "Masa 2:",
                trueFallDistanceLabel: "Distancia de Caída:",
                chartTypeLabel: "Tipo de gráfico:",
                barChart: "Histograma",
                lineChart: "Curva de distribución",
                scatterChart: "Dispersión",
                exportChartBtn: "Exportar Gráfico"
            },
            en: {
                title: "Atwood Machine Educational Simulator",
                langBtn: "Español",
                pulleyTypeLabel: "Pulley Type",
                masslessPulley: "Massless pulley",
                massivePulley: "Massive pulley",
                pulleyParamsLabel: "Pulley Parameters",
                pulleyMassLabel: "Mass (kg):",
                pulleyRadiusLabel: "Radius (m):",
                massesLabel: "Masses on Plates (kg)",
                mass1Label: "Mass 1:",
                mass2Label: "Mass 2:",
                distanceLabel: "Fall Distance (cm)",
                errorOptionsLabel: "Error Options",
                randomErrorsLabel: "Enable random errors",
                runBtn: "Run Experiment",
                resetBtn: "Reset",
                adminBtn: "Administrator",
                resultsLabel: "Results",
                runColumn: "Run",
                mass1Column: "Mass 1 (kg)",
                mass2Column: "Mass 2 (kg)",
                distanceColumn: "Distance (cm)",
                timeColumn: "Time (s)",
                accelerationColumn: "Acceleration (m/s²)",
                statsBtn: "Calculate Statistics",
                exportBtn: "Export Data",
                statsLabel: "Descriptive Statistics",
                meanLabel: "Mean:",
                medianLabel: "Median:",
                stdevLabel: "Standard Deviation:",
                authorInfo: "Author: Rodrigo Agosta | Research Group: GIEDI | Institution: Facultad Regional Santa Fe",
                adminTitle: "Administrator Mode",
                passwordLabel: "Password:",
                submitPassword: "Enter",
                trueValuesLabel: "True Values",
                truePulleyMassLabel: "Pulley Mass:",
                truePulleyRadiusLabel: "Pulley Radius:",
                trueMass1Label: "Mass 1:",
                trueMass2Label: "Mass 2:",
                trueFallDistanceLabel: "Fall Distance:",
                chartTypeLabel: "Chart type:",
                barChart: "Histogram",
                lineChart: "Distribution curve",
                scatterChart: "Scatter plot",
                exportChartBtn: "Export Chart"
            }
        };

        const t = translations[currentLanguage];

        // Update UI with translations
        document.getElementById('title').textContent = t.title;
        langToggle.textContent = t.langBtn;
        document.getElementById('pulley-type-label').textContent = t.pulleyTypeLabel;
        document.getElementById('massless-pulley-label').textContent = t.masslessPulley;
        document.getElementById('massive-pulley-label').textContent = t.massivePulley;
        document.getElementById('pulley-params-label').textContent = t.pulleyParamsLabel;
        document.getElementById('pulley-mass-label').textContent = t.pulleyMassLabel;
        document.getElementById('pulley-radius-label').textContent = t.pulleyRadiusLabel;
        document.getElementById('masses-label').textContent = t.massesLabel;
        document.getElementById('mass1-value-label').textContent = t.mass1Label;
        document.getElementById('mass2-value-label').textContent = t.mass2Label;
        document.getElementById('distance-label').textContent = t.distanceLabel;
        document.getElementById('error-options-label').textContent = t.errorOptionsLabel;
        document.getElementById('random-errors-label').textContent = t.randomErrorsLabel;
        runBtn.textContent = t.runBtn;
        resetBtn.textContent = t.resetBtn;
        adminBtn.textContent = t.adminBtn;
        document.getElementById('results-label').textContent = t.resultsLabel;
        document.getElementById('run-column').textContent = t.runColumn;
        document.getElementById('mass1-column').textContent = t.mass1Column;
        document.getElementById('mass2-column').textContent = t.mass2Column;
        document.getElementById('distance-column').textContent = t.distanceColumn;
        document.getElementById('time-column').textContent = t.timeColumn;
        document.getElementById('acceleration-column').textContent = t.accelerationColumn;
        statsBtn.textContent = t.statsBtn;
        exportBtn.textContent = t.exportBtn;
        document.getElementById('stats-label').textContent = t.statsLabel;
        document.getElementById('mean-label').textContent = t.meanLabel;
        document.getElementById('median-label').textContent = t.medianLabel;
        document.getElementById('stdev-label').textContent = t.stdevLabel;
        document.getElementById('author-info').textContent = t.authorInfo;
        document.getElementById('admin-title').textContent = t.adminTitle;
        document.getElementById('password-label').textContent = t.passwordLabel;
        submitPasswordBtn.textContent = t.submitPassword;
        document.getElementById('true-values-label').textContent = t.trueValuesLabel;
        document.getElementById('true-pulley-mass-label').textContent = t.truePulleyMassLabel;
        document.getElementById('true-pulley-radius-label').textContent = t.truePulleyRadiusLabel;
        document.getElementById('true-mass1-label').textContent = t.trueMass1Label;
        document.getElementById('true-mass2-label').textContent = t.trueMass2Label;
        document.getElementById('true-fall-distance-label').textContent = t.trueFallDistanceLabel;
        document.getElementById('chart-type-label').textContent = t.chartTypeLabel;

        const chartTypeOptions = chartTypeSelect.options;
        chartTypeOptions[0].textContent = t.barChart;
        chartTypeOptions[1].textContent = t.lineChart;
        chartTypeOptions[2].textContent = t.scatterChart;

        exportChartBtn.textContent = t.exportChartBtn;

        // Update chart labels if chart exists
        if (chart) {
            chart.options.scales.x.title.text = currentLanguage === 'es' ? 'Tiempo (s)' : 'Time (s)';
            chart.options.scales.y.title.text = currentLanguage === 'es' ? 'Frecuencia' : 'Frequency';
            chart.data.datasets[0].label = currentLanguage === 'es' ? 'Distribución de tiempos' : 'Time Distribution';
            chart.update();
        }
    }

    function setMassPositions(x1, y1, x2, y2) {
        const mass1 = document.getElementById('mass1');
        const mass2 = document.getElementById('mass2');

        if (mass1 && mass2) {
            mass1.setAttribute('transform', `translate(${x1}, ${y1})`);
            mass2.setAttribute('transform', `translate(${x2}, ${y2})`);
            updateRope();
        }
    }
});