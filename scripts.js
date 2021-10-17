// map key:
// e = empty
// s = snake
// f = food

const classroomIconUrl =
  "https://cdn.glitch.me/61845a2e-50dd-416e-b27c-f6c4d479d0ad%2Ffavicon.png?v=1633720408561";

const startSnakeLength = 3;
var map;
var snake;
var direction;
var lastMovedDirection;
var mapHeight;
var mapWidth;
var snakePositions;
var snakePosition;
var endSnakePosition;
var foods;
var blocksToAdd;
var score;
var interval;
var delay;
var animationTime;
var dead = true;
var deathAllowed;
var numFood;
var gameMode;
var canvas;
var context;
var snakeMode;
var snakeWidth = 15;
var snakeColor = "#99FF99";
var snakeBorderColor = "#90EE90";

document.addEventListener("touchstart", handleTouchStart, false);

document.addEventListener("touchmove", handleTouchMove, false);

var xDown = null;

var yDown = null;

function jimmyjohns() {
  alert("Call (269) 447-2921 for Jimmy Johns! (#notsponsored)");
}

function getTouches(evt) {
  return (
    evt.touches || evt.originalEvent.touches // browser API
  ); // jQuery
}

function handleTouchStart(evt) {
  const firstTouch = getTouches(evt)[0];

  xDown = firstTouch.clientX;

  yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
  if (!xDown || !yDown) {
    return;
  }

  var xUp = evt.touches[0].clientX;

  var yUp = evt.touches[0].clientY;

  var xDiff = xDown - xUp;

  var yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {
    /*most significant*/

    if (xDiff > 0) {
      left();
    } else {
      right();
    }
  } else {
    if (yDiff > 0) {
      up();
    } else {
      down();
    }
  }

  /* reset values */

  xDown = null;

  yDown = null;
}

function die(delay = 1000, forceEnd = false) {
  if (dead || (!deathAllowed && !forceEnd)) {
    return;
  }
  dead = true;
  clearInterval(interval);
  setTimeout(function() {
    document.getElementById("dimBox").style.display = "";
    reset();
  }, delay);
}

window.onresize = onResize;

function onResize() {
  if (!dead) {
    setTimeout(onResize, 500);
    return;
  }
  loadCookies();
}

window.addEventListener("blur", () => {
  if (!dead) {
    clearInterval(interval);
  }
});
window.addEventListener("focus", () => {
  if (!dead) {
    interval = setInterval(move, delay);
  }
});

function right() {
  if (direction[0] == 1 && direction[1] == 0) return true;
  if (lastMovedDirection[0] != -1 || lastMovedDirection[1] != 0)
    direction = [1, 0];
}

function up() {
  if (direction[0] == 0 && direction[1] == -1) return true;
  if (lastMovedDirection[0] != 0 || lastMovedDirection[1] != 1)
    direction = [0, -1];
}

function left() {
  if (
    (direction[0] == -1 && direction[1] == 0) ||
    (direction[0] == 0 && direction[1] == 0)
  )
    return true;
  if (lastMovedDirection[0] != 1 || lastMovedDirection[1] != 0)
    direction = [-1, 0];
}

function down() {
  if (direction[0] == 0 && direction[1] == 1) return true; // check if already in direction
  if (lastMovedDirection[0] != 0 || lastMovedDirection[1] != -1)
    direction = [0, 1]; // check if not turning 180 degrees
}

