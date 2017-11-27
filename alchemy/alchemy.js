function AlchemyGame() {
  this.canvas = document.getElementById("whyupdate");
  this.context = this.canvas.getContext('2d');
  this.engine = new Engine(this.canvas, this.context, "2D");
}

AlchemyGame.prototype.init = function() {
  //Bind game level listeners
  this.engine.input.setMouseDownHandler(this.imageSelected.bind(this));
  this.engine.input.setMouseUpHandler(this.imageDeselected.bind(this));
  this.engine.input.setMouseMoveHandler(this.imageMoved.bind(this));
  this.engine.collision.setCollisionHandler(this.combineImages.bind(this));
}

AlchemyGame.prototype.loadContent = function() {
  this.init();
  this.elements = ["air", "water", "earth", "fire", "soul", "steam", "lava", "rockDude", "captainPlanet"];

  if(this.engine.loadSpriteSheet("spritesheet.png") != true)
    return false;

  this.spriteStyle = {
    "air": {x: 230, y: 280, width: 230, height: 280},
    "water": {x: 0, y: 560, width: 230, height: 280},
    "earth": {x: 460, y: 280, width: 230, height: 280},
    "fire": {x: 230, y: 0, width: 230, height: 280},
    "soul": {x: 690, y: 280, width: 230, height: 280},
    "steam": {x: 0, y: 280, width: 230, height: 280},
    "lava": {x: 690, y: 0, width: 230, height: 280},
    "rockDude": {x: 460, y: 0, width: 230, height: 280},
    "captainPlanet": {x: 0, y: 0, width: 230, height: 280}
  };

  this.combinations = new Map;
  this.combinations.set("water,air", "steam");
  this.combinations.set("earth,fire", "lava");
  this.combinations.set("steam,lava", "rockDude");
  this.combinations.set("soul,rockDude", "captainPlanet");
  this.combinations.set("air,water", "steam");
  this.combinations.set("fire,earth", "lava");
  this.combinations.set("lava,steam", "rockDude");
  this.combinations.set("rockDude,soul", "captainPlanet");
  
  this.unitWidth = this.canvas.width * 0.08;
  this.unitHeight = this.canvas.height * 0.18;

  for (var i = 0; i < this.elements.length; i++) {
    var startX = this.canvas.width * 0.81;
    var startY = this.canvas.height * 0.01;
    var xOffset = (i<5)? 0: 0.1 * this.canvas.width;
    var yOffset = (i%5) * 0.2 * this.canvas.height;
    var hidden = (i < 5)? false: true;
    startX += xOffset;
    startY += yOffset;
    var picture = new Sprite(startX, startY, this.unitWidth, this.unitHeight, this.spriteStyle[this.elements[i]]);
    picture.tags.name = this.elements[i];
    picture.tags.hidden = hidden;
    picture.tags.isFixed = true;
    this.engine.addObject(picture);
  }
  return true;
}

AlchemyGame.prototype.drawLayout = function() {
  var context = this.context;
  var canvas = this.canvas;
  
  context.lineWidth = "3";
  context.strokeStyle = "black";
  context.beginPath();
  context.moveTo(canvas.width*0.8,0);
  context.lineTo(canvas.width*0.8,canvas.height);
  context.stroke();
  
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

AlchemyGame.prototype.imageSelected = function(picture, x, y) {
  if(picture.tags.hidden == true) //this has not been unlocked yet. Do nothing
    return;
  
  console.log("Image selected!");
  var selectedPictureId = picture.id;
  if(picture.tags.isFixed == true) { //fixed picture. create a copy to move and add at the end. 
    var newPicture = new Sprite(x, y, this.unitWidth, this.unitHeight, this.spriteStyle[picture.tags.name]);
    newPicture.tags.name = picture.tags.name;
    newPicture.tags.hidden = false;
    newPicture.tags.isFixed = false;
    this.engine.addObject(newPicture);
    selectedPictureId = newPicture.id;
  }
  this.engine.input.setObjectSelected(selectedPictureId);
}

AlchemyGame.prototype.imageDeselected = function(picture, x, y) {
  console.log("Image deselected!");
  var outOfBoundsX = this.canvas.width * 0.8;
  if(x > outOfBoundsX) //image throwaway
    this.engine.deleteObject(picture.id);
}

AlchemyGame.prototype.combineImages = function(i1, i2) {
  if(i1.tags.isFixed == true || i2.tags.isFixed == true)  //dont combine if either of image is fixed
    return;
  var mapKey = i1.tags.name + "," + i2.tags.name;
  console.log("Checking for " + mapKey + " collision");
  if(this.combinations.get(mapKey)) {
    var newX = (i1.X + i2.X)/2;
    var newY = (i1.Y + i2.Y)/2;
    var newName = this.combinations.get(mapKey);
    var sourceId = this.elements.indexOf(newName);
    var newPicture = new Sprite(newX, newY, this.unitWidth, this.unitHeight, this.spriteStyle[newName]);
    newPicture.tags.name = newName;
    newPicture.tags.hidden = false;
    newPicture.tags.isFixed = false;
    this.engine.getObject(sourceId).tags.hidden = false;
    this.engine.deleteObject(i1.id);
    this.engine.deleteObject(i2.id);
    this.engine.addObject(newPicture);
  }
}

AlchemyGame.prototype.imageMoved = function(picture, x, y) {
  if(picture){
    picture.X = x;
    picture.Y = y;
  }
}


AlchemyGame.prototype.update = function() {
  this.engine.update();
}

AlchemyGame.prototype.draw = function() {
  this.engine.draw();
  this.drawLayout();
}

AlchemyGame.prototype.gameLoop = function() {
  this.update();
  this.draw();
}

function initGame() {
  var game = new AlchemyGame();
  if(game.loadContent() != true)
    return;
  setInterval(game.gameLoop.bind(game), 30);
}

initGame();