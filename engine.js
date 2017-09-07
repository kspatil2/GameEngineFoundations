//---------Engine------------------
function Engine(canvas, context) {
  this.canvas = canvas;
  this.context = context;
  this.objects = new Array();           //Game objects(sprites)
  this.input = new Input(this);         //Input handler system
  this.collision = new Collision(this); //Collision handler system

  //Bind engine event listeners
  this.canvas.onmousedown = this.input.handleMouseDown.bind(this.input);
  this.canvas.onmouseup = this.input.handleMouseUp.bind(this.input);
  this.canvas.onmousemove = this.input.handleMouseMove.bind(this.input);
}

Engine.prototype.update = function() {
  this.collision.update();
}

Engine.prototype.draw = function() {
  this.canvas.width = this.canvas.width;
  for (var i = 0; i < this.objects.length; i++) {
    this.objects[i].draw(this.context);
  }
}

Engine.prototype.addObject = function(object) {
  this.objects.push(object);
}

Engine.prototype.deleteObject = function(index) {
  if(this.input.objectSelected == index) 
    this.input.objectSelected = null;
  if(this.collision.movedObjectIndex == index)
    this.collision.movedObjectIndex = null;
  this.objects.splice(index, 1);
}

Engine.prototype.objectCount = function() {
  return this.objects.length;
}

//---------Sprite------------------
function Sprite(x, y, width, height, src) {
  this.X = x;
  this.Y = y;
  this.width = width;
  this.height = height;
  this.image = new Image();
  this.image.width = width;
  this.image.height = height;
  this.image.src = src;
  this.tags = {};
}

//Draw sprite if it is not hidden
Sprite.prototype.draw = function(context) {
  if(this.tags.hidden != true) {
    context.drawImage(this.image, this.X, this.Y, this.image.width, this.image.height);
    //draw a red box around selected object
    if(this.tags.selected == true) {
      context.beginPath();
      context.lineWidth = "6";
      context.strokeStyle = "red";
      context.rect(this.X, this.Y, this.width, this.height);
      context.stroke();
    }
  }
}

//---------Collision---------------
function Collision(engine) {
  this.engine = engine;
  this.movedObjectIndex = null;
  this.collisionHandler = null;
}

Collision.prototype.setCollisionHandler = function(handler) {
  this.collisionHandler = handler;
}

//Check if a point-object collision occurs
Collision.prototype.checkCollision = function(object, x, y) {
  var minX = object.X;
  var maxX = object.X + object.width;
  var minY = object.Y;
  var maxY = object.Y + object.height;
  
  if (x >= minX && x <= maxX && y >= minY && y <= maxY)
    return true;
  return false;
}

//Check if an object-object collision occurs
Collision.prototype.checkBoxCollision = function(obj1, obj2) {
  
}

//Check if the last moved Object interests with any other object
Collision.prototype.update = function() {
  if(this.movedObjectIndex == null)
    return;
  
  var movedObject = this.engine.objects[this.movedObjectIndex];
  var movedX = movedObject.X + (movedObject.width / 2);
  var movedY = movedObject.Y + (movedObject.height / 2);
  for(var i = 0; i < this.engine.objects.length; i++) {
    if(this.movedObjectIndex != i && this.checkCollision(this.engine.objects[i], movedX, movedY)) {
      this.collisionHandler(movedObject, this.engine.objects[i], this.movedObjectIndex, i);
      break;
    }
  }
  this.movedObjectIndex = null;
}

//---------Input-------------------
function Input(engine) {
  this.engine = engine;
  this.objectSelected = null;
  this.intervalX = null;
  this.intervalY = null;
}

Input.prototype.setMouseDownHandler = function(handler) {
  this.mouseDownHandler = handler;
}

Input.prototype.setMouseUpHandler = function(handler) {
  this.mouseUpHandler = handler;
}

Input.prototype.setMouseMoveHandler = function(handler) {
  this.mouseMoveHandler = handler;
}

Input.prototype.setObjectSelected = function(iter) {
  if(this.objectSelected != null)
    this.engine.objects[this.objectSelected].tags.selected = false;
  if(iter != null) {
    this.engine.objects[iter].tags.selected = true;
  }
  this.objectSelected = iter;
}

//call handler if an object was clicked on
Input.prototype.handleMouseDown = function(e) {
  var x = e.clientX, y = e.clientY;
  for (var iter = 0; iter < this.engine.objects.length; iter++) {
    if (this.engine.collision.checkCollision(this.engine.objects[iter], x, y)) {
      this.intervalX = x - this.engine.objects[iter].X;
      this.intervalY = y - this.engine.objects[iter].Y;
      this.setObjectSelected(iter);
      this.mouseDownHandler(this.engine.objects[iter], iter, x - this.intervalX, y - this.intervalY);
      break;
    }
  }
}

//call handler if an object was released
Input.prototype.handleMouseUp = function(e) {
  if(this.objectSelected != null) {
    this.mouseUpHandler(this.engine.objects[this.objectSelected], this.objectSelected, e.clientX, e.clientY);
    this.engine.collision.movedObjectIndex = this.objectSelected;
    this.setObjectSelected(null);
    this.intervalX = null;
    this.intervalY = null;
  }
}

//call handler if an object was dragged
Input.prototype.handleMouseMove = function(e) {
  if(this.objectSelected != null)
    this.mouseMoveHandler(this.engine.objects[this.objectSelected], this.objectSelected, e.clientX - this.intervalX, e.clientY - this.intervalY);
}