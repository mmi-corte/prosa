export const initUI = ({ onStart, onStop }) => {
  const startButton = document.querySelector("#startButton");
  const stopButton = document.querySelector("#stopButton");

  if (startButton) {
    startButton.addEventListener("click", onStart);
  }

  if (stopButton) {
    stopButton.addEventListener("click", onStop);
  }
};