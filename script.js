console.log("Quiz JS loaded...");

// Variables
let currentQuestionIndex = 0;
let score = 0;
let bestScore = 0;
let timeLeft = 0;
let timerId = null;
let isEnglish = false; // Default language flag

// DOM Elements
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
const endBtn = document.getElementById("end-btn");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const practiceBtn = document.getElementById("practice-btn");
const scoreText = document.getElementById("score-text");
const timeLeftSpan = document.getElementById("time-left");
const progressText = document.getElementById("progress");
const currentQuestionIndexSpan = document.getElementById("current-question-index");
const totalQuestionsSpan = document.getElementById("total-questions");
const darkModeToggle = document.getElementById("darkModeToggle");
const languageToggle = document.getElementById("languageToggle");

let isInfiniteMode = false; // Infinite mode flag
let parsedQuestions; // To store randomized questions

// Language Translations

const categoryTranslations = {
  "Géographie": { en: "Geography", fr: "Géographie" },
  "Math": { en: "Math", fr: "Maths" },
  "Observation": { en: "Observation", fr: "Observation" },
  "Animaux": { en: "Animals", fr: "Animaux" }
};

const englishText = {
  "title": "Dynamic Quiz",
  "notice": "Test your knowledge with a few timed questions!",
  "bestScore": "Best Score:",
  "startQuiz": "Start Quiz",
  "practiceMode": "Practice (INFINITE MODE)",
  "quizByCategory": "Quiz by Category:",
  "question": "Question",
  "timeLeft": "Time Remaining:",
  "stop": "Stop",
  "hint": "Click for a hint",
  "nextQuestion": "Next Question",
  "finalResult": "Final Result",
  "score": "Your Score",
  "restart": "Restart",
  "darkMode": "🌙 Dark Mode",
  "lightMode": "☀️ Light Mode",
  "languageToggle": "FR",
  "categoryButtonText": "Category"
};

const frenchText = {
  "title": "Quiz Dynamique",
  "notice": "Testez vos connaissances en quelques questions chronométrées !",
  "bestScore": "Meilleur score :",
  "startQuiz": "Commencer le quiz",
  "practiceMode": "Entrainement (MODE INFINI)",
  "quizByCategory": "Quiz Par Catégorie:",
  "question": "Question",
  "timeLeft": "Temps restant :",
  "stop": "Stop",
  "hint": "Cliquez pour avoir un indice",
  "nextQuestion": "Question suivante",
  "finalResult": "Résultat final",
  "score": "Votre score",
  "restart": "Recommencer",
  "darkMode": "🌙 Mode Sombre",
  "lightMode": "☀️ Mode Clair",
  "languageToggle": "EN",
  "categoryButtonText": "Catégorie"
};

// Functions
function loadBestScore() {
  const stored = localStorage.getItem("bestScore");
  if (stored) {
    bestScore = parseInt(stored, 10);
  }
}

function saveBestScore() {
  localStorage.setItem("bestScore", bestScore.toString());
}

// Event listeners for quiz start and language toggle
window.addEventListener("DOMContentLoaded", () => {
  startBtn.addEventListener("click", () => startQuiz());
  practiceBtn.addEventListener("click", () => startQuiz(null, true));
  nextBtn.addEventListener("click", nextQuestion);
  restartBtn.addEventListener("click", restartQuiz);
  endBtn.addEventListener("click", restartQuiz);

  languageToggle.addEventListener("click", () => {
    isEnglish = !isEnglish;
    updateLanguage();  // Update the language in both screens
    updateContentLanguage(); // Update the questions and answers
  });
  
  darkModeToggle.addEventListener("click", toggleDarkMode);

  renderCategories();
  loadBestScore();
  bestScoreValue.textContent = bestScore;
});

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  darkModeToggle.textContent = document.body.classList.contains("dark-mode")
    ? englishText.lightMode
    : englishText.darkMode;
}

function updateLanguage() {
  const text = isEnglish ? englishText : frenchText;

  // Update static text
  document.title = text.title;
  document.querySelector('h1').textContent = text.title;
  document.querySelector('.notice').textContent = text.notice;
  document.getElementById('start-btn').textContent = text.startQuiz;
  document.getElementById('practice-btn').textContent = text.practiceMode;
  document.querySelector('h3').textContent = text.quizByCategory;
  document.getElementById('end-btn').textContent = text.stop;
  document.getElementById('btn-indice').textContent = text.hint;
  document.getElementById('next-btn').textContent = text.nextQuestion;
  document.getElementById('result-screen').querySelector('h2').textContent = text.finalResult;
  document.getElementById('score-text').textContent = text.score;
  document.getElementById('restart-btn').textContent = text.restart;
  document.getElementById('darkModeToggle').textContent = text.darkMode;
  document.getElementById('languageToggle').textContent = text.languageToggle;

  // Update the "Meilleur score" or "Best score" label in intro and result screens
  const bestScoreLabels = document.querySelectorAll('.best-score-label');
  bestScoreLabels.forEach(label => {
    label.textContent = text.bestScore; // "Meilleur score" / "Best Score"
  });

  // Update "Temps restant" or "Time Remaining" label dynamically in the timer
  const timeRemainingLabel = document.querySelector('.time-remaining-label');
  if (timeRemainingLabel) {
    timeRemainingLabel.textContent = text.timeLeft; // "Temps restant" / "Time Remaining"
  }

  // Update "Meilleur score" in intro screen
  const bestScoreIntro = document.getElementById('best-score-value');
  if (bestScoreIntro) {
    bestScoreIntro.textContent = bestScore; // Ensure the best score is displayed dynamically in intro screen
  }
}