document.onkeydown = function(e) {
  if (dead) {
    return;
  }
  switch (e.code) {
    case "ArrowDown":
      if (down()) return;
      break;
    case "ArrowRight":
      if (right()) return;
      break;
    case "ArrowUp":
      if (up()) return;
      break;
    case "ArrowLeft":
      if (left()) return;
      break;
    case "Escape":
      die(0, true);
      return;
      break;
    default:
      return;
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

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return parts
      .pop()
      .split(";")
      .shift();
}

function checkSchoolHours(force = false) {
  if (getCookie("disguiseTab") == "off" && !force) {
    return;
  }

  let date = new Date();
  if (
    (date.getDay() != 0 && date.getDay() != 6) ||
    getCookie("disguiseTab") == "force" ||
    force
  ) {
    if (
      (date.getHours() > 7 && date.getHours() < 14) ||
      (date.getHours() == 7 && date.getMinutes() >= 40) ||
      (date.getHours() == 14 && date.getMinutes() <= 40) ||
      getCookie("disguiseTab") == "force" ||
      force
    ) {
      if (
        getCookie("disguiseTab") == "force" ||
        force ||
        getCookie("disguiseTab") == "on" ||
        confirm(
          "You are playing snake during school hours.\nWould you like to disguise this tab as a google classroom window?"
        )
      ) {
        document.getElementById("icon").href = classroomIconUrl;
        document.getElementById("tabTitle").innerHTML = "Classes";
      }
    }
  }
}

function printMap() {
  let output = "";
  for (var i = 0; i < mapHeight; i++) {
    for (var j = 0; j < mapWidth; j++) {
      output += map[coordinateToIndex(j, i)];
    }
    output += "<br>";
  }
  output += snakePositions;

  document.getElementById("fdsa").innerHTML = output;
}

function reset() {
  clearInterval(interval);
  document.getElementById("backgroundBox").innerHTML = "";
  document.getElementById("foodBox").innerHTML = "";
  map = [];
  snake = [];
  direction = [0, 0];
  lastMovedDirection = [0, 0];
  snakePositions = [];
  snakePosition = [5, 6];
  endSnakePosition = [3, 6];
  foods = [];
  blocksToAdd = 0;
  score = 0;

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
    newSnakeBlock.style.backgroundColor = snakeColor;
    newSnakeBlock.style.borderColor = snakeBorderColor;
    newSnakeBlock.style.left = ((snakePosition[0] - i) * 30).toString() + "px";
    newSnakeBlock.style.top = (snakePosition[1] * 30).toString() + "px";
    document.getElementById("backgroundBox").appendChild(newSnakeBlock);
    snake.push(newSnakeBlock);
    snakePositions.push([snakePosition[0] - i, snakePosition[1]]);
  }
  
  drawCanvas();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function spawnFood() {
  let emptySpaces = [];

  for (var j = 0; j < mapHeight; j++) {
    for (var i = 0; i < mapWidth; i++) {
      if (map[coordinateToIndex(i, j)] == "e") {
        emptySpaces.push([i, j]);
      }
    }
  }

  if (emptySpaces.length == 0) {
    alert("You have filled the map!");
    die(0, true);
    return;
  }

  let foodPosition = emptySpaces[getRandomInt(0, emptySpaces.length)];

  map[coordinateToIndex(foodPosition[0], foodPosition[1])] = "f";

  let newFoodBlock = document.createElement("div");
  newFoodBlock.setAttribute("class", "foodBlock");
  newFoodBlock.style.left = foodPosition[0] * 30 + "px";
  newFoodBlock.style.top = foodPosition[1] * 30 + "px";
  document.getElementById("foodBox").appendChild(newFoodBlock);
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

function start() {
  dead = false;
  document.getElementById("dimBox").style.display = "none";
  /*$("#countdownNumbers").show();
  $("#countdownBox").show();
  $("#countdownNumbers").html("3");
  $("#countdownNumbers").fadeOut(1000, () => {
    $("#countdownNumbers").html("2");
    $("#countdownNumbers").show();

    $("#countdownNumbers").fadeOut(1000, () => {
      $("#countdownNumbers").html("1");
      $("#countdownNumbers").show();

      $("#countdownNumbers").fadeOut(1000, () => {
        $("#countdownBox").fadeOut(1000);*/
  $("#countdownNumbers").hide();
  $("#countdownBox").hide();
  interval = setInterval(move, delay); /*
      });
    });
  });*/

  for (var i = 0; i < numFood; i++) {
    if (dead) {
      break;
    }
    spawnFood();
  }
}

function move() {
  switch (gameMode) {
    case "normal":
      normal();
      break;
    case "infinite":
      infinite();
      break;
    default:
      break;
  }
}

function touchingFood() {
  score++;
  document.getElementById("title").innerHTML =
    "Snake Score: " + score.toString();
  blocksToAdd++;
  removeFood([
    snakePosition[0] + direction[0],
    snakePosition[1] + direction[1]
  ]);
  spawnFood();
}

function infinite() {
  if (direction[0] == 0 && direction[1] == 0) return;
  //alert(snakePositions);
  lastMovedDirection = direction;
  let spaceAhead =
    map[
      coordinateToIndex(
        snakePosition[0] + direction[0],
        snakePosition[1] + direction[1]
      )
    ];
  if (spaceAhead == "s") {
    // check if snake is in path
    if (
      map[coordinateToIndex(snakePosition[0] + 0, snakePosition[1] + 1)] ==
        "s" && // [0, 1]
      map[coordinateToIndex(snakePosition[0] + 0, snakePosition[1] + -1)] ==
        "s" && // [0, -1]
      map[coordinateToIndex(snakePosition[0] + 1, snakePosition[1] + 0)] ==
        "s" && // [1, 0]
      map[coordinateToIndex(snakePosition[0] + -1, snakePosition[1] + 0)] == "s" // [-1, 0]
    ) {
      die(1000, true);
    }
    die();
    return;
  } else if (spaceAhead == "f") {
    touchingFood();
  }

  for (var i = snake.length - 1; i >= 0; i--) {
    $("#" + i).stop();
    if (i == 0) {
      // check if we are moving the head
      snakePositions[i] = [
        snakePositions[i][0] + direction[0],
        snakePositions[i][1] + direction[1]
      ];

      snakePosition = [
        snakePosition[0] + direction[0],
        snakePosition[1] + direction[1]
      ];

      // check if outside map in each coordinate, then set coordinate to other side
      if (snakePositions[i][0] == parseInt(mapWidth, 10)) {
        snakePositions[i][0] = 0;
        snakePosition[0] = 0;
      } else if (snakePositions[i][0] == -1) {
        snakePositions[i][0] = mapWidth - 1;
        snakePosition[0] = mapWidth - 1;
      }

      if (snakePositions[i][1] == parseInt(mapHeight, 10)) {
        snakePositions[i][1] = 0;
        snakePosition[1] = 0;
      } else if (snakePositions[i][1] == -1) {
        snakePositions[i][1] = mapHeight - 1;
        snakePosition[1] = mapHeight - 1;
      }

      let newLeftPosition = snakePositions[i][0] * 30;
      let newTopPosition = snakePositions[i][1] * 30;
      //snake[i].style.left = newLeftPosition + "px";

      if (
        Math.abs(newLeftPosition - parseInt(snake[i].style.left, 10)) >=
          30 * 2 ||
        Math.abs(newTopPosition - parseInt(snake[i].style.top, 10)) >= 30 * 2
      ) {
        document.getElementById(snake[i].id).style.top = newTopPosition + "px";
        document.getElementById(snake[i].id).style.left =
          newLeftPosition + "px";
      } else {
        //alert(Math.abs(newLeftPosition - parseInt(snake[i].style.left, 10)));
        $("#" + snake[i].id).animate(
          { left: newLeftPosition + "px", top: newTopPosition + "px" },
          { duration: animationTime, easing: "linear" }
        );
      }
      //snake[i].style.top = newTopPosition + "px";
      //$("#" + snake[i].id).animate({top:newTopPosition + 'px'}, {duration: 100, easing: 'linear'});

      map[coordinateToIndex(snakePosition[0], snakePosition[1])] = "s";

      continue;
    } else if (i == snake.length - 1) {
      // check if we are moving the tail
      if (blocksToAdd == 0) {
        // check for block queue
        map[
          coordinateToIndex(
            snakePositions[snakePositions.length - 1][0],
            snakePositions[snakePositions.length - 1][1]
          )
        ] = "e"; // set the tail's position to empty on the map
        endSnakePosition = snakePositions[snake.length - 1];
        //alert(endSnakePosition[0] + ', ' + endSnakePosition[1] + ': ' + coordinateToIndex(endSnakePosition[0], endSnakePosition[1]));
      } else {
        let newSnakeBlock = document.createElement("div");
        newSnakeBlock.setAttribute("class", "snakeBlock");
        newSnakeBlock.style.backgroundColor = snakeColor;
        newSnakeBlock.style.borderColor = snakeBorderColor;
        newSnakeBlock.style.left = snake[i].style.left;
        newSnakeBlock.style.top = snake[i].style.top;
        newSnakeBlock.id = snake.length;
        document.getElementById("backgroundBox").appendChild(newSnakeBlock);
        snake.push(newSnakeBlock);
        snakePositions.push(snakePositions[i]);
        blocksToAdd--;
        endSnakePosition = snakePositions[i];
      }
    }

    //snake[i].style.left = snake[i - 1].style.left;
    if (
      Math.abs(
        parseInt(snake[i - 1].style.left, 10) -
          parseInt(snake[i].style.left, 10)
      ) >=
        30 * 2 ||
      parseInt(
        Math.abs(snake[i - 1].style.top, 10) - parseInt(snake[i].style.top, 10)
      ) >=
        30 * 2
    ) {
      document.getElementById(snake[i].id).style.top =
        parseInt(snake[i - 1].style.top, 10) + "px";
      document.getElementById(snake[i].id).style.left =
        parseInt(snake[i - 1].style.left, 10) + "px";
    } else {
      $("#" + snake[i].id).animate(
        { left: snake[i - 1].style.left, top: snake[i - 1].style.top },
        { duration: animationTime, easing: "linear" }
      );
    }
    //snake[i].style.top = snake[i - 1].style.top;
    snakePositions[i] = snakePositions[i - 1];
  }
  //printMap();
  
  drawCanvas();
}

function normal() {
  if (direction[0] == 0 && direction[1] == 0) return;
  //alert(snakePositions);
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
    if (
      (map[coordinateToIndex(snakePosition[0] + 0, snakePosition[1] + 1)] ==
        "s" ||
        !coordinateIsWithin(
          snakePosition[0] + 0,
          snakePosition[1] + 1,
          mapWidth,
          mapHeight
        )) && // [0, 1]
      (map[coordinateToIndex(snakePosition[0] + 0, snakePosition[1] + -1)] ==
        "s" ||
        !coordinateIsWithin(
          snakePosition[0] + 0,
          snakePosition[1] + -1,
          mapWidth,
          mapHeight
        )) && // [0, -1]
      (map[coordinateToIndex(snakePosition[0] + 1, snakePosition[1] + 0)] ==
        "s" ||
        !coordinateIsWithin(
          snakePosition[0] + 1,
          snakePosition[1] + 0,
          mapWidth,
          mapHeight
        )) && // [1, 0]
      (map[coordinateToIndex(snakePosition[0] + -1, snakePosition[1] + 0)] ==
        "s" ||
        !coordinateIsWithin(
          snakePosition[0] + -1,
          snakePosition[1] + 0,
          mapWidth,
          mapHeight
        )) // [-1, 0]
    ) {
      die(1000, true);
    }
    die();
    return;
  } else if (spaceAhead == "f") {
    touchingFood();
  }

  for (var i = snake.length - 1; i >= 0; i--) {
    $("#" + i).stop();
    if (i == 0) {
      // check if we are moving the head
      snakePositions[i] = [
        snakePositions[i][0] + direction[0],
        snakePositions[i][1] + direction[1]
      ];
      let newLeftPosition = snakePositions[i][0] * 30;
      let newTopPosition = snakePositions[i][1] * 30;
      //snake[i].style.left = newLeftPosition + "px";
      $("#" + snake[i].id).animate(
        { left: newLeftPosition + "px", top: newTopPosition + "px" },
        { duration: animationTime, easing: "linear" }
      );
      //snake[i].style.top = newTopPosition + "px";
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
        map[
          coordinateToIndex(
            snakePositions[snakePositions.length - 1][0],
            snakePositions[snakePositions.length - 1][1]
          )
        ] = "e"; // set the tail's position to empty on the map
        endSnakePosition = snakePositions[snake.length - 1];
        //alert(endSnakePosition[0] + ', ' + endSnakePosition[1] + ': ' + coordinateToIndex(endSnakePosition[0], endSnakePosition[1]));
      } else {
        let newSnakeBlock = document.createElement("div");
        newSnakeBlock.setAttribute("class", "snakeBlock");
        newSnakeBlock.style.backgroundColor = snakeColor;
        newSnakeBlock.style.borderColor = snakeBorderColor;
        newSnakeBlock.style.left = snake[i].style.left;
        newSnakeBlock.style.top = snake[i].style.top;
        newSnakeBlock.id = snake.length;
        document.getElementById("backgroundBox").appendChild(newSnakeBlock);
        snake.push(newSnakeBlock);
        snakePositions.push(snakePositions[i]);
        blocksToAdd--;
        endSnakePosition = snakePositions[i];
      }
    }

    //snake[i].style.left = snake[i - 1].style.left;
    $("#" + snake[i].id).animate(
      { left: snake[i - 1].style.left, top: snake[i - 1].style.top },
      { duration: animationTime, easing: "linear" }
    );
    //snake[i].style.top = snake[i - 1].style.top;
    snakePositions[i] = snakePositions[i - 1];
  }
  //printMap();
  
  drawCanvas();
}

function drawCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = snakeColor;
  context.lineWidth = snakeWidth;
  context.lineCap = "round";
  

  for (var i = 0; i < snake.length; i++) {
    if (i == 0) {
      context.beginPath();
      
      let startPoint = getLinePoint(snakePositions[0], lastMovedDirection, false);
      let endPoint = getLinePoint(snakePositions[0], lastMovedDirection, true);
      let directionFacing = lastMovedDirection;
      
      if (lastMovedDirection[0] == 0 && lastMovedDirection[1] == 0) {
        directionFacing = [1, 0];
      }
            
      context.moveTo(startPoint[0], startPoint[1]);
      context.lineTo(endPoint[0] - directionFacing[0] * snakeWidth, endPoint[1] - directionFacing[1] * snakeWidth);
      context.stroke();
      
      continue;
    } else if (i == snake.length - 1) {
      context.beginPath();
      let startPosition = getLinePoint(snakePositions[i], getDirection(snakePositions[i - 1], snakePositions[i]), false);
      let endPosition = getLinePoint(snakePositions[i], getDirection(snakePositions[i - 1], snakePositions[i]), true);
      context.moveTo(startPosition[0], startPosition[1]);
      context.lineTo(endPosition[0] - getDirection(snakePositions[i - 1], snakePositions[i])[0] * snakeWidth, endPosition[1] - getDirection(snakePositions[i - 1], snakePositions[i])[1] * snakeWidth);
      context.stroke();
      
      continue;
    } else if (!isInLine(snakePositions[i], snakePositions[i + 1], getDirection(snakePositions[i - 1], snakePositions[i]))) { // we are on a curve
      context.beginPath();
      let startDirection = getDirection(snakePositions[i - 1], snakePositions[i]);
      let endDirection = getDirection(snakePositions[i], snakePositions[i + 1]);

      let startPosition = getArcPoint(snakePositions[i], startDirection, endDirection, false);
      let endPosition = getArcPoint(snakePositions[i], startDirection, endDirection, true);
      let cornerPos = getCornerPos(startPosition, startDirection);

      context.moveTo(startPosition[0], startPosition[1]);
      context.arcTo(cornerPos[0], cornerPos[1], endPosition[0], endPosition[1], 15);
      context.stroke();
    } else {
      context.beginPath();
      let startPosition = getLinePoint(snakePositions[i], getDirection(snakePositions[i - 1], snakePositions[i]), false);
      let endPosition = getLinePoint(snakePositions[i], getDirection(snakePositions[i - 1], snakePositions[i]), true);
      context.moveTo(startPosition[0], startPosition[1]);
      context.lineTo(endPosition[0], endPosition[1]);
      context.stroke();
    }
  }
}

