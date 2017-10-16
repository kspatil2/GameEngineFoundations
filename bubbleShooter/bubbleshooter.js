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
    var colors = [this.spriteStyle["red"],this.spriteStyle["blue"],this.spriteStyle["orange"],this.spriteStyle["green"]];
    this.levels = new Levels(this.engine, levelWidth, levelHeight, this.cellSize, colors);
    this.levels.addLevelObjectsToEngine(this.levels.current_level);
    this.Shooter = new Shooter(colors,levelHeight,levelWidth,this.cellSize, this.engine);
    this.Shooter.loadQueue();
    this.Shooter_Y = (levelHeight-1)*this.cellSize+(this.cellSize/2);
    this.Shooter_X = Math.floor(levelWidth/2)*this.cellSize+(this.cellSize/2);
    this.Shooter.addObjectstoEngine();
    this.engine.input.setMouseUpHandler(this.mouseUp.bind(this));
    this.engine.input.setMouseDownHandler(this.mousePressed.bind(this));
    this.engine.collision.setCollisionHandler(this.handleCollision.bind(this));
    this.engine.setUpdateHandler(this.update.bind(this));
    this.engine.setDrawHandler(this.draw.bind(this));
  }
  
  BubbleShooter.prototype.restart = function() {
    this.pauseGame = false;
  }

  BubbleShooter.prototype.mouseUp = function(selectedImage, x , y) {
    x = x - this.context.canvas.offsetLeft;
    y = y - this.context.canvas.offsetTop;
    if(y<this.Shooter_Y&&y>0&&x>0&&x<this.canvas.width){
      console.log("Setting velocity" , x , y, this.Shooter_X, this.Shooter_Y)
      var speed = 10;
      var xV = (x - this.Shooter_X);
      var yV = (y - this.Shooter_Y);
      var mag = Math.sqrt(xV * xV + yV * yV);
      xV = xV / mag;
      yV = yV / mag;
      this.Shooter.queue[0].x_velocity = xV * speed;
      this.Shooter.queue[0].y_velocity = yV * speed;
      console.log(this.Shooter.queue[0].x_velocity)
      console.log(this.Shooter.queue[0].y_velocity)
    }
  }
  BubbleShooter.prototype.mousePressed = function() {
  }
  BubbleShooter.prototype.handleCollision = function(shooter, collidedObject) {
    console.log("Collided")
    var j;
    var i = Math.floor(collidedObject.Y / this.cellSize);
    i = this.levels.getI(collidedObject.X,collidedObject.Y);
    j = this.levels.getJ(collidedObject.X,collidedObject.Y);
    
    if(shooter.x_velocity/shooter.y_velocity < -1.732){
      j = j-1;
      if(this.levels.gameLevels[this.levels.current_level][i][j]!=null)
        i++;
    }
    else if(shooter.x_velocity/shooter.y_velocity < 0){
      if(i%2==0)
        j--; 
      i++;
    }
    else if(shooter.x_velocity/shooter.y_velocity < 1.732){
      if(i%2==1)
        j++;
      i++;
    }
    else{
      j++;
      }
      console.log(this.levels.gameLevels[this.levels.current_level][i][j]);
      while(this.levels.gameLevels[this.levels.current_level][i][j]!=null){
        i++;
        console.log(this.levels.gameLevels[this.levels.current_level][i][j]);
     
    }
      
    /* 
    if(shooter.x_velocity>0){
      if(i%2==0)
        j--;
    }
    else{
      if(i%2==1){
        j++;
      }
    }
    i++;
    */


    this.levels.gameLevels[this.levels.current_level][i][j] = shooter;
    shooter.x_velocity = 0;
    shooter.y_velocity = 0;
    shooter.X = this.levels.getX(i,j);
    shooter.Y = this.levels.getY(i,j);
    this.Shooter.replace();

  }

  function Shooter(colors,height, width, cellSize, engine) {
    this.queue = new Array();
    this.colors = colors;
    this.engine = engine;
    this.height = height;
    this.width = width;
    this.cellSize = cellSize;
  }

  Shooter.prototype.loadQueue =function() {
    var img = this.colors[Math.floor(Math.random()*4)];
    var x = Math.floor((this.width/2))*this.cellSize;
    var y = (this.height-1)*this.cellSize;
    var current_sprite = new Sprite(x, y, this.cellSize, this.cellSize, img);
    this.queue.push(current_sprite);
    for(var i = 1;i < 4; i++ ){
      var img = this.colors[Math.floor(Math.random()*4)];
      var x = (4-i)*this.cellSize;
      var y = (this.height-1)*this.cellSize;
      var current_sprite = new Sprite(x, y, this.cellSize, this.cellSize, img);
      this.queue.push(current_sprite);
    }
  }
  Shooter.prototype.addObjectstoEngine = function() {
    for(var i = 0; i < this.queue.length; i++){

      this.engine.addObject(this.queue[i]); 
    }
  }
  Shooter.prototype.replace = function(){
    this.queue.shift();
    console.log(this.queue.length);
    this.queue[0].X = Math.floor((this.width/2))*this.cellSize;
    for(var i=1;i<3;i++){
      this.queue[i].X+=this.cellSize;
    }
    var img = this.colors[Math.floor(Math.random()*4)];
    var x = this.cellSize;
    var y = (this.height-1)*this.cellSize;
    var current_sprite = new Sprite(x, y, this.cellSize, this.cellSize, img);
    this.queue.push(current_sprite);
    this.engine.addObject(current_sprite);

  }

  Shooter.prototype.update = function() {
    if(this.queue[0].x_velocity && this.queue[0].y_velocity) {
      this.engine.input.setMovedObject(this.queue[0].id);

      if(this.queue[0].X<0 || this.queue[0].X > ((this.width-1)*this.cellSize)){
        this.queue[0].x_velocity*=-1;
      }

      this.queue[0].X += this.queue[0].x_velocity;
      this.queue[0].Y += this.queue[0].y_velocity;
      
    }
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
    this.Shooter.update();
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
    this.cellSize = cellSize
    this.create_levels(height, width);
    this.init();
  }

  Levels.prototype.init = function() {
    this.score = 0;
    this.current_level = 0;
   // this.init_scoring();
  }

  Levels.prototype.getX = function(i,j){
    if(i%2==0)
      return j*this.cellSize;
    else
      return j*this.cellSize + (this.cellSize/2);  
  }
  Levels.prototype.getY = function(i,j){
    return (i*this.cellSize);
  }
  Levels.prototype.getI = function(X,Y){
    return Math.floor(Y/this.cellSize);
  }
  Levels.prototype.getJ = function(X,Y){
    if(Math.floor(Y/this.cellSize)%2==0)
      return (X/this.cellSize);
    else
      return  ((X-(this.cellSize/2))/this.cellSize);
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
    colors[0]="red";
    colors[1]="green";
    colors[2]="blue";
    colors[3]="orange";
    
    for (var i = 0; i < height; i++) {
        this.gameLevels[0][i]=new Array();
        for(var j = 0; j < width; j++){
            if(i < height/3) {           
              if(i%2==0){
                  var x = this.getX(i,j);
                  var y = this.getY(i,j);
                  var img = this.source[Math.floor(Math.random()*4)];
                  
                  var current_sprite = new Sprite(x, y, this.cellSize, this.cellSize, img);
                  current_sprite.tags.name = name;
                  this.gameLevels[0][i].push(current_sprite);
              }
              else{
                  if(j==width-1)
                      continue;
                  var x = this.getX(i,j);
                  var y = this.getY(i,j);
                  var img = this.source[Math.floor(Math.random()*4)];
                  var current_sprite = new Sprite(x, y, this.cellSize, this.cellSize, img);
                  current_sprite.tags.name = name;
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

  Levels.prototype.addLevelObjectsToEngine = function(level) {
    for(var i = 0; i < this.gameLevels[level].length; i++) {
      for(var j = 0; j< this.gameLevels[level][i].length; j++){
        if(this.gameLevels[level][i][j])
          this.engine.addObject(this.gameLevels[level][i][j]);
      }
    }
  }

  function initGame() {
    var game = new BubbleShooter();
    if(game.loadContent() != true)
      return;
    game.init();
    setInterval(game.engine.gameLoop.bind(game.engine), 1);
  }
  
  initGame();
  