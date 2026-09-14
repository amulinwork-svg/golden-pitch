const telegramApp = window.Telegram?.WebApp;

if (telegramApp) {
  telegramApp.ready();
  telegramApp.expand();
}

function hapticImpact(style = "light") {
  telegramApp?.HapticFeedback?.impactOccurred(style);
}

function hapticNotification(type = "success") {
  telegramApp?.HapticFeedback?.notificationOccurred(type);
}

const telegramGreeting = document.querySelector("#telegramGreeting");

if (telegramApp?.initDataUnsafe?.user) {
  const user = telegramApp.initDataUnsafe.user;
  const firstName = user.first_name || "игрок";

  telegramGreeting.textContent = `Привет, ${firstName}!`;
  telegramGreeting.classList.remove("hidden");
}

const players = [
  {
    id: "luka-veil",
    name: "Лука Вейл",
    rarity: "Обычная",
    position: "ПВ",
    rating: 72,
    pace: 78,
    shooting: 64,
    passing: 70,
    defense: 38,
    image: "assets/players/luka-veil.png"
  },
  {
    id: "teo-maren",
    name: "Тео Марен",
    rarity: "Обычная",
    position: "ЦЗ",
    rating: 74,
    pace: 55,
    shooting: 32,
    passing: 61,
    defense: 82,
    image: "assets/players/teo-maren.png"
  },
  {
    id: "nico-solar",
    name: "Нико Солар",
    rarity: "Редкая",
    position: "ЛВ",
    rating: 81,
    pace: 88,
    shooting: 79,
    passing: 76,
    defense: 42,
    image: "assets/players/nico-solar.png"
  },
  {
    id: "elias-crown",
    name: "Элиас Кроун",
    rarity: "Редкая",
    position: "ЦП",
    rating: 83,
    pace: 69,
    shooting: 72,
    passing: 91,
    defense: 68,
    image: "assets/players/elias-crown.png"
  },
  {
    id: "ryan-frost",
    name: "Раян Фрост",
    rarity: "Эпическая",
    position: "ВР",
    rating: 89,
    pace: 52,
    shooting: 20,
    passing: 64,
    defense: 94,
    image: "assets/players/ryan-frost.png"
  },
  {
    id: "orion-vega",
    name: "Орион Вега",
    rarity: "Эпическая",
    position: "НАП",
    rating: 92,
    pace: 93,
    shooting: 96,
    passing: 84,
    defense: 35,
    image: "assets/players/orion-vega.png"
  }
];

const openPackButton = document.querySelector("#openPack");
const coinsElement = document.querySelector("#coins");
const messageElement = document.querySelector("#message");
const modal = document.querySelector("#modal");
const newCardsElement = document.querySelector("#newCards");
const collectionElement = document.querySelector("#collection");
const cardCountElement = document.querySelector("#cardCount");
const closeModalButton = document.querySelector("#closeModal");

let coins = Number(localStorage.getItem("goldenPitchCoins")) || 100;
let collection = JSON.parse(
  localStorage.getItem("goldenPitchCollection") || "[]"
);

coinsElement.textContent = coins;

function choosePlayer() {
  const randomIndex = Math.floor(Math.random() * players.length);
  return players[randomIndex];
}

function createCard(player) {
  const card = document.createElement("article");
  card.className = "card";
  if (player.rarity === "Редкая") {
  card.classList.add("rare");
}

if (player.rarity === "Эпическая") {
  card.classList.add("epic");
}

  card.innerHTML = `
  <div class="card-rating">${player.rating}</div>
  <div class="card-position">${player.position}</div>

  <img
    class="player-image"
    src="${player.image}"
    alt="Вымышленный игрок ${player.name}"
  >

  <div class="card-info">
    <div class="card-name">${player.name}</div>
    <div class="card-rarity">${player.rarity}</div>

    <div class="card-stats">
      <span>СКР ${player.pace}</span>
      <span>УДР ${player.shooting}</span>
      <span>ПАС ${player.passing}</span>
      <span>ЗАЩ ${player.defense}</span>
    </div>
  </div>
`;

  return card;
}

function saveGame() {
  localStorage.setItem("goldenPitchCoins", coins);
  localStorage.setItem(
    "goldenPitchCollection",
    JSON.stringify(collection)
  );
}

function updateCollection() {
  if (collection.length === 0) {
    collectionElement.className = "collection empty";
    collectionElement.textContent = "Здесь появятся твои игроки";
  } else {
    collectionElement.className = "collection";
    collectionElement.innerHTML = "";

    collection.forEach((player) => {
      collectionElement.appendChild(createCard(player));
    });
  }

  cardCountElement.textContent = `${collection.length} карт`;
}

function openPack() {
  hapticImpact("medium");

  if (coins < 10) {
    hapticNotification("error");
    messageElement.textContent = "Недостаточно монет";
    return;
  }

  coins -= 10;
  coinsElement.textContent = coins;
  openPackButton.disabled = true;
  document.querySelector(".pack").classList.add("opening");
  messageElement.textContent = "Открываем пак...";

  setTimeout(() => {
    const newPlayers = [
      choosePlayer(),
      choosePlayer(),
      choosePlayer()
    ];

    collection.push(...newPlayers);
    hapticNotification("success");
    saveGame();
    updateCollection();

    newCardsElement.innerHTML = "";

    newPlayers.forEach((player, index) => {
      const card = createCard(player);
      card.style.animationDelay = `${index * 120}ms`;
      newCardsElement.appendChild(card);
    });

    document.querySelector(".pack").classList.remove("opening");
    modal.classList.remove("hidden");
    openPackButton.disabled = false;
    messageElement.textContent =
      "В паке находятся 3 случайные карточки";
  }, 700);
}

openPackButton.addEventListener("click", openPack);

closeModalButton.addEventListener("click", () => {
  modal.classList.add("hidden");
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
});

updateCollection();

const resetGameButton = document.querySelector("#resetGame");

resetGameButton.addEventListener("click", () => {
  localStorage.removeItem("goldenPitchCoins");
  localStorage.removeItem("goldenPitchCollection");
  location.reload();
});

const closeTelegramApp = document.querySelector("#closeTelegramApp");

closeTelegramApp.addEventListener("click", () => {
  if (telegramApp) {
    telegramApp.close();
  }
});

console.log({
  telegramApp,
  initData: telegramApp?.initData,
  user: telegramApp?.initDataUnsafe?.user
});
