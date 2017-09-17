function SnakeGame() {
  this.canvas = document.getElementById("whyupdate");
  this.context = this.canvas.getContext('2d'); 
}

SnakeGame.prototype.create_levels = function(){
  var gameLevels = new Array();

  var width = this.canvas.width/this.cw;
  var height = this.canvas.height/this.cw;
  //Level 0
  gameLevels[0] = new Array();
  //Level 1
  gameLevels[1] = new Array();
  gameLevels[2] = new Array();
  for(var i =0; i<width/2; i++)
	{
		var current_sprite = new Sprite(i*this.cw+0.25*this.canvas.width,this.canvas.height/2-this.cw, this.cw, this.cw, "https://kspatil2.github.io/edited_air.png");
    current_sprite.tags.name = "wall";
		gameLevels[1].push(current_sprite);
  //  this.engine.addObject(current_sprite);
  }
  //level 2
  for(var i =0; i<height/4; i++)
	{
		var current_sprite = new Sprite(this.canvas.width/2,i*this.cw+0.15*this.canvas.height, this.cw, this.cw, "https://kspatil2.github.io/edited_air.png");
    current_sprite.tags.name = "wall";
		gameLevels[2].push(current_sprite);
   // this.engine.addObject(current_sprite);
  }

  for(var i =0; i<height/4; i++)
	{
		var current_sprite = new Sprite(this.canvas.width/2,i*this.cw+0.60*this.canvas.height, this.cw, this.cw, "https://kspatil2.github.io/edited_air.png");
    current_sprite.tags.name = "wall";
		gameLevels[2].push(current_sprite);
   // this.engine.addObject(current_sprite);
  }

  for(var i =0; i<width/4; i++)
	{
		var current_sprite = new Sprite(i*this.cw+0.20*this.canvas.width,this.canvas.height/2-this.cw, this.cw, this.cw, "https://kspatil2.github.io/edited_air.png");
    current_sprite.tags.name = "wall";
		gameLevels[2].push(current_sprite);
   // this.engine.addObject(current_sprite);
  }
  for(var i =0; i<width/4; i++)
	{
		var current_sprite = new Sprite(i*this.cw+0.60*this.canvas.width,this.canvas.height/2-this.cw, this.cw, this.cw, "https://kspatil2.github.io/edited_air.png");
    current_sprite.tags.name = "wall";
		gameLevels[2].push(current_sprite);
   // this.engine.addObject(current_sprite);
  }

  return gameLevels;
}

SnakeGame.prototype.init = function() {
  this.engine = new Engine(this.canvas, this.context);
  this.food = null;
  //Bind game level listeners
  if(this.restart == true){
    this.level = 0;
    this.prev = 0;
    this.score = 0;
  }
  this.restart = false;
  this.d = "right";
  this.cw = 40;
  this.create_walls();
  this.create_snake();
  this.create_food();
  this.levels = this.create_levels(); 
  this.engine.input.setKeyboardPressHandler(this.keyControls.bind(this));
  this.engine.collision.setCollisionHandler(this.handleCollission.bind(this));
  
}

SnakeGame.prototype.handleCollission = function(head,sprite2,index1,index2){
  console.log(sprite2);
  console.log(head);
  if(sprite2.tags.name == "food"){
    this.ateFood = true;
  }
  else{
    this.restart = true;
    this.init();
  }
}

SnakeGame.prototype.create_snake = function()
{
	var length = 5;
	this.snake_array = [];
	for(var i =length -1; i>=0; i--)
	{
		var current_sprite = new Sprite((i+2)*this.cw,this.cw, this.cw, this.cw, "https://kspatil2.github.io/edited_air.png");
    current_sprite.tags.name = "snake";
		this.snake_array.push(current_sprite);
    this.engine.addObject(current_sprite);
	}
}

SnakeGame.prototype.keyControls = function(e){
  var key = e.which;
  if(key == "37" && this.d != "right") this.d = "left";
  else if(key == "38" && this.d != "down") this.d = "up";
  else if(key == "39" && this.d != "left") this.d = "right";
  else if(key == "40" && this.d != "up") this.d = "down";
}

SnakeGame.prototype.create_food = function()
{
  var x = Math.round(Math.random()*(this.canvas.width-this.cw)/this.cw);
  var y = Math.round(Math.random()*(this.canvas.height-this.cw)/this.cw);
  if(this.food == undefined){
    this.food = new Sprite( this.cw * x, this.cw * y, this.cw, this.cw, "https://kspatil2.github.io/edited_RockDude.jpg");
    this.food.tags.name = "food";
    this.engine.addObject(this.food);
  }
  this.food.X = x*this.cw;
  this.food.Y = y*this.cw;
}