function updateContentLanguage() {
  if (!parsedQuestions) return; // No questions loaded yet

  const q = parsedQuestions[currentQuestionIndex];
  
  // Update question text
  questionText.textContent = isEnglish ? q.text_en : q.text_fr;

  // Update answers
  answersDiv.innerHTML = ""; // Clear current answers
  const questionAnswers = isEnglish ? q.answers_en : q.answers_fr;
  questionAnswers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.addEventListener("click", () => selectAnswer(index, btn));
    answersDiv.appendChild(btn);
  });

  // Update hint if visible
  if (questionIndice.style.display === "block") {
    questionIndice.textContent = isEnglish ? q.indice_en : q.indice_fr;
  }
}

function renderCategories() {
  const categorySet = new Set(questions.map(q => q.category));
  const categoryListDiv = document.getElementById('category-list');
  categoryListDiv.innerHTML = ''; // Clear previous list

  categorySet.forEach((category, index) => {
    const translatedCategory = isEnglish
      ? categoryTranslations[category]?.en || category
      : categoryTranslations[category]?.fr || category;

    const btn = document.createElement('button');
    btn.textContent = translatedCategory;
    btn.id = `category-btn-${index}`;
    btn.addEventListener('click', () => startQuiz(category)); // Pass untranslated category
    categoryListDiv.appendChild(btn);
  });
}


function startQuiz(category = null, infinite = false) {
  isInfiniteMode = infinite; // Set infinite mode flag
  introScreen.style.display = "none";
  questionScreen.style.display = "block";

  // Shuffle and filter questions based on category
  parsedQuestions = shuffle(questions);
  if (category) parsedQuestions = parsedQuestions.filter(q => q.category === category);

  currentQuestionIndex = 0;
  score = 0;
  totalQuestionsSpan.textContent = parsedQuestions.length;

  showQuestion();
}

btnIndice.addEventListener("click", () => {
  const q = parsedQuestions[currentQuestionIndex];
  if (q.indice_fr || q.indice_en) {
    const hint = isEnglish ? q.indice_en : q.indice_fr;
    questionIndice.textContent = hint;
    questionIndice.style.display = "block";
    btnIndice.disabled = true; // Disable the hint button after one use
  } else {
    questionIndice.textContent = isEnglish
      ? "No hint available for this question."
      : "Aucun indice disponible pour cette question.";
    questionIndice.style.display = "block";
  }
});

function showQuestion() {
  clearInterval(timerId);
  const q = parsedQuestions[currentQuestionIndex];

  // Update question text and answers
  const questionTextContent = isEnglish ? q.text_en : q.text_fr;
  const questionAnswers = isEnglish ? q.answers_en : q.answers_fr;

  questionText.textContent = questionTextContent;
  questionIndice.style.display = "none"; // Hide hint by default

  // Update hint button
  btnIndice.disabled = false; // Re-enable the hint button for the new question
  btnIndice.addEventListener("click", showHint); // Ensure the click listener is attached

  // Hide or show progress based on mode
  if (isInfiniteMode) {
    progressText.style.display = "none"; // Hide the "x/x" progress
  } else {
    progressText.style.display = "block"; // Show the "x/x" progress
    currentQuestionIndexSpan.textContent = currentQuestionIndex + 1; // Current question
    totalQuestionsSpan.textContent = parsedQuestions.length; // Total questions
  }

  // Clear and populate answers
  answersDiv.innerHTML = "";
  questionAnswers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.textContent = answer;
    btn.addEventListener("click", () => selectAnswer(index, btn));
    answersDiv.appendChild(btn);
  });

  // Reset buttons and timers
  nextBtn.classList.add("hidden");
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

// Function to display the hint
function showHint() {
  const q = parsedQuestions[currentQuestionIndex];
  const hint = isEnglish ? q.indice_en : q.indice_fr;

  if (hint) {
    questionIndice.textContent = hint;
    questionIndice.style.display = "block"; // Show the hint text
  } else {
    questionIndice.textContent = isEnglish
      ? "No hint available for this question."
      : "Aucun indice disponible pour cette question.";
    questionIndice.style.display = "block"; // Show fallback message
  }

  btnIndice.disabled = true; // Disable hint button after one use
}

function selectAnswer(index, btnClicked) {
  const q = parsedQuestions[currentQuestionIndex];
  clearInterval(timerId);

  if (index === q.correct) {
    score++;
    btnClicked.classList.add("correct");
  } else {
    btnClicked.classList.add("wrong");
  }

  const allButtons = answersDiv.querySelectorAll("button");
  if (q.correct < allButtons.length) {
    allButtons[q.correct].classList.add("correct");
  }

  lockAnswers();
  nextBtn.classList.remove("hidden");
}

function lockAnswers() {
  const allButtons = answersDiv.querySelectorAll("button");
  allButtons.forEach(b => b.disabled = true);
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < parsedQuestions.length) {
    showQuestion();
  } else if (isInfiniteMode) {
    currentQuestionIndex = 0; // Loop back to the first question
    parsedQuestions = shuffle(questions); // Optionally reshuffle
    showQuestion();
  } else {
    endQuiz(); // End quiz for non-infinite mode
  }
}


function endQuiz() {
  if (isInfiniteMode) {
    startQuiz(); // Restart quiz immediately in infinite mode
  } else {
    questionScreen.style.display = "none";
    resultScreen.style.display = "block";

    scoreText.textContent = `${score} / ${parsedQuestions.length}`;
    if (score > bestScore) {
      bestScore = score;
      saveBestScore();
    }
    bestScoreEnd.textContent = bestScore;
  }
}


function restartQuiz() {
  resultScreen.style.display = "none";
  questionScreen.style.display = "none";
  introScreen.style.display = "block";
  isInfiniteMode = false;
  bestScoreValue.textContent = bestScore;
}

function shuffle(array) {
  return array.sort(() => 0.5 - Math.random());
}
