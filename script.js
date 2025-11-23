// 🎯 Customize your bingo prompts here
const BINGO_ITEMS = [
  "Gary fat shamed",
  "Nana cries",
  "Tonya mentioned",
  "Bad food comment",
  "Sophie picks somebody up",
  "Sister's can't use their phones",
  "Marley gets scraps",
  "Nana pulls out rosary",
  "Nana condescending to Grandma Brown",
  "Papa falls asleep",
  "Papa says he never sees us",
  "Nana's cold",
  "Tammy calls football dumb",
  "Jello mold fails",
  "Someone is called the wrong name",
  "Nana asks us to pray",
  "Something gets spilled",
  "Racism",
  "Tonya shows up",
  "Parade is on TV",
  "Tammy raises voice at someone to get out of kitchen",
  "Sophie gets 'injured'",
  "Nana and Papa show up >2 hours late",
  "Nana and papa stop at McDonalds enroute",
  "Nana accidentally roots for the opposite team as Gary"
];

const BOARD_SIZE = 5;
const STORAGE_KEY = "thanksgivingFamilyBingoCard_v1";

const cardEl = document.getElementById("card");
const newCardBtn = document.getElementById("new-card-btn");
const toastEl = document.getElementById("toast");
const timestampEl = document.getElementById("timestamp");

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateNewCardData() {
  const needed = BOARD_SIZE * BOARD_SIZE - 1; // -1 for free space
  if (BINGO_ITEMS.length < needed) {
    alert("Not enough BINGO_ITEMS defined for a full card.");
    return null;
  }

  const shuffled = shuffle(BINGO_ITEMS);
  const squares = [];
  let idx = 0;

  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    if (i === Math.floor((BOARD_SIZE * BOARD_SIZE) / 2)) {
      squares.push({ text: "FREE", free: true });
    } else {
      squares.push({ text: shuffled[idx++], free: false });
    }
  }

  const marked = squares.map((sq, i) =>
    sq.free && i === Math.floor((BOARD_SIZE * BOARD_SIZE) / 2)
  );

  return {
    squares,
    marked,
    createdAt: new Date().toISOString()
  };
}

function saveCardToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save card to localStorage", e);
  }
}

function loadCardFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.squares) || !Array.isArray(data.marked)) return null;

    // Backward compatibility: if old cards don't have createdAt, assign one
    if (!data.createdAt) {
      data.createdAt = new Date().toISOString();
      saveCardToStorage(data);
    }

    return data;
  } catch (e) {
    console.warn("Could not load card from localStorage", e);
    return null;
  }
}

function renderCard(cardData) {
  cardEl.innerHTML = "";
  cardData.squares.forEach((square, index) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    if (square.free) cell.classList.add("free");
    if (cardData.marked[index]) cell.classList.add("marked");
    cell.textContent = square.text;
    cell.setAttribute("data-index", index);
    cardEl.appendChild(cell);
  });
}

function checkBingo(marked) {
  const n = BOARD_SIZE;
  const lines = [];

  // Rows
  for (let r = 0; r < n; r++) {
    lines.push([...Array(n)].map((_, c) => r * n + c));
  }

  // Columns
  for (let c = 0; c < n; c++) {
    lines.push([...Array(n)].map((_, r) => r * n + c));
  }

  // Diagonals
  lines.push([...Array(n)].map((_, i) => i * n + i));
  lines.push([...Array(n)].map((_, i) => i * n + (n - 1 - i)));

  return lines.some(line => line.every(idx => marked[idx]));
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2000);
}

function setupInteractions(cardData) {
  cardEl.onclick = (event) => {
    const cell = event.target.closest(".cell");
    if (!cell) return;

    const index = Number(cell.getAttribute("data-index"));
    if (Number.isNaN(index)) return;

    cardData.marked[index] = !cardData.marked[index];
    cell.classList.toggle("marked", cardData.marked[index]);

    saveCardToStorage(cardData);

    if (checkBingo(cardData.marked)) {
      showToast("BINGO! 🦃");
    }
  };
}

function displayTimestamp(cardData) {
  if (!cardData || !cardData.createdAt) {
    timestampEl.textContent = "";
    return;
  }
  const date = new Date(cardData.createdAt);
  timestampEl.textContent = "Card created: " + date.toLocaleString();
}

function init() {
  let cardData = loadCardFromStorage();
  if (!cardData) {
    cardData = generateNewCardData();
    if (!cardData) return;
    saveCardToStorage(cardData);
  }

  renderCard(cardData);
  setupInteractions(cardData);
  displayTimestamp(cardData);

  newCardBtn.onclick = () => {
    const confirmNew = confirm(
      "Generate a new card on this phone?\n(This will replace your current card.)"
    );
    if (!confirmNew) return;

    const fresh = generateNewCardData();
    if (!fresh) return;
    saveCardToStorage(fresh);
    renderCard(fresh);
    setupInteractions(fresh);
    displayTimestamp(fresh);
  };
}

init();
