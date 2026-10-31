/* ===== Study Quest — Quiz logic (shared by all quiz pages) ===== */
/* No frameworks, no backend — just plain JavaScript. */

// Wait for the page to load before running anything
document.addEventListener("DOMContentLoaded", function () {

  // --- Read the quiz data from the page's <script type="application/json"> ---
  var dataElement = document.getElementById("quiz-data");
  if (!dataElement) return; // stop if no quiz data found

  var data = JSON.parse(dataElement.textContent);
  var questions = data.questions;       // array of question objects
  var resultsUrl = data.resultsUrl;     // where to go after the quiz
  var xpPerCorrect = 10;               // XP earned per correct answer

  // --- Quiz state ---
  var currentIndex = 0;     // which question we're on (0 = first)
  var score = 0;            // correct answers count
  var xp = 0;               // total XP earned
  var wrongTopics = [];     // topics the student got wrong

  // --- Grab the HTML elements we need ---
  var progressLabel = document.getElementById("progress-label");
  var progressFill = document.getElementById("progress-fill");
  var questionText = document.getElementById("question-text");
  var answerBox = document.getElementById("answer-options");
  var explanation = document.getElementById("explanation");
  var scoreBox = document.getElementById("score-box");
  var nextBtn = document.getElementById("next-btn");

  // Show one question at a time
  function showQuestion() {
    var q = questions[currentIndex];

    // Update the progress bar and label ("Question 1 of 3")
    var progressPercent = (currentIndex / questions.length) * 100;
    progressFill.style.width = progressPercent + "%";
    progressLabel.textContent =
      data.labels.question + " " + (currentIndex + 1) + " " +
      data.labels.of + " " + questions.length;

    // Show the question text
    questionText.textContent = q.question;

    // Build the answer buttons
    answerBox.innerHTML = "";        // clear old buttons
    answerBox.classList.remove("locked"); // unlock clicking
    explanation.classList.remove("visible"); // hide old explanation
    nextBtn.classList.remove("visible");    // hide Next button

    // Create one button per answer option
    q.options.forEach(function (option, i) {
      var btn = document.createElement("button");
      btn.className = "answer-option";
      btn.textContent = option;
      // When clicked, check if this answer is correct
      btn.addEventListener("click", function () {
        handleAnswer(i, q, btn);
      });
      answerBox.appendChild(btn);
    });
  }

  // Called when the student clicks an answer
  function handleAnswer(chosenIndex, q, clickedBtn) {
    // Lock all buttons so the student can't click again
    answerBox.classList.add("locked");
    var allButtons = answerBox.querySelectorAll(".answer-option");

    // Highlight the correct answer in green
    allButtons[q.correct].classList.add("correct");

    // If the student picked the wrong answer, show it in red
    if (chosenIndex !== q.correct) {
      clickedBtn.classList.add("wrong");
      wrongTopics.push(q.topic); // remember the weak topic
    } else {
      // Correct! Add to score and XP
      score++;
      xp += xpPerCorrect;
      scoreBox.textContent = data.labels.score + ": " + xp;
    }

    // Show the one-line explanation
    explanation.textContent = q.explanation;
    explanation.classList.add("visible");

    // Update the progress bar to reflect this answered question
    progressFill.style.width =
      ((currentIndex + 1) / questions.length) * 100 + "%";

    // Show the Next button (its label changes on the last question)
    if (currentIndex === questions.length - 1) {
      nextBtn.textContent = data.labels.viewResults;
    } else {
      nextBtn.textContent = data.labels.next;
    }
    nextBtn.classList.add("visible");
  }

  // Called when the student clicks "Next"
  function nextQuestion() {
    currentIndex++;
    if (currentIndex < questions.length) {
      // Show the next question
      showQuestion();
    } else {
      // Quiz finished — save results and go to the results page
      // We store score, XP, and weak topics in the browser's session
      // so the results page can display them.
      sessionStorage.setItem("sq-score", score);
      sessionStorage.setItem("sq-total", questions.length);
      sessionStorage.setItem("sq-xp", xp);
      sessionStorage.setItem("sq-topics", JSON.stringify(wrongTopics));
      sessionStorage.setItem("sq-subject", data.subject || "");
      window.location.href = resultsUrl;
    }
  }

  // Wire up the Next button
  nextBtn.addEventListener("click", nextQuestion);

  // Start the quiz!
  showQuestion();
});
