// Major cities data - *** COORDINATES ADJUSTED FOR 2000x857 VIEWBOX ***
// These are estimations based on visual placement on the new map.

	// Major cities data - *** COORDINATES REVISED (v3) for 2000x857 VIEWBOX ***
// Focused on better within-country placement and latitude correction.
const cities = [
	// North America
	{name: "Washington DC", x: 570, y: 320, population: 700000},  // East Coast US, further South
	{name: "New York", x: 605, y: 310, population: 8400000},      // Northeast US Coast, South of previous
	
	{name: "Chicago", x: 515, y: 288, population: 2700000},       // South of Lake Michigan
	{name: "Los Angeles", x: 345, y: 315, population: 4000000},    // S. California Coast
	
	{name: "Seattle", x: 365, y: 280, population: 750000},        // Pacific NW US
	{name: "Houston", x: 475, y: 340, population: 2300000},       // Gulf Coast US
	
	{name: "Toronto", x: 565, y: 280, population: 2900000},       // N. Shore Lake Ontario
	{name: "Vancouver", x: 360, y: 250, population: 675000},      // SW Canada Coast
	{name: "Mexico City", x: 435, y: 395, population: 8900000},   // Central Mexico
	
	// South America
	{name: "Caracas", x: 605, y: 430, population: 2900000},       // N Coast Venezuela
	{name: "Rio de Janeiro", x: 740, y: 585, population: 6700000},// SE Brazil Coast
	{name: "Buenos Aires", x: 650, y: 650, population: 2900000},  // E Coast Argentina
	{name: "Lima", x: 555, y: 540, population: 9750000},          // W Coast Peru
	
	
	// Europe
	{name: "London", x: 980, y: 250, population: 8900000},        // SE UK
	{name: "Paris", x: 1000, y: 265, population: 2100000},        // N. France
	{name: "Berlin", x: 1045, y: 245, population: 3600000},       // NE Germany
	{name: "Rome", x: 1055, y: 290, population: 2800000},         // Central Italy
	{name: "Madrid", x: 965, y: 300, population: 3200000},        // Central Spain
	
	// Africa
	{name: "Cairo", x: 1155, y: 350, population: 9500000},        // NE Egypt
	{name: "Lagos", x: 995, y: 450, population: 14800000},       // S Coast Nigeria
	{name: "Johannesburg", x: 1135, y: 600, population: 5600000}, // South Africa (inland)
	{name: "Nairobi", x: 1200, y: 480, population: 4400000},      // Kenya (near equator)
	
	// USSR / Asia
	{name: "Moscow", x: 1170, y: 230, population: 11900000},      // West Russia
	{name: "St. Petersburg", x: 1128, y: 215, population: 5400000},// NW Russia
	
	{name: "Novosibirsk", x: 1400, y: 225, population: 1600000},  // S Siberia
	{name: "Vladivostok", x: 1705, y: 255, population: 600000},   // SE Russia Coast
	
	{name: "Beijing", x: 1590, y: 310, population: 21500000},     // E China
	{name: "Tokyo", x: 1740, y: 320, population: 13900000},       // E Coast Japan
	
	{name: "Shanghai", x: 1640, y: 360, population: 24000000},    // SE China Coast
	{name: "Mumbai", x: 1395, y: 395, population: 12500000},      // W Coast India
	
	{name: "Hong Kong", x: 1610, y: 375, population: 7400000},    // S Coast China
	{name: "Tehran", x: 1220, y: 330, population: 8700000},       // N Central Iran
	
	// Australia
	{name: "Sydney", x: 1800, y: 630, population: 5300000},       // SE Australia Coast
	{name: "Melbourne", x: 1750, y: 645, population: 5000000},    // S Coast Australia

];

