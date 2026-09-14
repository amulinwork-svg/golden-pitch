alert("script.js загружен");

const telegramApp = window.Telegram?.WebApp;
const greeting = document.querySelector("#telegramGreeting");

if (!greeting) {
  alert("Элемент telegramGreeting не найден");
} else if (!telegramApp) {
  greeting.textContent =
    "Telegram WebApp API не найден. Обычный запуск.";
  greeting.classList.remove("hidden");
} else if (!telegramApp.initData) {
  greeting.textContent =
    "Telegram найден, но initData отсутствует.";
  greeting.classList.remove("hidden");
} else if (!telegramApp.initDataUnsafe?.user) {
  greeting.textContent =
    "initData есть, но пользователь не передан.";
  greeting.classList.remove("hidden");
} else {
  greeting.textContent =
    `Привет, ${telegramApp.initDataUnsafe.user.first_name || "игрок"}!`;
  greeting.classList.remove("hidden");
}