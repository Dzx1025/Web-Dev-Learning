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
        this.y += 15;
      } else {
        console.log("Stopped at", this.y);
        clearInterval(id);
      }
    }, 300);
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
  COLLISION: "COLLISION",
};

let ctx,
  player,
  playerImg,
  meteor,
  meteorImg,
  gameObjects = [],
  eventEmitter = new EventEmitter();

let onKeyDown = function (evt) {
  console.log(evt.keyCode);
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
  let START_X = Math.random() * canvas.width;
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
      eventEmitter.emit(Messages.COLLISION, { deadObj: meteor });
    }
  });

  gameObjects = gameObjects.filter((obj) => !obj.dead);
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
  setInterval(() => createMeteor(), 10000);

  eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
    player.x -= 10;
  });

  eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
    player.x += 10;
  });

  eventEmitter.on(Messages.COLLISION, (_, { deadObj }) => {
    deadObj.dead = true;
  });
}

window.onload = async () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  playerImg = await loadTexture("assets/player.jpeg");
  meteorImg = await loadTexture("assets/meteor.jpeg");

  initGame();
  let gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateGameObjects();
    drawGameObjects(ctx);
  }, 100);
};
