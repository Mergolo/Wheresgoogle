// --- DATI DEL GIOCO ---
// Le coordinate restano normalizzate (0.0 - 1.0)
// Questo permette di adattarsi a qualsiasi risoluzione
const allScenes = [
  { src: "../img/berlino1.jpg", target: { x: 0.265, y: 0.525 } },
  { src: "../img/bruxelles1.jpg", target: { x: 0.244, y: 0.531 } },
  { src: "../img/londra1.jpg", target: { x: 0.794, y: 0.525 } },
  { src: "../img/londra2.jpg", target: { x: 0.481, y: 0.505 } },
  { src: "../img/milano1.jpg", target: { x: 0.768, y: 0.461 } },
  { src: "../img/milano2.jpg", target: { x: 0.748, y: 0.551 } },
  { src: "../img/parigi1.jpg", target: { x: 0.234, y: 0.537 } },
  { src: "../img/manerbio1.jpg", target: { x: 0.753, y: 0.527 } },
  { src: "../img/stoccarda1.jpg", target: { x: 0.738, y: 0.551 } },
];

// Chiave per il LocalStorage
const STORAGE_KEY = 'wheres_google_arcade_scores';

// --- VARIABILI DI STATO ---
let currentLevels = [];
let currentLevelIndex = 0;
let startTime = 0;
let timerInterval = null;
let finalTimeInSeconds = 0;

// --- CONFIGURAZIONE RESPONSIVE ---
// Tolleranza in PERCENTUALE rispetto alla larghezza dell'immagine.
// 4 = 4% della larghezza. 
// Su un telefono (300px wide) la tolleranza sarà 12px.
// Su un desktop (1000px wide) la tolleranza sarà 40px.
const tolerancePercentage = 2; 

// --- ELEMENTI DOM ---
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    end: document.getElementById('end-screen')
};

const gameImage = document.getElementById("scene");
const marker = document.getElementById("marker");
const timerDisplay = document.getElementById("timer-display");
const levelDisplay = document.getElementById("level-display");
const hitFlash = document.getElementById("hit-flash");

// --- GESTIONE SCHERMATE ---
function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// --- LOGICA DI GIOCO ---

function startGame() {
    currentLevelIndex = 0;
    marker.style.display = "none";
    
    // Prendi 5 livelli casuali unici
    const shuffled = [...allScenes].sort(() => 0.5 - Math.random());
    currentLevels = shuffled.slice(0, 5);
    
    // Avvia Timer
    startTime = Date.now();
    if(timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 100);
    
    loadLevel(0);
    showScreen('game');
}

function loadLevel(index) {
    const levelData = currentLevels[index];
    gameImage.src = levelData.src;
    levelDisplay.textContent = `${index + 1}/5`;
    marker.style.display = "none"; 
    
    gameImage.onerror = function() {
        this.style.backgroundColor = "#333";
        console.log("Immagine non trovata: " + levelData.src);
    };
}

function updateTimer() {
    const delta = Date.now() - startTime;
    timerDisplay.textContent = (delta / 1000).toFixed(2);
}

// Gestione Click Immagine
gameImage.addEventListener("click", (event) => {
    const rect = gameImage.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // 1. Calcola coordinate normalizzate solo per il log (per aiutarti a mappare nuove immagini)
    const normX = clickX / rect.width;
    const normY = clickY / rect.height;
    console.log(`Click % -> x: ${normX.toFixed(3)}, y: ${normY.toFixed(3)}`);

    // 2. Recupera il target
    const targetData = currentLevels[currentLevelIndex].target;

    // 3. Converti il target (che è in %) in pixel reali basati sulla grandezza ATTUALE dell'immagine
    const targetPixelX = targetData.x * rect.width;
    const targetPixelY = targetData.y * rect.height;

    // 4. Calcola la distanza in pixel tra il click e il target reale
    const distance = Math.hypot(clickX - targetPixelX, clickY - targetPixelY);

    // 5. Calcola la tolleranza dinamica in pixel basata sulla larghezza attuale
    // Se l'immagine è larga 1000px, maxDistance sarà 40px.
    // Se l'immagine è larga 500px, maxDistance sarà 20px.
    const maxDistancePx = (rect.width * tolerancePercentage) / 100;

    // Muovi la X rossa
    marker.style.left = `${clickX}px`;
    marker.style.top = `${clickY}px`;
    marker.style.display = "block";

    if (distance < maxDistancePx) {
        handleSuccess();
    } else {
        console.log(`Mancato! Distanza: ${distance.toFixed(1)}px (Max consentita: ${maxDistancePx.toFixed(1)}px)`);
    }
});

function handleSuccess() {
    hitFlash.style.opacity = "0.8";
    setTimeout(() => hitFlash.style.opacity = "0", 100);

    setTimeout(() => {
        currentLevelIndex++;
        if (currentLevelIndex < currentLevels.length) {
            loadLevel(currentLevelIndex);
        } else {
            endGame();
        }
    }, 500); 
}

function endGame() {
    clearInterval(timerInterval);
    finalTimeInSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
    
    document.getElementById('final-time').textContent = finalTimeInSeconds;
    
    document.getElementById('name-entry-container').style.display = "block";
    document.getElementById('player-name').value = "";
    
    renderLeaderboard();
    showScreen('end');
}

// --- LEADERBOARD (LOCAL STORAGE) ---

const leaderboardList = document.getElementById('leaderboard-list');
const nameInput = document.getElementById('player-name');
const submitBtn = document.getElementById('submit-score-btn');
const clearBtn = document.getElementById('clear-scores-btn');

function getScores() {
    const scores = localStorage.getItem(STORAGE_KEY);
    return scores ? JSON.parse(scores) : [];
}

function saveScores(scores) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

submitBtn.addEventListener('click', () => {
    const name = nameInput.value.toUpperCase().trim();
    if (!name) return;

    const newScore = {
        name: name,
        time: parseFloat(finalTimeInSeconds),
        date: new Date().toISOString()
    };

    const scores = getScores();
    scores.push(newScore);

    scores.sort((a, b) => a.time - b.time);

    const top10 = scores.slice(0, 10);
    saveScores(top10);

    document.getElementById('name-entry-container').style.display = "none";
    renderLeaderboard();
});

function renderLeaderboard() {
    leaderboardList.innerHTML = "";
    const scores = getScores();

    if (scores.length === 0) {
        leaderboardList.innerHTML = "<li>NO RECORDS YET</li>";
        return;
    }

    scores.forEach((score, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${index + 1}. ${score.name}</span>
            <span>${score.time.toFixed(2)}s</span>
        `;
        leaderboardList.appendChild(li);
    });
}

clearBtn.addEventListener('click', () => {
    if(confirm("RESET ALL SCORES?")) {
        localStorage.removeItem(STORAGE_KEY);
        renderLeaderboard();
    }
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', () => showScreen('start'));

showScreen('start');