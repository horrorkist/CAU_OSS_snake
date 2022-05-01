import kaboom from "kaboom";

kaboom();

const block_size = 20;

const directions = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};

let current_direction = directions.RIGHT;
let run_action = false;
let snake_length = 3;
let snake_body = [];

loadSprite("grass", "../assets/grass.png");

layers(["grass", "game"], "game");

add([sprite("grass"), layer("grass")]);

// The size of the board is 40 x 40.
const map = addLevel(
  [
    "==========================================",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "=                                        =",
    "==========================================",
  ],
  {
    width: block_size,
    height: block_size,
    pos: vec2(0, 0),
    "=": () => [rect(block_size, block_size), color(255, 0, 0), area(), "wall"],
  }
);

// Once the snake dies, the final score is calculated based on the number of apples eaten by the snake.
const score = add([text("Score: 0"), pos(block_size * 45, block_size * 1), { value: 0 }]);

const saveGame = () => {
  localStorage.setItem(
    "cau-snake-save",
    JSON.stringify({
      snake_length,
      score: score.value,
    })
  );
  window.location.href = "/";
};

const loadGame = () => {
  const data = JSON.parse(localStorage.getItem("cau-snake-save"));

  if (data) {
    destroyAll("snake");
    score.value = data.score;
    snake_body = [];
    snake_length = data.snake_length;

    let mapCenter = block_size * 20;

    for (let i = 1; i <= snake_length; i++) {
      let segment = add([
        rect(block_size, block_size),
        pos(mapCenter, mapCenter - block_size * i),
        color(173, 216, 230),
        area(),
        "snake",
      ]);
      snake_body.push(segment);
    }
    current_direction = directions.UP;
    score.text = "Score:" + score.value;
  }
};

onKeyPress("s", () => {
  saveGame();
});

onKeyPress("l", () => {
  loadGame();
});

function respawn_snake() {
  destroyAll("snake");

  snake_body = [];
  snake_length = 3;

  let mapCenter = block_size * 20;

  for (let i = 1; i <= snake_length; i++) {
    let segment = add([
      rect(block_size, block_size),
      pos(mapCenter, mapCenter - block_size * i), // The snake starts at the center of the board.
      color(173, 216, 230),
      area(),
      "snake",
    ]);
    snake_body.push(segment);
  }
  current_direction = directions.UP; // The snake starts moving north (upward)
}

function respawn_all() {
  run_action = false;
  wait(0.5, function () {
    respawn_snake();
    respawn_food();
    score.value = 0;
    score.text = "Score:" + score.value;
    run_action = true;
  });
}

respawn_all();

// The snake moves only north, south, east, or west.
onKeyPress("up", () => {
  if (current_direction != directions.DOWN) {
    current_direction = directions.UP;
  }
});

onKeyPress("down", () => {
  if (current_direction != directions.UP) {
    current_direction = directions.DOWN;
  }
});

onKeyPress("left", () => {
  if (current_direction != directions.RIGHT) {
    current_direction = directions.LEFT;
  }
});

onKeyPress("right", () => {
  if (current_direction != directions.LEFT) {
    current_direction = directions.RIGHT;
  }
});

let move_delay = 0.1; // The snake moves at a constant speed.
let timer = 0;
onUpdate(() => {
  if (!run_action) return;
  timer += dt();
  if (timer < move_delay) return;
  timer = 0;

  let move_x = 0;
  let move_y = 0;

  switch (current_direction) {
    case directions.DOWN:
      move_x = 0;
      move_y = block_size;
      break;
    case directions.UP:
      move_x = 0;
      move_y = -1 * block_size;
      break;
    case directions.LEFT:
      move_x = -1 * block_size;
      move_y = 0;
      break;
    case directions.RIGHT:
      move_x = block_size;
      move_y = 0;
      break;
  }

  let snake_head = snake_body[snake_body.length - 1];

  snake_body.push(
    add([
      rect(block_size, block_size),
      pos(snake_head.pos.x + move_x, snake_head.pos.y + move_y),
      color(173, 216, 230),
      area(),
      "snake",
    ])
  );

  if (snake_body.length > snake_length) {
    let tail = snake_body.shift();
    destroy(tail);
  }
});

let food = null;
loadSprite("apple", "../assets/gameapple.png");

// An apple appears at a random location (but the location where the snake can reach).
// There is always exactly one apple visible at any given time.
function respawn_food() {
  let new_pos = rand(vec2(1, 1), vec2(40, 40));
  new_pos.x = Math.floor(new_pos.x);
  new_pos.y = Math.floor(new_pos.y);
  new_pos = new_pos.scale(block_size);

  if (food) {
    destroy(food);
  }
  food = add([sprite("apple"), pos(new_pos), area(), "food"]);
}

// When the snake "eats" (runs into) an apple, it gets longer.
onCollide("snake", "food", (s, f) => {
  snake_length++;
  score.value++;
  score.text = "Score:" + score.value;
  respawn_food();
});

const goToScores = () => {
  wait(1.5, () => {
    localStorage.setItem("cau-snake-lastScore", JSON.stringify(score.value));
    window.location.href = "/scores/";
  });
};

// The game continues until the snake "dies".
// The snake dies by either (1) running into the edge of the board, or (2) by running into its own body.
onCollide("snake", "wall", (s, w) => {
  run_action = false;
  shake(12);
  goToScores();
});

onCollide("snake", "snake", (s, t) => {
  run_action = false;
  shake(12);
  respawn_all();
  goToScores();
});

onLoad(() => {
  const body = document.querySelector("body");
  body.style = "overflow: hidden;";

  const loadGameData = JSON.parse(localStorage.getItem("cau-snake-needs-load"));

  if (loadGameData === true) {
    wait(0.5, () => {
      loadGame();
      localStorage.setItem("cau-snake-needs-load", JSON.stringify(false));
    });
  }

  document.querySelector("canvas").focus();
});