// Launch sites data - *** COORDINATES REVISED AGAIN for 2000x857 VIEWBOX ***
// Adjusted slightly based on refined city positions.
const launchSites = [
		// US/Canada Sites
	{x: 420, y: 270, name: "US West ICBM"},     // Montana/Dakotas area (~lat 47N)
	{x: 445, y: 290, name: "US Central ICBM"},  // Nebraska/Kansas area (~lat 40N)
	{x: 570, y: 320, name: "US East ICBM"},     // Near East Coast (~lat 40N)
	{x: 660, y: 310, name: "N. Atlantic Fleet"},// Sea based North Atlantic
		// Europe Sites
		
	{x: 950, y: 250, name: "UK Forward Base"}, // North Sea / UK Area (~lat 55N)
	
	{x: 990, y: 300, name: "W. Europe Cmd"},   // Central Europe (~lat 50N)
		// USSR Sites
		
	{x: 1170, y: 190, name: "Soviet NW ICBM"},   // Kola Peninsula area (~lat 68N)
	
	{x: 1350, y: 190, name: "Soviet Central ICBM"},// West of Urals (~lat 55N)
	
	{x: 1567, y: 200, name: "Soviet Siberia ICBM"},// Central Siberia (~lat 55N)
	
	{x: 1470, y: 220, name: "Soviet S. Command"}, // Central Asia area (~lat 40N)
	
	{x: 1730, y: 240, name: "Soviet Pacific ICBM"},// Far East Russia (~lat 60N)
	{x: 1750, y: 280, name: "Soviet Pacific Fleet"},// Sea based Pacific - S of Japan
	
];

// DOM Elements (remain the same)
const worldMapSvg = document.getElementById('world-map');
const terminalElement = document.getElementById('terminal');
const missileCountElement = document.getElementById('missile-count');
const casualtiesElement = document.getElementById('casualties');
const startButton = document.getElementById('start-sim');
const resetButton = document.getElementById('reset-sim');
const toggleSoundButton = document.getElementById('toggle-sound');
const scanline = document.getElementById('scanline');

// Game state (remains the same)
let simulationRunning = false;
let soundEnabled = false;
let totalMissiles = 0;
let totalCasualties = 0;
let launchInterval;
let scanlineInterval;

// Sound effects (remain the same)
const alarmSound = new Audio();
alarmSound.src = "data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2ooFollowEABQquoJ+eXS0wsXLI9vPmS/FVXMkzov8O+gmHdXTD+MdvGlYkVWd2J9A89jE4glJD6Is/i1APpfZbpF3Kzn0B9sEaQ3dkzM2rjhsMSD2LUBn6WNK67Tcm1nWEsq90VZNU=";
alarmSound.loop = true;
const explosionSound = new Audio();
explosionSound.src = "data:audio/wav;base64,UklGRrQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YZAFAACBgIF/gn6CfoGAgH9/f35/fn9/gICBgYGAf3+AgIKCg4KBf359fX5/gYKDg4KCgYB+fHt8foGChIaEg4B9enl6fYCDhoaFhIJ/fHp6e3+ChYeIh4WCf3t5eXt+goWJiYiGg396eHh6fYKGiYqJh4WBfXp4eHt/g4aJiomHhIB9enh4e36ChYmKiYeEgH15eHl7f4OGiYqJh4SBfnp5eXt/goWIiYiGg4B9enl6fYCDhoiIhoSBfnt6ent/goWHiIeFgn98enp7foGEh4iHhYKAfXt6e32Ag4aHh4aEgX58e3t8f4KEhoaGhIOAfnx7e31/goSGhoWEgoB+fHx8foCChIWFhIOBf359fH1+gIKEhYWEg4GAf39+fn+AgYOEhIOCgYB/fn5+f4CBgoODg4KBgH9/f3+AgIGCgoKCgYGAgH9/gICBgYKCgoKBgYCAgICAgYGBgYGBgYGAgICAgICBgYGBgYGBgICAgICAgICAgYGBgYGAgICAgICAgICAgYGBgYCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgH9/f39/f39/f39/f3+AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA";
const beepSound = new Audio();
beepSound.src = "data:audio/wav;base64,UklGRl4BAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToBAACAgICAgICAgICAgICAgICAgICAgICAgICBg4OFh4iJiImHhYKAfXp2c3Bua2xvcnZ8gIWIi42Oj46MiYaDgH57eHVzcXBydXl+goaKjZCSkpGPjImGg4B9endzb2ttbnF1eX6ChYiLjI2NjIqHhIJ/fHp3dXNycnN2eX2Ag4aJi4yNjIuJhoOBfnt4dnRzcnJ0d3p9gIOFiIqLi4uJh4WCgH58eXd1dHNzdXd6fYCDhYeJioqKiIaEgn98enl3dnV1dXd5e36BhIaIiYmJiIaEgn98enl3dnV1dXZ4en2Ag4WGiIiIh4aEgoB+fHp4d3Z2dnd4en2AgYOFhoaGhoWDgYB+fHt5eHd3d3h5e31/gYOEhYWFhIOCgYB+fXt6eXl4eHl6fH1/gYKDhIWFhIOCgYB/fXx7enp5eXl7fH5/gYKDhISEg4OCgYB/fn18e3t6enp7fH1+gIGCg4ODg4KCgYB/fn18e3t7e3t8fX5/gIGCgoODg4KBgYB/fn58fHx8fHx9fn+AgYGCgoKCgoGBgIB/fn59fX19fX5+f4CAgYGBgYGBgYCAgH9/fn5+fn5+fn9/gICAgYGBgYGBgICAgH9/f39/f39/f3+A";


