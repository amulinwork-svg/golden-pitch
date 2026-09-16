const telegramApp = window.Telegram?.WebApp;

if (telegramApp) {
  telegramApp.ready();
  telegramApp.expand();
}

function hapticImpact(style = "light") {
  if (telegramApp?.HapticFeedback) {
    telegramApp.HapticFeedback.impactOccurred(style);
  }
}

function hapticNotification(type = "success") {
  if (telegramApp?.HapticFeedback) {
    telegramApp.HapticFeedback.notificationOccurred(type);
  }
}

function setupTelegramMainButton() {
  const mainButton = telegramApp?.MainButton;

  if (!mainButton) {
    return;
  }

  mainButton.setParams({
    color: "#dcae4d",
    text_color: "#241a08",
    is_active: true
  });

  mainButton.setText("ОТКРЫТЬ ПАК · 10 ◆");
  mainButton.onClick(openPack);
  mainButton.show();
}

function updateTelegramMainButton() {
  const mainButton = telegramApp?.MainButton;

  if (!mainButton) {
    return;
  }

  if (coins < 10) {
    mainButton.setParams({
      color: "#6b6252",
      text_color: "#d2c5a4",
      is_active: false
    });

    mainButton.setText("НЕДОСТАТОЧНО МОНЕТ");
    mainButton.show();

    return;
  }

  mainButton.setParams({
    color: "#dcae4d",
    text_color: "#241a08",
    is_active: true
  });

  mainButton.setText("ОТКРЫТЬ ПАК · 10 ◆");
  mainButton.show();
}

  telegramApp.MainButton.setParams({
    text: "ОТКРЫТЬ ПАК · 10 ◆",
    color: "#dcae4d",
    text_color: "#241a08",
    is_active: true,
    is_visible: true
  });


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
const closeModalButton = document.querySelector("#closeModal");

const collectionElement = document.querySelector("#collection");
const cardCountElement = document.querySelector("#cardCount");

const telegramGreeting = document.querySelector("#telegramGreeting");
const closeTelegramApp = document.querySelector("#closeTelegramApp");

const detailsModal = document.querySelector("#detailsModal");
const detailsCard = document.querySelector("#detailsCard");
const closeDetailsButton = document.querySelector("#closeDetails");
const deleteCardButton = document.querySelector("#deleteCard");

const resetGameButton = document.querySelector("#resetGame");
const filterButtons =
  document.querySelectorAll(".filter-button");

let activeFilter = "Все";

const claimBonusButton =
  document.querySelector("#claimBonus");

const bonusMessage =
  document.querySelector("#bonusMessage");

const DAILY_BONUS = 25;
const BONUS_INTERVAL = 24 * 60 * 60 * 1000;

let lastBonusTime = Number(
  localStorage.getItem("goldenPitchLastBonus") || 0
);

let selectedCardIndex = null;

let coins = 100;
let collection = [];

function updateBonusButton() {
  if (!claimBonusButton || !bonusMessage) {
    return;
  }

  const now = Date.now();
  const timePassed = now - lastBonusTime;
  const timeLeft = BONUS_INTERVAL - timePassed;

  if (timePassed >= BONUS_INTERVAL) {
    claimBonusButton.disabled = false;
    claimBonusButton.textContent = "Забрать";
    bonusMessage.textContent =
      "Ежедневная награда уже доступна";
    return;
  }

  claimBonusButton.disabled = true;

  const hoursLeft = Math.ceil(
    timeLeft / (60 * 60 * 1000)
  );

  claimBonusButton.textContent =
    `Через ${hoursLeft} ч.`;

  bonusMessage.textContent =
    "Ты уже получил бонус сегодня";
}

function claimDailyBonus() {
  if (!claimBonusButton) {
    return;
  }

  const now = Date.now();

  if (now - lastBonusTime < BONUS_INTERVAL) {
    return;
  }

  coins += DAILY_BONUS;
  lastBonusTime = now;

  localStorage.setItem(
    "goldenPitchLastBonus",
    String(lastBonusTime)
  );

  saveGame();
  updateCoinsDisplay();
  updateBonusButton();

  if (messageElement) {
    messageElement.textContent =
      "Ежедневный бонус: +25 монет!";
  }

  hapticNotification("success");
}

