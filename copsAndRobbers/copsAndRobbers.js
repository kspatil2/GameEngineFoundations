function CopsAndRobbersGame() {
  this.canvas = document.getElementById("whyupdate");
  this.context = this.canvas.getContext('2d');
  this.engine = new Engine(this.canvas, this.context, "2D");
}

CopsAndRobbersGame.prototype.init = function () {

  this.cellSize = 80;
  var levelWidth = this.canvas.width / this.cellSize;
  var levelHeight = this.canvas.height / this.cellSize;
  this.levelWidth = levelWidth;
  this.levelHeight = levelHeight;

  this.levels = new Levels(this.engine, levelWidth, levelHeight, this.cellSize, this.spriteStyle["wall"]);
  this.levels.addLevelObjectsToEngine(this.levels.current_level);

  this.createGraph(levelWidth, levelHeight, this.levels.nodeArray);
  // Initialize scoring
  this.init_scoring();

  this.players = [];
  this.players[0] = new Player(this.engine, levelWidth, levelHeight, this.cellSize, this.spriteStyle["robber2"], "robber", 0, 10, true);
  this.players[1] = new Player(this.engine, levelWidth, levelHeight, this.cellSize, this.spriteStyle["cop"], "cop", 1, 40, true);
  this.players[2] = new Player(this.engine, levelWidth, levelHeight, this.cellSize, this.spriteStyle["robber2"], "robber", 2, 70, false);
  this.players[3] = new Player(this.engine, levelWidth, levelHeight, this.cellSize, this.spriteStyle["cop"], "cop", 3, 16, true);
  this.turn = 0;
  this.closestEnemy = 0;
  this.engine.input.setObjectSelected(this.players[0].sprite.id);

  //Bind game level listeners
  this.engine.input.setKeyboardPressHandler(this.keyPressed.bind(this));
  this.engine.collision.setCollisionHandler(this.handleCollission.bind(this));
  this.engine.setUpdateHandler(this.update.bind(this));
  this.engine.setDrawHandler(this.draw.bind(this));
  this.engine.graph.setHeuristic(this.heuristic.bind(this));
}

CopsAndRobbersGame.prototype.init_scoring = function(){
  // Score is equivalent to number of turns taken by cops
  this.score = 0.0;
  this.maxTurns = 16;

  this.scoreLable = document.getElementById('turns');
  document.getElementById('maxTurns').innerText = this.maxTurns;
  this.update_score();
}

CopsAndRobbersGame.prototype.update_score = function(){
  var turns = Math.floor(this.score);
  this.scoreLable.innerText = turns;

  if(turns >= this.maxTurns){
    this.endGame("Robbers win!");
  }
}

function Player(engine, width, height, cellSize, spriteStyle, label, id, nodeId, isAI) {
  this.engine = engine;
  this.spriteStyle = spriteStyle;
  this.label = label;
  this.id = id;
  this.width = width;
  this.height = height;
  this.cellSize = cellSize;
  this.currentNodeId = nodeId;
  this.isAI = isAI;
  this.isDead = false;
  this.create_player(height, width, cellSize, nodeId);
}

Player.prototype.create_player = function (height, width, cellSize) {
  var x = this.currentNodeId % width * cellSize;
  var y = Math.floor(this.currentNodeId / height) * cellSize;
  this.sprite = new Sprite(x, y, cellSize, cellSize, this.spriteStyle);
  this.sprite.tags.label = this.label;
  this.sprite.tags.id = this.id;
  this.engine.addObject(this.sprite);
}

Player.prototype.move = function (newNodeId) {
  for (var index = 0; index < this.engine.graph.edges.length; index++) {
    if (this.engine.graph.edges[index].source == this.currentNodeId && this.engine.graph.edges[index].goal == newNodeId) {
      this.sprite.X = newNodeId % this.width * this.cellSize;
      this.sprite.Y = Math.floor(newNodeId / this.height) * this.cellSize;
      this.currentNodeId = newNodeId;
      this.engine.input.setMovedObject(this.sprite.id);
      return true;
    }
  }

  return false;
}

CopsAndRobbersGame.prototype.createGraph = function (levelWidth, levelHeight, nodeArray) {
  for (var index = 0; index < nodeArray.length; index++) {
    // console.log(nodeArray[index]%levelWidth);
    this.engine.graph.addNode(nodeArray[index] % levelWidth, Math.floor(nodeArray[index] / levelHeight), nodeArray[index]);
  }

  for (var i = 0; i < nodeArray.length; i++) {
    for (var j = 0; j < nodeArray.length; j++) {
      if (i != j) {
        if (nodeArray[i] + levelWidth == nodeArray[j] || nodeArray[i] - levelWidth == nodeArray[j]) {
          this.engine.graph.addEdge(nodeArray[i], nodeArray[j], 1);
        }
        if (nodeArray[i] + 1 == nodeArray[j] || nodeArray[i] - 1 == nodeArray[j]) {
          this.engine.graph.addEdge(nodeArray[i], nodeArray[j], 1);
        }
      }
    }
  }

}

CopsAndRobbersGame.prototype.restart = function () {
  window.location.reload(true);
}