SnakeGame.prototype.loadContent = function() {
	this.init();
}

SnakeGame.prototype.updateLevel = function(){

  this.restart = false;
  this.init();
  for(var i = 0; i < this.levels[this.level].length; i++){
    this.engine.addObject(this.levels[this.level][i]);
  }
}

SnakeGame.prototype.update = function() {
  this.engine.update();
  if(this.level==undefined){
    this.level = 0;
    this.prev = 0;
    this.score = 0;
  }
  this.level = Math.floor(this.score/100);
  if(this.prev!=this.level){
    console.log(this.score);
    if(this.level>=3){
      this.restart = true;
      this.init();
    }
    this.updateLevel();
  }
  this.prev = this.level;
  var nx = this.snake_array[0].X/this.cw;
  var ny = this.snake_array[0].Y/this.cw;
  if(this.d=="right") nx++;
  else if(this.d=="left") nx--;
  else if(this.d=="up" ) ny--;
  else if(this.d=="down" ) ny++;
  var tail = this.snake_array[this.snake_array.length-1];
  if(this.ateFood != true){
    tail = this.snake_array.pop();
    tail.X = nx * this.cw;
    tail.Y = ny * this.cw;
  }
  else {
    tail = new Sprite(nx*this.cw,ny*this.cw,this.cw,this.cw,"https://kspatil2.github.io/edited_air.png");
    tail.tags.name = "snake";
    this.engine.addObject(tail);
    this.create_food();
    this.score+=50;
    this.ateFood = false;
  }
  this.snake_array.unshift(tail);
  this.engine.input.setMovedObject(this.snake_array[0].id);
}

SnakeGame.prototype.create_walls = function()
{
  var height = this.canvas.height/this.cw;
  var width = this.canvas.width/this.cw;
	this.boundary = [];
	for(var i =0; i<width; i++)
	{
		var current_sprite = new Sprite(i*this.cw,0, this.cw, this.cw, "https://kspatil2.github.io/edited_air.png");
    current_sprite.tags.name = "wall";
		this.boundary.push(current_sprite);
    this.engine.addObject(current_sprite);
  }
  for(var i =1; i<height; i++)
	{
		var current_sprite = new Sprite(this.canvas.width-this.cw,i*this.cw, this.cw, this.cw, "https://kspatil2.github.io/edited_air.png");
    current_sprite.tags.name = "wall";
		this.boundary.push(current_sprite);
    this.engine.addObject(current_sprite);
  }
  for(var i =1; i<height; i++)
	{
		var current_sprite = new Sprite(0,i*this.cw, this.cw, this.cw, "https://kspatil2.github.io/edited_air.png");
    current_sprite.tags.name = "wall";
		this.boundary.push(current_sprite);
    this.engine.addObject(current_sprite);
  }
  for(var i =1; i<width; i++)
	{
		var current_sprite = new Sprite(i*this.cw,this.canvas.height-this.cw, this.cw, this.cw, "https://kspatil2.github.io/edited_air.png");
    current_sprite.tags.name = "wall";
		this.boundary.push(current_sprite);
    this.engine.addObject(current_sprite);
	}
}

SnakeGame.prototype.drawLayout = function()
{
  var context = this.context;
  var canvas = this.canvas;
  
  context.lineWidth = "3";
  context.strokeStyle = "black";
  context.beginPath();
  
  context.moveTo(0,canvas.height-1);
  context.lineTo(canvas.width,canvas.height-1);
  context.stroke();
  
  context.moveTo(0,1);
  context.lineTo(canvas.width,1);
  context.stroke();
  
  context.moveTo(1,1);
  context.lineTo(1,canvas.height);
  context.stroke();
  
  context.moveTo(canvas.width-1,0);
  context.lineTo(canvas.width-1,canvas.height);
  context.stroke();
}

SnakeGame.prototype.draw = function() {
  this.engine.draw();
  this.drawLayout();
}

SnakeGame.prototype.gameLoop = function() {
  this.update();
  this.draw();
}

function initGame() {
  var game = new SnakeGame();
  game.loadContent();
  setInterval(game.gameLoop.bind(game), 200);
}

initGame();
