const board = document.querySelector("canvas");
const clear = document.getElementById("clear-btn");
let x = 0;
let y = 0;
let isPenVisible = true;
let blinkIntervalId = null;
let blinkTimeoutId = null;

board.addEventListener("keydown", draw);
clear.addEventListener("click", clear_content);

// Initialize the blinking timer so it starts the process on load
resetBlinkTimer();

function draw(e) {
  resetBlinkTimer();
  clearInterval(blinkIntervalId);

  // console.log(`${e.code}`);
  const ctx = board.getContext("2d");
  const pen = ctx.createImageData(5, 5);
  for (let i = 0; i < pen.data.length; i += 4) {
    // Modify pixel data
    pen.data[i + 0] = 198; // R value
    pen.data[i + 1] = 120; // G value
    pen.data[i + 2] = 56; // B value
    pen.data[i + 3] = 180; // A value
  }
  const directionMap = {
    KeyK: { dx: 0, dy: -1 },
    KeyJ: { dx: 0, dy: 1 },
    KeyH: { dx: -1, dy: 0 },
    KeyL: { dx: 1, dy: 0 },
  };

  if (directionMap[e.code]) {
    const { dx, dy } = directionMap[e.code];
    for (let step = 0; step < 5; step++) {
      if (x + dx >= 0 && x + dx < board.width) {
        x += dx;
      }
      if (y + dy >= 0 && y + dy < board.height) {
        y += dy;
      }
      ctx.putImageData(pen, x, y);
    }
  }
}

function clear_content(e) {
  const ctx = board.getContext("2d");
  ctx.clearRect(0, 0, board.width, board.height);
}

function resetBlinkTimer() {
  clearTimeout(blinkTimeoutId);
  blinkTimeoutId = setTimeout(() => {
    startBlinking();
  }, 500);
}

function startBlinking() {
  const ctx = board.getContext("2d");
  const pen = ctx.createImageData(5, 5);
  for (let i = 0; i < pen.data.length; i += 4) {
    pen.data[i + 0] = 198; // R value
    pen.data[i + 1] = 120; // G value
    pen.data[i + 2] = 56; // B value
    pen.data[i + 3] = 180; // A value
  }

  const tmpX = x;
  const tmpY = y;
  blinkIntervalId = setInterval(() => {
    isPenVisible = !isPenVisible;
    if (isPenVisible) {
      ctx.putImageData(pen, tmpX, tmpY);
    } else {
      ctx.clearRect(tmpX, tmpY, 5, 5); // Adjust the size if needed
    }
  }, 300);
}
