const serviceName = "MemoryUp";
let isSubscribed = false;
let submitCount = 0;

function makeSubscribeMessage(email, subscribed){
    if(subscribed == true) {
        return email + "로 신청이 완료되었습니다.";
    }

    return "이메일을 입력한 뒤 신청해주세요.";
}

const subscribeForm = document.querySelector("#subscribe-form");
const emailInput = document.querySelector("#email");

const subscribeButton = document.querySelector("#subscribeButton");
const subscribeMessage = document.querySelector("#subscribeMessage");

function handleSubscribe(event) {
    event.preventDefault();

    const subscriberEmail = emailInput.value.trim();

    if(subscriberEmail === "") {
        subscribeMessage.textContent =
            "이메일을 입력한 뒤 신청해주세요.";
        emailInput.focus();
        return;
    }

    isSubscribed = true;
    submitCount += 1;

    subscribeMessage.textContent = 
        makeSubscribeMessage(subscriberEmail, isSubscribed);

    subscribeMessage.classList.add("is-success");

    subscribeButton.textContent = "신청 완료";
    subscribeButton.disabled = true;
}

subscribeForm.addEventListener("submit", handleSubscribe);

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function resetTabsAndPanels() {
    tabs.forEach(function (tab) {
        tab.classList.remove("is-active");
        tab.setAttribute("aria-selected", "false");
    });
    panels.forEach(function (panel){
        panel.classList.remove("is-active");
        panel.hidden = true;
    });
}

function activateTab(clickedTab) {
    const targetSelector = clickedTab.dataset.target;
    const targetPanel = document.querySelector(targetSelector);

    clickedTab.classList.add("is-active");
    clickedTab.setAttribute("aria-selected", "true");

    targetPanel.classList.add("is-active");
    targetPanel.hidden = false;
}

function handleTabClick(event){
    resetTabsAndPanels();
    activateTab(event.currentTarget);
}

tabs.forEach(function (tab) {
    tab.addEventListener("click", handleTabClick);
});

// 기억력 미니 퀴즈
const quizMemory = document.querySelector("#quiz-memory");
const quizQuestion = document.querySelector("#quiz-question");
const quizResult = document.querySelector("#quiz-result");
const quizNext = document.querySelector("#quiz-next");
const quizPrev = document.querySelector("#quiz-prev");
const quizSubmit = document.querySelector("#quiz-submit");
const quizRetry = document.querySelector("#quiz-retry");
const quizError = document.querySelector("#quiz-error");
const quizResultTitle = document.querySelector("#quiz-result-title");
const quizResultMessage = document.querySelector("#quiz-result-message");
const quizStepText = document.querySelector("#quiz-step-text");
const quizStepCount = document.querySelector("#quiz-step-count");
const quizProgressItems = document.querySelectorAll(".quiz-progress-item");

// 퀴즈 단계 변경
function showQuizStep(index) {
    quizMemory.hidden = index !== 0;
    quizQuestion.hidden = index !== 1;
    quizResult.hidden = index !== 2;

    const stepNames = [
        "STEP 01 · 그림 기억하기",
        "STEP 02 · 문제 풀기",
        "STEP 03 · 결과 확인"
    ];
    quizStepText.textContent = stepNames[index];

// 현재 단계 번호 표시
    if (index === 0) {
        quizStepCount.textContent = "1 / 3";
    } else if (index === 1) {
        quizStepCount.textContent = "2 / 3";
    } else {
        quizStepCount.textContent = "3 / 3";
    }
}

// 정답을 선택했는지 확인하고 결과 표시
quizSubmit.addEventListener("click", () => {
    const selectedAnswer = document.querySelector('input[name="quiz-answer"]:checked');

    if (!selectedAnswer) {
        quizError.textContent = "정답을 선택해주세요.";
        return;
    }
    quizError.textContent = "";

// 사과를 선택하면 정답, 나머지는 오답
    if (selectedAnswer.value === "apple") {
        quizResultTitle.textContent = "정답입니다!";
        quizResultMessage.textContent = "정확하게 기억했어요!";
    } else {
        quizResultTitle.textContent = "틀렸어요!";
        quizResultMessage.textContent = "정답은 사과였어요. 다시 도전해보세요!";
    }
    showQuizStep(2);
});

// 그림을 기억한 후 문제 화면으로 이동
    quizNext.addEventListener("click", () => {
        showQuizStep(1);
    });

// 이전 단계로 돌아가 그림 다시 보기
    quizPrev.addEventListener("click", () => {
        showQuizStep(0);
    });

// 퀴즈를 처음 상태로 초기화
quizRetry.addEventListener("click", () => {
    const selectedAnswer = document.querySelector('input[name="quiz-answer"]:checked');
    if (selectedAnswer) {
        selectedAnswer.checked = false;
    }
    quizError.textContent = "";
    quizResultTitle.textContent = "";
    quizResultMessage.textContent = "";
    showQuizStep(0);
});