function getCornerPos(position, direction) {
  return [position[0] + (direction[0] * 15), position[1] + (direction[1] * 15)];
}

function getLinePoint(position, direction, endPosition) {
  if (endPosition) {
    return [position[0] * 30 + 15 + (direction[0] * 15), position[1] * 30 + 15 + (direction[1] * 15)];
  }
  return [position[0] * 30 + 15 + (direction[0] * -15), position[1] * 30 + 15 + (direction[1] * -15)];
}

function getArcPoint(position, direction1, direction2, endPosition) {
  if (endPosition) {
    return [position[0] * 30 + 15 + (direction2[0] * 15), position[1] * 30 + 15 + (direction2[1] * 15)];
  }
  return [position[0] * 30 + 15 + (direction1[0] * -15), position[1] * 30 + 15 + (direction1[1] * -15)];
}

function getDirection(pos1, pos2) {
  if (pos1[0] > pos2[0]) {
    return [-1, 0];
  } else if (pos1[0] < pos2[0]) {
    return [1, 0];
  } else if (pos1[1] > pos2[1]) {
    return [0, -1];
  } else if (pos1[1] < pos2[1]) {
    return [0, 1];
  }
}

function isInLine(pos1, pos2, direction) {
  if (direction[0] == 0 && pos1[0] == pos2[0]) {
    return true;
  } else if (direction[1] == 0 && pos1[1] == pos2[1]) {
    return true;
  }
  
  return false;
}

