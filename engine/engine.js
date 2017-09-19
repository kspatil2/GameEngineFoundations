/**
 * @author aarlika, achand13, kspatil2, rsinha2
 */
//---------Engine------------------
/**
 * @class  Game Engine Class 
 * @param {*} canvas Canvas element from the HTML File
 * @param {*} context Drawing Context
 */
function Engine(canvas, context) {
  this.canvas = canvas;
  this.context = context;

  this.init();
}

Engine.prototype.init = function(){
  this.objects = new Array();           //Game objects(sprites)
  this.objectIdGenerator = 0;           //Unique id for each game object.

  this.input = new Input(this);         //Input handler system
  this.collision = new Collision(this); //Collision handler system
  this.storage = new Storage(this);

  //Bind engine event listeners
  this.canvas.onmousedown = this.input.handleMouseDown.bind(this.input);
  this.canvas.onmouseup = this.input.handleMouseUp.bind(this.input);
  this.canvas.onmousemove = this.input.handleMouseMove.bind(this.input);
  document.addEventListener("keydown", this.input.handleKeyPress.bind(this.input));
}

Engine.prototype.resetObjects = function() {
  this.init();
}

/**
 * Update Method of the Game Engine class
 */
Engine.prototype.update = function() {
  this.collision.update();
}

/**
 * Draw Method of the game engine class
 */
Engine.prototype.draw = function() {
  this.canvas.width = this.canvas.width;
  for (var i = 0; i < this.objects.length; i++) {
    this.objects[i].draw(this.context);
  }
}

/**
 * Method to add new Objects to the game engines list of Objects
 */
Engine.prototype.addObject = function(object) {
  object.id = this.objectIdGenerator;
  this.objects.push(object);
  this.objectIdGenerator++;
}

/**
 * Method to remove Objects from the game engines list of objects
 */
Engine.prototype.deleteObject = function(id) {
  if(this.input.objectSelectedId == id) 
    this.input.objectSelectedId = null;
  if(this.collision.movedObjectId == id)
    this.collision.movedObjectId = null;
  var index = this.getObjectIndex(id);
  if(index != null)
    this.objects.splice(index, 1);
}

/**
 * Method to get Object from the engine list of objects 
 */
Engine.prototype.getObject = function(id) {  
  for(var index = 0; index < this.objects.length; index++) {
    if(this.objects[index].id == id)
      return this.objects[index];
  }
  return null;
}

/**
 * Method to get Object's index  from the engine list of objects 
 */
Engine.prototype.getObjectIndex = function(id) {  
  for(var index = 0; index < this.objects.length; index++) {
    if(this.objects[index].id == id)
      return index;
  }
  return null;
}

/**
 * Method to Get Count of Objects in the list of Objects
 */
Engine.prototype.objectCount = function() {
  return this.objects.length;
}

//---------Sprite------------------
/**
 * @class Sprite Class
 * @param {*} x x coordinate 
 * @param {*} y y coordinate 
 * @param {*} width width of Sprite
 * @param {*} height height of Sprite
 * @param {*} src src of Image
 */
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


/**
 * Function to draw sprite if it is not hidden 
 */
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
/**
 * @class contains collision related functionality
 * @param {*} engine Current Engine Object 
 */
function Collision(engine) {
  this.engine = engine;
  this.movedObjectId = null;
  this.collisionHandler = null;
}

/**
 * Sets collisionHandler
 */
Collision.prototype.setCollisionHandler = function(handler) {
  this.collisionHandler = handler;
}
/**
 * Check if a point-object collision occurs
 */
Collision.prototype.checkCollision = function(object, x, y) {
  var minX = object.X;
  var maxX = object.X + object.width;
  var minY = object.Y;
  var maxY = object.Y + object.height;
  
  if (x >= minX && x <= maxX && y >= minY && y <= maxY)
    return true;
  return false;
}

/**
 * Check if an object-object collision occurs 
 */
Collision.prototype.checkBoxCollision = function(obj1, obj2) {
  //TODO to be added when needed
}

/**
 * Check if a point x, y collides with any of the game objects
 */