// Initialize the world map - *** No longer creates SVG paths ***
function initWorldMap() {
	// Paths are now embedded in HTML. We just add markers.
	console.log("Initializing markers on embedded SVG map...");

	// Clear old markers and add new ones based on updated coords
	document.querySelectorAll(".city-marker, .city-name").forEach(el => el.remove());

	cities.forEach(city => {
		const mapContainer = document.querySelector(".map-container"); // Ensure markers are relative to this container

		const cityMarker = document.createElement("div");
		cityMarker.className = "city-marker";
		// Convert SVG coords (0-2000, 0-857) to percentage for positioning
		// relative to the container, which allows the SVG to scale.
		cityMarker.style.left = `${(city.x / 2000) * 100}%`;
		cityMarker.style.top = `${(city.y / 857) * 100}%`;
		mapContainer.appendChild(cityMarker);

		const cityName = document.createElement("div");
		cityName.className = "city-name";
		cityName.textContent = city.name;
		cityName.style.left = `${(city.x / 2000) * 100}%`;
		cityName.style.top = `${(city.y / 857) * 100}%`;
		mapContainer.appendChild(cityName);
	});

	console.log("Map markers placed for", cities.length, "cities.");
}

// Function to add a log message to the terminal (no changes needed)
function logMessage(message) {
	const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	const logEntry = document.createElement("div");
	logEntry.textContent = `${timestamp}> ${message}`;
	terminalElement.appendChild(logEntry);
	terminalElement.scrollTop = terminalElement.scrollHeight;
}