function loadGame() {
  const savedCoins = localStorage.getItem("goldenPitchCoins");
  const savedCollection = localStorage.getItem(
    "goldenPitchCollection"
  );

  if (savedCoins === null) {
    coins = 100;
  } else {
    coins = Number(savedCoins);

    if (!Number.isFinite(coins)) {
      coins = 100;
    }
  }

  if (savedCollection === null) {
    collection = [];
  } else {
    try {
      const parsedCollection = JSON.parse(savedCollection);
      collection = Array.isArray(parsedCollection)
        ? parsedCollection
        : [];
    } catch (error) {
      console.error("Ошибка загрузки коллекции:", error);
      collection = [];
    }
  }

  updateCoinsDisplay();
  updateCollection();
}

function saveGame() {
  localStorage.setItem(
    "goldenPitchCoins",
    String(coins)
  );

  localStorage.setItem(
    "goldenPitchCollection",
    JSON.stringify(collection)
  );
}

function resetGame() {
  localStorage.removeItem("goldenPitchCoins");
  localStorage.removeItem("goldenPitchCollection");

  coins = 100;
  collection = [];
  selectedCardIndex = null;

  updateCoinsDisplay();
  updateCollection();

  if (messageElement) {
    messageElement.textContent =
      "Тестовая игра сброшена. У тебя снова 100 монет.";
  }

  if (modal) {
    modal.classList.add("hidden");
  }

  if (detailsModal) {
    detailsModal.classList.add("hidden");
  }

  hapticNotification("success");
}

function updateCoinsDisplay() {
  if (coinsElement) {
    coinsElement.textContent = coins;
  }

  updateTelegramMainButton();
}

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
      onerror="this.style.display='none'"
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

