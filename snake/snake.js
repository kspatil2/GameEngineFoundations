function SnakeGame() {
  this.canvas = document.getElementById("whyupdate");
  this.context = this.canvas.getContext('2d');
}

SnakeGame.prototype.init = function () {
  this.engine = new Engine(this.canvas, this.context);

  this.cellSize = 40;

  var levelWidth = this.canvas.width / this.cellSize;
  var levelHeight = this.canvas.height / this.cellSize;
  
  this.levels = new Levels(this.engine, levelWidth, levelHeight, this.cellSize, this.sources.get("wall"));
  this.levels.addBoundaryObjectsToEngine();
  this.levels.addLevelObjectsToEngine(this.levels.current_level);
  
  this.food = new Food(this.engine, levelWidth, levelHeight, this.cellSize, this.sources.get("food"), this.sources.get("spoiledFood"));

  this.snake = new SnakeLinks(this.engine, this.sources.get("snake"), 5, this.cellSize);
  this.snake.addSnakeLinksToEngine();

  //Bind game level listeners
  this.engine.input.setKeyboardPressHandler(this.keyPressed.bind(this));
  this.engine.collision.setCollisionHandler(this.handleCollission.bind(this));
}

SnakeGame.prototype.restart = function() {
  this.pauseGame = false;
  this.levels.init();
  this.newLevel();
}

SnakeGame.prototype.newLevel = function() {
  this.engine.resetObjects();
  this.levels.addBoundaryObjectsToEngine();
  this.levels.addLevelObjectsToEngine(this.levels.current_level);
  this.levels.startNewLevel = false;
  this.food.init();
  this.snake.init();
  this.snake.addSnakeLinksToEngine();
  //Bind game level listeners
  this.engine.input.setKeyboardPressHandler(this.keyPressed.bind(this));
  this.engine.collision.setCollisionHandler(this.handleCollission.bind(this));
}

SnakeGame.prototype.handleCollission = function (head, collidedSprite) {
  if (collidedSprite.tags.name == "food") {
    this.snake.ateFood = true;
    this.food.createNewFood = true;
    if(this.food.spoiledFoodTimeLeft <= 0)
      this.food.createNewSpoiledFood = true;
    this.levels.score += 25;
  }
  else if(collidedSprite.tags.name == "spoiledFood" && this.snake.snakeLinksArray.length > 1) {
    this.snake.ateSpoiledFood = true;
    this.food.createNewSpoiledFood = true;
    this.levels.score -= 50;
  }
  else {
    this.pauseGame = true;
  }
}

SnakeGame.prototype.keyPressed = function (key) {
  switch(key) {
    case "ArrowLeft": 
      if(this.snake.direction != "right") this.snake.direction = "left";
      break;
    case "ArrowRight": 
      if(this.snake.direction != "left") this.snake.direction = "right";
      break;
    case "ArrowUp": 
      if(this.snake.direction != "down") this.snake.direction = "up";
      break;
    case "ArrowDown": 
      if(this.snake.direction != "up") this.snake.direction = "down";
      break;
    case "KeyR":
      this.restart();
  }
}

SnakeGame.prototype.loadContent = function () {
  this.sources = new Map;
  this.sources.set("snake", "https://kspatil2.github.io/snake_texture.jpg");
  this.sources.set("food", "https://kspatil2.github.io/jerry.jpg");
  this.sources.set("wall", "https://kspatil2.github.io/deathstar.jpg");
  this.sources.set("spoiledFood", "https://kspatil2.github.io/edited_lava.png")
  return true;
}

SnakeGame.prototype.update = function () {
  if(this.pauseGame)
    return;
  
  this.engine.update();

  this.snake.update();
  //Set head of snake as a moved object to compute collision.
  this.engine.input.setMovedObject(this.snake.snakeLinksArray[0].id);
  
  this.food.update();

  this.levels.update();
  if(this.levels.startNewLevel == true)
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
  if(this.pauseGame)
    return;
  
  this.engine.draw();
  this.drawLayout();
}

SnakeGame.prototype.gameLoop = function () {
  this.update();
  this.draw();
}

function Levels(engine, width, height, cellSize, source) {
  this.engine = engine;
  this.source = source;
  this.create_boundary_walls(height, width, cellSize);
  this.create_levels(height, width, cellSize);
  this.init();
}

