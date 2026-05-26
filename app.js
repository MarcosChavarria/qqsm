const prizeLevels = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000];
    const safeLevelIndexes = [4, 7];
    const QUESTIONS_PER_RUN = 10;
    const SCORE_STORAGE_KEY = "qqsm_scores_v1";

    const fallbackQuestions = [
      {
        "question": "Choose the correct past tense sentence:",
        "options": ["Yesterday I goed to school.", "Yesterday I went to school.", "Yesterday I go to school.", "Yesterday I gone to school."],
        "answerIndex": 1
      },
      {
        "question": "What is the past tense of \"play\"?",
        "options": ["playd", "played", "plaid", "plays"],
        "answerIndex": 1
      },
      {
        "question": "Complete: She ____ a cake last night.",
        "options": ["baked", "bake", "bakes", "boken"],
        "answerIndex": 0
      },
      {
        "question": "What is the past tense of \"see\"?",
        "options": ["seed", "saw", "seen", "see"],
        "answerIndex": 1
      },
      {
        "question": "Choose the correct sentence:",
        "options": ["He writed a letter.", "He wrote a letter.", "He written a letter.", "He write a letter."],
        "answerIndex": 1
      },
      {
        "question": "What is the past tense of \"study\"?",
        "options": ["studied", "studyed", "studys", "stude"],
        "answerIndex": 0
      },
      {
        "question": "Complete: They ____ football after school.",
        "options": ["play", "played", "plaid", "playing"],
        "answerIndex": 1
      },
      {
        "question": "What is the past tense of \"eat\"?",
        "options": ["ate", "eated", "eaten", "eat"],
        "answerIndex": 0
      },
      {
        "question": "Choose the correct question in past tense:",
        "options": ["Did you watched the movie?", "Did you watch the movie?", "Did you watching the movie?", "Do you watched the movie?"],
        "answerIndex": 1
      },
      {
        "question": "Complete: We ____ very happy yesterday.",
        "options": ["was", "were", "are", "be"],
        "answerIndex": 1
      },
      {
        "question": "What is the past tense of \"take\"?",
        "options": ["tooked", "taken", "took", "take"],
        "answerIndex": 2
      },
      {
        "question": "Choose the correct sentence:",
        "options": ["I didn't went to class.", "I didn't go to class.", "I not went to class.", "I didn't gone to class."],
        "answerIndex": 1
      }
    ];

    let questionBank = [];
    let questions = [];
    let questionsLoaded = false;
    let currentIndex = 0;
    let selectedIndex = null;
    let currentMoney = 0;
    let gameEnded = false;
    let eliminatedSet = new Set();
    let currentSource = "Fallback";
    let currentPlayerName = "Player";
    let scoreSavedForCurrentGame = false;
    let audioCtx = null;

    const lifelinesUsed = {
      fifty: false,
      teacher: false,
      changeQuestion: false
    };

    const playerNameEl = document.getElementById("playerName");
    const questionNumberEl = document.getElementById("questionNumber");
    const moneyEl = document.getElementById("money");
    const levelEl = document.getElementById("level");
    const questionTextEl = document.getElementById("questionText");
    const questionSourceEl = document.getElementById("questionSource");
    const optionsContainerEl = document.getElementById("optionsContainer");
    const messageEl = document.getElementById("message");
    const ladderEl = document.getElementById("ladder");
    const confirmBtn = document.getElementById("confirmBtn");
    const nextBtn = document.getElementById("nextBtn");
    const restartBtn = document.getElementById("restartBtn");
    const newPlayerBtn = document.getElementById("newPlayerBtn");
    const fiftyBtn = document.getElementById("fiftyBtn");
    const teacherBtn = document.getElementById("teacherBtn");
    const changeQuestionBtn = document.getElementById("changeQuestionBtn");
    const resultModal = document.getElementById("resultModal");
    const resultCard = document.getElementById("resultCard");
    const resultTitle = document.getElementById("resultTitle");
    const resultText = document.getElementById("resultText");
    const closeResultBtn = document.getElementById("closeResultBtn");
    const startModal = document.getElementById("startModal");
    const playerInput = document.getElementById("playerInput");
    const startGameBtn = document.getElementById("startGameBtn");
    const scoreboardEl = document.getElementById("scoreboard");
    const scoreEmptyEl = document.getElementById("scoreEmpty");

    function formatMoney(value) {
      return "$" + value.toLocaleString("en-US");
    }

    function sanitizeName(value) {
      const cleaned = String(value || "").replace(/\s+/g, " ").trim();
      return cleaned ? cleaned.slice(0, 24) : "Player";
    }

    function setQuestionSourceLabel(source) {
      currentSource = source;
      questionSourceEl.textContent = source;
    }

    function ensureAudio() {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    }

    function playTone(freq, duration = 0.14, type = "sine", volume = 0.03, delay = 0) {
      if (!audioCtx) return;
      const startAt = audioCtx.currentTime + delay;
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.02);
    }

    function sfxCorrect() {
      playTone(523, 0.12, "triangle", 0.04, 0);
      playTone(659, 0.12, "triangle", 0.04, 0.12);
    }

    function sfxWrong() {
      playTone(220, 0.22, "sawtooth", 0.03, 0);
      playTone(165, 0.28, "sawtooth", 0.025, 0.15);
    }

    function sfxLifeline() {
      playTone(440, 0.08, "square", 0.02, 0);
      playTone(554, 0.08, "square", 0.02, 0.08);
    }

    function sfxCelebrate() {
      playTone(523, 0.1, "triangle", 0.035, 0);
      playTone(659, 0.1, "triangle", 0.035, 0.1);
      playTone(784, 0.16, "triangle", 0.04, 0.2);
    }

    function readScores() {
      try {
        const raw = localStorage.getItem(SCORE_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    function writeScores(scores) {
      localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
    }

    function renderTopScores() {
      const top = readScores()
        .filter(entry => Number(entry.amount) > 0)
        .sort((a, b) => (b.amount - a.amount) || (b.time - a.time))
        .slice(0, 5);

      scoreboardEl.innerHTML = "";
      scoreEmptyEl.hidden = top.length > 0;

      top.forEach((entry) => {
        const item = document.createElement("li");
        item.textContent = `${entry.name} - ${formatMoney(entry.amount)}`;
        scoreboardEl.appendChild(item);
      });
    }

    function saveScoreOnce() {
      if (scoreSavedForCurrentGame) return;
      if (currentMoney <= 0) {
        scoreSavedForCurrentGame = true;
        renderTopScores();
        return;
      }
      const scores = readScores();
      scores.push({
        name: currentPlayerName,
        amount: currentMoney,
        time: Date.now()
      });
      writeScores(scores);
      scoreSavedForCurrentGame = true;
      renderTopScores();
    }

    function updateStatus() {
      questionNumberEl.textContent = Math.min(currentIndex + 1, questions.length);
      moneyEl.textContent = formatMoney(currentMoney);
      levelEl.textContent = String(Math.min(currentIndex + 1, prizeLevels.length));
      renderLadder();
    }

    function renderLadder() {
      ladderEl.innerHTML = "";
      for (let i = 0; i < prizeLevels.length; i++) {
        const item = document.createElement("div");
        const isCurrent = i === currentIndex;
        const isSafe = safeLevelIndexes.includes(i);
        item.className = "ladder-item" + (isCurrent ? " current" : "") + (isSafe ? " safe" : "");
        const leftLabel = isSafe ? `Level ${i + 1} (Safe)` : `Level ${i + 1}`;
        item.innerHTML = `<span>${leftLabel}</span><span>${formatMoney(prizeLevels[i])}</span>`;
        ladderEl.appendChild(item);
      }
    }

    function getGuaranteedMoney(lastCorrectIndex) {
      let guaranteed = 0;
      safeLevelIndexes.forEach((safeIndex) => {
        if (lastCorrectIndex >= safeIndex) guaranteed = prizeLevels[safeIndex];
      });
      return guaranteed;
    }

    function showResultPopup(mode, amount) {
      resultCard.classList.remove("win", "motivation");
      if (mode === "win") {
        resultCard.classList.add("win");
        resultTitle.textContent = "Great Performance!";
        resultText.textContent = `You finished the game with ${formatMoney(amount)}.`;
      } else {
        resultCard.classList.add("motivation");
        resultTitle.textContent = "Keep Going!";
        resultText.textContent = "You earned $0 this time, but you are improving. Try again and reach the safe levels.";
      }
      resultModal.classList.add("show");
    }

    function hideResultPopup() {
      resultModal.classList.remove("show");
    }

    function resetRoundState() {
      selectedIndex = null;
      eliminatedSet = new Set();
      confirmBtn.disabled = true;
      nextBtn.disabled = true;
      messageEl.textContent = "";
    }

    function renderQuestion() {
      if (!questions.length) {
        questionTextEl.textContent = "No questions available.";
        optionsContainerEl.innerHTML = "";
        confirmBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }
      const q = questions[currentIndex];
      resetRoundState();
      questionTextEl.textContent = q.question;
      optionsContainerEl.innerHTML = "";

      q.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.className = "option";
        btn.textContent = `${String.fromCharCode(65 + index)}. ${opt}`;
        btn.type = "button";
        btn.addEventListener("click", () => selectOption(index));
        optionsContainerEl.appendChild(btn);
      });
      updateStatus();
    }

    function selectOption(index) {
      if (gameEnded || eliminatedSet.has(index)) return;
      selectedIndex = index;
      confirmBtn.disabled = false;
      const optionButtons = optionsContainerEl.querySelectorAll(".option");
      optionButtons.forEach((btn, i) => btn.classList.toggle("selected", i === index));
    }

    function finishGame() {
      gameEnded = true;
      saveScoreOnce();
      if (currentMoney === 0) {
        showResultPopup("motivation", currentMoney);
      } else {
        showResultPopup("win", currentMoney);
        sfxCelebrate();
      }
      updateStatus();
    }

    function confirmAnswer() {
      if (selectedIndex === null || gameEnded) return;
      ensureAudio();

      const q = questions[currentIndex];
      const optionButtons = optionsContainerEl.querySelectorAll(".option");
      optionButtons.forEach(btn => btn.disabled = true);

      const correct = selectedIndex === q.answerIndex;
      optionButtons[q.answerIndex].classList.add("correct");

      if (correct) {
        sfxCorrect();
        currentMoney = prizeLevels[currentIndex] || currentMoney;
        messageEl.textContent = "Correct answer. You can continue to the next question.";
        if (currentIndex === questions.length - 1 || currentIndex === prizeLevels.length - 1) {
          messageEl.textContent = `Great job! You finished with ${formatMoney(currentMoney)}.`;
          confirmBtn.disabled = true;
          finishGame();
          return;
        }
        nextBtn.disabled = false;
      } else {
        sfxWrong();
        optionButtons[selectedIndex].classList.add("wrong");
        const lastCorrectIndex = currentIndex - 1;
        currentMoney = getGuaranteedMoney(lastCorrectIndex);
        messageEl.textContent = `Incorrect. Game over. You return to your last safe checkpoint: ${formatMoney(currentMoney)}.`;
        confirmBtn.disabled = true;
        finishGame();
        return;
      }

      confirmBtn.disabled = true;
      updateStatus();
    }

    function nextQuestion() {
      if (gameEnded) return;
      currentIndex += 1;
      renderQuestion();
    }

    function restartGame() {
      currentIndex = 0;
      selectedIndex = null;
      currentMoney = 0;
      gameEnded = false;
      scoreSavedForCurrentGame = false;
      lifelinesUsed.fifty = false;
      lifelinesUsed.teacher = false;
      lifelinesUsed.changeQuestion = false;
      [fiftyBtn, teacherBtn, changeQuestionBtn].forEach(btn => btn.classList.remove("used"));
      fiftyBtn.disabled = false;
      teacherBtn.disabled = false;
      changeQuestionBtn.disabled = false;
      const source = questionBank.length ? questionBank : fallbackQuestions;
      questions = getRandomQuestions(source, Math.min(QUESTIONS_PER_RUN, source.length, prizeLevels.length));
      hideResultPopup();
      renderQuestion();
    }

    function useFiftyFifty() {
      if (lifelinesUsed.fifty || gameEnded) return;
      ensureAudio();
      sfxLifeline();
      const q = questions[currentIndex];
      const wrongIndexes = q.options.map((_, i) => i).filter(i => i !== q.answerIndex);

      for (let i = wrongIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wrongIndexes[i], wrongIndexes[j]] = [wrongIndexes[j], wrongIndexes[i]];
      }

      const toEliminate = wrongIndexes.slice(0, 2);
      const optionButtons = optionsContainerEl.querySelectorAll(".option");
      toEliminate.forEach(i => {
        eliminatedSet.add(i);
        optionButtons[i].disabled = true;
        optionButtons[i].classList.add("eliminated");
        optionButtons[i].classList.remove("selected");
        if (selectedIndex === i) selectedIndex = null;
      });

      if (selectedIndex === null) confirmBtn.disabled = true;
      lifelinesUsed.fifty = true;
      fiftyBtn.classList.add("used");
      fiftyBtn.disabled = true;
      messageEl.textContent = "50-50 used: two incorrect options were removed.";
    }

    function markTeacherTip() {
      if (gameEnded) return;
      ensureAudio();
      sfxLifeline();
      lifelinesUsed.teacher = !lifelinesUsed.teacher;
      teacherBtn.classList.toggle("used", lifelinesUsed.teacher);
      messageEl.textContent = lifelinesUsed.teacher
        ? "Teacher tip marked as used."
        : "Teacher tip mark removed.";
    }

    function useQuestionChange() {
      if (gameEnded || lifelinesUsed.changeQuestion) return;
      if (!questions.length) return;
      ensureAudio();
      sfxLifeline();

      const candidates = questionBank.filter(q => !questions.includes(q));
      if (!candidates.length) {
        messageEl.textContent = "No extra questions available to replace this one.";
        return;
      }

      const replacement = candidates[Math.floor(Math.random() * candidates.length)];
      questions[currentIndex] = replacement;
      lifelinesUsed.changeQuestion = true;
      changeQuestionBtn.classList.add("used");
      changeQuestionBtn.disabled = true;
      renderQuestion();
      messageEl.textContent = "Question changed.";
    }

    function getRandomQuestions(source, count) {
      const clone = [...source];
      for (let i = clone.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
      }
      return clone.slice(0, Math.min(count, clone.length));
    }

    async function loadQuestions() {
      if (window.location.protocol === "file:") {
        questionBank = fallbackQuestions;
        setQuestionSourceLabel("Fallback");
        messageEl.textContent = "JSON blocked by browser CORS in file:// mode. Run a local server and open http://localhost:8000/.";
        questions = getRandomQuestions(
          questionBank,
          Math.min(QUESTIONS_PER_RUN, questionBank.length, prizeLevels.length)
        );
        questionsLoaded = true;
        renderQuestion();
        return;
      }

      try {
        const response = await fetch("qqsm_questions.json");
        if (!response.ok) throw new Error("Could not load JSON");
        const data = await response.json();
        if (!Array.isArray(data) || data.length < 1) throw new Error("Invalid question format");
        questionBank = data;
        setQuestionSourceLabel("JSON");
      } catch {
        questionBank = fallbackQuestions;
        setQuestionSourceLabel("Fallback");
        messageEl.textContent = "Could not load external JSON. Fallback questions were loaded.";
      }

      questions = getRandomQuestions(
        questionBank,
        Math.min(QUESTIONS_PER_RUN, questionBank.length, prizeLevels.length)
      );
      questionsLoaded = true;
      renderQuestion();
    }

    async function startGame() {
      ensureAudio();
      currentPlayerName = sanitizeName(playerInput.value);
      playerNameEl.textContent = currentPlayerName;
      startModal.classList.remove("show");

      if (!questionsLoaded) {
        await loadQuestions();
      } else {
        restartGame();
      }
    }

    function promptNewPlayer() {
      hideResultPopup();
      playerInput.value = "";
      startModal.classList.add("show");
      playerInput.focus();
    }

    confirmBtn.addEventListener("click", confirmAnswer);
    nextBtn.addEventListener("click", nextQuestion);
    restartBtn.addEventListener("click", restartGame);
    newPlayerBtn.addEventListener("click", promptNewPlayer);
    fiftyBtn.addEventListener("click", useFiftyFifty);
    teacherBtn.addEventListener("click", markTeacherTip);
    changeQuestionBtn.addEventListener("click", useQuestionChange);
    closeResultBtn.addEventListener("click", hideResultPopup);
    resultModal.addEventListener("click", (event) => {
      if (event.target === resultModal) hideResultPopup();
    });
    startGameBtn.addEventListener("click", startGame);
    playerInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") startGame();
    });

    renderTopScores();
    playerInput.focus();
