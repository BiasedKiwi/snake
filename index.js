//  Number of squares. 1 square = 9 (3x3)
const gridItems = 9 * 53 + 3;

const score = document.getElementById("scoreValue");
const highScore = document.getElementById("highScoreValue");

const appleEvent = new CustomEvent("applehit", {
  detail: {},
  bubbles: true,
  cancelable: true,
  composed: false,
});

const snakeDead = new CustomEvent("snakedead", {
  detail: {},
  bubbles: true,
  cancelable: true,
  composed: false,
});

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const renderGrid = (side = 30) => {
  let elId = 0;
  const container = document.querySelector(".container");
  for (let i = 0; i < side; i++) {
    const el = document.createElement("div");
    el.classList.add("grid-element");
    el.id = elId;
    // el.innerText = elId;
    elId++;
    container.appendChild(el);
  }
};

function renderSnake(snakeObj = [0, 1, 2, 3, 4]) {
  for (const elId of snakeObj.position) {
    const el = document.getElementById(elId);
    el.classList.add("snake");
  }
  return snakeObj;
}

function cleanSnake(snakeObj) {
  let snake = snakeObj;
  for (const elId of snake.position) {
    const el = document.getElementById(elId);
    el.classList.remove("snake");
  }
}

async function scheduleCleanSnake(snakeObj, ms) {
  await delay(ms);
  cleanSnake(snakeObj);
}

// TODO: Clean up this function. (get rid of the if statements because the only difference is the number added to the coordinates)
function snakeMove(snakeObj) {
  const snakeBody = snakeObj.position;
  let finalArr = [];
  for (let i = 0; i < snakeBody.length; i++) {
    if (snakeObj.direction === "down") {
      // Check if last element of list
      if (snakeBody[i + 1] === undefined) {
        const first = snakeBody[i];
        const result = first + 30;
        finalArr.push(result);
        continue;
      }
      const second = snakeBody[i + 1];
      const first = snakeBody[i];
      const result = second - first + first;
      finalArr.push(result);
    } else if (snakeObj.direction === "up") {
      // Check if last element of list
      if (snakeBody[i + 1] === undefined) {
        const first = snakeBody[i];
        const result = first - 30;
        finalArr.push(result);
        continue;
      }
      const second = snakeBody[i + 1];
      const first = snakeBody[i];
      const result = second - first + first;
      finalArr.push(result);
    } else if (snakeObj.direction === "left") {
      // Check if last element of list
      if (snakeBody[i + 1] === undefined) {
        const first = snakeBody[i];
        const result = first - 1;
        finalArr.push(result);
        continue;
      }
      const second = snakeBody[i + 1];
      const first = snakeBody[i];
      const result = second - first + first;
      finalArr.push(result);
    } else {
      if (snakeBody[i + 1] === undefined) {
        const first = snakeBody[i];
        const result = first + 1;
        finalArr.push(result);
        continue;
      }
      const second = snakeBody[i + 1];
      const first = snakeBody[i];
      const result = second - first + first;
      finalArr.push(result);
    }
  }
  return finalArr;
}

function renderApple(snakeObj) {
  const rand = Math.floor(Math.random() * gridItems + 1);
  document.getElementById(rand).classList.add("apple");
  snakeObj.apple = rand;
  return rand;
}

function cleanApple(snakeObj) {
  document.getElementById(snakeObj.apple).classList.remove("apple");
}

function handleInput(snake) {
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      snake.direction = "up";
    } else if (e.key === "ArrowDown") {
      snake.direction = "down";
    } else if (e.key === "ArrowLeft") {
      snake.direction = "left";
    } else if (e.key === "ArrowRight") {
      snake.direction = "right";
    }
  });
}

function watchApple(mutations, observer, snakeObj) {
  mutations.forEach((mut) => {
    if (mut.type !== "attributes" && mut.attributeName !== "class") return;
    if (mut.target.id == snakeObj.apple) return;
    if (new Set(snakeObj.position).size !== snakeObj.position.length) {
      for (let cord of snakeObj.position) {
        console.log("cord: " + cord);
        if (cord == snakeObj.apple) {
          return;
        }
      }
      console.log(snakeObj.position);
      alert(`You died! Score: ${snakeObj.score}`);
      window.dispatchEvent(snakeDead)
    }
    for (let coordinate of snakeObj.position) {
      if (coordinate == snakeObj.apple) {
        document.dispatchEvent(appleEvent);
        cleanApple(snakeObj);
        renderApple(snakeObj);
      }
    }
  });
}

function bumpScore(snakeObj) {
  console.log("apple hit!");
  snakeObj.score++;
  score.innerText = snakeObj.score;
  const highScore = localStorage.getItem("highScore");
  if (highScore < snakeObj.score) {
    localStorage.setItem("highScore", snakeObj.score);
  }

  let toAdd = 0;

  switch (snakeObj.direction) {
    case "left":
      toAdd = 1;
    case "down":
      toAdd = 30;
    case "right":
      toAdd = -1;
    case "up":
      toAdd = -30;
  }
  console.log(snakeObj.direction);
  let newPart = snakeObj.position[0] + toAdd;

  console.log(newPart);
  snakeObj.position.unshift(newPart);
  console.log(snakeObj.position);
}

function reset(snakeObj) {
  window.location.reload();
}

main();

async function main() {
  let snake = {
    position: [0, 1, 2, 3, 4],
    direction: "right",
    apple: -1,
    score: 0,
  };

  highScore.innerText = localStorage.getItem("highScore") | 0;

  renderGrid(gridItems);
  renderApple(snake);
  handleInput(snake);

  const container = document.querySelector(".container");
  const appleObserver = new MutationObserver((mutations, observer) =>
    watchApple.apply(null, [mutations, observer, snake])
  );
  appleObserver.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
  });

  document.addEventListener("applehit", () => {
    bumpScore(snake);
  });

  document.addEventListener("snakedead", () => reset(snake))

  while (true) {
    renderSnake(snake);
    await delay(150);
    cleanSnake(snake);
    snake.position = snakeMove(snake);
    cleanSnake(snake);
  }
}
