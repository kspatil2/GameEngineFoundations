function SnakeGame() {
  this.canvas = document.getElementById("whyupdate");
  this.context = this.canvas.getContext('2d');
  this.engine = new Engine(this.canvas, this.context, "2D");
}


SnakeGame.prototype.init = function () {

  this.cellSize = 20;
  var levelWidth = this.canvas.width / this.cellSize;
  var levelHeight = this.canvas.height / this.cellSize;
  this.engine.network.initNetwork('cupxwsjrn486w29');
  document.getElementById("playerId").innerHTML = this.engine.network.peerId;
  document.getElementById("hostButton").onclick = this.host.bind(this);
  document.getElementById("joinButton").onclick = this.join.bind(this);
  this.levels = new Levels(this.engine, levelWidth, levelHeight, this.cellSize, this.spriteStyle["wall"]);
  this.levels.addBoundaryObjectsToEngine();
  this.levels.addLevelObjectsToEngine(this.levels.current_level);

  this.food = new Food(this.engine, levelWidth, levelHeight, this.cellSize, this.spriteStyle["food"], this.spriteStyle["spoiledFood"]);

  this.snakes = new Array();

  // Add the first snake
  var snake = new SnakeLinks(this.engine, this.spriteStyle["snake"], 5, this.cellSize, levelWidth, levelHeight, 'right');
  snake.addSnakeLinksToEngine();

  this.snakes.push(snake);

  // Add the secind snake
  var secondarySnake = new SnakeLinks(this.engine, this.spriteStyle["blueSnake"], 5, this.cellSize, levelWidth, levelHeight, 'left');
  secondarySnake.addSnakeLinksToEngine();

  this.snakes.push(secondarySnake);

  this.pauseGame = true;

  // Initialize scoring
  this.init_scoring();

  //Bind game level listeners
  this.engine.input.setKeyboardPressHandler(this.keyPressed.bind(this));
  this.engine.collision.setCollisionHandler(this.handleCollission.bind(this));
  this.engine.network.setNetworkEventHandler(this.networkEventHandler.bind(this));
  this.engine.network.setConnectionRestoreHandler(this.onConnectionRestored.bind(this));
  this.engine.setUpdateHandler(this.update.bind(this));
  this.engine.setDrawHandler(this.draw.bind(this));
}

//Network Event Receive Handler
SnakeGame.prototype.networkEventHandler = function(data) {
  switch(data.message) {
    case "Start": 
      this.pauseGame = false;
      break;
    case "Food":
      this.food.food = this.food.generate_food(this.food.food, data.value.foodX, data.value.foodY, this.spriteStyle["food"], "food");
      this.food.createNewFood = false;
      break;
    case "SpoiledFood":
      this.food.spoiledFood = this.food.generate_food(this.food.spoiledFood, data.value.foodX, data.value.foodY, this.spriteStyle["spoiledFood"], "spoiledFood");
      this.food.createNewFood = false;
      break;
    case "FoodScoreUpdate":
      this.snakes[data.value.eatenBy].ateFood = true;
      this.snakes[0].score = data.value.score[0];
      this.snakes[1].score = data.value.score[1];
      break;
    case "SpoiledFoodScoreUpdate":
      this.snakes[data.value.eatenBy].ateSpoiledFood = true;
      this.snakes[0].score = data.value.score[0];
      this.snakes[1].score = data.value.score[1];
      break;
    case "End":
      console.log(data.value)
      this.endGame(data.value);
      break;
    case "Key":
      this.move(data.value, data.playerId);
      break;
  }
}

SnakeGame.prototype.onConnectionRestored = function(){
  document.getElementById("connect").style.display = "none";
  document.getElementById("game").style.display = "block";
  this.pauseGame = false;
}


SnakeGame.prototype.host = function() {
  document.getElementById("connect").innerHTML = "Waiting...";
  this.engine.network.host();
}

SnakeGame.prototype.join = function() {
  document.getElementById("connect").style.display = "none";
  document.getElementById("game").style.display = "block";
  var peerId = document.getElementById("peer").value;
  this.engine.network.join(peerId.toString());
}

