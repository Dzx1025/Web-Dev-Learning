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
    this.type = "Player";
    this.width = 180;
    this.height = 35;
    this.speed = 0;
  }
}

class Meteor extends GameObject {
  constructor(x, y) {
    super(x, y);
    this.type = "Meteor";
    this.width = 50;
    this.height = 50;

    let id = setInterval(() => {
      if (!this.dead) {
        this.y = this.y < canvas.height ? this.y + 10 : this.y;

        if (this.y >= canvas.height - this.height) {
          this.dead = true;
          // eventEmitter.emit(Messages.METEOR_OUT_OF_BOUNDS, {
          //   deadObj: this,
          //   id: gameLoopId,
          // });
        }
      } else {
        // console.log("Stopped at", this.y);
        clearInterval(id);
      }
    }, 100);
  }
}

const Messages = {
  KEY_EVENT_LEFT: "PLAYER_MOVE_LEFT",
  KEY_EVENT_RIGHT: "PLAYER_MOVE_RIGHT",
  PLAYER_SPEED_LEFT: "PLAYER_SPEED_LEFT",
  PLAYER_SPEED_RIGHT: "PLAYER_SPEED_RIGHT",
  PLAYER_SPEED_ZERO: "PLAYER_SPEED_ZERO",
  METEOR_OUT_OF_BOUNDS: "METEOR_OUT_OF_BOUNDS",
  COLLISION_METEOR: "COLLISION_METEOR",
  GAME_END_LOSS: "GAME_END_LOSS",
  GAME_END_WIN: "GAME_END_WIN",
  GAME_START: "GAME_START",
};

class Game {
  constructor() {
    this.points = 0;
    this.life = 3;
    this.end = false;
    this.ready = false;

    eventEmitter.on(Messages.KEY_EVENT_LEFT, () => {
      player.x = player.x > 0 ? player.x - 10 : player.x;
    });

    eventEmitter.on(Messages.KEY_EVENT_RIGHT, () => {
      player.x = player.x > 0 ? player.x + 10 : player.x;
    });

    eventEmitter.on(Messages.PLAYER_SPEED_LEFT, () => {
      player.speed = -10;
    });

    eventEmitter.on(Messages.PLAYER_SPEED_RIGHT, () => {
      player.speed = 10;
    });

    eventEmitter.on(Messages.PLAYER_SPEED_ZERO, () => {
      player.speed = 0;
    });

    eventEmitter.on(
      Messages.METEOR_OUT_OF_BOUNDS,
      (_, { deadObj: meteor, id }) => {
        game.life--;
        if (game.life === 0) {
          player.dead = true;
          eventEmitter.emit(Messages.GAME_END_LOSS, id);
        }
        meteor.dead = true;
      },
    );

    eventEmitter.on(Messages.COLLISION_METEOR, (_, { deadObj: meteor }) => {
      meteor.dead = true;
      game.points += 100;
    });

    eventEmitter.on(Messages.GAME_END_LOSS, (_, gameLoopId) => {
      game.end = true;
      displayMessage("You died... - Press [Enter] to start the game ");
      clearInterval(gameLoopId);
    });

    eventEmitter.on(Messages.GAME_END_WIN, (_, gameLoopId) => {
      game.end = true;
      displayMessage("Victory!!! - Press [Enter] to start a new game");
      clearInterval(gameLoopId);
    });

    eventEmitter.on(Messages.GAME_START, () => {
      if (game.ready && game.end) {
        // assets loaded
        runGame();
      }
    });
  }
}

const eventEmitter = new EventEmitter();
const player = new Player(0, 0);
const WIDTH = 1024;
const HEIGHT = 768;

let canvas;
let ctx;

let playerImg;
let meteorImg;
let lifeImg;
let hitSound;

let gameObjects = [];

const game = new Game();

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

function draw(ctx, objects) {
  objects.forEach((obj) => {
    obj.draw(ctx);
  });
}

let onKeyDown = function (e) {
  // console.log(evt.keyCode);
  switch (e.key) {
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp":
    case "ArrowDown":
    case " ":
      e.preventDefault();
      break;
    default:
      break;
  }
};

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      eventEmitter.emit(Messages.PLAYER_SPEED_LEFT);
      break;
    case "ArrowRight":
      eventEmitter.emit(Messages.PLAYER_SPEED_RIGHT);
      break;
  }
});

window.addEventListener("keyup", (e) => {
  eventEmitter.emit(Messages.PLAYER_SPEED_ZERO);
  if (e.key == "ArrowLeft") {
    eventEmitter.emit(Messages.KEY_EVENT_LEFT);
  } else if (e.key == "ArrowRight") {
    eventEmitter.emit(Messages.KEY_EVENT_RIGHT);
  } else if (e.key == "Enter") {
    eventEmitter.emit(Messages.GAME_START);
  }
});

function displayLife() {
  const START_X = canvas.width - 150 - 30;
  for (let i = 0; i < game.life; i++) {
    ctx.drawImage(lifeImg, START_X + (i + 1) * 35, canvas.height - 90);
  }
}

function displayGameScore(message) {
  ctx.font = "30px Arial";
  ctx.fillStyle = "red";
  ctx.textAlign = "right";
  ctx.fillText(message, canvas.width - 100, canvas.height - 30);
}

function displayMessage(message, color = "red") {
  ctx.font = "30px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function createMeteor() {
  let START_X = Math.random() * (canvas.width - 50);
  let meteor = new Meteor(START_X, 0);
  meteor.img = meteorImg;
  gameObjects.push(meteor);
}

function createPlayer(playerImg) {
  player.dead = false;
  player.img = playerImg;
  player.x = canvas.width / 2;
  player.y = (canvas.height / 4) * 3;
  gameObjects.push(player);
}

function checkGameState(gameLoopId) {
  const meteors = gameObjects.filter((obj) => obj.type === "Meteor");

  if (player.dead) {
    eventEmitter.emit(Messages.GAME_END_LOSS, gameLoopId);
  } else if (meteors.length === 0) {
    eventEmitter.emit(Messages.GAME_END_WIN, gameLoopId);
  }

  // Update player position
  if (player.speed !== 0) {
    player.x += player.speed;
  }

  meteors.forEach((meteor) => {
    if (
      intersectRect(player.rectFromGameObject(), meteor.rectFromGameObject())
    ) {
      eventEmitter.emit(Messages.COLLISION_METEOR, { deadObj: meteor });
      hitSound.play();
    } else if (meteor.y >= canvas.height - meteor.height) {
      eventEmitter.emit(Messages.METEOR_OUT_OF_BOUNDS, {
        deadObj: meteor,
        id: gameLoopId,
      });
    }
  });

  gameObjects = gameObjects.filter((obj) => !obj.dead);
}

function runGame() {
  gameObjects = [];
  game.life = 3;
  game.points = 0;
  game.end = false;

  createMeteor();
  setInterval(() => createMeteor(), 3000);
  createPlayer(playerImg);

  let gameLoopId = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#130723";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    displayGameScore("Score: " + game.points);
    displayLife();
    checkGameState(gameLoopId);
    draw(ctx, gameObjects);
  }, 100);
}

window.onload = async () => {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  playerImg = await loadTexture("assets/player.jpeg");
  meteorImg = await loadTexture("assets/meteor.png");
  lifeImg = await loadTexture("assets/life.png");
  hitSound = document.getElementById("hitSound");
  hitSound.volume = 0.1;

  game.ready = true;
  game.end = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#130723";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  displayMessage("Press [Enter] to start the game", "blue");
};
