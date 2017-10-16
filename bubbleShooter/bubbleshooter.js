function BubbleShooter() {
  this.canvas = document.getElementById("whyupdate");
  this.context = this.canvas.getContext('2d');
  this.engine = new Engine(this.canvas, this.context, "2D");
}

BubbleShooter.prototype.init = function () {
  this.cellSize = 15;
  this.score = 0;
  var levelWidth = this.canvas.width / this.cellSize;
  var levelHeight = this.canvas.height / this.cellSize;
  this.gameState = "play";
  var colors = [this.spriteStyle["red"], this.spriteStyle["blue"], this.spriteStyle["orange"], this.spriteStyle["green"]];
  this.levels = new Levels(this.engine, levelWidth, levelHeight, this.cellSize, colors, this);
  this.levels.addLevelObjectsToEngine(this.levels.current_level);
  this.Shooter = new Shooter(colors, levelHeight, levelWidth, this.cellSize, this.engine, this);
  this.Shooter.loadQueue();
  this.Shooter_Y = (levelHeight - 1) * this.cellSize + (this.cellSize / 2);
  this.Shooter_X = Math.floor(levelWidth / 2) * this.cellSize + (this.cellSize / 2);
  this.Shooter.addObjectstoEngine();
  this.engine.input.setMouseUpHandler(this.mouseUp.bind(this));
  this.engine.input.setMouseMoveHandler(this.mouseMove.bind(this));
  this.engine.collision.setCollisionHandler(this.handleCollision.bind(this));
  this.engine.setUpdateHandler(this.update.bind(this));
  this.engine.setDrawHandler(this.draw.bind(this));
}

BubbleShooter.prototype.restart = function () {
  this.pauseGame = false;
}

BubbleShooter.prototype.mouseUp = function (selectedImage, x, y) {
  if(this.gameState == "play")
    this.gameState = "bounce";
  // x = x - this.context.canvas.offsetLeft;
  // y = y - this.context.canvas.offsetTop;
  // if (y < this.Shooter_Y && y > 0 && x > 0 && x < this.canvas.width) {
  //   var speed = 10;
  //   var xV = (x - this.Shooter_X);
  //   var yV = (y - this.Shooter_Y);
  //   var mag = Math.sqrt(xV * xV + yV * yV);
  //   xV = xV / mag;
  //   yV = yV / mag;
  //   this.Shooter.queue[0].x_velocity = xV * speed;
  //   this.Shooter.queue[0].y_velocity = yV * speed;
  // }
}

BubbleShooter.prototype.mouseMove = function (objectMoved, x, y) {
  if(this.gameState != "play")
    return;
  x = x - this.context.canvas.offsetLeft;
  y = y - this.context.canvas.offsetTop;
  if (y < this.Shooter_Y && y > 0 && x > 0 && x < this.canvas.width) {
    var speed = 10;
    var xV = (x - this.Shooter_X);
    var yV = (y - this.Shooter_Y);
    var mag = Math.sqrt(xV * xV + yV * yV);
    xV = xV / mag;
    yV = yV / mag;
    this.Shooter.queue[0].x_velocity = xV * speed;
    this.Shooter.queue[0].y_velocity = yV * speed;
    this.head_x_velocity = xV * speed;
    this.head_y_velocity = yV * speed;
  }
}

BubbleShooter.prototype.handleCollision = function (shooter, collidedObject) {
  this.gameState = "initBreak";
  var j;
  var i = Math.floor(collidedObject.Y / this.cellSize);
  i = this.levels.getI(collidedObject.X, collidedObject.Y);
  j = this.levels.getJ(collidedObject.X, collidedObject.Y);

  if (shooter.x_velocity / shooter.y_velocity < -1.732) {
    j = j - 1;
    if (this.levels.gameLevels[this.levels.current_level][i][j] != null)
      i++;
  }
  else if (shooter.x_velocity / shooter.y_velocity < 0) {
    if (i % 2 == 0)
      j--;
    i++;
  }
  else if (shooter.x_velocity / shooter.y_velocity < 1.732) {
    if (i % 2 == 1)
      j++;
    i++;
  }
  else {
    j++;
  }
  while (this.levels.gameLevels[this.levels.current_level][i][j] != null) {
    i++;
  }
  this.levels.gameLevels[this.levels.current_level][i][j] = shooter;
  shooter.x_velocity = 0;
  shooter.y_velocity = 0;
  shooter.X = this.levels.getX(i, j);
  shooter.Y = this.levels.getY(i, j);
}

