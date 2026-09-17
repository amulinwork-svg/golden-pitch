const API_URL = "";

const telegramApp = window.Telegram?.WebApp;

if (telegramApp) {
  telegramApp.ready();
  telegramApp.expand();
}

if (telegramApp?.MainButton) {
  telegramApp.MainButton.hide();
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

const packTypes = {
  starter: {
    price: 10,
    cards: 3,
    rareBonus: 0,
    epicBonus: 0
  },
  premium: {
    price: 25,
    cards: 5,
    rareBonus: 0.15,
    epicBonus: 0.05
  },
  elite: {
    price: 50,
    cards: 7,
    rareBonus: 0.25,
    epicBonus: 0.15
  }
};

const DAILY_BONUS = 25;
const BONUS_INTERVAL = 24 * 60 * 60 * 1000;
const XP_PER_PACK = 20;
const XP_PER_LEVEL = 100;
const LEVEL_REWARD = 50;

const coinsElement = document.querySelector("#coins");
const messageElement = document.querySelector("#message");

const packButtons =
  document.querySelectorAll(".buy-pack");

const modal = document.querySelector("#modal");
const newCardsElement =
  document.querySelector("#newCards");
const closeModalButton =
  document.querySelector("#closeModal");

const collectionElement =
  document.querySelector("#collection");
const cardCountElement =
  document.querySelector("#cardCount");

const filterButtons =
  document.querySelectorAll(".filter-button");

const telegramGreeting =
  document.querySelector("#telegramGreeting");

const closeTelegramApp =
  document.querySelector("#closeTelegramApp");

const detailsModal =
  document.querySelector("#detailsModal");

const detailsCard =
  document.querySelector("#detailsCard");

const closeDetailsButton =
  document.querySelector("#closeDetails");

const deleteCardButton =
  document.querySelector("#deleteCard");

const resetGameButton =
  document.querySelector("#resetGame");

const claimBonusButton =
  document.querySelector("#claimBonus");

const bonusMessage =
  document.querySelector("#bonusMessage");

const levelName =
  document.querySelector("#levelName");

const experienceText =
  document.querySelector("#experienceText");

const experienceFill =
  document.querySelector("#experienceFill");

const levelMessage =
  document.querySelector("#levelMessage");

const authStatus =
  document.querySelector("#authStatus");

let coins = 100;
let collection = [];
let selectedCardIndex = null;
let activeFilter = "Все";
let experience = 0;
let level = 1;
let lastBonusTime = 0;

function loadGame() {
  const savedCoins =
    localStorage.getItem("goldenPitchCoins");

  const savedCollection =
    localStorage.getItem("goldenPitchCollection");

  const savedExperience =
    localStorage.getItem("goldenPitchExperience");

  const savedLevel =
    localStorage.getItem("goldenPitchLevel");

  const savedBonusTime =
    localStorage.getItem("goldenPitchLastBonus");

  coins =
    savedCoins === null
      ? 100
      : Number(savedCoins);

  if (!Number.isFinite(coins)) {
    coins = 100;
  }

  if (!savedCollection) {
    collection = [];
  } else {
    try {
      const parsedCollection =
        JSON.parse(savedCollection);

      collection = Array.isArray(parsedCollection)
        ? parsedCollection
        : [];
    } catch (error) {
      console.error(
        "Ошибка загрузки коллекции:",
        error
      );

      collection = [];
    }
  }

  experience =
    savedExperience === null
      ? 0
      : Number(savedExperience);

  if (
    !Number.isFinite(experience) ||
    experience < 0
  ) {
    experience = 0;
  }

  level =
    savedLevel === null
      ? 1
      : Number(savedLevel);

  if (
    !Number.isFinite(level) ||
    level < 1
  ) {
    level = 1;
  }

  lastBonusTime =
    savedBonusTime === null
      ? 0
      : Number(savedBonusTime);

  if (
    !Number.isFinite(lastBonusTime) ||
    lastBonusTime < 0
  ) {
    lastBonusTime = 0;
  }

  updateCoinsDisplay();
  updateCollection();
  updateProgress();
  updateBonusButton();
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

function saveProgress() {
  localStorage.setItem(
    "goldenPitchExperience",
    String(experience)
  );

  localStorage.setItem(
    "goldenPitchLevel",
    String(level)
  );
}

function updateCoinsDisplay() {
  if (coinsElement) {
    coinsElement.textContent = coins;
  }
}

function updateProgress() {
  if (
    !levelName ||
    !experienceText ||
    !experienceFill
  ) {
    return;
  }

  levelName.textContent =
    `УРОВЕНЬ ${level}`;

  experienceText.textContent =
    `${experience} / ${XP_PER_LEVEL} XP`;

  experienceFill.style.width =
    `${Math.min(
      experience / XP_PER_LEVEL,
      1
    ) * 100}%`;
}

function addExperience(amount) {
  experience += amount;

  let levelUp = false;

  while (experience >= XP_PER_LEVEL) {
    experience -= XP_PER_LEVEL;
    level += 1;
    coins += LEVEL_REWARD;
    levelUp = true;
  }

  saveProgress();
  saveGame();
  updateCoinsDisplay();
  updateProgress();

  if (levelMessage) {
    levelMessage.textContent = levelUp
      ? `Новый уровень! +${LEVEL_REWARD} монет`
      : `Получено +${amount} XP`;
  }

  if (levelUp) {
    hapticNotification("success");
  }
}

function updateBonusButton() {
  if (
    !claimBonusButton ||
    !bonusMessage
  ) {
    return;
  }

  const timePassed =
    Date.now() - lastBonusTime;

  if (timePassed >= BONUS_INTERVAL) {
    claimBonusButton.disabled = false;
    claimBonusButton.textContent = "Забрать";
    bonusMessage.textContent =
      "Ежедневная награда уже доступна";
    return;
  }

  claimBonusButton.disabled = true;

  const hoursLeft = Math.ceil(
    (BONUS_INTERVAL - timePassed) /
      (60 * 60 * 1000)
  );

  claimBonusButton.textContent =
    `Через ${hoursLeft} ч.`;

  bonusMessage.textContent =
    "Ты уже получил бонус сегодня";
}

function claimDailyBonus() {
  if (
    !claimBonusButton ||
    Date.now() - lastBonusTime <
      BONUS_INTERVAL
  ) {
    return;
  }

  coins += DAILY_BONUS;
  lastBonusTime = Date.now();

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

function choosePlayer(pack) {
  const randomNumber = Math.random();
  let selectedRarity = "Обычная";

  if (
    randomNumber <
    0.08 + pack.epicBonus
  ) {
    selectedRarity = "Эпическая";
  } else if (
    randomNumber <
    0.35 + pack.rareBonus
  ) {
    selectedRarity = "Редкая";
  }

  const availablePlayers =
    players.filter(
      (player) =>
        player.rarity === selectedRarity
    );

  return availablePlayers[
    Math.floor(
      Math.random() * availablePlayers.length
    )
  ];
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
    <div class="card-rating">
      ${player.rating}
    </div>

    <div class="card-position">
      ${player.position}
    </div>

    <img
      class="player-image"
      src="${player.image}"
      alt="Вымышленный игрок ${player.name}"
      onerror="this.style.display='none'"
    >

    <div class="card-info">
      <div class="card-name">
        ${player.name}
      </div>

      <div class="card-rarity">
        ${player.rarity}
      </div>

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
      <div class="details-rating">
        ${player.rating}
      </div>

      <div class="details-position">
        ${player.position}
      </div>

      <img
        class="details-image"
        src="${player.image}"
        alt="Вымышленный игрок ${player.name}"
        onerror="this.style.display='none'"
      >

      <div class="details-info">
        <p class="details-rarity">
          ${player.rarity}
        </p>

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
  if (
    !collectionElement ||
    !cardCountElement
  ) {
    return;
  }

  const filteredCollection =
    activeFilter === "Все"
      ? collection
      : collection.filter(
          (player) =>
            player.rarity === activeFilter
        );

  if (filteredCollection.length === 0) {
    collectionElement.className =
      "collection empty";

    collectionElement.textContent =
      collection.length === 0
        ? "Здесь появятся твои игроки"
        : "В этой категории пока нет карточек";
  } else {
    collectionElement.className = "collection";
    collectionElement.innerHTML = "";

    filteredCollection.forEach((player) => {
      const originalIndex =
        collection.indexOf(player);

      const card = createCard(player);

      card.addEventListener("click", () => {
        selectedCardIndex = originalIndex;
        createDetailsCard(player);

        if (detailsModal) {
          detailsModal.classList.remove(
            "hidden"
          );
        }

        hapticImpact("light");
      });

      collectionElement.appendChild(card);
    });
  }

  cardCountElement.textContent =
    activeFilter === "Все"
      ? `${collection.length} карт`
      : `${filteredCollection.length} из ${collection.length}`;
}

function openPack(packId = "starter") {
  const pack = packTypes[packId];

  if (!pack) {
    return;
  }

  if (coins < pack.price) {
    if (messageElement) {
      messageElement.textContent =
        "Недостаточно монет для этого пака";
    }

    hapticNotification("error");
    return;
  }

  coins -= pack.price;
  updateCoinsDisplay();

  packButtons.forEach((button) => {
    button.disabled = true;
  });

  if (messageElement) {
    messageElement.textContent =
      "Открываем пак...";
  }

  setTimeout(() => {
    const newPlayers = [];

    for (
      let index = 0;
      index < pack.cards;
      index += 1
    ) {
      newPlayers.push(choosePlayer(pack));
    }

    collection.push(...newPlayers);

    addExperience(XP_PER_PACK);
    saveGame();
    updateCollection();

    if (newCardsElement) {
      newCardsElement.innerHTML = "";

      newPlayers.forEach((player, index) => {
        const card = createCard(player);

        card.style.animationDelay =
          `${index * 100}ms`;

        newCardsElement.appendChild(card);
      });
    }

    if (modal) {
      modal.classList.remove("hidden");
    }

    packButtons.forEach((button) => {
      button.disabled = false;
    });

    if (messageElement) {
      messageElement.textContent =
        "Выбери пак для открытия";
    }

    hapticNotification("success");
  }, 700);
}

async function openPackOnServer(packId) {
  const pack = packTypes[packId];

  if (!pack) {
    return;
  }

  if (!telegramApp?.initData) {
    openPack(packId);
    return;
  }

  if (coins < pack.price) {
    if (messageElement) {
      messageElement.textContent =
        "Недостаточно монет для этого пака";
    }

    hapticNotification("error");
    return;
  }

  packButtons.forEach((button) => {
    button.disabled = true;
  });

  if (messageElement) {
    messageElement.textContent =
      "Сервер открывает пак...";
  }

  try {
    const response = await fetch(
      `${API_URL}/api/open-pack`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          initData: telegramApp.initData,
          packId
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "Не удалось открыть пак"
      );
    }

    const newPlayers = Array.isArray(data.cards)
      ? data.cards
      : [];

    applyServerProfile(data.profile);

    if (newCardsElement) {
      newCardsElement.innerHTML = "";

      newPlayers.forEach((player, index) => {
        const card = createCard(player);

        card.style.animationDelay =
          `${index * 100}ms`;

        newCardsElement.appendChild(card);
      });
    }

    if (modal) {
      modal.classList.remove("hidden");
    }

    if (messageElement) {
      messageElement.textContent =
        "Выбери пак для открытия";
    }

    hapticNotification("success");
  } catch (error) {
    console.error(
      "Ошибка открытия пака:",
      error
    );

    if (messageElement) {
      messageElement.textContent =
        `Ошибка: ${error.message}`;
    }

    hapticNotification("error");
  } finally {
    packButtons.forEach((button) => {
      button.disabled = false;
    });
  }
}

async function checkServer() {
  if (!telegramApp?.initData) {
    if (authStatus) {
      authStatus.textContent =
        "Telegram initData отсутствует";
      authStatus.classList.add("warning");
    }

    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/auth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          initData: telegramApp.initData
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "Авторизация не прошла"
      );
    }

    if (authStatus) {
      authStatus.textContent =
        `Сервер подтвердил Telegram: ${
          data.user?.first_name || "игрок"
        }`;

      authStatus.classList.remove("warning");
      authStatus.classList.add("success");
    }
  } catch (error) {
    console.error(
      "Ошибка серверной авторизации:",
      error
    );

    if (authStatus) {
      authStatus.textContent =
        `Ошибка авторизации: ${error.message}`;

      authStatus.classList.remove("success");
      authStatus.classList.add("warning");
    }
  }
}