SnakeGame.prototype.endGame = function(playerId) {
  this.pauseGame = true;
  var winner;
  if(playerId == 0)
    winner = "Green";
  else
    winner = "Blue";
  document.getElementById("connect").style.display = "block";
  document.getElementById("game").style.display = "none";
  document.getElementById("connect").innerHTML = "<h2>"+ winner +" Wins !</h2>"
}

SnakeGame.prototype.newLevel = function () {
  this.engine.resetObjects();
  this.levels.addBoundaryObjectsToEngine();
  this.levels.addLevelObjectsToEngine(this.levels.current_level);
  this.levels.startNewLevel = false;
  this.food.init();
  this.snakes[0].init();
  this.snakes[1].init();
  this.snakes[0].addSnakeLinksToEngine();
  this.snakes[1].addSnakeLinksToEngine();
  //Bind game level listeners
  this.engine.input.setKeyboardPressHandler(this.keyPressed.bind(this));
  this.engine.collision.setCollisionHandler(this.handleCollission.bind(this));
}

SnakeGame.prototype.handleCollission = function (head, collidedSprite) {
  var snake = null;
  var eatenBy;
  if(head.id == this.snakes[0].snakeLinksArray[0].id) {
    snake = this.snakes[0];
    eatenBy = 0;
  }
  else if(head.id == this.snakes[1].snakeLinksArray[0].id) {
    snake = this.snakes[1];
    eatenBy = 1;
  }
  if(snake == null)
    return;

  if (collidedSprite.tags.name == "food") {
    snake.ateFood = true;
    this.food.createNewFood = true;
    if (this.food.spoiledFoodTimeLeft <= 0)
      this.food.createNewSpoiledFood = true;
    //this.levels.score += 25;
    snake.score += 25;
    this.engine.network.send("FoodScoreUpdate", {score: [this.snakes[0].score, this.snakes[1].score], eatenBy: eatenBy});
  }
  else if (collidedSprite.tags.name == "spoiledFood" && snake.snakeLinksArray.length > 1) {
    snake.ateSpoiledFood = true;
    this.food.createNewSpoiledFood = true;
    //this.levels.score -= 50;
    this.engine.network.send("SpoiledFoodScoreUpdate", {score: [this.snakes[0].score, this.snakes[1].score], eatenBy: eatenBy});
    snake.score -= 50;
  }
  else {
    if(snake == this.snakes[0])
    {
      this.endGame(1);
      console.log("Game ended sent")
      this.engine.network.send("End", 1);
    }
    else
    {
      this.endGame(0);
      console.log("Game ended sent")
      this.engine.network.send("End", 0);
    }
    this.pauseGame = true;
  }
}

SnakeGame.prototype.keyPressed = function(key) {
  this.engine.network.send("Key", key);
  this.move(key, this.engine.network.playerId);
}

SnakeGame.prototype.move = function (key, playerId) {
  switch (key) {
    case "ArrowLeft":
      if (this.snakes[playerId].direction != "right") this.snakes[playerId].direction = "left";
      break;
    case "ArrowRight":
      if (this.snakes[playerId].direction != "left") this.snakes[playerId].direction = "right";
      break;
    case "ArrowUp":
      if (this.snakes[playerId].direction != "down") this.snakes[playerId].direction = "up";
      break;
    case "ArrowDown":
      if (this.snakes[playerId].direction != "up") this.snakes[playerId].direction = "down";
      break;
  }
}

SnakeGame.prototype.loadContent = function () {
  if (this.engine.loadSpriteSheet("spritesheet.png") != true)
    return false;

  this.spriteStyle = {
    "snake": { x: 300, y: 300, width: 300, height: 300 },
    "food": { x: 0, y: 300, width: 300, height: 300 },
    "wall": { x: 0, y: 0, width: 300, height: 300 },
    "spoiledFood": { x: 300, y: 0, width: 300, height: 300 },
    "blueSnake": {x: 0, y: 600, width: 300, height: 300}
  };

  return true;
}

