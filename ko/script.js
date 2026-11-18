/* ===== Study Quest — 퀴즈 로직 (모든 퀴즈 페이지 공통) ===== */
/* 문제 표시, 채점, 결과 저장을 처리합니다.                  */

// 공유 Supabase 클라이언트 가져오기
import { supabase } from "../supabase.js";

// 페이지가 로드될 때까지 기다렸다가 실행
document.addEventListener("DOMContentLoaded", function () {

  // --- 페이지의 <script type="application/json">에서 퀴즈 데이터 읽기 ---
  var dataElement = document.getElementById("quiz-data");
  if (!dataElement) return; // 퀴즈 데이터가 없으면 중단

  var data = JSON.parse(dataElement.textContent);
  var questions = data.questions;       // 문제 배열
  var resultsUrl = data.resultsUrl;     // 퀴즈 종료 후 이동할 페이지
  var xpPerCorrect = 10;               // 정답당 획득 XP

  // --- 퀴즈 상태 ---
  var currentIndex = 0;     // 현재 문제 번호 (0 = 첫 번째)
  var score = 0;            // 정답 개수
  var xp = 0;               // 획득한 총 XP
  var wrongTopics = [];     // 틀린 주제 목록

  // --- 필요한 HTML 요소 가져오기 ---
  var progressLabel = document.getElementById("progress-label");
  var progressFill = document.getElementById("progress-fill");
  var questionText = document.getElementById("question-text");
  var answerBox = document.getElementById("answer-options");
  var explanation = document.getElementById("explanation");
  var scoreBox = document.getElementById("score-box");
  var nextBtn = document.getElementById("next-btn");

  // 한 번에 하나의 문제 표시
  function showQuestion() {
    var q = questions[currentIndex];

    // 진행 바와 라벨 업데이트 ("문제 1 / 3")
    var progressPercent = (currentIndex / questions.length) * 100;
    progressFill.style.width = progressPercent + "%";
    progressLabel.textContent =
      data.labels.question + " " + (currentIndex + 1) + " " +
      data.labels.of + " " + questions.length;

    // 문제 텍스트 표시
    questionText.textContent = q.question;

    // 답변 버튼 만들기
    answerBox.innerHTML = "";        // 이전 버튼 제거
    answerBox.classList.remove("locked"); // 클릭 잠금 해제
    explanation.classList.remove("visible"); // 이전 설명 숨기기
    nextBtn.classList.remove("visible");    // 다음 버튼 숨기기

    // 각 답변 옵션마다 버튼 생성
    q.options.forEach(function (option, i) {
      var btn = document.createElement("button");
      btn.className = "answer-option";
      btn.textContent = option;
      // 클릭 시 정답 여부 확인
      btn.addEventListener("click", function () {
        handleAnswer(i, q, btn);
      });
      answerBox.appendChild(btn);
    });
  }

  // 학생이 답변을 클릭했을 때 호출
  function handleAnswer(chosenIndex, q, clickedBtn) {
    // 모든 버튼 잠금 (다시 클릭할 수 없도록)
    answerBox.classList.add("locked");
    var allButtons = answerBox.querySelectorAll(".answer-option");

    // 정답을 초록색으로 강조
    allButtons[q.correct].classList.add("correct");

    // 오답을 클릭한 경우 빨간색으로 표시
    if (chosenIndex !== q.correct) {
      clickedBtn.classList.add("wrong");
      wrongTopics.push(q.topic); // 취약 주제 기록
    } else {
      // 정답! 점수와 XP 증가
      score++;
      xp += xpPerCorrect;
      scoreBox.textContent = data.labels.score + ": " + xp;
    }

    // 한 줄 설명 표시
    explanation.textContent = q.explanation;
    explanation.classList.add("visible");

    // 진행 바를 답변한 문제 수에 맞게 업데이트
    progressFill.style.width =
      ((currentIndex + 1) / questions.length) * 100 + "%";

    // 다음 버튼 표시 (마지막 문제에서는 라벨이 변경됨)
    if (currentIndex === questions.length - 1) {
      nextBtn.textContent = data.labels.viewResults;
    } else {
      nextBtn.textContent = data.labels.next;
    }
    nextBtn.classList.add("visible");
  }

  // 학생이 "다음"을 클릭했을 때 호출
  async function nextQuestion() {
    currentIndex++;
    if (currentIndex < questions.length) {
      // 다음 문제 표시
      showQuestion();
    } else {
      // 퀴즈 완료 — 결과를 sessionStorage에 저장하여
      // 결과 페이지에서 표시할 수 있도록 함
      sessionStorage.setItem("sq-score", score);
      sessionStorage.setItem("sq-total", questions.length);
      sessionStorage.setItem("sq-xp", xp);
      sessionStorage.setItem("sq-topics", JSON.stringify(wrongTopics));
      sessionStorage.setItem("sq-subject", data.subject || "");

      // 로그인된 경우, 퀴즈 결과를 Supabase에 저장하고 XP 추가
      var { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        // quiz_results 테이블에 행 삽입
        await supabase.from("quiz_results").insert({
          subject: data.subject || "",
          score: score,
          total: questions.length,
          xp_earned: xp,
        });

        // 이 사용자의 profiles 총 XP에 획득한 XP 추가
        await supabase.rpc("add_xp", { xp_to_add: xp }).catch(function () {});
      }

      // 결과 페이지로 이동
      window.location.href = resultsUrl;
    }
  }

  // 다음 버튼에 이벤트 연결
  nextBtn.addEventListener("click", nextQuestion);

  // 퀴즈 시작!
  showQuestion();
});