async function loadServerProfile() {
  if (!telegramApp?.initData) {
    throw new Error(
      "Telegram initData отсутствует"
    );
  }

  const response = await fetch(
    `${API_URL}/api/profile`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        initData: telegramApp.initData
      })
    }
  );

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Сервер вернул не JSON: ${responseText.slice(0, 160)}`
    );
  }

  if (!response.ok || !data.success) {
    throw new Error(
      data.error ||
      `HTTP ошибка ${response.status}`
    );
  }

  return data.profile;
}

function applyServerProfile(profile) {
  if (!profile) {
    return;
  }

  coins = Number(profile.coins) || 0;
  experience = Number(profile.experience) || 0;
  level = Number(profile.level) || 1;

  collection = Array.isArray(profile.collection)
    ? profile.collection
    : [];

  lastBonusTime =
    Number(profile.last_bonus_at) || 0;

  updateCoinsDisplay();
  updateCollection();
  updateProgress();
  updateBonusButton();

  saveGame();
  saveProgress();

  localStorage.setItem(
    "goldenPitchLastBonus",
    String(lastBonusTime)
  );
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

  if (messageElement) {
    messageElement.textContent =
      "Карточка удалена из коллекции";
  }

  hapticNotification("warning");
}

function confirmDeleteCard() {
  if (selectedCardIndex === null) {
    return;
  }

  const selectedPlayer =
    collection[selectedCardIndex];

  if (
    telegramApp &&
    typeof telegramApp.showPopup === "function"
  ) {
    telegramApp.showPopup(
      {
        title: "Удалить карточку?",
        message:
          `Карточка «${selectedPlayer.name}» ` +
          "будет удалена из коллекции.",
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

  if (
    window.confirm(
      `Удалить карточку «${selectedPlayer.name}»?`
    )
  ) {
    deleteSelectedCard();
  }
}

function resetGame() {
  localStorage.removeItem(
    "goldenPitchCoins"
  );

  localStorage.removeItem(
    "goldenPitchCollection"
  );

  localStorage.removeItem(
    "goldenPitchExperience"
  );

  localStorage.removeItem(
    "goldenPitchLevel"
  );

  localStorage.removeItem(
    "goldenPitchLastBonus"
  );

  coins = 100;
  collection = [];
  experience = 0;
  level = 1;
  lastBonusTime = 0;
  selectedCardIndex = null;

  updateCoinsDisplay();
  updateCollection();
  updateProgress();
  updateBonusButton();

  if (messageElement) {
    messageElement.textContent =
      "Тестовая игра сброшена. " +
      "У тебя снова 100 монет.";
  }

  if (modal) {
    modal.classList.add("hidden");
  }

  if (detailsModal) {
    detailsModal.classList.add("hidden");
  }

  hapticNotification("success");
}

if (packButtons.length > 0) {
  packButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openPackOnServer(button.dataset.pack);
    });
  });
}

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

if (claimBonusButton) {
  claimBonusButton.addEventListener(
    "click",
    claimDailyBonus
  );
}

if (closeModalButton && modal) {
  closeModalButton.addEventListener(
    "click",
    () => {
      modal.classList.add("hidden");
    }
  );
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  });
}

if (closeDetailsButton && detailsModal) {
  closeDetailsButton.addEventListener(
    "click",
    () => {
      detailsModal.classList.add("hidden");
    }
  );
}

if (detailsModal) {
  detailsModal.addEventListener(
    "click",
    (event) => {
      if (event.target === detailsModal) {
        detailsModal.classList.add("hidden");
      }
    }
  );
}

if (deleteCardButton) {
  deleteCardButton.addEventListener(
    "click",
    confirmDeleteCard
  );
}

if (resetGameButton) {
  resetGameButton.addEventListener(
    "click",
    resetGame
  );
}

if (closeTelegramApp) {
  closeTelegramApp.addEventListener(
    "click",
    () => {
      if (telegramApp) {
        telegramApp.close();
      }
    }
  );
}

if (telegramGreeting) {
  const telegramUser =
    telegramApp?.initDataUnsafe?.user;

  if (telegramUser) {
    telegramGreeting.textContent =
      `Привет, ${
        telegramUser.first_name || "игрок"
      }!`;

    telegramGreeting.classList.remove(
      "hidden"
    );
  }
}

loadGame();

if (telegramApp?.MainButton) {
  telegramApp.MainButton.hide();
}

checkServer();

loadServerProfile()
  .then((profile) => {
    applyServerProfile(profile);

    if (authStatus) {
      authStatus.textContent =
        "Профиль загружен из SQLite";
      authStatus.classList.remove("warning");
      authStatus.classList.add("success");
    }
  })
  .catch((error) => {
    console.error(
      "Ошибка загрузки серверного профиля:",
      error
    );

    if (authStatus) {
      authStatus.textContent =
        `Профиль не загружен: ${error.message}`;
      authStatus.classList.remove("success");
      authStatus.classList.add("warning");
    }
  });