SnakeGame.prototype.update = function () {
  if (this.pauseGame)
    return;

  this.engine.update();

  for (var i = 0; i < this.snakes.length; ++i)
    this.snakes[i].update();

  //Set head of snake as a moved object to compute collision.
  this.engine.input.setMovedObject(this.snakes[0].snakeLinksArray[0].id);
  this.engine.input.setMovedObject(this.snakes[1].snakeLinksArray[0].id);

  this.food.update();

  this.refresh_score();

  var maxScore = Math.max(this.snakes[0].score, this.snakes[1].score);

  this.levels.update(maxScore);
  if (this.levels.startNewLevel == true)
    this.newLevel();
}

SnakeGame.prototype.drawLayout = function () {
  var context = this.context;
  var canvas = this.canvas;

  context.lineWidth = "3";
  context.strokeStyle = "black";
  context.beginPath();

  context.moveTo(0, canvas.height - 1);
  context.lineTo(canvas.width, canvas.height - 1);
  context.stroke();

  context.moveTo(0, 1);
  context.lineTo(canvas.width, 1);
  context.stroke();

  context.moveTo(1, 1);
  context.lineTo(1, canvas.height);
  context.stroke();

  context.moveTo(canvas.width - 1, 0);
  context.lineTo(canvas.width - 1, canvas.height);
  context.stroke();
}

SnakeGame.prototype.draw = function () {
  if (this.pauseGame)
    return;
  this.engine.draw();
  this.drawLayout();
}

SnakeGame.prototype.init_scoring = function () {
  this.player1Label = document.getElementById("player1score");
  this.levelLabel = document.getElementById("level");
  this.player2Label = document.getElementById("player2score");
  
  this.refresh_score();
}

SnakeGame.prototype.refresh_score = function () {
  this.player1Label.innerHTML = this.snakes[0].score;
  this.player2Label.innerHTML = this.snakes[1].score;
  this.levelLabel.innerHTML = this.levels.current_level + 1; // level number is zero based
}

function Levels(engine, width, height, cellSize, spriteStyle) {
  this.engine = engine;
  this.spriteStyle = spriteStyle;
  this.create_boundary_walls(height, width, cellSize);
  this.create_levels(height, width, cellSize);
  this.init();
}

Levels.prototype.init = function () {
  //this.score = 0;
  this.current_level = 0;
  //this.init_scoring();
}

Levels.prototype.create_boundary_walls = function (height, width, cellSize) {
  this.boundary = [];
  var name = "wall";
  for (var i = 0; i < width; i++) {
    var x = i * cellSize;
    var current_sprite = new Sprite(x, 0, cellSize, cellSize, this.spriteStyle);
    current_sprite.tags.name = name;
    this.boundary.push(current_sprite);
  }
  for (var i = 1; i < height; i++) {
    var x = width * cellSize - cellSize;
    var y = i * cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.spriteStyle);
    current_sprite.tags.name = name;
    this.boundary.push(current_sprite);
  }
  for (var i = 1; i < height; i++) {
    var y = i * cellSize;
    var current_sprite = new Sprite(0, y, cellSize, cellSize, this.spriteStyle);
    current_sprite.tags.name = name;
    this.boundary.push(current_sprite);
  }
  for (var i = 1; i < width; i++) {
    var x = i * cellSize;
    var y = height * cellSize - cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.spriteStyle);
    current_sprite.tags.name = name;
    this.boundary.push(current_sprite);
  }
}