function snakeOptions() {
  $("#optionsContent").html(`
    <br style="line-height: 15px"><label style="margin-top: 30px;" for="snakeMode">Snake Mode</label>
    <select id="snakeMode" onchange="updateSelectOption(this, 'snakeMode')">
      <option value="normal">Normal</option>
      <option value="smooth">Smooth</option>
      <option value="blocky">Blocky</option>
    </select><br>
    <label for="deathOption" onclick="updateCheckOption(this, 'enableDeath')">Enable Death</label><input id="deathOption" onclick="updateCheckOption(this, 'enableDeath')" type="checkbox"><br>
    <label for="speedOption">Speed</label><input value="350" max="500" min="0" onchange="updateSliderOption(this, 'speed')" id="speedOption" type="range"><br>
    <label for="snakeWidthOption">Snake Width</label><input value="15" max="30" min="1" onchange="updateSliderOption(this, 'snakeWidth')" id="snakeWidthOption" type="range"><br>
    <label for="snakeColorOption">Snake Color</label><input value="#99FF99" onchange="updateSliderOption(this, 'snakeColor')" id="snakeColorOption" type="color"><br>
    <label for="snakeBorderColorOption">Border Color</label><input value="#90EE90" onchange="updateSliderOption(this, 'snakeBorderColor')" id="snakeBorderColorOption" type="color"><br>
`);
  document.getElementById("deathOption").checked =
    getCookie("enableDeath") == "off" ? false : true;
  document.getElementById("speedOption").value =
    getCookie("speed") === undefined ? "350" : getCookie("speed");
  document.getElementById("snakeMode").value = 
    getCookie("snakeMode") === undefined ? "normal" : getCookie("snakeMode");
  document.getElementById("snakeWidthOption").value = 
    getCookie("snakeWidth") === undefined ? 15 : getCookie("snakeWidth");
  document.getElementById("snakeColorOption").value = 
    getCookie("snakeColor") === undefined ? "#99FF99" : getCookie("snakeColor");
  document.getElementById("snakeBorderColorOption").value = 
    getCookie("snakeBorderColor") === undefined ? "#90EE90" : getCookie("snakeBorderColor");
  document.getElementById("snakeOptions").style.backgroundColor = "gray";
  document.getElementById("fruitOptions").style.backgroundColor = "";
  document.getElementById("mapOptions").style.backgroundColor = "";
  document.getElementById("otherOptions").style.backgroundColor = "";
}