Levels.prototype.init = function() {
  this.score = 0;
  this.current_level = 0;
  this.init_scoring();
}

Levels.prototype.create_boundary_walls = function (height, width, cellSize) {
  this.boundary = [];
  var name = "wall";
  for (var i = 0; i < width; i++) {
    var x = i * cellSize;
    var current_sprite = new Sprite(x, 0, cellSize, cellSize, this.source);
    current_sprite.tags.name = name;
    this.boundary.push(current_sprite);
  }
  for (var i = 1; i < height; i++) {
    var x = width * cellSize - cellSize;
    var y = i * cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.source);
    current_sprite.tags.name = name;
    this.boundary.push(current_sprite);
  }
  for (var i = 1; i < height; i++) {
    var y = i * cellSize;
    var current_sprite = new Sprite(0, y, cellSize, cellSize, this.source);
    current_sprite.tags.name = name;
    this.boundary.push(current_sprite);
  }
  for (var i = 1; i < width; i++) {
    var x = i * cellSize;
    var y = height * cellSize - cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.source);
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
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.source);
    current_sprite.tags.name = name;
    this.gameLevels[1].push(current_sprite);
  }
  //level 2
  for (var i = 0; i < height / 4; i++) {
    var x = cellSize * (width / 2);
    var y = (i + Math.round(0.15 * height)) * cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.source);
    current_sprite.tags.name = name;
    this.gameLevels[2].push(current_sprite);
  }

  for (var i = 0; i < height / 4; i++) {
    var x = cellSize * (width / 2);
    var y = (i + Math.round(0.60 * height)) * cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.source);
    current_sprite.tags.name = name;
    this.gameLevels[2].push(current_sprite);
  }

  for (var i = 0; i < width / 4; i++) {
    var x = (i + Math.round(0.20 * width)) * cellSize;
    var y = (height / 2 - 1) * cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.source);
    current_sprite.tags.name = "wall";
    this.gameLevels[2].push(current_sprite);
  }
  for (var i = 0; i < width / 4; i++) {
    var x = (i + Math.round(0.60 * width)) * cellSize;
    var y = (height / 2 - 1) * cellSize;
    var current_sprite = new Sprite(x, y, cellSize, cellSize, this.source);
    current_sprite.tags.name = "wall";
    this.gameLevels[2].push(current_sprite);
  }
}

Levels.prototype.addBoundaryObjectsToEngine = function() {
  for(var i = 0; i < this.boundary.length; i++) {
    this.engine.addObject(this.boundary[i]);
  }
}

Levels.prototype.addLevelObjectsToEngine = function(level) {
  for(var i = 0; i < this.gameLevels[level].length; i++) {
    this.engine.addObject(this.gameLevels[level][i]);
  }
}

Levels.prototype.removeLevelObjectsFromEngine = function(level) {
  for(var i = 0; i < this.gameLevels[level].length; i++) {
    this.engine.deleteObject(this.gameLevels[level][i].id);
  }
}

Levels.prototype.init_scoring = function() {
  this.highScoreLabel = document.getElementById("highScore");
  this.levelLabel = document.getElementById("level");
  this.scoreLabel = document.getElementById("currentScore");
  var persistentHighScore = this.engine.storage.getValue("SnakeHighScore");
  if(persistentHighScore !== null)
    if(persistentHighScore == 'undefined')
      this.highScore = 0;
    else
      this.highScore = parseInt(persistentHighScore, 10);
  else
    this.highScore = -1;
  this.refresh_score();
}

Levels.prototype.refresh_score = function () {
  if (this.highScore != -1 && this.score > this.highScore) {
    this.highScore = this.score;
    this.engine.storage.setValue("SnakeHighScore", this.highScore);
  }
  this.highScoreLabel.innerHTML = this.highScore == -1? "Unavailable" : this.highScore;
  this.scoreLabel.innerHTML = this.score;
  this.levelLabel.innerHTML = this.current_level + 1; // level number is zero based
}

Levels.prototype.update = function() {
  this.refresh_score();

  var new_level = Math.floor(this.score / 100);
  new_level = Math.max(0, new_level);
  if(new_level != this.current_level) {
    this.removeLevelObjectsFromEngine(this.current_level);
    if(new_level >= 3) {
      this.init();
      new_level = 0;
    }
    this.startNewLevel = true;
    this.addLevelObjectsToEngine(new_level);
  }
  this.current_level = new_level;
}

