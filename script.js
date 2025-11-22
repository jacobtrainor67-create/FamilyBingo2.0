// 🎯 Customize your bingo prompts here
const BINGO_ITEMS = [
  "Someone falls asleep on the couch",
  "Political comment causes awkward silence",
  "Someone says they're 'too full' but eats dessert",
  "Football game turned on",
  "Photo of the whole family",
  "Someone forgets something in the oven",
  "Pie is mentioned",
  "Someone talks about work",
  "Old family story is repeated",
  "Someone asks about your love life",
  "Someone arrives late",
  "A kid cries",
  "Someone mentions Black Friday deals",
  "Dish gets mis-identified ('what is this again?')",
  "A relative calls instead of coming",
  "Someone says 'I'm stuffed'",
  "Something gets spilled",
  "Talk about travel plans",
  "Someone needs coffee",
  "Debate about how to carve the turkey",
  "Someone compliments the stuffing",
  "Weather is discussed",
  "Board games or cards come out",
  "Someone talks about sports"
];

const BOARD_SIZE = 5;
const STORAGE_KEY = "thanksgivingFamilyBingoCard_v1";

const cardEl = document.getElementById("card");
const newCardBtn = document.getElementById("new-card-btn");
const toastEl = document.getElementById("toast");

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadCardFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.squares) || !Array.isArray(data.marked)) return null;
    return data;
  } catch {
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
    cardData.marked[index] = !cardData.marked[index];
    cell.classList.toggle("marked", cardData.marked[index]);

    saveCardToStorage(cardData);

    if (checkBingo(cardData.marked)) {
      showToast("BINGO! 🦃");
    }
  };
}

function init() {
  let cardData = loadCardFromStorage();
  if (!cardData) {
    cardData = generateNewCardData();
    saveCardToStorage(cardData);
  }
  renderCard(cardData);
  setupInteractions(cardData);

  newCardBtn.onclick = () => {
    if (!confirm("Generate a new card on this phone?")) return;
    const fresh = generateNewCardData();
    saveCardToStorage(fresh);
    renderCard(fresh);
    setupInteractions(fresh);
  };
}

init();
