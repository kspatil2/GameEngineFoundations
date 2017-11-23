function CopsAndRobbersGame() {
  this.canvas = document.getElementById("whyupdate");
  this.context = this.canvas.getContext('2d');
  this.engine = new Engine(this.canvas, this.context, "2D");
}

CopsAndRobbersGame.prototype.init = function () {

  this.cellSize = 80;
  var levelWidth = this.canvas.width / this.cellSize;
  var levelHeight = this.canvas.height / this.cellSize;

  this.levels = new Levels(this.engine, levelWidth, levelHeight, this.cellSize, this.spriteStyle["wall"]);
  this.levels.addLevelObjectsToEngine(this.levels.current_level);

  // Initialize scoring
  this.init_scoring();

  //Bind game level listeners
  this.engine.input.setKeyboardPressHandler(this.keyPressed.bind(this));
  this.engine.collision.setCollisionHandler(this.handleCollission.bind(this));
  this.engine.setUpdateHandler(this.update.bind(this));
  this.engine.setDrawHandler(this.draw.bind(this));
}

CopsAndRobbersGame.prototype.restart = function () {
  this.pauseGame = false;
  this.levels.init();
  this.newLevel();
}

CopsAndRobbersGame.prototype.newLevel = function () {
 
}

CopsAndRobbersGame.prototype.handleCollission = function (head, collidedSprite) {
  
}

CopsAndRobbersGame.prototype.keyPressed = function (key) {
  switch (key) {
    // case "ArrowLeft":
    //   if (this.snakes[0].direction != "right") this.snakes[0].direction = "left";
    //   break;
    // case "ArrowRight":
    //   if (this.snakes[0].direction != "left") this.snakes[0].direction = "right";
    //   break;
    // case "ArrowUp":
    //   if (this.snakes[0].direction != "down") this.snakes[0].direction = "up";
    //   break;
    // case "ArrowDown":
    //   if (this.snakes[0].direction != "up") this.snakes[0].direction = "down";
    //   break;
    // case "KeyA":
    //   if (this.snakes[1].direction != "right") this.snakes[1].direction = "left";
    //   break;
    // case "KeyD":
    //   if (this.snakes[1].direction != "left") this.snakes[1].direction = "right";
    //   break;
    // case "KeyW":
    //   if (this.snakes[1].direction != "down") this.snakes[1].direction = "up";
    //   break;
    // case "KeyS":
    //   if (this.snakes[1].direction != "up") this.snakes[1].direction = "down";
    //   break;
    // case "KeyR":
    //   this.restart();
  }
}

CopsAndRobbersGame.prototype.loadContent = function () {
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

CopsAndRobbersGame.prototype.update = function () {
  if (this.pauseGame)
    return;

  this.engine.update();

  // for (var i = 0; i < this.snakes.length; ++i)
  //  // this.snakes[i].update();

  // //Set head of snake as a moved object to compute collision.
  // this.engine.input.setMovedObject(this.snakes[0].snakeLinksArray[0].id);
  // this.engine.input.setMovedObject(this.snakes[1].snakeLinksArray[0].id);

  // this.food.update();  

  // this.refresh_score();

  // var maxScore = Math.max(this.snakes[0].score, this.snakes[1].score);

  // this.levels.update(maxScore);
  // if (this.levels.startNewLevel == true)
  //   this.newLevel();
}

CopsAndRobbersGame.prototype.drawLayout = function () {
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

CopsAndRobbersGame.prototype.draw = function () {
  if (this.pauseGame)
    return;
  this.engine.draw();
  this.drawLayout();
}

CopsAndRobbersGame.prototype.init_scoring = function () {
  this.player1Label = document.getElementById("player1score");
  this.levelLabel = document.getElementById("level");
  this.player2Label = document.getElementById("player2score");
  
  this.refresh_score();
}

CopsAndRobbersGame.prototype.refresh_score = function () {
  // this.player1Label.innerHTML = this.snakes[0].score;
  // this.player2Label.innerHTML = this.snakes[1].score;
  // this.levelLabel.innerHTML = this.levels.current_level + 1; // level number is zero based
}

function Levels(engine, width, height, cellSize, spriteStyle) {
  this.engine = engine;
  this.spriteStyle = spriteStyle;
  this.create_levels(height, width, cellSize);
  this.init();
}

Levels.prototype.init = function () {
  //this.score = 0;
  this.current_level = 0;
  //this.init_scoring();
}



Levels.prototype.create_levels = function (height, width, cellSize) {
  this.gameLevels = new Array();

  //Level 0
  this.gameLevels[0] = new Array();
  
  var name = "wall";
  console.log("width : " + width);
  var nodeArray = [10,15,16,19,20,21,22,24,28,31,33,37,38,39,40,41,42,43,46,48,52, 55, 57,61,64,66,67,68,69,70];
  var wallArray = [];
  var current_pointer = 0;
  for(var i = 0; i < width*height; i++)
  {
     if(i != nodeArray[current_pointer])
     {  
        wallArray.push(i);
     }
     else
     {
        current_pointer++;
     }
  }

  for(var i = 0; i < wallArray.length ; i++)
  {
      var x = (wallArray[i] % width ) * cellSize;
      var y = (Math.floor(wallArray[i] / height)) * cellSize;
      var current_sprite = new Sprite(x, y, cellSize, cellSize, this.spriteStyle);
      current_sprite.tags.name = name;
      this.gameLevels[0].push(current_sprite);  
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
  
}


function initGame() {
  var game = new CopsAndRobbersGame();
  if (game.loadContent() != true)
    return;
  game.init();
  setInterval(game.engine.gameLoop.bind(game.engine), 200);
}

initGame();
