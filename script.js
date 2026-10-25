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

const themeButton = document.querySelector("#themeButton");
const nicknameInput = document.querySelector("#nickname");
const nicknameCount =  document.querySelector("#nicknameCount");
const agreeCheck = document.querySelector("#agreeCheck");
const agreeMessage = document.querySelector("#agreeMessage");
const startButton = document.querySelector("#startButton");

function handleThemeClick(){
    const isDark = document.body.classList.toggle("dark");

    themeButton.textContent = isDark ? "라이트 테마로 바꾸기" : "다크 테마로 바꾸기";
}

themeButton.addEventListener("click", handleThemeClick);

function handleNicknameInput(){
    const maxLength = nicknameInput.maxLength;
    const currentLength = Math.min(nicknameInput.value.length, maxLength);

    nicknameCount.textContent = currentLength + " / " + maxLength;
}

nicknameInput.addEventListener("input", handleNicknameInput);

function handleAgreeChange(){
    const agreed = agreeCheck.checked;

    startButton.disabled = !agreed;
    agreeMessage.textContent = agreed
        ? "훈련 설정을 시작할 수 있습니다."
        : "동의 후 훈련 설정을 시작할 수 있습니다.";

    if(agreed) {
        agreeMessage.classList.add("is-ready");
    } else {
        agreeMessage.classList.remove("is-ready");
    }
}

agreeCheck.addEventListener("change", handleAgreeChange);

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

const trainingFlow = document.querySelector("#training-flow");
const flowSteps = trainingFlow.querySelectorAll(".step");
const progressItems = trainingFlow.querySelectorAll(".progress_item");
const nameInput = document.querySelector("#learner-name");
const nameError = document.querySelector("#name-error");
const nameNext = document.querySelector("#name-next");
const difficultyRange = document.querySelector("#difficulty-range");
const difficultyValue = document.querySelector("#difficulty-value");
const timeOption = document.querySelector("#time-option");
const timeOptions = document.querySelector("#time-options");
const optionPrev = document.querySelector("#option-prev");
const optionNext = document.querySelector("#option-next");
const summaryPrev = document.querySelector("#summary-prev");
const finishButton = document.querySelector("#finish-button");
const restartButton = document.querySelector("#restart-button");
const summaryName = document.querySelector("#summary-name");
const summaryDifficulty = document.querySelector("#summary-difficulty");
const summaryTime = document.querySelector("#summary-time");
const difficultyValues = ["쉬움", "보통", "어려움"];

const formData = {
    name : "", difficulty : "보통", time : false, trainingTime : "10"
};

function showStep(index){
    flowSteps.forEach((step, i) => {step.hidden = i !== index;});
    progressItems.forEach((item, i) => {
        item.classList.toggle("is-active", i === index);
    });
}

const memoryDialog = document.querySelector("#memory-dialog");
const memoryCancel = document.querySelector("#memory-cancel");
const memoryConfirm = document.querySelector("#memory-confirm");

function revokeMemoryAgreement(){
    agreeCheck.checked = false;
    trainingFlow.hidden = true;
    handleAgreeChange();
    agreeCheck.focus();
}

startButton.addEventListener("click", () => {
    if(!agreeCheck.checked) return;
    memoryDialog.showModal();
});
memoryCancel.addEventListener("click", () => {
    memoryDialog.close();
    revokeMemoryAgreement();
});
memoryDialog.addEventListener("cancel", revokeMemoryAgreement);
memoryConfirm.addEventListener("click", () => {
    if(!agreeCheck.checked) return;
    memoryDialog.close();
    trainingFlow.hidden = false;
    showStep(0);
    trainingFlow.scrollIntoView({behavior : "smooth"});
    nameInput.focus();
});

function validateName(){
    const value = nameInput.value.trim();
    if(!value){
        nameError.textContent = "학습자 이름을 입력해주세요.";
        nameInput.classList.add("has-error");
        nameInput.focus();
        return false;
    }
    nameError.textContent = "";
    nameInput.classList.remove("has-error");
    formData.name = value;
    return true;
}

nameNext.addEventListener("click", () => {
    if(!validateName()) return;
    showStep(1);
});

difficultyRange.addEventListener("input", () => {
    difficultyValue.value = difficultyValues[difficultyRange.value];
});
timeOption.addEventListener("change", () => {
    timeOptions.hidden = !timeOption.checked;
});

optionPrev.addEventListener("click", () => showStep(0));
optionNext.addEventListener("click", () => {
    formData.difficulty = difficultyValues[difficultyRange.value];
    formData.time = timeOption.checked;
    const count = document.querySelector('input[name="training-time"]:checked');
    formData.trainingTime = count.value;
    summaryName.textContent = formData.name;
    summaryDifficulty.textContent = formData.difficulty;
    summaryTime.textContent = formData.time
        ? formData.trainingTime + "분" : "설정 안 함";

    showStep(2);
});

summaryPrev.addEventListener("click", () => showStep(1));
finishButton.addEventListener("click", () => showStep(3));
restartButton.addEventListener("click", () => {
    formData.name = "";
    formData.difficulty = "보통";
    formData.time = false;
    formData.trainingTime = "10";
    nameInput.value = "";
    nameError.textContent = "";
    nameInput.classList.remove("has-error");
    difficultyRange.value = "1";
    difficultyValue.value = "보통";
    timeOption.checked = false;
    timeOptions.hidden = true;
    document.querySelector('input[name="training-time"][value="10"]').checked = true;
    summaryName.textContent = "";
    summaryDifficulty.textContent = "";
    summaryTime.textContent = "";
    showStep(0);
});