function Shooter(colors, height, width, cellSize, engine, game) {
  this.queue = new Array();
  this.colors = colors;
  this.engine = engine;
  this.height = height;
  this.width = width;
  this.cellSize = cellSize;
  this.game = game
}

Shooter.prototype.loadQueue = function () {
  var index = Math.floor(Math.random() * 4);
  var img = this.colors[index];
  var x = Math.floor((this.width / 2)) * this.cellSize;
  var y = (this.height - 1) * this.cellSize;
  var current_sprite = new Sprite(x, y, this.cellSize, this.cellSize, img);
  current_sprite.tags.color = index;
  this.queue.push(current_sprite);
  for (var i = 1; i < 4; i++) {
    var index = Math.floor(Math.random() * 4);
    var img = this.colors[index];
    var x = (4 - i) * this.cellSize;
    var y = (this.height - 1) * this.cellSize;
    var current_sprite = new Sprite(x, y, this.cellSize, this.cellSize, img);
    current_sprite.tags.color = index;
    this.queue.push(current_sprite);
  }
}
Shooter.prototype.addObjectstoEngine = function () {
  for (var i = 0; i < this.queue.length; i++) {

    this.engine.addObject(this.queue[i]);
  }
}
Shooter.prototype.replace = function () {
  this.queue[1].x_velocity = this.queue[0].x_velocity;
  this.queue[1].y_velocity = this.queue[0].y_velocity;
  this.queue.shift();
  this.queue[0].X = Math.floor((this.width / 2)) * this.cellSize;
  for (var i = 1; i < 3; i++) {
    this.queue[i].X += this.cellSize;
  }
  var index = Math.floor(Math.random() * 4);
  var img = this.colors[index];
  var x = this.cellSize;
  var y = (this.height - 1) * this.cellSize;
  var current_sprite = new Sprite(x, y, this.cellSize, this.cellSize, img);
  current_sprite.tags.color = index;
  this.queue.push(current_sprite);
  this.engine.addObject(current_sprite);

}

Shooter.prototype.update = function () {
  if (this.queue[0].x_velocity && this.queue[0].y_velocity) {
    this.engine.input.setMovedObject(this.queue[0].id);

    if (this.queue[0].X < 0 || this.queue[0].X > ((this.width - 1) * this.cellSize)) {
      this.queue[0].x_velocity *= -1;
    }
    this.queue[0].X += this.queue[0].x_velocity;
    this.queue[0].Y += this.queue[0].y_velocity;
    if (this.queue[0].Y <= 0) {
      this.queue[0].Y = 0;
      this.queue[0].x_velocity = 0;
      this.queue[0].y_velocity = 0;
    }
  }
  else this.game.gameState = "play";
}

BubbleShooter.prototype.loadContent = function () {
  if (this.engine.loadSpriteSheet("spritesheet.png") != true)
    return false;

  this.spriteStyle = {
    "explosion1": { x: 0, y: 0, width: 70, height: 70 },
    "explosion2": { x: 70, y: 0, width: 70, height: 70 },
    "explosion3": { x: 140, y: 0, width: 70, height: 70 },
    "explosion4": { x: 210, y: 0, width: 70, height: 70 },
    "explosion5": { x: 280, y: 0, width: 70, height: 70 },
    "blue": { x: 350, y: 0, width: 70, height: 70 },
    "green": { x: 420, y: 0, width: 70, height: 70 },
    "orange": { x: 490, y: 0, width: 70, height: 70 },
    "red": { x: 560, y: 0, width: 70, height: 70 }
  };

  return true;
}

