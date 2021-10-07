// map key:
// e = empty
// s = snake
// f = food

var map = [];
var snake = [];
var direction = [1, 0];
var lastMovedDirection = direction;
const mapHeight = 13;
const mapWidth = 13;
var snakePosition = [5, 6];
var endSnakePosition = [2, 6];
var foods = [];
const startSnakeLength = 3;
var blocksToAdd = 0;
var score = 0;
var interval;
const delay = 150;

document.onkeydown = function(e) {
  switch (e.code) {
    case "ArrowDown":
      if (direction[0] == 0 && direction[1] == 1) return; // check if already in direction
      if (lastMovedDirection[0] != 0 || lastMovedDirection[1] != -1)
        direction = [0, 1]; // check if not turning 180 degrees
      break;
    case "ArrowRight":
      if (direction[0] == 1 && direction[1] == 0) return;
      if (lastMovedDirection[0] != -1 || lastMovedDirection[1] != 0)
        direction = [1, 0];
      break;
    case "ArrowUp":
      if (direction[0] == 0 && direction[1] == -1) return;
      if (lastMovedDirection[0] != 0 || lastMovedDirection[1] != 1)
        direction = [0, -1];
      break;
    case "ArrowLeft":
      if (direction[0] == -1 && direction[1] == 0) return;
      if (lastMovedDirection[0] != 1 || lastMovedDirection[1] != 0)
        direction = [-1, 0];
      break;
  }
  clearInterval(interval);
  move();
  interval = setInterval(move, delay);
};

function printSnakeBlockCount() {
  let output = 0;
  for (var i = 0; i < mapHeight; i++) {
    for (var j = 0; j < mapWidth; j++) {
      if (map[coordinateToIndex(j, i)] == "s") {
        output++;
      }
    }
  }

  console.log(output);
}

function printMap() {
  let output = "";
  for (var i = 0; i < mapHeight; i++) {
    for (var j = 0; j < mapWidth; j++) {
      output += map[coordinateToIndex(j, i)];
    }
    output += "<br>";
  }

  document.getElementById("asdf").innerHTML = output;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function spawnFood() {
  var foodPosition = undefined;

  while (
    foodPosition == undefined ||
    map[coordinateToIndex(foodPosition[0], foodPosition[1])] != "e"
  ) {
    foodPosition = [getRandomInt(0, mapWidth), getRandomInt(0, mapHeight)];
  }

  map[coordinateToIndex(foodPosition[0], foodPosition[1])] = "f";

  let newFoodBlock = document.createElement("div");
  newFoodBlock.setAttribute("class", "foodBlock");
  newFoodBlock.style.left = foodPosition[0] * 30 + "px";
  newFoodBlock.style.top = foodPosition[1] * 30 + "px";
  document.getElementById("backgroundBox").appendChild(newFoodBlock);
  foods.push(newFoodBlock);
}

function removeFood(position) {
  for (var i = 0; i < foods.length; i++) {
    if (
      parseInt(foods[i].style.left, 10) / 30 == position[0] &&
      parseInt(foods[i].style.top, 10) / 30 == position[1]
    ) {
      foods[i].remove();
    }
  }
}

function coordinateToIndex(x, y) {
  return mapWidth * y + x;
}

function coordinateIsWithin(x, y, width, height) {
  if (x >= width || x < 0 || y >= height || y < 0) {
    return false;
  }

  return true;
}

function move() {
  lastMovedDirection = direction;
  let spaceAhead =
    map[
      coordinateToIndex(
        snakePosition[0] + direction[0],
        snakePosition[1] + direction[1]
      )
    ];
  if (
    spaceAhead == "s" ||
    !coordinateIsWithin(
      snakePosition[0] + direction[0],
      snakePosition[1] + direction[1],
      mapWidth,
      mapHeight
    )
  ) {
    // check if snake is in path
    console.log("dead");
    return;
  } else if (spaceAhead == "f") {
    score++;
    blocksToAdd++;
    removeFood([
      snakePosition[0] + direction[0],
      snakePosition[1] + direction[1]
    ]);
    spawnFood();
  }

  for (var i = snake.length - 1; i >= 0; i--) {
    if (i == 0) {
      // check if we are moving the head
      let newLeftPosition =
        parseInt(snake[i].style.left, 10) + 30 * direction[0];
      let newTopPosition = parseInt(snake[i].style.top, 10) + 30 * direction[1];
      snake[i].style.left = newLeftPosition + "px";
      //$("#" + snake[i].id).animate({left:newLeftPosition + 'px'}, {duration: 100, easing: 'linear'});
      snake[i].style.top = newTopPosition + "px";
      //$("#" + snake[i].id).animate({top:newTopPosition + 'px'}, {duration: 100, easing: 'linear'});
      snakePosition = [
        snakePosition[0] + direction[0],
        snakePosition[1] + direction[1]
      ];
      map[coordinateToIndex(snakePosition[0], snakePosition[1])] = "s";

      continue;
    } else if (i == snake.length - 1) {
      // check if we are moving the tail
      if (blocksToAdd == 0) {
        // check for block queue
        map[coordinateToIndex(endSnakePosition[0], endSnakePosition[1])] = "e"; // set the tail's position to empty on the map
        endSnakePosition = [
          parseInt(snake[i - 1].style.left, 10) / 30,
          parseInt(snake[i - 1].style.top, 10) / 30
        ];
      } else {
        let newSnakeBlock = document.createElement("div");
        newSnakeBlock.setAttribute("class", "snakeBlock");
        newSnakeBlock.style.left = snake[i].style.left;
        newSnakeBlock.style.top = snake[i].style.top;
        document.getElementById("backgroundBox").appendChild(newSnakeBlock);
        snake.push(newSnakeBlock);
        blocksToAdd--;
        endSnakePosition = [
          parseInt(snake[i].style.left, 10) / 30,
          parseInt(snake[i].style.top, 10) / 30
        ];
      }
    }

    snake[i].style.left = snake[i - 1].style.left;
    snake[i].style.top = snake[i - 1].style.top;
  }
}

$(function() {
  for (var i = 0; i < mapHeight; i++) {
    for (var j = 0; j < mapWidth; j++) {
      map.push("e");
    }
  }

  for (var i = 0; i < startSnakeLength; i++) {
    // generate the snake
    //map[coordinateToIndex(snakePosition[0] - i, snakePosition[1])] = "s"; // don't have to set blocks to s because you are too short to run into yourself until you have a food
    let newSnakeBlock = document.createElement("div");
    newSnakeBlock.setAttribute("class", "snakeBlock");
    newSnakeBlock.id = i.toString();
    if (i == 0) {
      newSnakeBlock.style.backgroundColor = "#99FF99";
    }
    newSnakeBlock.style.left = ((snakePosition[0] - i) * 30).toString() + "px";
    newSnakeBlock.style.top = (snakePosition[1] * 30).toString() + "px";
    document.getElementById("backgroundBox").appendChild(newSnakeBlock);
    snake.push(newSnakeBlock);
  }

  spawnFood();

  interval = setInterval(move, delay);
});
