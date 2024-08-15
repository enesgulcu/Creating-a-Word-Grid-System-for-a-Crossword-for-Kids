let words = [];
let selectedWord = null;
let hints = [];
let hintMode = false;

document.addEventListener("DOMContentLoaded", () => {
  drawGrid();
  document.getElementById("grid").addEventListener("click", handleGridClick);
  document.addEventListener("keydown", handleKeyDown);
  document.getElementById("toggleHintMode").addEventListener("click", toggleHintMode);
});

function handleGridClick(event) {
  const canvas = document.getElementById("grid");
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / 30);
  const y = Math.floor((event.clientY - rect.top) / 30);

  if (hintMode) {
    toggleHint(x, y);
  } else if (selectedWord) {
    placeWord(selectedWord, x, y);
    selectedWord = null;
  }
  drawGrid();
}

function handleKeyDown(event) {
  if (event.key === "r" && selectedWord) {
    selectedWord.direction = selectedWord.direction === "horizontal" ? "vertical" : "horizontal";
    drawGrid();
  }
}

function toggleHintMode() {
  hintMode = !hintMode;
  document.getElementById("toggleHintMode").innerText = hintMode ? "İpucu Seçim Modunu Kapat" : "İpucu Seçim Modunu Aç";
}

function addWord() {
  const word = document.getElementById("word-input").value;
  if (word) {
    const wordObj = {
      word,
      x: 0,
      y: 0,
      direction: "horizontal",
      hintCells: []
    };
    words.push(wordObj);
    displayWords();
    selectedWord = wordObj;
    document.getElementById("word-input").value = "";
    document.getElementById("word-modal").style.display = "none";
    drawGrid();
  }
}

function addWords() {
  const wordsInput = document.getElementById("words-input").value;
  const wordArray = wordsInput.split(",").map(word => word.trim()).filter(word => word);
  wordArray.forEach(word => {
    const wordObj = {
      word,
      x: 0,
      y: 0,
      direction: "horizontal",
      hintCells: []
    };
    words.push(wordObj);
  });
  displayWords();
  drawGrid();
}

function displayWords() {
  const wordList = document.getElementById("word-list");
  wordList.innerHTML = words
    .map(
      (w, index) => `
        <div class="word-item" onclick="selectWord(${index})">
            ${w.word} (${w.x}, ${w.y}) - ${w.direction === "horizontal" ? "Yatay" : "Dikey"}
            <button onclick="removeWord(${index})">Sil</button>
        </div>
    `
    )
    .join("");
}

function selectWord(index) {
  selectedWord = words[index];
  drawGrid();
}

function placeWord(wordObj, x, y) {
  wordObj.x = x;
  wordObj.y = y;
  drawGrid();
}

function removeWord(index) {
  words.splice(index, 1);
  displayWords();
  drawGrid();
}

function generateJson() {
  const json = JSON.stringify(
    words.map(wordObj => ({
      ...wordObj,
      hintCells: hints.filter(hint => {
        const hintX = hint.x;
        const hintY = hint.y;
        return (
          hintX >= wordObj.x &&
          hintX < wordObj.x + (wordObj.direction === "horizontal" ? wordObj.word.length : 1) &&
          hintY >= wordObj.y &&
          hintY < wordObj.y + (wordObj.direction === "vertical" ? wordObj.word.length : 1)
        );
      })
    })),
    null,
    2
  );

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "crossword.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function toggleHint(x, y) {
  if (isCellOccupied(x, y)) {
    const index = hints.findIndex(hint => hint.x === x && hint.y === y);
    if (index === -1) {
      hints.push({ x, y });
    } else {
      hints.splice(index, 1);
    }
  }
}

function isCellOccupied(x, y) {
  for (const wordObj of words) {
    for (let i = 0; i < wordObj.word.length; i++) {
      const wordX = wordObj.direction === "horizontal" ? wordObj.x + i : wordObj.x;
      const wordY = wordObj.direction === "horizontal" ? wordObj.y : wordObj.y + i;
      if (wordX === x && wordY === y) {
        return true;
      }
    }
  }
  return false;
}

function drawGrid() {
  const canvas = document.getElementById("grid");
  const ctx = canvas.getContext("2d");
  const gridSize = 30; // Grid boyutu
  const cellSize = 30; // Hücre boyutu

  canvas.width = gridSize * cellSize;
  canvas.height = gridSize * cellSize;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#ddd";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Grid çizgilerini çizer
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }

  // Seçili hücreyi vurgular
  if (selectedWord) {
    ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
    const xStart = selectedWord.x * cellSize;
    const yStart = selectedWord.y * cellSize;
    const width = selectedWord.direction === "horizontal" ? selectedWord.word.length * cellSize : cellSize;
    const height = selectedWord.direction === "vertical" ? selectedWord.word.length * cellSize : cellSize;
    ctx.fillRect(xStart, yStart, width, height);
  }

  // İpuçlarını vurgula
  hints.forEach(({ x, y }) => {
    ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
  });

  // Kelimeleri grid'e yazar
  words.forEach(({ word, x, y, direction }) => {
    ctx.fillStyle = "#000"; // Yazı rengi
    for (let i = 0; i < word.length; i++) {
      const xPos = direction === "horizontal" ? x + i : x;
      const yPos = direction === "horizontal" ? y : y + i;
      ctx.fillText(
        word[i],
        xPos * cellSize + cellSize / 2,
        yPos * cellSize + cellSize / 2
      );
    }
  });
}