function fruitOptions() {
  $("#optionsContent").html(`
    <label for="fruitCount">Fruit Count</label><input min="1" max = "1000" id="fruitCount" onchange="updateSelectOption(this, 'fruitCount')" type="number"><br>
  `);
  document.getElementById("fruitCount").value =
    getCookie("fruitCount") === undefined ? 1 : getCookie("fruitCount");
  document.getElementById("snakeOptions").style.backgroundColor = "";
  document.getElementById("fruitOptions").style.backgroundColor = "gray";
  document.getElementById("mapOptions").style.backgroundColor = "";
  document.getElementById("otherOptions").style.backgroundColor = "";
}

function mapOptions() {
  $("#optionsContent").html(`
    <label for="mapWidth">Map Width</label><input min="10" max="10000" id="mapWidth" onchange="updateSelectOption(this, 'mapWidth', mapOptions)" type="number"><input id="enableWidth" onclick="updateCheckOption(this, 'enableWidth')" type="checkbox"><br>
    <label for="mapHeight">Map Height</label><input min="10" max="10000" id="mapHeight" onchange="updateSelectOption(this, 'mapHeight', mapOptions)" type="number"><input id="enableHeight" onclick="updateCheckOption(this, 'enableHeight')" type="checkbox"><br>
    <br style="line-height: 15px"><label style="margin-top: 30px;" for="gameMode">Game Mode</label>
    <select id="gameMode" onchange="updateSelectOption(this, 'gameMode')">
      <option value="normal">Normal</option>
      <option value="infinite">Infinite</option>
    </select><br>
  `);
  loadCookies();
  document.getElementById("gameMode").value =
    getCookie("gameMode") === undefined ? "normal" : getCookie("gameMode");
  document.getElementById("enableWidth").checked =
    getCookie("enableWidth") == "on" ? true : false;
  document.getElementById("enableHeight").checked =
    getCookie("enableHeight") == "on" ? true : false;
  document.getElementById("mapWidth").value =
    getCookie("mapWidth") === undefined ? 13 : getCookie("mapWidth");
  document.getElementById("mapHeight").value =
    getCookie("mapHeight") === undefined ? 13 : getCookie("mapHeight");
  document.getElementById("snakeOptions").style.backgroundColor = "";
  document.getElementById("fruitOptions").style.backgroundColor = "";
  document.getElementById("mapOptions").style.backgroundColor = "gray";
  document.getElementById("otherOptions").style.backgroundColor = "";
}

