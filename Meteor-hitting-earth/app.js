class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  on(message, listener) {
    if (!this.listeners[message]) {
      this.listeners[message] = [];
    }
    this.listeners[message].push(listener);
  }
  emit(message, ...args) {
    if (this.listeners[message]) {
      this.listeners[message].forEach((cb) => {
        cb(message, ...args);
      });
    }
  }
}

class GameObject {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dead = false;
    this.type = "";
    this.width = 0;
    this.height = 0;
    this.img = undefined;
  }
  draw() {
    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
  }
  rectFromGameObject() {
    return {
      top: this.y,
      left: this.x,
      bottom: this.y + this.height,
      right: this.x + this.width,
    };
  }
}

class Player extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.type = "player";
    this.width = 180;
    this.height = 35;
    this.life = 3;
    this.points = 0;
  }
  decrementLife() {
    this.life--;
    if (this.life === 0) {
      this.dead = true;
    }
  }
  incrementPoints() {
    this.points += 10;
  }
}

class Meteor extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.type = "meteor";
    this.width = 50;
    this.height = 50;

    let id = setInterval(() => {
      if (this.y < canvas.height) {
        this.y += 10;
      } else {
        // console.log("Stopped at", this.y);
        clearInterval(id);
      }
    }, 100);
  }
}

function loadTexture(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function intersectRect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

const Messages = {
  KEY_EVENT_LEFT: "PLAYER_MOVE_LEFT",
  KEY_EVENT_RIGHT: "PLAYER_MOVE_RIGHT",
  COLLISION_METEOR: "COLLISION",
  HURT_PLAYER: "HURT_PLAYER",
};

let ctx,
  player,
  playerImg,
  meteor,
  meteorImg,
  lifeImg,
  hitSound,
  gameObjects = [],
  gameLoopId,
  eventEmitter = new EventEmitter();

let onKeyDown = function (evt) {
  // console.log(evt.keyCode);
  if (evt.key === "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
  } else if (evt.key === "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
  } else if (
    evt.key === "ArrowUp" ||
    evt.key === "ArrowDown" ||
    evt.key === " "
  ) {
    evt.preventDefault();
  }
};

window.addEventListener("keydown", onKeyDown);

function createPlayer() {
  player = new Player(canvas.width / 2 - 45, canvas.height - canvas.height / 6);
  player.img = playerImg;
  gameObjects.push(player);
}

function createMeteor() {
  let START_X = 50 + Math.random() * (canvas.width - 50);
  meteor = new Meteor(START_X, 0);
  meteor.img = meteorImg;
  gameObjects.push(meteor);
}

function updateGameObjects() {
  const meteors = gameObjects.filter((obj) => obj.type === "meteor");

  meteors.forEach((meteor) => {
    if (
      intersectRect(player.rectFromGameObject(), meteor.rectFromGameObject())
    ) {
      eventEmitter.emit(Messages.COLLISION_METEOR, { deadObj: meteor });
      hitSound.play();
    } else if (meteor.y >= canvas.height) {
      eventEmitter.emit(Messages.HURT_PLAYER, { deadObj: meteor });
    }
  });

  gameObjects = gameObjects.filter((obj) => !obj.dead);
}

function drawLife(ctx) {
  const START_POS = canvas.width / 2 - (player.life * 50) / 2;
  for (let i = 0; i < player.life; i++) {
    ctx.drawImage(lifeImg, START_POS + i * 50, 700, 50, 50);
  }
}

function drawPoints(ctx) {
  ctx.font = "40px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText("Points: " + player.points, canvas.width / 2 - 75, 200);
}

function drawGameObjects(ctx) {
  gameObjects.forEach((obj) => {
    obj.draw(ctx);
  });
}

function initGame() {
  gameObjects = [];
  createPlayer();
  createMeteor();
  setInterval(() => createMeteor(), 1000);

  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    player.x -= 10;
  });

  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    player.x += 10;
  });

  eventEmitter.on(Messages.COLLISION_METEOR, (_, { deadObj: meteor }) => {
    meteor.dead = true;
    player.incrementPoints();
  });

  eventEmitter.on(Messages.HURT_PLAYER, (_, { deadObj: meteor }) => {
    meteor.dead = true;
    player.decrementLife();
    if (player.dead) {
      exitGame();
    }
  });
}

function exitGame() {
  alert("Game Over");
  gameObjects = [];
  clearInterval(gameLoopId);
}

window.onload = async () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  playerImg = await loadTexture("assets/player.jpeg");
  meteorImg = await loadTexture("assets/meteor.png");
  lifeImg = await loadTexture("assets/life.png");
  hitSound = document.getElementById("hitSound");
  hitSound.volume = 0.1;

  initGame();
  gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#130723";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLife(ctx);
    drawPoints(ctx);
    updateGameObjects();
    drawGameObjects(ctx);
  }, 100);
};
