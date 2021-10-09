// map key:
// e = empty
// s = snake
// f = food

const classroomIconUrl =
  "https://cdn.glitch.me/61845a2e-50dd-416e-b27c-f6c4d479d0ad%2Ffavicon.png?v=1633720408561";

var map = [];
var snake = [];
var direction = [1, 0];
var lastMovedDirection = direction;
const mapHeight = 15;
const mapWidth = 15;
var snakePositions = [];
var snakePosition = [5, 6];
var endSnakePosition = [3, 6];
var foods = [];
const startSnakeLength = 3;
var blocksToAdd = 0;
var score = 0;
var interval;
var delay;
var animationTime;
var dead = true;
var deathAllowed;

function die(delay = 1000, forceEnd = false) {
  if (dead || (!deathAllowed && !forceEnd)) {
    return;
  }
  dead = true;
  clearInterval(interval);
  setTimeout(function() {
    document.getElementById("dimBox").style.display = "";
  }, delay);
}

document.onkeydown = function(e) {
  if (dead) {
    return;
  }
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
    case "Escape":
      die(0, true);
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
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function checkSchoolHours() {
  if (getCookie('disguiseTab') == 'off') {
    return;
  }

  let date = new Date();
  if (date.getDay() != 0 && date.getDay() != 6) {
    if (
      (date.getHours() > 7 && date.getHours() < 14) ||
      (date.getHours() == 7 && date.getMinutes() >= 40) ||
      (date.getHours() == 14 && date.getMinutes() <= 40)
    ) {
      if (getCookie('disguiseTab') == 'on' || confirm("You are playing snake during school hours.\nWould you like to disguise this tab as a google classroom window?")) {
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
  map = [];
  snake = [];
  direction = [1, 0];
  lastMovedDirection = direction;
  snakePositions = [];
  snakePosition = [5, 6];
  endSnakePosition = [3, 6];
  foods = [];
  blocksToAdd = 0;
  score = 0;
  dead = false;

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
    snakePositions.push([snakePosition[0] - i, snakePosition[1]]);
  }

  spawnFood();
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

function start() {
  reset();
  document.getElementById("dimBox").style.display = "none";
  $("#countdownNumbers").show();
  $("#countdownBox").show();
  $("#countdownNumbers").html('3');
  $("#countdownNumbers").fadeOut(1000, () => {
    $("#countdownNumbers").html('2');
    $("#countdownNumbers").show();
    
    $("#countdownNumbers").fadeOut(1000, () => {
      $("#countdownNumbers").html('1');
      $("#countdownNumbers").show();
      
      $("#countdownNumbers").fadeOut(1000, () => {
        $("#countdownBox").fadeOut(1000);
        interval = setInterval(move, delay);
      });
    });
  });
}

function move() {
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
      (map[coordinateToIndex(snakePosition[0] + 0,snakePosition[1] + 1)] == 's' || 
       !coordinateIsWithin(snakePosition[0] + 0,snakePosition[1] + 1,mapWidth,mapHeight)) && // [0, 1]
      (map[coordinateToIndex(snakePosition[0] + 0,snakePosition[1] + -1)] == 's' || 
      !coordinateIsWithin(snakePosition[0] + 0,snakePosition[1] + -1,mapWidth,mapHeight)) && // [0, -1]
      (map[coordinateToIndex(snakePosition[0] + 1,snakePosition[1] + 0)] == 's' || 
      !coordinateIsWithin(snakePosition[0] + 1,snakePosition[1] + 0,mapWidth,mapHeight)) && // [1, 0]
      (map[coordinateToIndex(snakePosition[0] + -1,snakePosition[1] + 0)] == 's' || 
      !coordinateIsWithin(snakePosition[0] + -1,snakePosition[1] + 0,mapWidth,mapHeight)) // [-1, 0]
    ) {
      die(1000, true);  
    }
    die();
    return;
  } else if (spaceAhead == "f") {
    score++;
    document.getElementById("title").innerHTML =
      "Snake Score: " +
      score.toString();
    blocksToAdd++;
    removeFood([
      snakePosition[0] + direction[0],
      snakePosition[1] + direction[1]
    ]);
    spawnFood();
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
}

function snakeOptions() {
  $("#optionsContent").html(`
    <label for="choppyOption" onclick="updateCheckOption(this, 'smoothSnake')">Smooth Snake</label><input id="choppyOption" onclick="updateCheckOption(this, 'smoothSnake')" type="checkbox"><br>
    <label for="deathOption" onclick="updateCheckOption(this, 'enableDeath')">Enable Death</label><input id="deathOption" onclick="updateCheckOption(this, 'enableDeath')" type="checkbox"><br>
    <label for="speedOption">Speed</label><input value="350" max="500" min="0" onchange="updateSliderOption(this, 'speed')" id="speedOption" type="range"><br>
  `);
  document.getElementById("choppyOption").checked = (getCookie("smoothSnake") == "off" ? false : true);
  document.getElementById("deathOption").checked = (getCookie("enableDeath") == "off" ? false : true);
  document.getElementById("speedOption").value = (getCookie("speed") === undefined ? "350" : getCookie("speed"));
  document.getElementById("snakeOptions").style.backgroundColor = "gray";
  document.getElementById("fruitOptions").style.backgroundColor = "";
  document.getElementById("mapOptions").style.backgroundColor = "";
  document.getElementById("otherOptions").style.backgroundColor = "";
}

function fruitOptions() {
  $("#optionsContent").html(`
    fruit options
  `);
  document.getElementById("snakeOptions").style.backgroundColor = "";
  document.getElementById("fruitOptions").style.backgroundColor = "gray";
  document.getElementById("mapOptions").style.backgroundColor = "";
  document.getElementById("otherOptions").style.backgroundColor = "";
}

function mapOptions() {
  $("#optionsContent").html(`
    map options
  `);
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
      <option value="off">Never</option>
      <option value="undefined">Ask At School</option>
    </select>
  `);
  document.getElementById("disguiseTab").value = getCookie("disguiseTab");
  document.getElementById("snakeOptions").style.backgroundColor = "";
  document.getElementById("fruitOptions").style.backgroundColor = "";
  document.getElementById("mapOptions").style.backgroundColor = "";
  document.getElementById("otherOptions").style.backgroundColor = "gray";
}

function updateSelectOption(object, optionName) {
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
  delay = 500 - (getCookie("speed") === undefined ? 350 : getCookie("speed"));
  animationTime = (getCookie('smoothSnake') == 'off' ? 0 : delay);
  deathAllowed = (getCookie('enableDeath') == 'off' ? false : true);
}

$(function() {
  loadCookies();
  checkSchoolHours();
  snakeOptions();  
  reset();
});