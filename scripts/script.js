const image = document.getElementById("scene");
const marker = document.getElementById("marker");
const message = document.getElementById("message-overlay");
const playAgainButton = document.getElementById("play-again-btn");

// immagini con coordinate del fotografo
const scenes = [
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

// Gestione indice sequenziale
let currentIndex = parseInt(localStorage.getItem('currentSceneIndex') || '0');

// Se abbiamo finito tutte le immagini, ricomincia da capo
if (currentIndex >= scenes.length) {
  currentIndex = 0;
}

const currentScene = scenes[currentIndex];
image.src = currentScene.src;
let target = currentScene.target;
const tolerance = 30;

// gestione click immagine
image.addEventListener("click", (event) => {
  const rect = image.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  console.log(x / rect.width, y / rect.height);

  // Mostra la X rossa
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;
  marker.style.display = "block";

  // Calcola la posizione "reale" del target in pixel in base alle percentuali
  const targetX = rect.width * currentScene.target.x;
  const targetY = rect.height * currentScene.target.y;
  const distance = Math.hypot(x - targetX, y - targetY);

  if (distance < tolerance) {
    message.style.display = "block";
  }
});

// Quando clicchi il bottone, vai alla prossima immagine
playAgainButton.addEventListener("click", () => {
  // Incrementa l'indice per la prossima immagine
  currentIndex++;
  localStorage.setItem('currentSceneIndex', currentIndex.toString());
  
  // Ricarica la pagina per mostrare la prossima immagine
  window.location.reload();
});