// 기억력 훈련 계획 만들기
const storageKey = "memoryup-training-plans-v1";
const form = document.querySelector("#plan-form");
const steps = [...document.querySelectorAll(".flow-step")];
const progressItems = [...document.querySelectorAll(".progress-item")];
const titleInput = document.querySelector("#training-title");
const titleError = document.querySelector("#title-error");
const titleField = document.querySelector("#title-field");
const titleHelp = document.querySelector("#title-help");
const titleCount = document.querySelector("#title-count");
const nicknameInput = document.querySelector("#nickname");
const nicknameCount = document.querySelector("#nickname-count");
const timeOption = document.querySelector("#time-option");
const timeOptions = document.querySelector("#time-options");
const timeInputs = document.querySelectorAll('input[name="training-time"]');
const planList = document.querySelector("#plan-list");
const emptyState = document.querySelector("#empty-state");
const planCount = document.querySelector("#plan-count");
const archiveStatus = document.querySelector("#archive-status");
const planDialog = document.querySelector("#plan-dialog");
const navLinks = document.querySelectorAll(".main-nav a");
const filterButtons = document.querySelectorAll(".filter-button");
let currentFilter = "all";
const saveButton = document.querySelector("#save-plan");
const submitStatus = document.querySelector("#submit-status");
const completeMessage = document.querySelector("#complete-message");
let isSubmitting = false;

function readPlans() {
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");

        if (!Array.isArray(stored)) return [];

        return stored
            .filter((plan) =>
                plan &&
                typeof plan.id === "string" &&
                typeof plan.title === "string"
            )
            .map((plan) => ({
                id: plan.id,
                title: plan.title.slice(0, 60),
                nickname: typeof plan.nickname === "string"
                    ? plan.nickname.slice(0, 10) : "",
                difficulty: ["easy", "normal", "hard"].includes(plan.difficulty)
                    ? plan.difficulty : "normal",
                timeIncluded: plan.timeIncluded === true,
                trainingTime: ["5", "10", "15"].includes(plan.trainingTime)
                    ? plan.trainingTime : "10",
                cancelled: plan.cancelled === true,
                createdAt: typeof plan.createdAt === "string"
                    ? plan.createdAt : ""
            }));
    } catch {
        return [];
    }
}

let plans = readPlans();
let currentStep = 1;

// 계획 저장
function savePlans() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(plans));
        return true;
    } catch {
        return false;
    }
}

function showStep(number) {
    currentStep = number;

    steps.forEach((step) => {
        step.hidden = Number(step.dataset.step) !== number;
    });

    progressItems.forEach((item, index) => {
        const isCurrent = index === number - 1;

        item.classList.toggle("is-current", isCurrent);
        item.classList.toggle("is-done", index < number - 1);

        if (isCurrent && number <= 3) {
            item.setAttribute("aria-current", "step");
        } else {
            item.removeAttribute("aria-current");
        }
    });

    const heading = steps[number - 1].querySelector("h3");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });

    document.querySelector("#planner").scrollIntoView({
        block: "start",
        behavior: "smooth"
    });
}

function updateTitleExperience(){
    const length = titleInput.value.length;
    const valid = titleInput.value.trim().length >= 2;
    const hasError = titleInput.getAttribute("aria-invalid") === "true";

    titleCount.textContent = length + " / 60자";
    titleField.classList.toggle("has-error", hasError);
    titleField.classList.toggle("is-valid", valid && !hasError);
    titleHelp.textContent = hasError
        ? "제목 입력 조건을 다시 확인해 주세요."
        : valid
            ? "입력 조건을 충족했습니다."
    : "2자 이상 60자 이하로 입력해 주세요."
}

// 훈련 제목 입력
function validateTitle() {
    const title = titleInput.value.trim();
    if (!title) {
        titleError.textContent =
            "훈련 제목을 입력해 주세요.";
        titleInput.setAttribute("aria-invalid", "true");
        updateTitleExperience();
        titleInput.focus();
        return false;
    }
    if (title.length < 2) {
        titleError.textContent ="훈련 제목은 최소 2자 이상이어야 합니다.";
        titleInput.setAttribute("aria-invalid", "true");
        updateTitleExperience();
        titleInput.focus();
        return false;
    }
    titleError.textContent = "";
    titleInput.removeAttribute("aria-invalid");
    updateTitleExperience();
    return true;
}

// 입력한 내용 가져오기
function getFormValues() {
    return {
        title: titleInput.value.trim(),
        nickname: nicknameInput.value.trim(),
        difficulty: form.querySelector(
            'input[name="difficulty"]:checked'
        ).value,
        timeIncluded: timeOption.checked,
        trainingTime: form.querySelector(
            'input[name="training-time"]:checked'
        ).value
    };
}