BubbleShooter.prototype.drawLayout = function () {
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

BubbleShooter.prototype.drawShooterHead = function () {
  var context = this.context;
  var len = 3;
  context.lineWidth = "3";
  context.strokeStyle = "black";
  context.beginPath();

  context.moveTo(this.Shooter_X, this.Shooter_Y);
  context.lineTo(this.Shooter_X + this.head_x_velocity * len, this.Shooter_Y + this.head_y_velocity * len);
  context.stroke();

  context.beginPath();
  context.arc(this.Shooter_X, this.Shooter_Y, 7, 0,2*Math.PI);
  context.stroke();
}

BubbleShooter.prototype.update = function () {
  if (this.pauseGame)
    return;

  this.engine.update();
  //Update Logic
  //console.log(this.gameState)
  switch (this.gameState) {
    case "play":
      break;
    case "bounce":
      this.Shooter.update();
      if (this.Shooter.queue[0].Y == 0) {
        this.levels.gameLevels[this.levels.current_level][0][Math.floor(this.levels.getJ(this.Shooter.queue[0].X, this.Shooter.queue[0].Y))] = this.Shooter.queue[0];
        this.Shooter.queue[0].X = this.levels.getX(0, Math.floor(this.levels.getJ(this.Shooter.queue[0].X, this.Shooter.queue[0].Y)))
        this.Shooter.replace();
        this.gameState = "initBreak";
      }
      break;
    case "initBreak":
      this.levels.initBreak();
      break;
    case "updateBreak":
      this.levels.updateBreak();
      break;
    case "initFall":
      this.levels.initFall();
      break;
    case "updateFall":
      this.levels.updateFall();
      break;
  }
}

BubbleShooter.prototype.draw = function () {
  if (this.pauseGame)
    return;
  this.engine.draw();
  this.drawLayout();
  this.drawShooterHead();
}

function Levels(engine, width, height, cellSize, source, game) {
  this.engine = engine;
  this.source = source;
  this.cellSize = cellSize;
  this.game = game;
  this.create_levels(height, width);
  this.init();
}

Levels.prototype.init = function () {
  this.score = 0;
  this.current_level = 0;
  // this.init_scoring();
}

Levels.prototype.getX = function (i, j) {
  if (i % 2 == 0)
    return j * this.cellSize;
  else
    return j * this.cellSize + (this.cellSize / 2);
}
Levels.prototype.getY = function (i, j) {
  return (i * this.cellSize);
}
Levels.prototype.getI = function (X, Y) {
  return Math.floor(Y / this.cellSize);
}
Levels.prototype.getJ = function (X, Y) {
  if (Math.floor(Y / this.cellSize) % 2 == 0)
    return (X / this.cellSize);
  else
    return ((X - (this.cellSize / 2)) / this.cellSize);
}

Levels.prototype.create_levels = function (height, width) {
  this.gameLevels = new Array();

  //Level 0
  this.gameLevels[0] = new Array();
  //Level 1
  //this.gameLevels[1] = new Array();
  //Level 2
  //this.gameLevels[2] = new Array();

  var colors = new Array();
  colors[0] = "red";
  colors[1] = "blue";
  colors[2] = "orange";
  colors[3] = "green";

  for (var i = 0; i < height; i++) {
    this.gameLevels[0][i] = new Array();
    for (var j = 0; j < width; j++) {
      if (i < height / 10) {
        if (i % 2 == 0) {
          var x = this.getX(i, j);
          var y = this.getY(i, j);
          var index = Math.floor(Math.random() * 4);
          var img = this.source[index];

          var current_sprite = new Sprite(x, y, this.cellSize, this.cellSize, img);
          current_sprite.tags.color = index;
          this.gameLevels[0][i].push(current_sprite);
        }
        else {
          if (j == width - 1)
            continue;
          var x = this.getX(i, j);
          var y = this.getY(i, j);
          var index = Math.floor(Math.random() * 4);
          var img = this.source[index];
          var current_sprite = new Sprite(x, y, this.cellSize, this.cellSize, img);
          current_sprite.tags.color = index;
          this.gameLevels[0][i].push(current_sprite);
        }
      }
      else {
        this.gameLevels[0][i].push(null);
      }
    }
  }

  //Other levels to be created
}

Levels.prototype.addLevelObjectsToEngine = function (level) {
  for (var i = 0; i < this.gameLevels[level].length; i++) {
    for (var j = 0; j < this.gameLevels[level][i].length; j++) {
      if (this.gameLevels[level][i][j])
        this.engine.addObject(this.gameLevels[level][i][j]);
    }
  }
}

Levels.prototype.checkSurroundingsForSameColor = function (i, j, color, shouldDelete) {
  if (i >= 0 && j >= 0 && i < this.gameLevels[this.current_level].length && j < this.gameLevels[this.current_level][i].length
    && this.gameLevels[this.current_level][i][j] && this.gameLevels[this.current_level][i][j].tags.visited != true) {
    this.gameLevels[this.current_level][i][j].tags.visited = true;
    if (this.gameLevels[this.current_level][i][j].tags.color == color) {
      if (/*count < 3*/ true) {
        var t = (i % 2) ? 1 : -1;
        if (shouldDelete) {
          this.deletedItems.push(this.gameLevels[this.current_level][i][j].id);
          this.gameLevels[this.current_level][i][j] = null;
        }
        return 1 +
          this.checkSurroundingsForSameColor(i, j - 1, color, shouldDelete) +
          this.checkSurroundingsForSameColor(i, j + 1, color, shouldDelete) +
          this.checkSurroundingsForSameColor(i - 1, j, color, shouldDelete) +
          this.checkSurroundingsForSameColor(i + 1, j, color, shouldDelete) +
          this.checkSurroundingsForSameColor(i - 1, j + t, color, shouldDelete) +
          this.checkSurroundingsForSameColor(i + 1, j + t, color, shouldDelete);
      }
    }
  }
  return 0;
}

Levels.prototype.initVisited = function () {
  for (var i = 0; i < this.gameLevels[this.current_level].length; i++) {
    for (var j = 0; j < this.gameLevels[this.current_level][i].length; j++) {
      if (this.gameLevels[this.current_level][i][j]) {
        this.gameLevels[this.current_level][i][j].tags.visited = false;
      }
    }
  }
}

Levels.prototype.initBreak = function () {
  var si = this.getI(this.game.Shooter.queue[0].X, this.game.Shooter.queue[0].Y);
  var sj = this.getJ(this.game.Shooter.queue[0].X, this.game.Shooter.queue[0].Y);
  this.initVisited();
  var total = this.checkSurroundingsForSameColor(si, sj, this.game.Shooter.queue[0].tags.color, false);
  if (total >= 3) {
    this.deletedItems = [];
    this.initVisited();
    var total = this.checkSurroundingsForSameColor(si, sj, this.game.Shooter.queue[0].tags.color, true);
    this.explosionState = 1;
    this.game.gameState = "updateBreak";
  } else {
    this.game.gameState = "play"
    this.game.Shooter.replace();
  }
}

Levels.prototype.updateBreak = function () {
  if(this.explosionState >= 6) {
    for (var i = 0; i < this.deletedItems.length; i++) {
      this.game.engine.deleteObject(this.deletedItems[i])
    }
    this.game.gameState = "initFall";
    this.explosionState = 1;
    return;
  }
  for (var i = 0; i < this.deletedItems.length; i++) {
    this.game.engine.getObject(this.deletedItems[i]).spriteStyle = this.game.spriteStyle["explosion"+Math.floor(this.explosionState)];
  }
  this.explosionState+=0.1;
}

Levels.prototype.checkIfStuckToTop = function (i, j) {
  if (i >= 0 && j >= 0 && i < this.gameLevels[this.current_level].length && j < this.gameLevels[this.current_level][i].length
    && this.gameLevels[this.current_level][i][j] && this.gameLevels[this.current_level][i][j].tags.visited != true) {
    this.gameLevels[this.current_level][i][j].tags.visited = true;
    var o = (i % 2) ? 1 : -1;
    this.checkIfStuckToTop(i, j - 1);
    this.checkIfStuckToTop(i, j + 1);
    this.checkIfStuckToTop(i + 1, j);
    this.checkIfStuckToTop(i - 1, j);
    this.checkIfStuckToTop(i - 1, j + o);
    this.checkIfStuckToTop(i + 1, j + o);
  }
  return 0;
}

Levels.prototype.initFall = function () {
  this.initVisited();
  for (var j = 0; j < this.gameLevels[this.current_level][0].length; j++) {
    if (this.gameLevels[this.current_level][0][j]) {
      if (this.gameLevels[this.current_level][0][j].tags.visited != true) {
        this.checkIfStuckToTop(0, j);
      }
    }
  }
  this.fallingIds = [];
  for (var i = 0; i < this.gameLevels[this.current_level].length; i++) {
    for (var j = 0; j < this.gameLevels[this.current_level][i].length; j++) {
      if (this.gameLevels[this.current_level][i][j] && this.gameLevels[this.current_level][i][j].tags.visited == false) {
        this.fallingIds.push(this.gameLevels[this.current_level][i][j].id);
        this.gameLevels[this.current_level][i][j] = null;
      }
    }
  }
  this.game.gameState = "updateFall";
}
Levels.prototype.updateFall = function () {
  if(this.explosionState >= 6) {
    for (var i = 0; i < this.fallingIds.length; i++) {
      this.game.engine.deleteObject(this.fallingIds[i]);
    }
    this.game.gameState = "play";
    this.game.Shooter.replace();
    return;
  }
  for (var i = 0; i < this.fallingIds.length; i++) {
    this.game.engine.getObject(this.fallingIds[i]).spriteStyle = this.game.spriteStyle["explosion"+Math.floor(this.explosionState)];
  }
  this.explosionState+=0.1;
}

function initGame() {
  var game = new BubbleShooter();
  if (game.loadContent() != true)
    return;
  game.init();
  setInterval(game.engine.gameLoop.bind(game.engine), 10);
}

initGame();