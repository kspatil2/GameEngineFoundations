canvas = document.getElementById("whyupdate");
context = canvas.getContext('2d');
var sources = new Array();
var names = new Array();
var selectedImage = -1;
var pictures = new Array();
var intervalX;
var intervalY;
var movingPicture;
var check_overlap = -1;
var alchemyMap = new Map();
alchemyMap.set('water,air', 5);
alchemyMap.set('earth,fire', 6);
alchemyMap.set('steam,lava',7);
alchemyMap.set('soul,rockDude',8);
alchemyMap.set('air,water', 5);
alchemyMap.set('fire,earth', 6);
alchemyMap.set('lava,steam', 7);
alchemyMap.set('rockDude,soul',8);
//unhide newly created sprites. on side bar
function Sprite(x, y, width, height, src, hidden, naam) {
  this.X = x;
  this.Y = y;
  this.image = new Image();
  this.image.width = width;
  this.image.height = height;
  this.image.src = src;
  this.hidden = hidden;
  this.name = naam;
}

function loadContent(){
  names.push("air");
  names.push("water");
  names.push("earth");
  names.push("fire");
  names.push("soul");
  names.push("steam");
  names.push("lava");
  names.push("rockDude");
  names.push("captainPlanet");
  sources.push("https://kspatil2.github.io/edited_air.png");
  sources.push("https://kspatil2.github.io/edited_water.png");
  sources.push("https://kspatil2.github.io/edited_earth.png");
  sources.push("https://kspatil2.github.io/edited_Fire.png");
  sources.push("https://kspatil2.github.io/edited_soul.jpg");
  sources.push("https://kspatil2.github.io/edited_Steam.png");
  sources.push("https://kspatil2.github.io/edited_lava.png");
  sources.push("https://kspatil2.github.io/edited_RockDude.jpg");
  sources.push("https://kspatil2.github.io/edited_CaptainPlanet.jpg");
  for(i = 0;i < 9;i ++){
  if(i/5<1){
      var picture = new Sprite(canvas.width*0.81, canvas.height*0.01 + (i%5)*0.2* canvas.height, canvas.width*0.08, canvas.height*0.18, sources[i] , false, names[i]);
      pictures.push(picture);
    }else
    {
      var picture = new Sprite(canvas.width*0.91, canvas.height*0.01 + (i%5)*0.2*canvas.height, canvas.width*0.08, canvas.height*0.18, sources[i], true, names[i]);
      pictures.push(picture);
    } 
  }
  //canvas.addEventListener("click", handleClick);
  canvas.onmousedown = mouseDown;
  canvas.onmouseup = mouseUp;
 
  //canvas.addEventListener("mousePress",handleDrag);
  //canvas.addEventListener("dragstart", )
  document.addEventListener("keydown", handleKeyDown);
}

function mouseDown(e) {
  for (var iter = 0; iter < pictures.length; iter++) {
    if (checkSprite(pictures[iter], e.clientX, e.clientY) && pictures[iter].hidden == false) {
      selectedImage = iter;
      break;
    } else {
      selectedImage = -1;
    }
  }
  if (selectedImage != -1 && selectedImage<=8) {
    intervalX = e.clientX - pictures[selectedImage].X;
    intervalY = e.clientY - pictures[selectedImage].Y;
    //pictures.push(pictures[selectedImage]);
    //movingPicture = new Sprite(canvas.width * 0.81, canvas.height * 0.01 + (selectedImage % 5) * 0.2 * canvas.height, canvas.width * 0.08, canvas.height * 0.18, sources[selectedImage], false,pictures[selectedImage].name);
   //pictures.push(movingPicture);
   var temp = 0;
   if(selectedImage > 4)
    temp = 1;
  
    pictures.push(new Sprite(canvas.width * 0.81 + (temp * canvas.width*0.1) , canvas.height * 0.01 + (selectedImage % 5) * 0.2 * canvas.height, canvas.width * 0.08, canvas.height * 0.18, sources[selectedImage], false,pictures[selectedImage].name));
   //selectedImage = pictures.length - 1; 
   sources.push(sources[selectedImage]);
   canvas.onmousemove = mouseMove;
  }else if(selectedImage>8){
    intervalX = e.clientX - pictures[selectedImage].X;
    intervalY = e.clientY - pictures[selectedImage].Y;
    //pictures.push(pictures[selectedImage]);
    canvas.onmousemove = mouseMove;
  }
}