// 난이도
function difficultyText(plan) {
    if (plan.difficulty === "easy") return "쉬움";
    if (plan.difficulty === "hard") return "어려움";
    return "보통";
}

// 훈련 시간
function timeText(plan) {
    return plan.timeIncluded
        ? `${plan.trainingTime}분`
        : "설정 안 함";
}

// 입력 내용 확인 화면
function updateSummary() {
    const values = getFormValues();

    document.querySelector("#summary-title").textContent =
        values.title;

    document.querySelector("#summary-nickname").textContent =
        values.nickname || "입력 안 함";

    document.querySelector("#summary-difficulty").textContent =
        difficultyText(values);

    document.querySelector("#summary-time").textContent =
        timeText(values);
}

function setSubmitState(state, message){
    isSubmitting = state === "loading";
    form.setAttribute("aria-busy", String(isSubmitting));
    saveButton.disabled = isSubmitting;
    saveButton.textContent = isSubmitting ? "저장하는 중..." : "계획 저장하기";
    submitStatus.textContent = message;
    submitStatus.classList.toggle("is-success", state === "success");
    submitStatus.classList.toggle("has-error", state === "error");
}

// 제목 입력 시 오류 상태 다시 검사
titleInput.addEventListener("input", () => {
    if (titleInput.getAttribute("aria-invalid") === "true") {
        validateTitle();
    } else{
        updateTitleExperience();
    }
});

// 학습자 이름 글자 수 표시
nicknameInput.addEventListener("input", () => {
    nicknameCount.textContent =
        `${nicknameInput.value.length} / 10자`;
});

function syncTimeOptions(){
    const open = timeOption.checked;
    timeOption.setAttribute("aria-expanded", String(open));
    timeOptions.hidden = !open;
    timeInputs.forEach((input) => {
        input.disabled = !open;
    });
}

// 훈련 시간 설정 여부
timeOption.addEventListener("change", syncTimeOptions);
syncTimeOptions();

// 폼 제출
form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (currentStep === 1) {
        if(validateTitle()) showStep(2);
        return;
    }
        if(currentStep !== 3 || isSubmitting) return;

        if(!validateTitle()) {
            showStep(1);
            titleInput.focus();
            return;
        }

        setSubmitState("loading", "입력한 계획을 저장하고 있습니다.");
        window.setTimeout(() => {
            if(!saveCurrentPlan()) {
                setSubmitState("error", "계획을 저장하지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요.");
                return;
            }
            setSubmitState("success", "계획 저장이 완료되었습니다.");
            showStep(4);
        }, 600); 
});

// 1단계 -> 2단계
document.querySelector("#info-next").addEventListener("click", () => {
if (validateTitle()) showStep(2);
});
// 2단계 -> 1단계
document.querySelector("#option-prev").addEventListener("click", () => {
    showStep(1);
});
// 2단계 -> 3단계
document.querySelector("#option-next").addEventListener("click", () => {
    updateSummary();
    showStep(3);
});

// 정보 수정
document.querySelector("#edit-info").addEventListener("click", () => {
    showStep(1);
});

// 조건 수정
document.querySelector("#edit-options").addEventListener("click", () => {
    showStep(2);
});

function saveCurrentPlan() {
    const plan = {
        id: typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
        ...getFormValues(),
        cancelled: false,
        createdAt: new Date().toISOString()
    };

    plans.unshift(plan);
    if(!savePlans()) {
        plans.shift();
        return false;
    }

    renderPlans();
    archiveStatus.textContent = `‘${plan.title}’ 계획을 저장했습니다.`;
    completeMessage.textContent = `‘${plan.title}’ 계획을 내 계획에서 다시 확인할 수 있습니다.`;
    return true;
}

// 새 계획 만들기
document.querySelector("#restart-button").addEventListener("click", () => {
    form.reset();
    syncTimeOptions();
    nicknameCount.textContent = "0 / 10자";
    titleError.textContent = "";
    titleInput.removeAttribute("aria-invalid");
    titleField.classList.remove("is-valid", "has-error");
    updateTitleExperience();
    setSubmitState("idle", "");

    showStep(1);
    titleInput.focus();
});

function createText(tag, className, content) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = content;
    return element;
}

