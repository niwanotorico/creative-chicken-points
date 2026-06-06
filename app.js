const storageKey = "creativeChickenPoints.records.v1";
const children = ["ぴよきち", "ぴよみ"];

const form = document.querySelector("#entryForm");
const entryMode = document.querySelector("#entryMode");
const tabs = document.querySelectorAll(".tab");
const childFilter = document.querySelector("#childFilter");
const childName = document.querySelector("#childName");
const titleInput = document.querySelector("#title");
const titleLabel = document.querySelector("#titleLabel");
const pointLabel = document.querySelector("#pointLabel");
const pointsInput = document.querySelector("#points");
const category = document.querySelector("#category");
const photoInput = document.querySelector("#photo");
const preview = document.querySelector("#preview");
const photoPrompt = document.querySelector("#photoPrompt");
const note = document.querySelector("#note");
const saveButton = document.querySelector("#saveButton");
const history = document.querySelector("#history");
const emptyState = document.querySelector("#emptyState");
const template = document.querySelector("#recordTemplate");
const earnedTotal = document.querySelector("#earnedTotal");
const spentTotal = document.querySelector("#spentTotal");
const balanceTotal = document.querySelector("#balanceTotal");
const exportButton = document.querySelector("#exportButton");
const clearFilterButton = document.querySelector("#clearFilterButton");

let records = loadRecords();
let currentPhoto = "";

function loadRecords() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "[]");
  } catch {
    return [];
  }
}

function saveRecords() {
  localStorage.setItem(storageKey, JSON.stringify(records));
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function readPhoto(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

function setMode(mode) {
  entryMode.value = mode;
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));

  const isSpend = mode === "spend";
  titleLabel.textContent = isSpend ? "プリントしたもの" : "作品名";
  pointLabel.textContent = isSpend ? "使った分数" : "ポイント";
  titleInput.placeholder = isSpend ? "例：ドラゴンのキーホルダー" : "例：宇宙のチキン城";
  saveButton.textContent = isSpend ? "プリント時間を記録" : "ポイントを記録";
  category.value = isSpend ? "3Dプリント" : category.value === "3Dプリント" ? "絵" : category.value;
}

function getChildren() {
  const recordedChildren = records.map((record) => record.child).filter(Boolean);
  return [...new Set([...children, ...recordedChildren])].sort((a, b) => a.localeCompare(b, "ja"));
}

function updateChildFilter() {
  const selected = childFilter.value;
  const children = getChildren();
  childFilter.innerHTML = '<option value="all">全員</option>';

  children.forEach((child) => {
    const option = document.createElement("option");
    option.value = child;
    option.textContent = child;
    childFilter.append(option);
  });

  childFilter.value = children.includes(selected) ? selected : "all";
}

function filteredRecords() {
  const selected = childFilter.value;
  if (!selected || selected === "all") return records;
  return records.filter((record) => record.child === selected);
}

function updateTotals() {
  const visible = filteredRecords();
  const earned = visible
    .filter((record) => record.mode === "earn")
    .reduce((sum, record) => sum + record.points, 0);
  const spent = visible
    .filter((record) => record.mode === "spend")
    .reduce((sum, record) => sum + record.points, 0);

  earnedTotal.textContent = earned;
  spentTotal.textContent = `${spent}分`;
  balanceTotal.textContent = `${Math.max(earned - spent, 0)}分`;
}

function renderHistory() {
  const visible = filteredRecords().slice().sort((a, b) => b.createdAt - a.createdAt);
  history.innerHTML = "";
  emptyState.classList.toggle("hidden", visible.length > 0);

  visible.forEach((record) => {
    const card = template.content.firstElementChild.cloneNode(true);
    card.classList.add(record.mode);
    card.querySelector(".record-photo").src =
      record.photo ||
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Crect width='240' height='240' fill='%23e8edf3'/%3E%3Cpath d='M72 150l34-42 24 30 18-22 34 44H72z' fill='%23aeb8c7'/%3E%3Ccircle cx='82' cy='80' r='18' fill='%23c4ccda'/%3E%3C/svg%3E";
    card.querySelector(".record-child").textContent = record.child;
    card.querySelector(".record-points").textContent =
      record.mode === "spend" ? `-${record.points}分` : `+${record.points}pt`;
    card.querySelector("h3").textContent = record.title;
    card.querySelector(".record-meta").textContent = `${record.category}・${formatDate(record.createdAt)}`;
    card.querySelector(".record-note").textContent = record.note || "";
    card.querySelector(".record-note").hidden = !record.note;
    card.querySelector(".delete-button").addEventListener("click", () => {
      records = records.filter((item) => item.id !== record.id);
      saveRecords();
      refresh();
    });
    history.append(card);
  });
}

function refresh() {
  updateChildFilter();
  updateTotals();
  renderHistory();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
});

childFilter.addEventListener("change", () => {
  updateTotals();
  renderHistory();
});

clearFilterButton.addEventListener("click", () => {
  childFilter.value = "all";
  updateTotals();
  renderHistory();
});

photoInput.addEventListener("change", async () => {
  currentPhoto = await readPhoto(photoInput.files[0]);
  preview.src = currentPhoto;
  preview.hidden = !currentPhoto;
  photoPrompt.textContent = currentPhoto ? "写真を変える" : "写真を撮る / 選ぶ";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const mode = entryMode.value;
  const child = childName.value.trim();
  const title = titleInput.value.trim();
  const points = Number(pointsInput.value);

  if (!child || !title || !Number.isFinite(points) || points < 1) return;

  records.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    mode,
    child,
    title,
    points,
    category: category.value,
    photo: currentPhoto,
    note: note.value.trim(),
    createdAt: Date.now(),
  });

  saveRecords();
  form.reset();
  setMode(mode);
  childName.value = children.includes(child) ? child : children[0];
  pointsInput.value = mode === "spend" ? "10" : "5";
  currentPhoto = "";
  preview.hidden = true;
  photoPrompt.textContent = "写真を撮る / 選ぶ";
  refresh();
});

exportButton.addEventListener("click", () => {
  const data = JSON.stringify(records, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `creative-chicken-points-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

setMode("earn");
refresh();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
