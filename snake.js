function SnakeGame() {
  this.canvas = document.getElementById("whyupdate");
  this.context = this.canvas.getContext('2d');
  this.engine = new Engine(this.canvas, this.context);
}

SnakeGame.prototype.init = function() {
  //Bind game level listeners
  this.d = "right";
  this.score = 0;
  this.cw = 40;
  this.create_snake();
  this.create_food();

  this.engine.input.setKeyboardPressHandler(this.keyControls.bind(this));

  
}


SnakeGame.prototype.create_snake = function()
{
	var length = 5;
	this.snake_array = [];
	for(var i =length -1; i>=0; i--)
	{
		var current_sprite = new Sprite(i*this.cw,0, this.cw, this.cw, "https://kspatil2.github.io/edited_air.png");
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

  var food = new Sprite( this.cw * x, this.cw * y, this.cw, this.cw, "https://kspatil2.github.io/edited_RockDude.jpg");
  this.engine.addObject(food);
}

SnakeGame.prototype.loadContent = function() {
	this.init();
}

SnakeGame.prototype.update = function() {
  this.engine.update();
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
  setInterval(game.gameLoop.bind(game), 30);
}

initGame();