function createDetailsCard(player) {
  if (!detailsCard) {
    return;
  }

  detailsCard.innerHTML = `
    <div class="details-card">
      <div class="details-rating">${player.rating}</div>
      <div class="details-position">${player.position}</div>

      <img
        class="details-image"
        src="${player.image}"
        alt="Вымышленный игрок ${player.name}"
        onerror="this.style.display='none'"
      >

      <div class="details-info">
        <p class="details-rarity">${player.rarity}</p>
        <h2>${player.name}</h2>

        <div class="details-stats">
          <div>
            <span>СКОРОСТЬ</span>
            <strong>${player.pace}</strong>
          </div>

          <div>
            <span>УДАР</span>
            <strong>${player.shooting}</strong>
          </div>

          <div>
            <span>ПАС</span>
            <strong>${player.passing}</strong>
          </div>

          <div>
            <span>ЗАЩИТА</span>
            <strong>${player.defense}</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateCollection() {
  if (!collectionElement || !cardCountElement) {
    return;
  }

  const filteredCollection =
    activeFilter === "Все"
      ? collection
      : collection.filter(
          (player) => player.rarity === activeFilter
        );

  if (filteredCollection.length === 0) {
    collectionElement.className = "collection empty";

    if (collection.length === 0) {
      collectionElement.textContent =
        "Здесь появятся твои игроки";
    } else {
      collectionElement.textContent =
        "В этой категории пока нет карточек";
    }
  } else {
    collectionElement.className = "collection";
    collectionElement.innerHTML = "";

    filteredCollection.forEach((player) => {
      const originalIndex = collection.indexOf(player);
      const card = createCard(player);

      card.addEventListener("click", () => {
        selectedCardIndex = originalIndex;
        createDetailsCard(player);

        if (detailsModal) {
          detailsModal.classList.remove("hidden");
        }

        hapticImpact("light");
      });

      collectionElement.appendChild(card);
    });
  }

  if (activeFilter === "Все") {
    cardCountElement.textContent =
      `${collection.length} карт`;
  } else {
    cardCountElement.textContent =
      `${filteredCollection.length} из ${collection.length}`;
  }
}

function openPack() {
  if (openPackButton?.disabled) {
  return;
  }
  
  if (telegramApp?.MainButton) {
  telegramApp.MainButton.hide();
  }
  
  if (coins < 10) {
    if (messageElement) {
      messageElement.textContent =
        "Недостаточно монет";
    }

    hapticNotification("error");
    updateTelegramMainButton();
    return;
  }

  hapticImpact("medium");

  coins -= 10;
  updateCoinsDisplay();

  if (openPackButton) {
    openPackButton.disabled = true;
  }

  const packElement = document.querySelector(".pack");

  if (packElement) {
    packElement.classList.add("opening");
  }

  if (messageElement) {
    messageElement.textContent =
      "Открываем пак...";
  }

  setTimeout(() => {
    const newPlayers = [
      choosePlayer(),
      choosePlayer(),
      choosePlayer()
    ];

    collection.push(...newPlayers);
    saveGame();
    updateCollection();

    if (newCardsElement) {
      newCardsElement.innerHTML = "";

      newPlayers.forEach((player, index) => {
        const card = createCard(player);
        card.style.animationDelay =
          `${index * 120}ms`;

        newCardsElement.appendChild(card);
      });
    }

    if (packElement) {
      packElement.classList.remove("opening");
    }

    if (modal) {
      modal.classList.remove("hidden");
    }

    if (openPackButton) {
      openPackButton.disabled = false;
    }

    if (messageElement) {
      messageElement.textContent =
        "В паке находятся 3 случайные карточки";
    }

    updateTelegramMainButton();

    hapticNotification("success");
  }, 700);
}

if (openPackButton) {
  openPackButton.addEventListener("click", openPack);
}

if (closeModalButton && modal) {
  closeModalButton.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  });
}

if (closeDetailsButton && detailsModal) {
  closeDetailsButton.addEventListener("click", () => {
    detailsModal.classList.add("hidden");
  });
}

if (detailsModal) {
  detailsModal.addEventListener("click", (event) => {
    if (event.target === detailsModal) {
      detailsModal.classList.add("hidden");
    }
  });
}

function deleteSelectedCard() {
  if (selectedCardIndex === null) {
    return;
  }

  collection.splice(selectedCardIndex, 1);
  selectedCardIndex = null;

  saveGame();
  updateCollection();

  if (detailsModal) {
    detailsModal.classList.add("hidden");
  }

  hapticNotification("warning");

  if (messageElement) {
    messageElement.textContent =
      "Карточка удалена из коллекции";
  }
}

function confirmDeleteCard() {
  if (selectedCardIndex === null) {
    return;
  }

  const selectedPlayer = collection[selectedCardIndex];

  if (telegramApp?.showPopup) {
    telegramApp.showPopup(
      {
        title: "Удалить карточку?",
        message:
          `Карточка «${selectedPlayer.name}» будет удалена из коллекции.`,
        buttons: [
          {
            id: "delete",
            type: "destructive",
            text: "Удалить"
          },
          {
            id: "cancel",
            type: "cancel",
            text: "Отмена"
          }
        ]
      },
      (buttonId) => {
        if (buttonId === "delete") {
          deleteSelectedCard();
        }
      }
    );

    return;
  }

  const confirmed = window.confirm(
    `Удалить карточку «${selectedPlayer.name}»?`
  );

  if (confirmed) {
    deleteSelectedCard();
  }
}

if (deleteCardButton) {
  deleteCardButton.addEventListener(
    "click",
    confirmDeleteCard
  );
}

if (resetGameButton) {
  resetGameButton.addEventListener("click", resetGame);
}

if (closeTelegramApp) {
  closeTelegramApp.addEventListener("click", () => {
    if (telegramApp) {
      telegramApp.close();
    }
  });
}

if (telegramGreeting) {
  const telegramUser = telegramApp?.initDataUnsafe?.user;

  if (telegramUser) {
    telegramGreeting.textContent =
      `Привет, ${telegramUser.first_name || "игрок"}!`;

    telegramGreeting.classList.remove("hidden");
  }
}

console.log("Telegram app:", telegramApp);
console.log("MainButton:", telegramApp?.MainButton);
console.log("Version:", telegramApp?.version);
const telegramDebug = document.querySelector("#telegramDebug");

if (telegramDebug) {
  telegramDebug.textContent =
    `Telegram: ${Boolean(telegramApp)} | ` +
    `MainButton: ${Boolean(telegramApp?.MainButton)} | ` +
    `Версия: ${telegramApp?.version || "нет"}`;
}

if (claimBonusButton) {
  claimBonusButton.addEventListener(
    "click",
    claimDailyBonus
  );
}

updateBonusButton();

if (filterButtons.length > 0) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;

      filterButtons.forEach((item) => {
        item.classList.remove("active");
      });

      button.classList.add("active");
      updateCollection();
      hapticImpact("light");
    });
  });
}

loadGame();
setupTelegramMainButton();
updateTelegramMainButton();