Levels.prototype.create_levels = function (height, width, cellSize) {
  this.gameLevels = new Array();

  //Level 0
  this.gameLevels[0] = new Array();
  //Level 1
  this.gameLevels[1] = new Array();
  //Level 2
  this.gameLevels[2] = new Array();

  var name = "wall";
  for (var i = 0; i < width / 2; i++) {
    var x = (i + Math.round(0.25 * width)) * cellSize;
    var y = (height / 2) * cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.spriteStyle);
    current_sprite.tags.name = name;
    this.gameLevels[1].push(current_sprite);
  }
  //level 2
  for (var i = 0; i < height / 4; i++) {
    var x = cellSize * (width / 2);
    var y = (i + Math.round(0.15 * height)) * cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.spriteStyle);
    current_sprite.tags.name = name;
    this.gameLevels[2].push(current_sprite);
  }

  for (var i = 0; i < height / 4; i++) {
    var x = cellSize * (width / 2);
    var y = (i + Math.round(0.60 * height)) * cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.spriteStyle);
    current_sprite.tags.name = name;
    this.gameLevels[2].push(current_sprite);
  }

  for (var i = 0; i < width / 4; i++) {
    var x = (i + Math.round(0.20 * width)) * cellSize;
    var y = (height / 2 - 1) * cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.spriteStyle);
    current_sprite.tags.name = "wall";
    this.gameLevels[2].push(current_sprite);
  }
  for (var i = 0; i < width / 4; i++) {
    var x = (i + Math.round(0.60 * width)) * cellSize;
    var y = (height / 2 - 1) * cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.spriteStyle);
    current_sprite.tags.name = "wall";
    this.gameLevels[2].push(current_sprite);
  }
}

Levels.prototype.addBoundaryObjectsToEngine = function () {
  for (var i = 0; i < this.boundary.length; i++) {
    this.engine.addObject(this.boundary[i]);
  }
}

Levels.prototype.addLevelObjectsToEngine = function (level) {
  for (var i = 0; i < this.gameLevels[level].length; i++) {
    this.engine.addObject(this.gameLevels[level][i]);
  }
}

Levels.prototype.removeLevelObjectsFromEngine = function (level) {
  for (var i = 0; i < this.gameLevels[level].length; i++) {
    this.engine.deleteObject(this.gameLevels[level][i].id);
  }
}

Levels.prototype.update = function (score) {
  //this.refresh_score();

  var new_level = Math.floor(score / 10000);
  new_level = Math.max(0, new_level);
  if (new_level != this.current_level) {
    this.removeLevelObjectsFromEngine(this.current_level);
    if (new_level >= 3) {
      this.init();
      new_level = 0;
    }
    this.startNewLevel = true;
    this.addLevelObjectsToEngine(new_level);
  }
  this.current_level = new_level;
}

function SnakeLinks(engine, spriteStyle, initialLength, cellSize, levelWidth, levelHeight, direction) {
  this.engine = engine;
  this.spriteStyle = spriteStyle;
  this.cellSize = cellSize;
  this.initialLength = initialLength;

  this.direction = direction;
  this.levelWidth = levelWidth;
  this.levelHeight = levelHeight;

  this.init();
}

SnakeLinks.prototype.init = function () {
  //this.direction = "right";
  this.create_snake(this.initialLength);
  this.ateFood = false;
  this.atePoisonousFood = false;
  this.score = 0;
}

SnakeLinks.prototype.create_snake = function (length) {
  this.snakeLinksArray = [];
  for (var i = length - 1; i >= 0; i--) {

    var x = 0;
    var y = 0;

    // TODO: extend the logic to accomodate other positions and directions
    if (this.direction == 'right') {
      // spawn the snake at top left
      x = (i + 1) * this.cellSize;
      y = this.cellSize;
    }
    else {
      // direction is left, spawn the snake at bottom right
      x = (this.levelWidth - i - 1) * this.cellSize;
      y = (this.levelHeight - 2) * this.cellSize;
    }

    var current_sprite = new Sprite(x, y, this.cellSize, this.cellSize, this.spriteStyle);
    current_sprite.tags.name = "snake";
    this.snakeLinksArray.push(current_sprite);
  }
}

SnakeLinks.prototype.addSnakeLinksToEngine = function () {
  for (var i = 0; i < this.snakeLinksArray.length; i++) {
    this.engine.addObject(this.snakeLinksArray[i]);
  }
}

