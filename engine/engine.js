/**
 * @author aarlika, achand13, kspatil2, rsinha2
 */
//---------Engine------------------
/**
 * @class  Game Engine Class 
 * @param {*} canvas Canvas element from the HTML File
 * @param {*} context Drawing Context
/**
 * 
 * 
 * @param {any} canvas 
 * @param {any} context 
 * @param {any} gameType 
 */
function Engine(canvas, context, gameType) {
  if (gameType === "2D") {
    this.game_type = "2D";
    this.canvas = canvas;
    this.context = context;
    this.updateHandler = null;
    this.drawHandler = null;
    this.init();
  }
  else {
    this.game_type = "3D";
    this.updateHandler = null;
    this.drawHandler = null;
    // TODO : change naming of this function to accomodate both 2d and 3d
    // Parameters : webglCanvas, inputTrianglesURL, inputSpheresURL
    // Also for 3D games, there is no init yet. Everything initializd in Graphics Constructor
    this.webglCanvas = canvas;
    this.inputTriangles = context;
    this.inputSpheres = gameType;
    //console.log("Engine constructor :"+ this.inputTriangles);
    this.init();
  }
}
/**
 * This is the constructor function for the Engine Class
 */
Engine.prototype.init = function () {
  if (this.game_type == "2D") {
    this.objects = new Array();           //Game objects(sprites)
    this.objectIdGenerator = 0;           //Unique id for each game object.
    this.particleSystem = new Array();   // Particle System

    this.input = new Input(this);         //Input handler system
    this.collision = new Collision(this); //Collision handler system
    this.storage = new Storage(this);
    this.physics = new Physics(this);
    this.network = new Network(this);
    this.graph = new Graph(this);
    this.pathSearch = new PathSearch(this);

    //Bind engine event listeners
    this.canvas.onmousedown = this.input.handleMouseDown.bind(this.input);
    this.canvas.onmouseup = this.input.handleMouseUp.bind(this.input);
    this.canvas.onmousemove = this.input.handleMouseMove.bind(this.input);
    document.addEventListener("keydown", this.input.handleKeyPress.bind(this.input));
  }
  else {
    this.input = new Input(this);         //Input handler system
    this.textures = new Textures(this);
    this.graphics = new Graphics(this);
    this.sound = new Sound(this);

    document.addEventListener("keydown", this.input.handleKeyPress.bind(this.input));
  }
}

/**
 * This Function is called on restarting the game
 */
Engine.prototype.resetObjects = function () {
  this.init();
}

/**
 * Update Method of the Game Engine class
 */
Engine.prototype.update = function () {
  this.physics.update();
  this.collision.update();
}

/**
 * Draw Method of the game engine class
 */
Engine.prototype.draw = function () {
  if (this.game_type == '2D') {
    this.canvas.width = this.canvas.width;
    for (var i = 0; i < this.objects.length; i++) {
      this.objects[i].draw(this.context, this.spriteSheet);
    }
  }
  else {
    this.graphics.renderModels();
  }
}

/**
 * Method to add new Objects to the game engines list of Objects
 */
Engine.prototype.addObject = function (object) {
  object.id = this.objectIdGenerator;
  this.objects.push(object);
  this.objectIdGenerator++;
}

/**
 * Method to remove Objects from the game engines list of objects
 */
Engine.prototype.deleteObject = function (id) {
  if (this.input.objectSelectedId == id)
    this.input.objectSelectedId = null;
  //if (this.collision.movedObjectId == id)
    //this.collision.movedObjectId = null;
  if(this.collision.isMovingObject(id))
    delete this.collision.movedObjectId[id];
  var index = this.getObjectIndex(id);
  if (index != null) {
    this.particleSystem.push(this.objects[index]);
    this.objects.splice(index, 1);
  }
}

/**
* Method to get a reuable object from the pool (Particle System)
*/
Engine.prototype.getReusableObject = function () {
  if (this.particleSystem.length > 0) {
    var obj = this.particleSystem[0];
    this.particleSystem.shift();
    return obj;
  }
  return null;
}

/**
 * Method to get Object from the engine list of objects 
 */
Engine.prototype.getObject = function (id) {
  for (var index = 0; index < this.objects.length; index++) {
    if (this.objects[index].id == id)
      return this.objects[index];
  }
  return null;
}

/**
 * Method to get Object's index  from the engine list of objects 
 */
Engine.prototype.getObjectIndex = function (id) {
  for (var index = 0; index < this.objects.length; index++) {
    if (this.objects[index].id == id)
      return index;
  }
  return null;
}

