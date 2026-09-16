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

const telegramGreeting = document.querySelector("#telegramGreeting");
const closeTelegramApp = document.querySelector("#closeTelegramApp");

const detailsModal = document.querySelector("#detailsModal");
const detailsCard = document.querySelector("#detailsCard");
const closeDetailsButton = document.querySelector("#closeDetails");
const deleteCardButton = document.querySelector("#deleteCard");

let selectedCardIndex = null;

let coins = Number(localStorage.getItem("goldenPitchCoins")) || 100;

let collection = JSON.parse(
  localStorage.getItem("goldenPitchCollection") || "[]"
);

function loadTelegramGame() {
  if (!telegramApp?.CloudStorage) {
    updateCollection();
    return;
  }

  telegramApp.CloudStorage.getItems(
    ["goldenPitchCoins", "goldenPitchCollection"],
    (error, values) => {
      if (error) {
        console.error("Ошибка загрузки Telegram CloudStorage:", error);
        updateCollection();
        return;
      }

      if (values.goldenPitchCoins !== undefined) {
        coins = Number(values.goldenPitchCoins);
      }

      if (values.goldenPitchCollection !== undefined) {
        try {
          collection = JSON.parse(values.goldenPitchCollection);
        } catch (parseError) {
          console.error("Ошибка чтения коллекции:", parseError);
        }
      }

      if (coinsElement) {
        coinsElement.textContent = coins;
      }

      updateCollection();
    }
  );
}

if (telegramGreeting) {
  const telegramUser = telegramApp?.initDataUnsafe?.user;

  if (telegramUser) {
    telegramGreeting.textContent =
      `Привет, ${telegramUser.first_name || "игрок"}!`;
    telegramGreeting.classList.remove("hidden");
  }
}

if (closeTelegramApp) {
  closeTelegramApp.addEventListener("click", () => {
    if (telegramApp) {
      telegramApp.close();
    }
  });
}

if (coinsElement) {
  coinsElement.textContent = coins;
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

function saveGame() {
  localStorage.setItem("goldenPitchCoins", coins);

  localStorage.setItem(
    "goldenPitchCollection",
    JSON.stringify(collection)
  );

  if (!telegramApp?.CloudStorage) {
    return;
  }

  telegramApp.CloudStorage.setItem(
    "goldenPitchCoins",
    String(coins)
  );

  telegramApp.CloudStorage.setItem(
    "goldenPitchCollection",
    JSON.stringify(collection)
  );
}

function updateCollection() {
  if (!collectionElement || !cardCountElement) {
    return;
  }

  if (collection.length === 0) {
    collectionElement.className = "collection empty";
    collectionElement.textContent = "Здесь появятся твои игроки";
  } else {
    collectionElement.className = "collection";
    collectionElement.innerHTML = "";

    collection.forEach((player, index) => {
      const card = createCard(player);

      card.addEventListener("click", () => {
        selectedCardIndex = index;
        createDetailsCard(player);

        if (detailsModal) {
          detailsModal.classList.remove("hidden");
        }

        hapticImpact("light");
      });

      collectionElement.appendChild(card);
    });
  }

  cardCountElement.textContent = `${collection.length} карт`;
}

function openPack() {
  hapticImpact("medium");

  if (coins < 10) {
    if (messageElement) {
      messageElement.textContent = "Недостаточно монет";
    }

    hapticNotification("error");
    return;
  }

  coins -= 10;

  if (coinsElement) {
    coinsElement.textContent = coins;
  }

  if (openPackButton) {
    openPackButton.disabled = true;
  }

  const packElement = document.querySelector(".pack");

  if (packElement) {
    packElement.classList.add("opening");
  }

  if (messageElement) {
    messageElement.textContent = "Открываем пак...";
  }

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

    if (newCardsElement) {
      newCardsElement.innerHTML = "";

      newPlayers.forEach((player, index) => {
        const card = createCard(player);
        card.style.animationDelay = `${index * 120}ms`;
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

if (deleteCardButton && detailsModal) {
  deleteCardButton.addEventListener("click", () => {
    if (selectedCardIndex === null) {
      return;
    }

    collection.splice(selectedCardIndex, 1);
    selectedCardIndex = null;

    saveGame();
    updateCollection();

    detailsModal.classList.add("hidden");
    hapticNotification("warning");
  });
}

const resetGameButton = document.querySelector("#resetGame");

if (resetGameButton) {
  resetGameButton.addEventListener("click", () => {
    localStorage.removeItem("goldenPitchCoins");
    localStorage.removeItem("goldenPitchCollection");

    if (telegramApp?.CloudStorage) {
      telegramApp.CloudStorage.removeItems(
        [
          "goldenPitchCoins",
          "goldenPitchCollection"
        ],
        (error) => {
          if (error) {
            console.error(
              "Ошибка очистки Telegram CloudStorage:",
              error
            );
          }

          window.location.href =
            window.location.pathname + "?reset=" + Date.now();
        }
      );

      return;
    }

    window.location.href =
      window.location.pathname + "?reset=" + Date.now();
  });
}

loadTelegramGame();