function updateCurrentNav() {
    const currentHash = window.location.hash;

    navLinks.forEach((link) => {
        const current = currentHash
        ? link.getAttribute("href") === currentHash
        : link === navLinks[0];

        link.classList.toggle("is-current", current);

        if(current){
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}

window.addEventListener("hashchange", updateCurrentNav);
updateCurrentNav();

function getVisiblePlans(){
    return plans.filter((plan) => {
        if(currentFilter === "all") return true;
        if(currentFilter === "canceled") return plan.cancelled;
        return !plan.cancelled;
    });
}

// 저장된 계획 목록 표시
function renderPlans() {
    const visiblePlans = getVisiblePlans();

    planList.replaceChildren();
    emptyState.hidden = visiblePlans.length !== 0;
    planList.hidden = visiblePlans.length === 0;
    
    const emptyTitle = emptyState.querySelector("h3");
    const emptyDescription = emptyState.querySelector("p");
    const emptyAction = emptyState.querySelector("a");

    if(visiblePlans.length === 0){
        const filtered = currentFilter !== "all";
        emptyTitle.textContent = filtered
            ? "선택한 상태의 계획이 없어요."
            : "아직 저장한 계획이 없어요.";
        emptyDescription.textContent = filtered
            ? "다른 상태를 계획해 보세요."
            : "첫 발표 훈련 계획을 만들면 이곳에서 다시 볼 수 있습니다.";
        emptyAction.hidden = filtered;
    }

    planCount.textContent = String(visiblePlans.length);
    planCount.setAttribute(
        "aria-label",
        `현재 표시 중인 계획 ${visiblePlans.length}개`
    );

    visiblePlans.forEach((plan) => {
        const card = document.createElement("li");

        card.className =
            `plan-card${plan.cancelled ? " is-cancelled" : ""}`;

        const top = document.createElement("div");
        top.className = "plan-card-top";

        top.append(
            createText(
                "span",
                "plan-state",
                plan.cancelled ? "취소됨" : "저장됨"
            )
        );

        const date = new Date(plan.createdAt);

        if (!Number.isNaN(date.getTime())) {
            top.append(
                createText(
                    "time",
                    "plan-date",
                    new Intl.DateTimeFormat("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }).format(date)
                )
            );
        }

        card.append(top);
        card.append(createText("h3", "plan-title", plan.title));

        card.append(
            createText(
                "p",
                "plan-meta",
                `${difficultyText(plan)} 난이도 · ${timeText(plan)}`
            )
        );

        const actions = document.createElement("div");
        actions.className = "plan-actions";

        const openButton = createText(
            "button",
            "button button-secondary",
            "내용 보기"
        );

        openButton.type = "button";
        openButton.dataset.action = "open";
        openButton.dataset.id = plan.id;

        const toggleButton = createText(
            "button",
            "button button-text",
            plan.cancelled ? "취소 되돌리기" : "계획 취소하기"
        );

        toggleButton.type = "button";
        toggleButton.dataset.action = "toggle";
        toggleButton.dataset.id = plan.id;

        actions.append(openButton, toggleButton);
        card.append(actions);
        planList.append(card);
    });
}

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach((item) => {
            const selected = item === button;
            item.classList.toggle("is-active", selected);
            item.setAttribute("aria-pressed", String(selected));
        });

        renderPlans();
    });
});

// 저장한 계획 보기 및 취소
planList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const plan = plans.find(
        (item) => item.id === button.dataset.id
    );

    if (!plan) return;

    // 계획 상세 보기
    if (button.dataset.action === "open") {
        document.querySelector("#dialog-title").textContent =
            plan.title;

        document.querySelector("#dialog-status").textContent =
            plan.cancelled ? "취소된 계획입니다." : "저장된 계획입니다.";

        document.querySelector("#dialog-nickname").textContent =
            plan.nickname || "입력 안 함";

        document.querySelector("#dialog-difficulty").textContent =
            difficultyText(plan);

        document.querySelector("#dialog-time").textContent =
            timeText(plan);

        planDialog.showModal();
        return;
    }

    // 계획 취소 및 복구
    const wasCancelled = plan.cancelled;
    plan.cancelled = !wasCancelled;

    const persisted = savePlans();
    renderPlans();

    archiveStatus.textContent = persisted
        ? `‘${plan.title}’ 계획을 ${wasCancelled
            ? "다시 사용할 수 있습니다"
            : "취소했습니다"}.`
        : "상태를 변경했지만, 브라우저 저장 공간을 사용할 수 없어 새로고침하면 사라질 수 있습니다.";

    const nextButton = [
        ...planList.querySelectorAll('button[data-action="toggle"]')
    ].find((item) => item.dataset.id === plan.id);

    nextButton?.focus();
});

// 팝업 닫기
document.querySelector("#dialog-close").addEventListener("click", () => {
    planDialog.close();
});

document.querySelector("#dialog-done").addEventListener("click", () => {
    planDialog.close();
});

// 다크 모드
const themeButton = document.querySelector("#theme-button");

if (themeButton) {
    themeButton.addEventListener("click", () => {
        const dark = document.body.classList.toggle("dark");

        themeButton.textContent =
            dark ? "라이트 모드" : "다크 모드";

        themeButton.setAttribute("aria-pressed", String(dark));
    });
}

// 저장된 계획 초기 표시
renderPlans();