function SnakeLinks(engine, source, initialLength, cellSize) {
  this.engine = engine;
  this.source = source;
  this.cellSize = cellSize;
  this.initialLength = initialLength;
  this.init();
}

SnakeLinks.prototype.init = function() {
  this.direction = "right";
  this.create_snake(this.initialLength);
  this.ateFood = false;
  this.atePoisonousFood = false;
}

SnakeLinks.prototype.create_snake = function (length) {
  this.snakeLinksArray = [];
  for (var i = length - 1; i >= 0; i--) {
    var x = (i + 1) * this.cellSize;
    var current_sprite = new Sprite(x, this.cellSize, this.cellSize, this.cellSize, this.source);
    current_sprite.tags.name = "snake";
    this.snakeLinksArray.push(current_sprite);
  }
}

SnakeLinks.prototype.addSnakeLinksToEngine = function () {
  for(var i = 0; i < this.snakeLinksArray.length; i++) {
    this.engine.addObject(this.snakeLinksArray[i]);
  }
}

SnakeLinks.prototype.update = function() {  
  var nx = this.snakeLinksArray[0].X / this.cellSize;
  var ny = this.snakeLinksArray[0].Y / this.cellSize;
  if (this.direction == "right") nx++;
  else if (this.direction == "left") nx--;
  else if (this.direction == "up") ny--;
  else if (this.direction == "down") ny++;
  var tail = this.snakeLinksArray[this.snakeLinksArray.length - 1];
  if (this.ateFood == true) {
    //we ate normal food. so add tail to the last link
    tail = new Sprite(nx * this.cellSize, ny * this.cellSize, this.cellSize, this.cellSize, this.source);
    tail.tags.name = "snake";
    this.engine.addObject(tail);
    this.ateFood = false;
    this.snakeLinksArray.unshift(tail);
  }
  else if(this.ateSpoiledFood == true) {
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

function Food(engine, width, height, cellSize, source, spoiledSource) {
  this.engine = engine;
  this.width = width;
  this.height = height;
  this.cellSize = cellSize;
  this.source = source;
  this.spoiledSource = spoiledSource;
  this.init();
}

Food.prototype.init = function() {
  this.createNewFood = true;
  this.createNewSpoiledFood = true;
  this.food = undefined;
  this.spoiledFood = undefined;
  this.update();
}

Food.prototype.create_food = function (food, source, name) {
  var x,y;
  var unique_xy = false;
  while(unique_xy == false)
  {
    x = Math.round(Math.random() * (this.width - 1));
    y = Math.round(Math.random() * (this.height - 1));
    var actualX = x * this.cellSize + (this.cellSize / 2);
    var actualY = y * this.cellSize + (this.cellSize / 2);
    if(!this.engine.collision.checkCollisionWithAllObjects(actualX, actualY) && y != 1) {
      unique_xy = true;
    }
  }

  if (food == undefined) {
    food = new Sprite(this.cellSize * x, this.cellSize * y, this.cellSize, this.cellSize, source);
    food.tags.name = name;
    this.engine.addObject(food);
  }
  food.X = x * this.cellSize;
  food.Y = y * this.cellSize;
  return food;
}

Food.prototype.update = function() {
  if(this.createNewFood == true) {
    this.food = this.create_food(this.food, this.source, "food");
    this.spoiledFoodTimeLeft = 10;
    this.createNewFood = false;
  }
  if(this.createNewSpoiledFood == true) {
    this.spoiledFood = this.create_food(this.spoiledFood, this.spoiledSource, "spoiledFood");
    this.spoiledFoodTimeLeft = 10;
    this.createNewSpoiledFood = false;
  }
  if(this.spoiledFoodTimeLeft > 0) {
    this.spoiledFoodTimeLeft--;
    if(this.spoiledFoodTimeLeft <= 0) {
      this.engine.deleteObject(this.spoiledFood.id);
      this.spoiledFood = undefined;
    }
  }
}

function initGame() {
  var game = new SnakeGame();
  if(game.loadContent() != true)
    return;
  game.init();
  setInterval(game.gameLoop.bind(game), 200);
}

initGame();