/**
 * Method to Get Count of Objects in the list of Objects
 */
Engine.prototype.objectCount = function () {
  return this.objects.length;
}

Engine.prototype.setUpdateHandler = function (handler) {
  this.updateHandler = handler;
  //console.log(this.updateHandler);
}

Engine.prototype.setDrawHandler = function (handler) {
  this.drawHandler = handler;
  //console.log(this.drawHandler);
}
/**
 * The main game Loop of the Engine
 */
Engine.prototype.gameLoop = function () {
  this.updateHandler();
  this.drawHandler();
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
function Sprite(x, y, width, height, spriteStyle) {
  this.X = x;
  this.Y = y;
  this.width = width;
  this.height = height;
  this.spriteStyle = spriteStyle;
  this.tags = {};
}


/**
 * Function to draw sprite if it is not hidden 
 */
Sprite.prototype.draw = function (context, spriteSheet) {
  if (this.tags.hidden != true) {
    //context.drawImage(this.image, this.X, this.Y, this.image.width, this.image.height);
    context.drawImage(spriteSheet, this.spriteStyle.x, this.spriteStyle.y, this.spriteStyle.width, this.spriteStyle.height, this.X, this.Y, this.width, this.height);
    //draw a red box around selected object
    if (this.tags.selected == true) {
      context.beginPath();
      context.lineWidth = "6";
      context.strokeStyle = "red";
      context.rect(this.X, this.Y, this.width, this.height);
      context.stroke();
    }
  }
}

/**
 * Loads the Sprite Sheet for the current game
 * 
 * @param {any} url 
 * @returns 
 */
Engine.prototype.loadSpriteSheet = function (url) {
  try {
    this.spriteSheet = new Image();
    this.spriteSheet.src = url;
    return true;
  }
  catch (e) {
    console.log("Failed to load spritesheet!");
    return false;
  }
}

//---------Collision---------------
/**
 * @class contains collision related functionality
 * @param {*} engine Current Engine Object 
 */
function Collision(engine) {
  this.engine = engine;
  //this.movedObjectId = null;
  this.movedObjectId = new Object(); // Creating new hash map for the moving objects
  this.checkCollisionBetweenMovingObjects = true;
  this.collisionHandler = null;
}

/**
 * Sets collisionHandler
 */
Collision.prototype.setCollisionHandler = function (handler) {
  this.collisionHandler = handler;
}
/**
 * Check if a point-object collision occurs
 */
Collision.prototype.checkCollision = function (object, x, y) {
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
Collision.prototype.checkBoxCollision = function (obj1, obj2) {
  //TODO to be added when needed
}

/**
 * Check if a point x, y collides with any of the game objects
 */
Collision.prototype.checkCollisionWithAllObjects = function (x, y) {
  for (var i = 0; i < this.engine.objects.length; i++) {
    if (this.checkCollision(this.engine.objects[i], x, y)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if the last moved Object interests with any other object. 
 */
Collision.prototype.update = function () {
  if (this.movedObjectId == null || Object.keys(this.movedObjectId).length == 0)
    return;

  for (var id in this.movedObjectId) {
    var movedObject = this.engine.getObject(id);

    if (movedObject == null)
      return;

    var movedX = movedObject.X + (movedObject.width / 2);
    var movedY = movedObject.Y + (movedObject.height / 2);

    for (var i = 0; i < this.engine.objects.length; i++) {

      if (this.isMovingObject(this.engine.objects[i].id) == false || this.checkCollisionBetweenMovingObjects == true) {
        if (id != this.engine.objects[i].id && this.checkCollision(this.engine.objects[i], movedX, movedY)) {
          if (this.collisionHandler != null) {
            this.collisionHandler(movedObject, this.engine.objects[i]);
            break;
          }
        }
      }
    }
    //this.movedObjectId = null;
  }

  this.movedObjectId = new Object();
}

/**
 * Check if the given object id belongs to a moving object
 */
Collision.prototype.isMovingObject = function (id) {
  return this.movedObjectId != null && this.movedObjectId[id] == true;
}

/**
 * Sets the flag to check that handles collision between moving objects
 */
Collision.prototype.setCollisionBetweenMovingObjects = function (value) {
  this.checkCollisionBetweenMovingObjects = value;
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
Input.prototype.setMouseDownHandler = function (handler) {
  this.mouseDownHandler = handler;
}

/**
 * Set Mouse Up Event Handler
 */
Input.prototype.setMouseUpHandler = function (handler) {
  this.mouseUpHandler = handler;
}

/**
 * Set Mouse Move Event Handler
 */
Input.prototype.setMouseMoveHandler = function (handler) {
  this.mouseMoveHandler = handler;
}
/**
 * Set Keypress Event Handler
 * 
 * @param {any} handler 
 */
Input.prototype.setKeyboardPressHandler = function (handler) {

  this.keyboardPressHandler = handler;

}

/**
 * Set Current selected object
 */
Input.prototype.setObjectSelected = function (id) {
  if (this.objectSelectedId != null) {
    var objectSelected = this.engine.getObject(this.objectSelectedId);
    if (objectSelected != null)
      objectSelected.tags.selected = false;
  }
  if (id != null) {
    var objectSelected = this.engine.getObject(id);
    if (objectSelected != null)
      objectSelected.tags.selected = true;
  }
  this.objectSelectedId = id;
}

/**
 * call handler if an object was clicked on.
 * Checks for collision, If it has occurred, determines difference between mouse postion and position of the object 
 * and calls the event handler of the game
 */
Input.prototype.handleMouseDown = function (e) {
  var x = e.clientX, y = e.clientY;
  for (var iter = 0; iter < this.engine.objects.length; iter++) {
    if (this.engine.collision.checkCollision(this.engine.objects[iter], x, y)) {
      this.intervalX = x - this.engine.objects[iter].X;
      this.intervalY = y - this.engine.objects[iter].Y;
      this.setObjectSelected(this.engine.objects[iter].id);
      if (this.mouseDownHandler != null)
        this.mouseDownHandler(this.engine.objects[iter], x - this.intervalX, y - this.intervalY);
      break;
    }
  }
}
/**
 * Sets the object/objects to be moved
 * 
 * @param {any} id 
 */
Input.prototype.setMovedObject = function (id) {
  //this.engine.collision.movedObjectId = id;
  if (this.engine.collision.movedObjectId == null || this.engine.collision.movedObjectId == undefined)
    this.engine.collision.movedObjectId = new Object();

  this.engine.collision.movedObjectId[id] = true;
}

/**
 * Removes an object from the moving object list
 * 
 * @param {any} id 
 */
Input.prototype.removeMovedObject = function (id) {
  if(this.engine.collision.movedObjectId!= null && this.engine.collision.movedObjectId[id] == true)
    delete this.engine.collision.movedObjectId[id];
}

/**
 * call handler if an object was released 
 */
Input.prototype.handleMouseUp = function (e) {
  if (/*this.objectSelectedId != null&&*/ this.mouseUpHandler != null) {
    var objectSelected = this.engine.getObject(this.objectSelectedId);
    //if(objectSelected != null)
    this.mouseUpHandler(objectSelected, e.clientX, e.clientY);
    this.setMovedObject(this.objectSelectedId);
    // this.engine.collision.movedObjectId[this.objectSelectedId] = true;
    this.setObjectSelected(null);
    this.intervalX = null;
    this.intervalY = null;
  }
}

/**
 * call handler if an object was dragged 
 */
Input.prototype.handleMouseMove = function (e) {
  if (/*this.objectSelectedId != null &&*/ this.mouseMoveHandler != null) {
    var objectSelected = this.engine.getObject(this.objectSelectedId);
    //if(objectSelected != null)
    this.mouseMoveHandler(objectSelected, e.clientX - (this.intervalX == null ? 0 : this.intervalX), e.clientY - (this.intervalY == null ? 0 : this.intervalY));
  }
}
/**
 * call handler if key was pressed
 * 
 * @param {any} e 
 */
Input.prototype.handleKeyPress = function (e) {

  if (this.keyboardPressHandler != null)
    this.keyboardPressHandler(e.code);
}

/**
 * This class is for storage
 * 
 * @param {any} engine 
 */
function Storage(engine) {
  this.engine = engine;
}
/**
 * Store key value pair
 * 
 * @param {any} key key of Map
 * @param {any} value Value corresponding to the key
 */
Storage.prototype.setValue = function (key, value) {
  if (typeof (Storage) !== "undefined") {
    localStorage.setItem(key, value);
  }
}
/**
 * Get value for a given key
 * 
 * @param {any} key Key of the Map
 * @returns 
 */
Storage.prototype.getValue = function (key) {
  if (typeof (Storage) !== "undefined") {
    return localStorage.getItem(key) == null ? 0 : localStorage.getItem(key);
  }
  return null;
}

//--------------------Physics---------------------
/**
 * The Main Physics class constructor
 * 
 * @param {any} engine The current engine object
 */
function Physics(engine) {
  this.engine = engine;
  this.outOfBoundsHandler = null;
}

/**
 * Sets Out of bounds handler
 * 
 * @param {any} handler Event Handler function
 */
Physics.prototype.setOutOfBoundsHandler = function (handler) {
  this.outOfBoundsHandler = handler
}
/**
 * The Update function for physics sub engine
 * 
 */
Physics.prototype.update = function () {
  for (var i = 0; i < this.engine.objects.length; i++) {
    if (this.engine.objects[i].physics) {
      var obj = this.engine.objects[i];
      if (obj.physics.x_velocity != 0 || obj.physics.y_velocity != 0) {
        this.engine.input.setMovedObject(obj.id);
        obj.X += obj.physics.x_velocity;
        obj.Y += obj.physics.y_velocity;
        if (obj.X < 0 || (obj.X + 1.5 * obj.width) > this.engine.canvas.width) {
          if (this.outOfBoundsHandler != null)
            this.outOfBoundsHandler("X", obj);
        }
        if (obj.Y < 0 || (obj.Y + obj.height) > this.engine.canvas.height)
          if (this.outOfBoundsHandler != null)
            this.outOfBoundsHandler("Y", obj);
      }
    }
  }
}

/**
 * The init Function for the physics sub engine
 * 
 * @returns 
 */
Physics.prototype.initPhysics = function () {
  var physicsObj = {
    x_velocity: 0,
    y_velocity: 0
  };
  return physicsObj;
}
/**
 * 
 * 
 * @param {any} obj 
 * @returns 
 */
Physics.prototype.getVelocityTan = function (obj) {
  return obj.x_velocity / obj.y_velocity;
}

//---------Textures-------------------

/**
 * Texture Class
 * @param {*} engine current Engine
 */
function Textures(engine) {
  this.engine = engine;
  this.triangleTexture = [];
  this.sphereTexture = [];
}
/**
 * Initialize texture
 * 
 * @param {any} texture_path path to texture image
 * @param {any} whichSet index of model
 */
Textures.prototype.initTexture = function (texture_path, whichSet) {
  this.triangleTexture[whichSet] = gl.createTexture();
  this.triangleTexture[whichSet].image = new Image();
  this.triangleTexture[whichSet].image.crossOrigin = '';
  this.triangleTexture[whichSet].image.textures = this;
  //console.log(this);
  this.triangleTexture[whichSet].image.onload = function () {
    //   console.log("gl : "+ this.textures.triangleTexture[whichSet]);
    this.textures.handleLoadedTexture(this.textures.triangleTexture[whichSet]);
  }
  if (texture_path)
    this.triangleTexture[whichSet].image.src = "https://kspatil2.github.io/" + texture_path;
  //console.log("Hello : ",texture_path);
}
/**
 * initialize sphere texture
 * 
 * @param {any} texture_path path to texture image
 * @param {any} whichSet index of sphere
 */
Textures.prototype.initSphereTexture = function (texture_path, whichSet) {
  this.sphereTexture[whichSet] = gl.createTexture();
  this.sphereTexture[whichSet].image = new Image();
  this.sphereTexture[whichSet].image.crossOrigin = '';
  this.sphereTexture[whichSet].image.textures = this;

  this.sphereTexture[whichSet].image.onload = function () {
    this.textures.handleLoadedTexture(this.textures.sphereTexture[whichSet]);
  }
  if (texture_path)
    this.sphereTexture[whichSet].image.src = "https://kspatil2.github.io/" + texture_path;
  //console.log(texture_path);
}
/**
 * to add texture to GL
 * 
 * @param {any} texture 
 */
Textures.prototype.handleLoadedTexture = function (texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.bindTexture(gl.TEXTURE_2D, null);
}


//---------Sound-------------------
/**
 * Sound Class
 * 
 * @param {any} engine Current game Engine
 */
function Sound(engine) {
  this.engine = engine;
  this.soundArray = [];
}
/**
 * Init Function for sound Class
 * 
 */
Sound.prototype.initSound = function () {
  this.soundArray.push(new Audio("sound/level1.mp3"));
  this.soundArray.push(new Audio("sound/level2.mp3"));
  this.soundArray.push(new Audio("sound/level3.mp3"));
  this.soundArray.push(new Audio("sound/level4.mp3"));
  this.soundArray.push(new Audio("sound/level5.mp3"));
  this.soundArray.push(new Audio("sound/tryagain.mp3"));
  this.soundArray.push(new Audio("sound/jump.wav"));
}
/**
 * Play Sound
 * 
 * @param {any} id index of SoundArray
 * @param {any} flag Flag to pause or play the sound
 */
Sound.prototype.playSound = function (id, flag) {
  switch (id) {
    case "level1": this.soundArray[0].loop = flag; this.soundArray[0].play(); break;
    case "level2": this.soundArray[1].loop = flag; this.soundArray[1].play(); break;
    case "level3": this.soundArray[2].loop = flag; this.soundArray[2].play(); break;
    case "level4": this.soundArray[3].loop = flag; this.soundArray[3].play(); break;
    case "level5": this.soundArray[4].loop = flag; this.soundArray[4].play(); break;
    case "tryagain": this.soundArray[5].play();
    case "jump": this.soundArray[6].play();
  }

}

/**
 * Stops sound
 * 
 * @param {any} id index of the SoundArray 
 */
Sound.prototype.stopSound = function (id) {
  switch (id) {
    case "level1": this.soundArray[0].pause(); this.soundArray.currentTime = 0; break;
    case "level2": this.soundArray[1].pause(); this.soundArray.currentTime = 0; break;
    case "level3": this.soundArray[2].pause(); this.soundArray.currentTime = 0; break;
    case "level4": this.soundArray[3].pause(); this.soundArray.currentTime = 0; break;
    case "level5": this.soundArray[4].pause(); this.soundArray.currentTime = 0; break;
  }
}

//-------------Network-----------
/**
 * Network Class
 * 
 * @param {any} engine 
 */
function Network(engine) {
  this.engine = engine;
  this.peer = null;
  this.networkEventHandler = null;
  this.connectionRestoreHandler = null;
}
/**
 * Initialize a new connection 
 * 
 * @param {any} keyValue 
 */
Network.prototype.initNetwork = function (keyValue) {
  this.generatePeerId();
  this.peer = new Peer(this.peerId, { key: keyValue });
  this.connection = null;
}
/**
 * 
 * Function to generate a random peerId
 */
Network.prototype.generatePeerId = function() {
  this.peerId = Math.floor(Math.random() * 10000);
}
/**
 * Function to create a new host
 * 
 */
Network.prototype.host = function() {
  this.playerId = 0;
  var network = this;
  this.peer.on("connection", function(connection) {
    network.connection = connection;
    network.connection.on('open', network.onConnectionRestored.bind(network));
    network.connection.on('data', network.networkEventHandler);
  });
}
/**
 * Function to join a new Connection
 * 
 * @param {any} peerId peerId of Host
 */
Network.prototype.join = function(peerId) {
  this.playerId = 1;
  this.connection = this.peer.connect(peerId.toString());
  this.connection.on('data', this.networkEventHandler);
}

/**
 * Called when connection starts
 * 
 */
Network.prototype.onConnectionRestored = function() {
  obj = {
    message: "Start"
  }
  this.connection.send(obj);
  this.connectionRestoreHandler();
}
/**
 * Sets Connection restore handler
 * 
 * @param {any} handler handler function
 */
Network.prototype.setConnectionRestoreHandler = function (handler) {
  this.connectionRestoreHandler = handler;
}

/**
 * sets  Network Handler
 * 
 * @param {any} handler handler function 
 */
Network.prototype.setNetworkEventHandler = function (handler) {
  this.networkEventHandler = handler;
}

/**
 * Sends data over the network
 * 
 * @param {any} key key of the map
 * @param {any} data data corresponding to the key
 */
Network.prototype.send = function (key, data) {
  obj = {
    message: key,
    value: data,
    playerId: this.playerId
  }
  if(this.connection)
    this.connection.send(obj);
}

//-------------Graph-----------
/**
 * Node class
 * 
 * @param {any} x 
 * @param {any} y 
 * @param {any} id 
 */
function GraphNode(x,y,id) {
  this.x = x;
  this.y = y;
  this.id = id
}
/**
 * Edge Class
 * 
 * @param {any} source 
 * @param {any} goal 
 * @param {any} weight 
 */
function Edge(source,goal,weight){
  this.source = source;
  this.goal = goal;
  this.weight = weight;
}
/**
 * Graph Class
 * 
 * @param {any} engine 
 */
function Graph(engine){
  this.engine = engine;
  this.nodes = [];
  this.edges = [];
  this.heuristic = null;
}
/**
 * Create new Node
 * 
 * @param {any} x x coordinate
 * @param {any} y y coordinate
 * @param {any} id id of node
 */
Graph.prototype.addNode = function(x,y,id) {
  this.nodes.push(new GraphNode(x,y,id));
}
/**
 * Add new edge
 * 
 * @param {any} id1 node 1
 * @param {any} id2 node 2
 * @param {any} dist edge weight
 */
Graph.prototype.addEdge = function(id1,id2,dist){
  this.edges.push(new Edge(id1,id2,dist));
}
/**
 * Constructor for the Search Class
 * 
 * @param {any} engine The current engine
 */
function PathSearch(engine){
  this.engine = engine;
}
/**
 * Get Shortest Path between a given source and dest
 * 
 * @param {any} graph 
 * @param {any} source 
 * @param {any} dest 
 * @returns 
 */
PathSearch.prototype.astar = function(graph,source, dest){
  this.nodes = graph.nodes;
  this.edges = graph.edges; 
  this.closedList = new Set();
  this.openList = new Set();
  this.distance = new Map();
  this.total = new Map();
  this.predecessors = new Map();
  this.distance[source] = 0;
  this.total[source] = graph.heuristic(source, dest); 
  this.openList.add(source);
  while(this.openList.size>0){
    var node = this.getMinimum(this.openList);
    if(node == dest)
      break;
    this.closedList.add(node);
    this.openList.delete(node);
    adjacentNodes = this.getNeighbors(node);
    for(var i = 0; i< adjacentNodes.length ;i++){
      if(this.getShortestTotal(adjacentNodes[i])>this.getShortestTotal(node)+this.getDistance(node, adjacentNodes[i])){
        this.distance[adjacentNodes[i]] = this.getShortestTotal(node)+this.getDistance(node, adjacentNodes[i]);
        this.total[adjacentNodes[i]] = this.distance[adjacentNodes[i]] + graph.heuristic(adjacentNodes[i],node);
        this.predecessors[adjacentNodes[i]] = node;
        this.openList.add(adjacentNodes[i]);
      }
    } 
  }
  return this.getPath(dest);
}
/**
 * Returns List of Neighbors
 * 
 * @param {any} node given node in the graph
 * @returns list of nodes
 */
PathSearch.prototype.getNeighbors = function(node){
  var neighbors = new Array();
  for(var i = 0; i < this.edges.length; i++){
    if(this.edges[i].source == node && !this.closedList.has(this.edges[i].goal)){
      neighbors.push(this.edges[i].goal);
    }
  }

  return neighbors;
}
/**
 * Gets the distance from node to target
 * 
 * @param {any} node 
 * @param {any} target 
 * @returns 
 */
PathSearch.prototype.getDistance = function(node, target){
  for(var i = 0; i < this.edges.length;i++){
    if(this.edges[i].source == node && this.edges[i].goal == target)
      return this.edges[i].weight;
  }
}
/**
 * Return the path given the target
 * 
 * @param {any} target target of the search
 * @returns path List of Nodes
 */
PathSearch.prototype.getPath = function(target){
  var path = new Array();
  var step = target;
  if(this.predecessors[step] == null){
    return null;
  }
  path.push(step);
  while(this.predecessors[step]!=null){
    step = this.predecessors[step];
    path.push(step);
  }

  return path;
  
}
/**
 * Set Heuristic Function
 * 
 * @param {any} handler handler to set heuristic 
 */
Graph.prototype.setHeuristic = function(handler) {
  this.heuristic = handler; 
  //return 0;
}
/**
 * Selects minimum Valued node from OpenList
 * 
 * @param {any} vertexes OpenList
 * @returns minimum cost Node
 */
PathSearch.prototype.getMinimum = function(vertexes){
  minimum = null;
  for(let i of vertexes){
    if(minimum == null) {
      minimum = i;
    }
    else{
      if(this.getShortestTotal(i)<this.getShortestTotal(minimum))
        minimum = i;
    }
  }
  return minimum;
}
/**
 * Return Shortest total distance to the destination Cost + Heuristic
 * 
 * @param {any} destination Goal of the search
 * @returns Shortest Total cost + heuristic
 */
PathSearch.prototype.getShortestTotal = function(destination) {
  d = this.total[destination];
  if(d==null){
    return Number.MAX_VALUE ;
  }else {
        return d;
    }
}