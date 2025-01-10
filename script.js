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
const btnIndice = document.getElementById("btn-indice");
const questionIndice = document.getElementById("question-indice");
const nextBtn = document.getElementById("next-btn");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const practiceBtn = document.getElementById("practice-btn");

const scoreText = document.getElementById("score-text");
const timeLeftSpan = document.getElementById("time-left");

const currentQuestionIndexSpan = document.getElementById(
  "current-question-index"
);
const totalQuestionsSpan = document.getElementById("total-questions");

// On init
window.addEventListener("DOMContentLoaded", () => {
  startBtn.addEventListener("click", () => startQuiz('Math'));
  practiceBtn.addEventListener("click", () => startQuiz(undefined, true));
  nextBtn.addEventListener("click", nextQuestion);
  restartBtn.addEventListener("click", restartQuiz);

  renderCategories(questions);
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

let parsedQuestions; // MUTABLE ARRAY;

function startQuiz(category, isInfiniteMode) {
  introScreen.style.display = "none";
  questionScreen.style.display = "block";

  parsedQuestions = shuffle(questions); // RESET AND RANDOMIZE QUESTION ORDER ON QUIZ START
  console.log(parsedQuestions);
  if (category != undefined) parsedQuestions = questionFilter(parsedQuestions, category);

  currentQuestionIndex = 0;
  score = 0;

  totalQuestionsSpan.textContent = parsedQuestions.length;

  

  showQuestion(isInfiniteMode);
}

function showQuestion(isInfiniteMode) {
  // Stop any previous timer
  clearInterval(timerId);

  const q = parsedQuestions[currentQuestionIndex];
  questionText.textContent = q.text;
  questionIndice.textContent = q.indice;
  questionIndice.style.display = "none";
  
  currentQuestionIndexSpan.textContent = currentQuestionIndex + 1;

  // Refresh answers
  answersDiv.innerHTML = "";
  q.answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.addEventListener("click", () => selectAnswer(index, btn, isInfiniteMode));
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


btnIndice.addEventListener('click', () => {
questionIndice.style.display = "block";
});

function selectAnswer(index, btnClicked, isInfiniteMode) {
  const q = parsedQuestions[currentQuestionIndex];

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

function nextQuestion(isInfiniteMode) {
  currentQuestionIndex++;
  if (currentQuestionIndex < parsedQuestions.length) {
    showQuestion();
  } else {
    isInfiniteMode ? startQuiz() : endQuiz();
  }
}

function endQuiz() {
  questionScreen.style.display = "none";
  resultScreen.style.display = "block";

  scoreText.textContent = `Votre score : ${score} / ${parsedQuestions.length}`;

  if (score > bestScore) {
    bestScore = score;
    saveBestScore();
  }
  bestScoreEnd.textContent = bestScore;
}

function restartQuiz() {
  resultScreen.style.display = "none";
  questionScreen.style.display = "none";
  introScreen.style.display = "block";

  bestScoreValue.textContent = bestScore;
}

// RANDOMISE AN ARRAY
function shuffle(array) {
  return array.sort((a, b) => 0.5 - Math.random())
}

// FILTER QUESTIONS BY CATEGORY
function questionFilter(array, category) {
  const filteredArray = array.filter(q => q.category == category);
  console.log('filtered Array', filteredArray);
  return filteredArray;
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

// Render category list
function renderCategories(questionList) {
  let categories = new Set();
  questionList.forEach(q => categories.add(q.category));

  for (let c of categories) {
    const btn = document.createElement('button');
    btn.innerText += c;
    btn.addEventListener('click', () => startQuiz(c))
    document.querySelector('#category-list').appendChild(btn);
  }
}