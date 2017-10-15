function BubbleShooter() {
    this.canvas = document.getElementById("whyupdate");
    this.context = this.canvas.getContext('2d');
    this.engine = new Engine(this.canvas, this.context, "2D");
}

BubbleShooter.prototype.init = function () {
    this.cellSize = 15;
    var levelWidth = this.canvas.width / this.cellSize;
    var levelHeight = this.canvas.height / this.cellSize;
    this.levels = new Levels(this.engine, levelWidth, levelHeight, this.cellSize, [this.spriteStyle["red"],this.spriteStyle["blue"],this.spriteStyle["orange"],this.spriteStyle["green"]]);
    this.levels.addLevelObjectsToEngine(this.levels.current_level);

    this.engine.input.setMouseMoveHandler(this.mouseMove.bind(this));
    this.engine.input.setMouseDownHandler(this.mousePressed.bind(this));
    this.engine.collision.setCollisionHandler(this.handleCollision.bind(this));
    this.engine.setUpdateHandler(this.update.bind(this));
    this.engine.setDrawHandler(this.draw.bind(this));
  }
  
  BubbleShooter.prototype.restart = function() {
    this.pauseGame = false;
  }

  BubbleShooter.prototype.mouseMove = function(selectedImage, x , y) {

  }
  BubbleShooter.prototype.mousePressed = function() {
    
  }
  BubbleShooter.prototype.handleCollision = function() {
    
  }

  BubbleShooter.prototype.loadContent = function() {
    if(this.engine.loadSpriteSheet("spritesheet.png") != true)
    return false;
  
  this.spriteStyle = {
    "eplosion1": {x: 0, y: 0, width: 70, height: 70},
    "explosion2": {x: 70, y: 0, width: 70, height: 70},
    "explosion3": {x: 140, y: 0, width: 70, height: 70},
    "explosion4": {x: 210, y: 0, width: 70, height: 70},
    "explosion5": {x: 280, y: 0, width: 70, height: 70},
    "blue": {x: 350, y: 0, width: 70, height: 70},
    "green": {x: 420, y: 0, width: 70, height: 70},
    "orange": {x: 490, y: 0, width: 70, height: 70},
    "red": {x: 560, y: 0, width: 70, height: 70}
  };

  return true;
  }

  BubbleShooter.prototype.drawLayout = function() {
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

  BubbleShooter.prototype.update = function () {
    if(this.pauseGame)
      return;
    
    this.engine.update();
    //Update Logic
    // 
  }

  BubbleShooter.prototype.draw = function() {
    if(this.pauseGame)
    return;
    this.engine.draw();
    this.drawLayout();
  }

  function Levels(engine, width, height, cellSize, source) {
    this.engine = engine;
    this.source = source;
    this.create_levels(height, width, cellSize);
    this.init();
  }

  Levels.prototype.init = function() {
    this.score = 0;
    this.current_level = 0;
   // this.init_scoring();
  }

  Levels.prototype.create_levels = function (height, width, cellSize) {
    this.gameLevels = new Array();
  
    //Level 0
    this.gameLevels[0] = new Array();
    //Level 1
    //this.gameLevels[1] = new Array();
    //Level 2
    //this.gameLevels[2] = new Array();
  
    var colors = new Array();
    colors[0]="red";
    colors[1]="green";
    colors[2]="blue";
    colors[3]="orange";
    
    for (var i = 0; i < height/3; i++) {
        for(var j = 0; j < width; j++){
           
            if(i%2==0){
                var x = (j*cellSize);
                var y = i*cellSize;
                var img = this.source[Math.floor(Math.random()*4)];
                
                var current_sprite = new Sprite(x, y, cellSize, cellSize, img);
                current_sprite.tags.name = name;
                this.gameLevels[0].push(current_sprite);
            }
            else{
                if(j==0)
                    continue;
                var x = (j*cellSize)-(cellSize/2);
                var y = i*cellSize;
                var img = this.source[Math.floor(Math.random()*4)];
                var current_sprite = new Sprite(x, y, cellSize, cellSize, img);
                current_sprite.tags.name = name;
                this.gameLevels[0].push(current_sprite);
            }
        }     
    }

   //Other levels to be created
  }

  Levels.prototype.addLevelObjectsToEngine = function(level) {
    for(var i = 0; i < this.gameLevels[level].length; i++) {
      this.engine.addObject(this.gameLevels[level][i]);
    }
  }

  function initGame() {
    var game = new BubbleShooter();
    if(game.loadContent() != true)
      return;
    game.init();
    setInterval(game.engine.gameLoop.bind(game.engine), 200);
  }
  
  initGame();
  