Collision.prototype.checkCollisionWithAllObjects = function(x, y) {
  for(var i = 0; i < this.engine.objects.length; i++) {
    if(this.checkCollision(this.engine.objects[i], x, y)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if the last moved Object interests with any other object. 
 */
Collision.prototype.update = function() {
  if(this.movedObjectId == null)
    return;
  var movedObject = this.engine.getObject(this.movedObjectId);
  if(movedObject == null)
    return;
  var movedX = movedObject.X + (movedObject.width / 2);
  var movedY = movedObject.Y + (movedObject.height / 2);
  for(var i = 0; i < this.engine.objects.length; i++) {
    if(this.movedObjectId != this.engine.objects[i].id && this.checkCollision(this.engine.objects[i], movedX, movedY)) {
      if(this.collisionHandler != null) {
        this.collisionHandler(movedObject, this.engine.objects[i]);
        break;
      }
    }
  }
  this.movedObjectId = null;
}

//---------Input-------------------
/**
 * @class for mantaining Input to the Engine
 * @param {*} engine The Current Engine Object  
 */
function Input(engine) {
  this.engine = engine;
  this.objectSelectedId = null;
  this.intervalX = null;
  this.intervalY = null;
  this.mouseDownHandler = null;
  this.mouseUpHandler = null;
  this.mouseMoveHandler = null;
  this.keyboardPressHandler = null;
}

/**
 * Set Mouse Down Event Handler
 */
Input.prototype.setMouseDownHandler = function(handler) {
  this.mouseDownHandler = handler;
}

/**
 * Set Mouse Up Event Handler
 */
Input.prototype.setMouseUpHandler = function(handler) {
  this.mouseUpHandler = handler;
}

/**
 * Set Mouse Move Event Handler
 */
Input.prototype.setMouseMoveHandler = function(handler) {
  this.mouseMoveHandler = handler;
}

Input.prototype.setKeyboardPressHandler = function(handler) {
  this.keyboardPressHandler = handler;
}

/**
 * Set Current selected object
 */
Input.prototype.setObjectSelected = function(id) {
  if(this.objectSelectedId != null) {
    var objectSelected = this.engine.getObject(this.objectSelectedId);
    if(objectSelected != null)
      objectSelected.tags.selected = false;
  }
  if(id != null) {
    var objectSelected = this.engine.getObject(id);
    if(objectSelected != null)
      objectSelected.tags.selected = true;
  }
  this.objectSelectedId = id;
}

/**
 * call handler if an object was clicked on.
 * Checks for collision, If it has occurred, determines difference between mouse postion and position of the object 
 * and calls the event handler of the game
 */
Input.prototype.handleMouseDown = function(e) {
  var x = e.clientX, y = e.clientY;
  for (var iter = 0; iter < this.engine.objects.length; iter++) {
    if (this.engine.collision.checkCollision(this.engine.objects[iter], x, y)) {
      this.intervalX = x - this.engine.objects[iter].X;
      this.intervalY = y - this.engine.objects[iter].Y;
      this.setObjectSelected(this.engine.objects[iter].id);
      if(this.mouseDownHandler != null)
        this.mouseDownHandler(this.engine.objects[iter], x - this.intervalX, y - this.intervalY);
      break;
    }
  }
}

Input.prototype.setMovedObject = function(id) {
  this.engine.collision.movedObjectId = id;
}
/**
 * call handler if an object was released 
 */
Input.prototype.handleMouseUp = function(e) {
  if(this.objectSelectedId != null && this.mouseUpHandler != null) {
    var objectSelected = this.engine.getObject(this.objectSelectedId);
    if(objectSelected != null)
      this.mouseUpHandler(objectSelected, e.clientX, e.clientY);
    this.engine.collision.movedObjectId = this.objectSelectedId;
    this.setObjectSelected(null);
    this.intervalX = null;
    this.intervalY = null;
  }
}

/**
 * call handler if an object was dragged 
 */
Input.prototype.handleMouseMove = function(e) {
  if(this.objectSelectedId != null && this.mouseMoveHandler != null) {
    var objectSelected = this.engine.getObject(this.objectSelectedId);
    if(objectSelected != null)
      this.mouseMoveHandler(objectSelected, e.clientX - this.intervalX, e.clientY - this.intervalY);
  }
}

Input.prototype.handleKeyPress = function(e) {
  if(this.keyboardPressHandler != null)
   this.keyboardPressHandler(e.code);
}

//---------Storage-------------------
function Storage(engine) {
  this.engine = engine;
}

Storage.prototype.setValue = function(key, value) {
  if (typeof (Storage) !== "undefined") {
    localStorage.setItem(key, value);
  }
}

Storage.prototype.getValue = function(key) {
  if (typeof (Storage) !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
}