CopsAndRobbersGame.prototype.endGame = function (message) {
  alert(message);
  window.location.reload(true);
  this.pauseGame = true;
}

CopsAndRobbersGame.prototype.handleCollission = function (head, collidedSprite) {
  var cop = null;
  var robber = null;
  if (head.tags.label == "cop" && collidedSprite.tags.label == "robber") {
    cop = head;
    robber = collidedSprite;
  }
  if (head.tags.label == "robber" && collidedSprite.tags.label == "cop") {
    cop = collidedSprite;
    robber = head;
  }
  if (cop != null && robber != null) {
    console.log("Deleting robber")
    this.engine.deleteObject(robber.id);
    //this.players.splice(robber.tags.id, 1);
    var robberObj;

    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].sprite.id == robber.id) {
        robberObj = this.players[i];
        this.players[i].isDead = true;
      }
    }
    //this.turn = this.turn % this.players.length;
    var foundNewEnemy = false;
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].label == "robber" && this.players[i].isDead == false) {
        this.closestEnemy = i;
        foundNewEnemy = true;
      }
    }

    if (foundNewEnemy == false)
      this.endGame("Cops win!");

    if (this.turn == robberObj.id)
      this.updateTurnIfDead();

  }
}


CopsAndRobbersGame.prototype.getNodeId = function (direction, currentNodeId) {
  var newNodeId;
  if (direction == "ArrowLeft")
    newNodeId = currentNodeId - 1;
  else if (direction == "ArrowRight")
    newNodeId = currentNodeId + 1;
  else if (direction == "ArrowUp")
    newNodeId = currentNodeId - this.levelWidth;
  else
    newNodeId = currentNodeId + this.levelWidth;
  return newNodeId;
}

CopsAndRobbersGame.prototype.keyPressed = function (key) {
  switch (key) {
    case "ArrowLeft":
    case "ArrowRight":
    case "ArrowUp":
    case "ArrowDown":
      var newNodeId = this.getNodeId(key, this.players[this.turn].currentNodeId);
      if (this.players[this.turn].isAI == false && this.players[this.turn].isDead == false) {
        if (this.players[this.turn].move(newNodeId) == true) {
          this.updateTurnIfDead();
        }
      }
      break;

    case "KeyR":
      this.restart();
  }
}

CopsAndRobbersGame.prototype.heuristic = function (source, goal) {
  //return 0;
  var sx = source % this.levelWidth;
  var gx = goal % this.levelWidth;
  var sy = Math.floor(source / this.levelWidth);
  var gy = Math.floor(goal / this.levelWidth);
  return (sx - gx) * (sx - gx) + (sy - gy) * (sy - gy);
}

CopsAndRobbersGame.prototype.loadContent = function () {
  if (this.engine.loadSpriteSheet("spritesheet.png") != true)
    return false;

  this.spriteStyle = {
    "cop": { x: 300, y: 0, width: 300, height: 300 },
    "robber1": { x: 0, y: 300, width: 300, height: 300 },
    "robber2": { x: 0, y: 0, width: 300, height: 300 },
    "wall": { x: 300, y: 300, width: 300, height: 300 }
  };

  return true;
}


CopsAndRobbersGame.prototype.updateTurnIfDead = function () {
  this.turn = (this.turn + 1) % this.players.length;
  while (this.players[this.turn].isDead == true)
    this.turn = (this.turn + 1) % this.players.length;
  this.engine.input.setObjectSelected(this.players[this.turn].sprite.id);
}

CopsAndRobbersGame.prototype.update = function () {
  //console.log("Update")
  if (this.pauseGame)
    return;

  this.engine.update();


  if (this.players[this.turn].isAI == true) {
    var newNode = null;
    if (this.players[this.turn].label == 'robber') {
      var directions = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
      var direction = Math.floor(Math.random() * directions.length);
      newNode = this.getNodeId(directions[direction], this.players[this.turn].currentNodeId);
    }
    else {
      var closestEnemy = this.closestEnemy; //this.players[this.turn].closestEnemy;
      console.log("Running astar for " + this.players[this.turn].currentNodeId, this.players[closestEnemy].currentNodeId);
      var path = this.engine.pathSearch.astar(this.engine.graph, this.players[this.turn].currentNodeId, this.players[closestEnemy].currentNodeId);
      newNode = path[path.length - 2];

      this.score += 0.5;
    }
    if (this.players[this.turn].move(newNode)) {
      this.updateTurnIfDead();
    }

    this.update_score();
  }
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
  this.nodeArray = [10, 15, 16, 19, 20, 21, 22, 24, 28, 31, 33, 37, 38, 39, 40, 41, 42, 43, 46, 48, 52, 55, 57, 61, 64, 66, 67, 68, 69, 70];
  var wallArray = [];
  var current_pointer = 0;
  for (var i = 0; i < width * height; i++) {
    if (i != this.nodeArray[current_pointer]) {
      wallArray.push(i);
    }
    else {
      current_pointer++;
    }
  }

  for (var i = 0; i < wallArray.length; i++) {
    var x = (wallArray[i] % width) * cellSize;
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