function otherOptions() {
  $("#optionsContent").html(`
    <br style="line-height: 15px"><label style="margin-top: 30px;" for="disguiseTab" onclick="updateCheckOption(this, 'disguiseTab')">Disguise Tab</label>
    <select id="disguiseTab" onchange="updateSelectOption(this, 'disguiseTab')">
      <option value="on">Automatic</option>
      <option value="force">Always</option>
      <option value="off">Never</option>
      <option value="undefined">Ask At School</option>
    </select>
    <button type="button" class="start" onclick="checkSchoolHours(true)">Disguise Now</button>
  `);
  document.getElementById("disguiseTab").value = getCookie("disguiseTab");
  document.getElementById("snakeOptions").style.backgroundColor = "";
  document.getElementById("fruitOptions").style.backgroundColor = "";
  document.getElementById("mapOptions").style.backgroundColor = "";
  document.getElementById("otherOptions").style.backgroundColor = "gray";
}

function updateSelectOption(object, optionName, reloadPage) {
  if (
    object.value < parseInt(object.getAttribute("min"), 10) ||
    object.value > parseInt(object.getAttribute("max"), 10)
  ) {
    alert(
      "Value must be between " +
        object.getAttribute("min") +
        " and " +
        object.getAttribute("max") +
        "."
    );
    reloadPage();
    return;
  }

  document.cookie = optionName + "=" + object.value;
  loadCookies();
}

