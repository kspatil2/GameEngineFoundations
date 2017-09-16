function SnakeGame() {
  this.canvas = document.getElementById("whyupdate");
  this.context = this.canvas.getContext('2d');
  this.engine = new Engine(this.canvas, this.context);
}

SnakeGame.prototype.init = function() {
  //Bind game level listeners
  
}

SnakeGame.prototype.loadContent = function() {

}

SnakeGame.prototype.update = function() {
  this.engine.update();
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