function mouseMove(e) {
  
  if(selectedImage< 9){
    pictures[pictures.length - 1].X = e.clientX - intervalX;
    pictures[pictures.length - 1].Y = e.clientY - intervalY;
  }else{
    pictures[selectedImage].X = e.clientX - intervalX;
    pictures[selectedImage].Y = e.clientY - intervalY;
  }
}

function mouseUp(e) {
  canvas.onmousemove = null;
  
  if(selectedImage > 8)
    check_overlap = selectedImage;
  else
    check_overlap = pictures.length -1;
 
  if(e.clientX >canvas.width*0.8 && selectedImage > 8 )
    {
      pictures.splice(selectedImage,1);
      check_overlap = -1;
    }
    else if(e.clientX >canvas.width*0.8 && selectedImage <= 8 && selectedImage > -1)
    {
      pictures.splice(pictures.length-1,1);
      check_overlap = -1;
    }
    //Check overlap logic;
   selectedImage = -1;
}


function handleKeyDown(e){
  switch(e.keyCode){
    case 37: //left
   //   selectedImage = Math.abs(1 - selectedImage);
      break;
    case 39: //right
    //  selectedImage = Math.abs(1 - selectedImage);
      break;
  }
  
}

function checkSprite(sprite, x, y) {
  var minX = sprite.X;
  var maxX = sprite.X + sprite.image.width;
  var minY = sprite.Y;
  var maxY = sprite.Y + sprite.image.height;
  var mx = x;
  var my = y;
  //console.log(minX + " " + maxX);
  if (mx >= minX && mx <= maxX && my >= minY && my <= maxY) {

    return true;
  }
  return false;
}

function handleClick(e) {
  selectedImage = e.clientX + " " + e.clientY;

  for (var iter = 0; iter < pictures.length; iter++) {
    if (checkSprite(pictures[iter], e.clientX, e.clientY)) {
      selectedImage = iter;
      break;
    } else {
      selectedImage = -1;
    }
  }
}

function update() 
{
if(check_overlap != -1)
{
  var x = pictures[check_overlap].X + pictures[check_overlap].image.width/2; 
  var y = pictures[check_overlap].Y + pictures[check_overlap].image.height/2; 
  
  for (var i = 9; i < pictures.length ; i++)
  {
    
    if (checkSprite(pictures[i], x, y) && i != check_overlap) 
    {
     
     var new_element = alchemyMap.get(pictures[i].name + "," + pictures[check_overlap].name);
      if(new_element!=undefined)
      {
      
      var movingPicture = new Sprite(pictures[i].X, pictures[i].Y, pictures[i].image.width, pictures[i].image.height, sources[new_element], false,pictures[new_element].name);
      if(i > check_overlap)
      {
        pictures.splice(i,1);
        pictures.splice(check_overlap,1);
        }
        else{
        pictures.splice(check_overlap,1);
        pictures.splice(i,1);
        
        }
        
        pictures[new_element].hidden = false;
        pictures.push(movingPicture);
       check_overlap = -1;
        break;
      }
      
    }
  }
  }
  check_overlap = -1;
}

function drawLayout(){
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


function draw() {
  canvas.width = canvas.width;
  //context.drawImage(pictureA, pictureA.X, pictureA.Y, pictureA.width, pictureA.height);
  drawLayout();
  context.font = "30px Verdana";
  //context.fillText("Selected Image: " + selectedImage, 100, 300);

  //draw selected outline
  if (selectedImage >= 0) {
    context.beginPath();
    context.lineWidth = "6";
    context.strokeStyle = "red";
    context.rect(pictures[selectedImage].X, pictures[selectedImage].Y, pictures[selectedImage].image.width, pictures[selectedImage].image.height);
    context.stroke();
    
  }
    for (var iter = 0; iter < pictures.length; iter++) {
    if(pictures[iter].hidden === false){
        context.drawImage(pictures[iter].image, pictures[iter].X, pictures[iter].Y, pictures[iter].image.width, pictures[iter].image.height);
      }
  }

}

function game_loop() {
  update();
  draw();
}

function initGame(){
  loadContent();
  setInterval(game_loop, 30);
}

initGame();