function launchMissile() {
	if (!simulationRunning) return;

	const launchSite = launchSites[Math.floor(Math.random() * launchSites.length)];
	const target = cities[Math.floor(Math.random() * cities.length)];

	if (Math.abs(launchSite.x - target.x) < 10 && Math.abs(launchSite.y - target.y) < 10) {
			return; // Skip this launch attempt if too close visually
	}

		const mapContainer = document.querySelector(".map-container");
		const containerWidth = mapContainer.offsetWidth;
		const containerHeight = mapContainer.offsetHeight;

	const missile = document.createElement("div");
	missile.className = "missile";
		missile.style.left = `${(launchSite.x / 2000) * containerWidth}px`;
		missile.style.top = `${(launchSite.y / 857) * containerHeight}px`;
	mapContainer.appendChild(missile);

	logMessage(`LAUNCH: ${launchSite.name} -> ${target.name}`);

	if (soundEnabled) {
		beepSound.currentTime = 0;
		beepSound.play().catch(e => console.warn("Sound play failed:", e));
	}

	totalMissiles++;
	missileCountElement.textContent = totalMissiles;

	const startTime = Date.now();
	const duration = 3000 + Math.random() * 4000;
	const targetPxX = (target.x / 2000) * containerWidth;
	const targetPxY = (target.y / 857) * containerHeight;
	const startPxX = (launchSite.x / 2000) * containerWidth;
	const startPxY = (launchSite.y / 857) * containerHeight;

	let frameCount = 0; // Counter for trail dot generation
	const trailDots = []; // Keep track of dots for this missile

	function animateMissile() {
			if (!missile.parentNode) return; // Stop if missile removed

		const elapsed = Date.now() - startTime;
		const progress = Math.min(elapsed / duration, 1);

		const dx = targetPxX - startPxX;
		const dy = targetPxY - startPxY;
		const distance = Math.sqrt(dx*dx + dy*dy);
		const arcHeight = Math.max(15, Math.min(distance * 0.18, 70));

		const currentX = startPxX + dx * progress;
		const currentY = startPxY + dy * progress - Math.sin(progress * Math.PI) * arcHeight;

		missile.style.left = `${currentX}px`;
		missile.style.top = `${currentY}px`;

		// --- START: Trail Dot Logic ---
		frameCount++;
		if (frameCount % 4 === 0 && progress < 0.95) { // Add a dot every 4 frames, stop near end
			const trailDot = document.createElement("div");
			trailDot.className = "missile-trail-dot";
			trailDot.style.left = `${currentX}px`;
			trailDot.style.top = `${currentY}px`;
			mapContainer.appendChild(trailDot);
			trailDots.push(trailDot); // Add to local list

			// Start fade out slightly delayed
			setTimeout(() => {
				trailDot.classList.add('fading');
				// Remove dot from DOM after fade completes
				setTimeout(() => {
					if (trailDot.parentNode) {
						trailDot.remove();
					}
				}, 1500); // Match CSS transition duration
			}, 500); // Delay before fade starts (adjust as needed)
		}
		// --- END: Trail Dot Logic ---

		if (progress < 1) {
			requestAnimationFrame(animateMissile);
		} else {
			missile.remove();
			// Explosion still uses target percentages
			createExplosion((target.x / 2000) * 100, (target.y / 857) * 100);

			// --- Ensure remaining trail dots fade out after explosion ---
			// (Though the above logic should handle most)
			trailDots.forEach(dot => {
					if (dot.parentNode && !dot.classList.contains('fading')) {
						setTimeout(() => {
						dot.classList.add('fading');
						setTimeout(() => {
							if (dot.parentNode) dot.remove();
						}, 1500);
					}, Math.random() * 300); // Stagger final fades slightly
					}
			});
		}
	}
	requestAnimationFrame(animateMissile);
}      

	// Function to create explosion (updated for percentage positioning)
	function createExplosion(targetPercentX, targetPercentY) {
		if (soundEnabled) {
		const explosionSoundClone = explosionSound.cloneNode();
		explosionSoundClone.volume = 0.6;
		explosionSoundClone.play().catch(e => console.warn("Sound play failed:", e));
		}

		const mapContainer = document.querySelector(".map-container");
		const explosion = document.createElement("div");
		explosion.className = "explosion";
		// Set position using percentage
		explosion.style.left = `${targetPercentX}%`;
		explosion.style.top = `${targetPercentY}%`;
		mapContainer.appendChild(explosion);

		// Calculate target pixel coords for hit detection
		const targetPxX = (targetPercentX / 100) * mapContainer.offsetWidth;
		const targetPxY = (targetPercentY / 100) * mapContainer.offsetHeight;

		// Hit detection needs to compare against *pixel* positions of markers
		let hitCity = null;
		let minDist = 15 * 15; // Initial detection radius (squared, in pixels)
		document.querySelectorAll('.city-marker').forEach((marker, index) => {
			const markerX = parseFloat(marker.style.left); // This is percentage
			const markerY = parseFloat(marker.style.top);
			// Convert marker percentage to pixels for comparison
			const markerPxX = (markerX / 100) * mapContainer.offsetWidth;
			const markerPxY = (markerY / 100) * mapContainer.offsetHeight;

			const distSq = Math.pow(markerPxX - targetPxX, 2) + Math.pow(markerPxY - targetPxY, 2);
			if (distSq < minDist) {
				minDist = distSq;
				hitCity = cities[index]; // Assumes city array order matches marker creation order
			}
		});


		let casualties = 0;
		if (hitCity) {
		const casualtyPercentage = 0.5 + Math.random() * 0.48; // 50-98%
		casualties = Math.floor(hitCity.population * casualtyPercentage);
		logMessage(`IMPACT: ${hitCity.name} | EST. CASUALTIES: ${casualties.toLocaleString()}`);
		} else {
			casualties = Math.floor(Math.random() * 300000);
			logMessage(`IMPACT DETECTED GRID [${Math.round(targetPxX)}, ${Math.round(targetPxY)}] | CAS: ${casualties.toLocaleString()}`);
		}
		totalCasualties += casualties;
		casualtiesElement.textContent = totalCasualties.toLocaleString();


		let size = 0;
		const maxSize = 22 + Math.random() * 12; // Max size in pixels
		const startTime = Date.now();
		const duration = 1100;

		function animateExplosion() {
			if (!explosion.parentNode) return;
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			size = maxSize * (1 - Math.pow(1 - progress, 3)); // Ease out expansion
			explosion.style.opacity = 1 - progress;
			explosion.style.width = `${size}px`;
			explosion.style.height = `${size}px`;
			explosion.style.transform = `translate(-50%, -50%)`; // Center the explosion

			if (progress < 1) {
				requestAnimationFrame(animateExplosion);
			} else {
				explosion.remove();
			}
		}
		requestAnimationFrame(animateExplosion);
	}