SnakeLinks.prototype.update = function () {
  var nx = this.snakeLinksArray[0].X / this.cellSize;
  var ny = this.snakeLinksArray[0].Y / this.cellSize;
  if (this.direction == "right") nx++;
  else if (this.direction == "left") nx--;
  else if (this.direction == "up") ny--;
  else if (this.direction == "down") ny++;
  var tail = this.snakeLinksArray[this.snakeLinksArray.length - 1];
  if (this.ateFood == true) {
    //we ate normal food. so add tail to the last link
    tail = new Sprite(nx * this.cellSize, ny * this.cellSize, this.cellSize, this.cellSize, this.spriteStyle);
    tail.tags.name = "snake";
    this.engine.addObject(tail);
    this.ateFood = false;
    this.snakeLinksArray.unshift(tail);
  }
  else if (this.ateSpoiledFood == true) {
    //we ate spoiled food, so only pop;
    tail = this.snakeLinksArray.pop();
    this.engine.deleteObject(tail.id);
    this.ateSpoiledFood = false;
  } else {
    //we don't need to extend length of snake here, so pop last link
    tail = this.snakeLinksArray.pop();
    tail.X = nx * this.cellSize;
    tail.Y = ny * this.cellSize;
    this.snakeLinksArray.unshift(tail);
  }
}

function Food(engine, width, height, cellSize, spriteStyle, spoiledSpriteStyle) {
  this.engine = engine;
  this.width = width;
  this.height = height;
  this.cellSize = cellSize;
  this.spriteStyle = spriteStyle;
  this.spoiledSpriteStyle = spoiledSpriteStyle;
  this.init();
}

Food.prototype.init = function () {
  this.createNewFood = true;
  this.createNewSpoiledFood = true;
  this.food = undefined;
  this.spoiledFood = undefined;
  //this.update();
}


Food.prototype.generate_food_pos = function() {
  var unique_xy = false;
  while (unique_xy == false) {
    x = Math.round(Math.random() * (this.width - 1));
    y = Math.round(Math.random() * (this.height - 1));
    var actualX = x * this.cellSize + (this.cellSize / 2);
    var actualY = y * this.cellSize + (this.cellSize / 2);
    if (!this.engine.collision.checkCollisionWithAllObjects(actualX, actualY) && y != 1) {
      unique_xy = true;
    }
  }
  return [x, y];
}

Food.prototype.generate_food = function(food, x, y, spriteStyle, name) {
  if (food == undefined) {
    food = new Sprite(this.cellSize * x, this.cellSize * y, this.cellSize, this.cellSize, spriteStyle);
    food.tags.name = name;
    this.engine.addObject(food);
  }
  food.X = x * this.cellSize;
  food.Y = y * this.cellSize;
  this.spoiledFoodTimeLeft = 10;
      
  return food;
}

Food.prototype.create_food = function (food, spriteStyle, name) {
  var x, y;
  [x, y] = this.generate_food_pos();
  return this.generate_food(food, x, y, spriteStyle, name);
}

Food.prototype.update = function () {
  if (this.createNewFood == true) {
      this.food = this.create_food(this.food, this.spriteStyle, "food");
      this.engine.network.send("Food", {
        foodX: x,
        foodY: y
      });
    this.createNewFood = false;
  }
  if (this.createNewSpoiledFood == true) {
      this.spoiledFood = this.create_food(this.spoiledFood, this.spoiledSpriteStyle, "spoiledFood");
      this.engine.network.send("SpoiledFood", {
        foodX: x,
        foodY: y
      });
    this.createNewSpoiledFood = false;
  }
  if (this.spoiledFoodTimeLeft > 0) {
    this.spoiledFoodTimeLeft--;
    if (this.spoiledFoodTimeLeft <= 0) {
      if(this.spoiledFood)
        this.engine.deleteObject(this.spoiledFood.id);
      this.spoiledFood = undefined;
    }
  }
}

function initGame() {
  var game = new SnakeGame();
  if (game.loadContent() != true)
    return;
  game.init();
  setInterval(game.engine.gameLoop.bind(game.engine), 200);
}

initGame();