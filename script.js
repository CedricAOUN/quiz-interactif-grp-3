console.log("Quiz JS loaded...");

// Variables
let currentQuestionIndex = 0;
let score = 0;
let bestScore = 0;
let timeLeft = 0;
let timerId = null;

// DOM
const introScreen = document.getElementById("intro-screen");
const questionScreen = document.getElementById("question-screen");
const resultScreen = document.getElementById("result-screen");

const bestScoreValue = document.getElementById("best-score-value");
const bestScoreEnd = document.getElementById("best-score-end");

const questionText = document.getElementById("question-text");
const answersDiv = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const scoreText = document.getElementById("score-text");
const timeLeftSpan = document.getElementById("time-left");

const currentQuestionIndexSpan = document.getElementById(
  "current-question-index"
);
const totalQuestionsSpan = document.getElementById("total-questions");

// On init
window.addEventListener("DOMContentLoaded", () => {
  startBtn.addEventListener("click", startQuiz);
  nextBtn.addEventListener("click", nextQuestion);
  restartBtn.addEventListener("click", restartQuiz);

  loadBestScore();
  bestScoreValue.textContent = bestScore;
});

function loadBestScore() {
  const stored = localStorage.getItem("bestScore");
  if (stored) {
    bestScore = parseInt(stored, 10);
  }
}

function saveBestScore() {
  localStorage.setItem("bestScore", bestScore.toString());
}

function startQuiz() {
  introScreen.style.display = "none";
  questionScreen.style.display = "block";

  questions = shuffle(questions); // RANDOMIZE QUESTION ORDER ON QUIZ START

  currentQuestionIndex = 0;
  score = 0;

  totalQuestionsSpan.textContent = questions.length;

  showQuestion();
}

function showQuestion() {
  // Stop any previous timer
  clearInterval(timerId);

  const q = questions[currentQuestionIndex];
  questionText.textContent = q.text;

  currentQuestionIndexSpan.textContent = currentQuestionIndex + 1;

  // Refresh answers
  answersDiv.innerHTML = "";
  q.answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.addEventListener("click", () => selectAnswer(index, btn));
    answersDiv.appendChild(btn);
  });

  // Hide "Question suivante" until user responds or time is up
  nextBtn.classList.add("hidden");

  // Timer
  timeLeft = q.timeLimit;
  timeLeftSpan.textContent = timeLeft;

  timerId = setInterval(() => {
    timeLeft--;
    timeLeftSpan.textContent = timeLeft;
    if (timeLeft <= 0) {
      lockAnswers();
      clearInterval(timerId);
      nextBtn.classList.remove("hidden");
    }
  }, 1000);
}

function selectAnswer(index, btnClicked) {
  const q = questions[currentQuestionIndex];

  clearInterval(timerId);

  // Vérification
  if (index === q.correct) {
    score++;
    btnClicked.classList.add("correct");
  } else {
    btnClicked.classList.add("wrong");
  }

  // Marquer la vraie réponse
  const allButtons = answersDiv.querySelectorAll("button");
  if (q.correct < allButtons.length) {
    allButtons[q.correct].classList.add("correct");
  }

  lockAnswers();
  nextBtn.classList.remove("hidden");
}

function lockAnswers() {
  const allButtons = answersDiv.querySelectorAll("button");
  allButtons.forEach((b) => {
    b.disabled = true;
  });
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
}

function endQuiz() {
  questionScreen.style.display = "none";
  resultScreen.style.display = "block";

  scoreText.textContent = `Votre score : ${score} / ${questions.length}`;

  if (score > bestScore) {
    bestScore = score;
    saveBestScore();
  }
  bestScoreEnd.textContent = bestScore;
}

function restartQuiz() {
  resultScreen.style.display = "none";
  introScreen.style.display = "block";

  bestScoreValue.textContent = bestScore;
}

// RANDOMISE AN ARRAY
function shuffle(array) {
  return array.sort((a, b) => 0.5 - Math.random())
}

// Dark mode
const darkModeToggle = document.getElementById("darkModeToggle");
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  
  // Change le texte du bouton
  if (document.body.classList.contains("dark-mode")) {
    darkModeToggle.textContent = "☀️ Light Mode";
  } else {
    darkModeToggle.textContent = "🌙 Dark Mode";
  }
});
// Fonction principale pour créer un bouton de partage sur Twitter
function createTwitterShareButton(score, url) {
  // Vérifiez que le DOM est chargé avant d'ajouter le bouton
  document.addEventListener('DOMContentLoaded', () => {
      // Créer un bouton
      const button = document.createElement('button');
      button.textContent = "Partager mon score sur Twitter";
      
      // Ajouter un style au bouton
      button.style.backgroundColor = "#1DA1F2";
      button.style.color = "white";
      button.style.border = "none";
      button.style.padding = "10px 20px";
      button.style.borderRadius = "5px";
      button.style.fontSize = "16px";
      button.style.cursor = "pointer";
      button.style.transition = "background-color 0.3s ease";

      // Ajouter des événements de style au survol
      button.addEventListener('mouseover', () => {
          button.style.backgroundColor = "#0d8cd8";
      });
      button.addEventListener('mouseout', () => {
          button.style.backgroundColor = "#1DA1F2";
      });

      // Ajouter l'événement de clic
      button.addEventListener('click', () => {
          const text = `J'ai obtenu un score de ${score} points ! 🎉 Pouvez-vous battre mon score ? ${url}`;
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
          window.open(twitterUrl, '_blank');
      });

      // Ajouter le bouton au corps du document
      document.body.appendChild(button);
  });
}

// Exemple d'utilisation
const score = 150; // Remplacez par votre score
const url = "https://example.com"; // Remplacez par l'URL de votre jeu
createTwitterShareButton(score, url);