// Start simulation function (no changes needed)
function startSimulation() {
	if (simulationRunning) return;
	console.log("Starting Detailed Map Simulation...");

	simulationRunning = true;
	startButton.textContent = "SIMULATION RUNNING";
	startButton.disabled = true;
	resetButton.disabled = false;

	totalMissiles = 0;
	totalCasualties = 0;
	missileCountElement.textContent = "0";
	casualtiesElement.textContent = "0";
	terminalElement.innerHTML = "";
	document.querySelectorAll(".missile, .explosion").forEach(el => el.remove());

	logMessage("SYSTEM ALERT: STRATEGIC LAUNCH DETECTED");
	logMessage("INITIATING WARGAME SCENARIO: GTW-SM84"); // SM for SimpleMaps :)
	logMessage("THREATCON: MAXIMUM");

	if (soundEnabled) {
		alarmSound.play().catch(e => console.warn("Sound play failed:", e));
	}

		const initialMissiles = 6 + Math.floor(Math.random() * 6);
		logMessage(`INITIAL STRIKE WAVE: ${initialMissiles} INBOUND.`);
		for (let i = 0; i < initialMissiles; i++) {
		setTimeout(launchMissile, 150 + i * 120);
	}

	launchInterval = setInterval(() => {
		if (!simulationRunning) return;
		const missilesInWave = 2 + Math.floor(Math.random() * 5);
		if (Math.random() < 0.4) logMessage(`TRACKING ${missilesInWave} NEW HOSTILES.`);
		for (let i = 0; i < missilesInWave; i++) {
			setTimeout(launchMissile, Math.random() * 500);
		}
	}, 1100 + Math.random() * 600);

	setTimeout(() => {
		if (simulationRunning) {
				logMessage("WARNING: ESCALATION TO FULL SCALE EXCHANGE.");
		}
	}, 30000);

	setTimeout(() => {
		if (simulationRunning) {
			logMessage("SIMULATION COMPLETE: MUTUAL DESTRUCTION ACHIEVED.");
			logMessage("SCENARIO ANALYSIS: NO WINNER.");
			logMessage("SYSTEM RETURNING TO STANDBY.");
			resetSimulation(false);
		}
	}, 60000);
}


function resetSimulation(manualReset = true) {
		console.log("Resetting Simulation...");
	simulationRunning = false;

	startButton.textContent = "START SIMULATION";
	startButton.disabled = false;
	resetButton.disabled = true;

	clearInterval(launchInterval);
	alarmSound.pause();
	alarmSound.currentTime = 0;

	// Remove all missiles, explosions, AND trail dots
	document.querySelectorAll(".missile, .explosion, .missile-trail-dot").forEach(el => el.remove());

	if(manualReset){
			logMessage("SIMULATION ABORTED.");
			logMessage("READY FOR INPUT.");
	} else {
			logMessage("FINAL STATE LOGGED.");
	}
		logMessage("--------------------------------");
}

// Toggle sound function (no changes needed)
function toggleSound() {
	soundEnabled = !soundEnabled;
	toggleSoundButton.textContent = `SOUND: ${soundEnabled ? "ON" : "OFF"}`;
	if (!soundEnabled) {
			alarmSound.pause();
			alarmSound.currentTime = 0;
	}
		logMessage(`AUDIO SYSTEM ${soundEnabled ? "ENABLED" : "MUTED"}`);
}

// Animate scanline effect (no changes needed)
function animateScanline() {
	let position = 0;
	const mapContainer = document.querySelector('.map-container');
	if (scanlineInterval) clearInterval(scanlineInterval);
	scanlineInterval = setInterval(() => {
			const height = mapContainer.clientHeight;
			if (height > 0) {
			position = (position + 1) % height;
			scanline.style.top = `${position}px`;
			}
	}, 30);
}

// Initialize simulation 
function init() {
	console.log('Initializing WOPR Interface...');
	resetButton.disabled = true;
	initWorldMap(); // This now just places markers
	animateScanline();
	document.getElementById('start-sim').addEventListener("click", startSimulation);
	document.getElementById('reset-sim').addEventListener("click", () => resetSimulation(true));
	document.getElementById('toggle-sound').addEventListener("click", toggleSound);
	logMessage("WOPR STRATEGIC DEFENSE SYSTEM V.9.1");
	logMessage("MAP DATA SOURCE: SimpleMaps.com");
	logMessage("STATUS: READY");
	logMessage("AWAITING COMMAND.");
	logMessage("--------------------------------");
}

document.addEventListener("DOMContentLoaded", init);