function updateSliderOption(object, optionName) {
  document.cookie = optionName + "=" + object.value;
  loadCookies();
}

function updateCheckOption(object, optionName) {
  document.cookie = optionName + "=" + (object.checked ? "on" : "off");
  loadCookies();
}

function loadCookies() {
  if (getCookie("enableWidth") != "on") {
    mapWidth = Math.floor((window.innerWidth - 50) / 30);
  } else {
    mapWidth = getCookie("mapWidth") === undefined ? 13 : getCookie("mapWidth");
  }

  if (getCookie("enableHeight") != "on") {
    mapHeight = Math.floor((window.innerHeight - 175) / 30);
  } else {
    mapHeight =
      getCookie("mapHeight") === undefined ? 13 : getCookie("mapHeight");
  }
  
  delay = 500 - (getCookie("speed") === undefined ? 350 : getCookie("speed"));
  
  snakeWidth = (getCookie("snakeWidth") === undefined ? 15 : getCookie("snakeWidth"));
  
  snakeColor = getCookie("snakeColor") === undefined ? "#99FF99" : getCookie("snakeColor");
  snakeBorderColor = getCookie("snakeBorderColor") === undefined ? "#90EE90" : getCookie("snakeBorderColor");
  
  if (getCookie("snakeMode") === undefined || getCookie("snakeMode") == "normal") {
    snakeMode = "normal";
    document.getElementById("backgroundBox").style.display = "none";
    canvas.style.display = "";
  } else {
    snakeMode = getCookie("snakeMode");
    canvas.style.display = "none";
    document.getElementById("backgroundBox").style.display = "";
  }
  
  if (snakeMode == "normal" || snakeMode == "blocky") {
    animationTime = 0;
  } else {
    animationTime = delay;
  }

  document.getElementById("backgroundBox").style.width =
    (mapWidth * 30).toString() + "px";
  document.getElementById("backgroundBox").style.height =
    (mapHeight * 30).toString() + "px";
  document.getElementById("backgroundBox").style.marginLeft =
    "calc((50% - (" + (mapWidth * 30).toString() + "px / 2)) - 12px)";
  
  document.getElementById("foodBox").style.width =
    (mapWidth * 30).toString() + "px";
  document.getElementById("foodBox").style.height =
    (mapHeight * 30).toString() + "px";
  document.getElementById("foodBox").style.marginLeft =
    "calc((50% - (" + (mapWidth * 30).toString() + "px / 2)) - 12px)";

  document.getElementById("countdownBox").style.width =
    (mapWidth * 30).toString() + "px";
  document.getElementById("countdownBox").style.height =
    (mapHeight * 30).toString() + "px";
  document.getElementById("countdownBox").style.marginLeft =
    "calc((50% - (" + (mapWidth * 30).toString() + "px / 2)) - 12px)";

  canvas.height = (mapHeight * 30).toString();
  canvas.width = (mapWidth * 30).toString();
  canvas.style.marginLeft =
    "calc((50% - (" + (mapWidth * 30).toString() + "px / 2)) - 12px)";
  canvas.style.marginLeft =
    "calc((50% - (" + (mapWidth * 30).toString() + "px / 2)) - 12px)";

  document.getElementById("countdownNumbers").style.marginTop =
    "calc(" + ((mapHeight * 30) / 2).toString() + "px - (155px / 2))";

  gameMode =
    getCookie("gameMode") === undefined ? "normal" : getCookie("gameMode");
  deathAllowed = getCookie("enableDeath") == "off" ? false : true;
  numFood = getCookie("fruitCount") === undefined ? 1 : getCookie("fruitCount");
  
  reset();
}

$(function() {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  loadCookies();
  checkSchoolHours();
  snakeOptions();
  reset();
});