const QUESTION_BANK_STORAGE_KEY = "qqsm_question_bank_v1";
    let questions = [];
    let currentQuestionIndex = 0;

    const addQuestionBtn = document.getElementById("addQuestionBtn");
    const saveBtn = document.getElementById("saveBtn");
    const exportBtn = document.getElementById("exportBtn");
    const importInput = document.getElementById("importInput");
    const resetBtn = document.getElementById("resetBtn");
    const statusEl = document.getElementById("status");
    const questionsContainer = document.getElementById("questionsContainer");
    const prevQuestionBtn = document.getElementById("prevQuestionBtn");
    const nextQuestionBtn = document.getElementById("nextQuestionBtn");
    const questionPosition = document.getElementById("questionPosition");

    function setStatus(text, type = "info") {
      statusEl.textContent = text;
      statusEl.style.color = type === "error" ? "#ffb4b4" : (type === "ok" ? "#9ef2cf" : "#dcf2ff");
    }

    function defaultQuestion() {
      return {
        question: "Write your question here",
        options: ["Option A", "Option B", "Option C", "Option D"],
        answerIndex: 0
      };
    }

    function isValidQuestion(question) {
      return question &&
        typeof question.question === "string" &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.options.every(opt => typeof opt === "string" && opt.trim().length > 0) &&
        Number.isInteger(question.answerIndex) &&
        question.answerIndex >= 0 &&
        question.answerIndex < question.options.length;
    }

    function readStorageBank() {
      try {
        const raw = localStorage.getItem(QUESTION_BANK_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (Array.isArray(parsed) && parsed.length && parsed.every(isValidQuestion)) {
          return parsed;
        }
      } catch {}
      return null;
    }

    async function readDefaultJsonBank() {
      try {
        const response = await fetch("qqsm_questions.json");
        if (!response.ok) throw new Error("Could not load JSON file.");
        const data = await response.json();
        if (!Array.isArray(data) || !data.length || !data.every(isValidQuestion)) {
          throw new Error("Invalid JSON question format.");
        }
        return data;
      } catch (err) {
        throw new Error(err.message || "Failed to load default JSON.");
      }
    }

    function clampQuestionIndex() {
      if (!questions.length) {
        currentQuestionIndex = 0;
        return;
      }
      currentQuestionIndex = Math.max(0, Math.min(currentQuestionIndex, questions.length - 1));
    }

    function renderQuestionEditor() {
      clampQuestionIndex();
      questionPosition.textContent = `Question ${questions.length ? currentQuestionIndex + 1 : 0} of ${questions.length}`;
      prevQuestionBtn.disabled = currentQuestionIndex <= 0;
      nextQuestionBtn.disabled = currentQuestionIndex >= questions.length - 1;

      if (!questions.length) {
        questionsContainer.innerHTML = "<p class='hint'>No questions loaded.</p>";
        return;
      }

      const index = currentQuestionIndex;
      const q = questions[index];
      questionsContainer.innerHTML = `
        <article class="question-card">
          <div class="card-head">
            <h3 class="card-title">Question ${index + 1}</h3>
            <button id="deleteCurrentBtn" class="danger" type="button">Delete</button>
          </div>
          <div class="row">
            <div>
              <label>Question text</label>
              <textarea id="questionTextInput"></textarea>
            </div>
          </div>
          <div class="row options">
            <div>
              <label>Option A</label>
              <input id="option0Input" type="text">
            </div>
            <div>
              <label>Option B</label>
              <input id="option1Input" type="text">
            </div>
            <div>
              <label>Option C</label>
              <input id="option2Input" type="text">
            </div>
            <div>
              <label>Option D</label>
              <input id="option3Input" type="text">
            </div>
          </div>
          <div class="row">
            <div>
              <label>Correct answer</label>
              <select id="answerSelect">
                <option value="0">A</option>
                <option value="1">B</option>
                <option value="2">C</option>
                <option value="3">D</option>
              </select>
            </div>
          </div>
        </article>
      `;

      const questionTextInput = document.getElementById("questionTextInput");
      const optionInputs = [
        document.getElementById("option0Input"),
        document.getElementById("option1Input"),
        document.getElementById("option2Input"),
        document.getElementById("option3Input")
      ];
      const answerSelect = document.getElementById("answerSelect");
      const deleteCurrentBtn = document.getElementById("deleteCurrentBtn");

      questionTextInput.value = q.question || "";
      questionTextInput.addEventListener("input", (e) => { questions[index].question = e.target.value; });

      for (let i = 0; i < 4; i++) {
        optionInputs[i].value = q.options[i] || "";
        optionInputs[i].addEventListener("input", (e) => { questions[index].options[i] = e.target.value; });
      }

      answerSelect.value = String(q.answerIndex);
      answerSelect.addEventListener("change", (e) => { questions[index].answerIndex = Number(e.target.value); });

      deleteCurrentBtn.addEventListener("click", () => {
        if (questions.length === 1) {
          setStatus("At least one question is required.", "error");
          return;
        }
        questions.splice(index, 1);
        if (currentQuestionIndex >= questions.length) currentQuestionIndex = questions.length - 1;
        renderQuestionEditor();
        setStatus("Question deleted.", "ok");
      });
    }

    function validateAllQuestions() {
      if (!questions.length) throw new Error("Add at least one question.");
      if (!questions.every(isValidQuestion)) {
        throw new Error("Each question must have text, 4 non-empty options, and one correct answer.");
      }
    }

    function saveBank() {
      try {
        validateAllQuestions();
        localStorage.setItem(QUESTION_BANK_STORAGE_KEY, JSON.stringify(questions));
        setStatus("Custom question bank saved. Open the game to use it.", "ok");
      } catch (err) {
        setStatus(err.message, "error");
      }
    }

    function exportBank() {
      try {
        validateAllQuestions();
        const blob = new Blob([JSON.stringify(questions, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "qqsm_questions_custom.json";
        a.click();
        URL.revokeObjectURL(url);
        setStatus("JSON exported successfully.", "ok");
      } catch (err) {
        setStatus(err.message, "error");
      }
    }

    async function importBank(file) {
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed) || !parsed.length || !parsed.every(isValidQuestion)) {
          throw new Error("Imported JSON has invalid format.");
        }
        questions = parsed;
        currentQuestionIndex = 0;
        renderQuestionEditor();
        setStatus("JSON imported. Save to apply in game.", "ok");
      } catch (err) {
        setStatus(err.message || "Import failed.", "error");
      } finally {
        importInput.value = "";
      }
    }

    async function resetToDefault() {
      try {
        const data = await readDefaultJsonBank();
        questions = data;
        localStorage.removeItem(QUESTION_BANK_STORAGE_KEY);
        currentQuestionIndex = 0;
        renderQuestionEditor();
        setStatus("Reset complete. Default JSON restored and custom bank cleared.", "ok");
      } catch (err) {
        setStatus(err.message, "error");
      }
    }

    async function init() {
      const fromStorage = readStorageBank();
      if (fromStorage) {
        questions = fromStorage;
        setStatus("Loaded custom bank from local storage.", "ok");
      } else {
        try {
          questions = await readDefaultJsonBank();
          setStatus("Loaded questions from qqsm_questions.json.", "ok");
        } catch (err) {
          questions = [defaultQuestion()];
          setStatus(`${err.message} Using one blank question.`, "error");
        }
      }
      renderQuestionEditor();
    }

    addQuestionBtn.addEventListener("click", () => {
      questions.push(defaultQuestion());
      currentQuestionIndex = questions.length - 1;
      renderQuestionEditor();
      setStatus("Question added.", "ok");
    });
    prevQuestionBtn.addEventListener("click", () => {
      if (currentQuestionIndex <= 0) return;
      currentQuestionIndex -= 1;
      renderQuestionEditor();
    });
    nextQuestionBtn.addEventListener("click", () => {
      if (currentQuestionIndex >= questions.length - 1) return;
      currentQuestionIndex += 1;
      renderQuestionEditor();
    });
    saveBtn.addEventListener("click", saveBank);
    exportBtn.addEventListener("click", exportBank);
    importInput.addEventListener("change", (e) => importBank(e.target.files[0]));
    resetBtn.addEventListener("click", resetToDefault);

    init();

