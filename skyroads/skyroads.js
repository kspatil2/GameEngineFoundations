/* GLOBAL CONSTANTS AND VARIABLES */
const INPUT_TRIANGLES_URL ="https://kspatil2.github.io/till4.json";
const INPUT_SPHERES_URL = "https://kspatil2.github.io/spaceship1.json"; // spheres file loc
/*var defaultEye = vec3.fromValues(0.5,0.8,-1); // default eye position in world space
var defaultCenter = vec3.fromValues(0.5,0.8,0.5); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var lightPosition = vec3.fromValues(20,300,75); // default light position
var defaultlightPosition = vec3.fromValues(0.5,4,0.4); // default light position
var rotateTheta = Math.PI/50; // how much to rotate models by with each key press
*/
/* webgl and geometry data */
///var gl = null; // the all powerful gl object. It's all here folks!
var inputTriangles = []; // the triangle data as loaded from input files
var inputSpheres = []; // the sphere data as loaded from input files


var viewDelta = 0; // how much to displace view with each key press

/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space

var acceleration = 0.003;
var deacceleration = 0.006;
var velocity=0;

var spaceJump=0.0; // flag if in jumping
var jumpTime=1; // half total time of jump till the top
var spaceJumpCounter=0; // time = t
var freeFallTime=0;
var jumpVelocity=0.1; // v = u0
var gravity = 0.1;
var freefall_velocity=0;

var sideJump=0.0; // flag if in jumping
var sidejumpTime=1; // half total time of jump till the top
var sideJumpCounter=0; // time = t
var sidejumpVelocity=0.04; // v = u0
var sidegravity = 0.04;
var left=0,right=0;
// var freeFallTime=0;
// var freefall_velocity=0;
var NUMBER_OF_LEVELS = 4;
var Score=0;
var HighScore = 0;

// ASSIGNMENT HELPER FUNCTIONS

var timeNode;

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres


Skyroads.prototype.UpdateScoreAndShit = function()
{
    var sphere = inputSpheres[0];
    if(sphere == undefined || sphere == null)
        return;
    
    if(document.getElementById("SoundCheck").checked == false)
    {
        this.engine.sound.stopSound("level"+sound_count);
    }
    else
    {
        this.engine.sound.playSound("level"+sound_count);   
    }
    var sphere_center = vec3.create(), sphere_bottom = vec3.create(); sphere_front = vec3.create();sphere_left = vec3.create();sphere_right = vec3.create();       
    sphere_center = vec3.add(sphere_center,sphere.translation,vec3.fromValues(sphere.x,sphere.y,sphere.z));        
    sphere_bottom = vec3.add(sphere_bottom,sphere.translation,vec3.fromValues(sphere.x, -sphere.r,sphere.z));
    sphere_front = vec3.add(sphere_front,sphere.translation,vec3.fromValues(sphere.x,sphere.y,sphere.z+sphere.r));        
    sphere_left = vec3.add(sphere_left,sphere.translation,vec3.fromValues(sphere.x-sphere.r,sphere.y,sphere.z));        
    sphere_right = vec3.add(sphere_right,sphere.translation,vec3.fromValues(sphere.x+sphere.r,sphere.y,sphere.z));        

    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
    Eye = vec3.add(Eye,Eye,vec3.scale(temp,lookAt,velocity));
    Center = vec3.add(Center,Center,vec3.scale(temp,lookAt,velocity));
    lightPosition = vec3.add(lightPosition,lightPosition,vec3.scale(temp,lookAt,velocity));
    // console.log("Light: ", lightPosition);
    // console.log("Eye: ", Eye);
    // to be applied to spaceship patterns
    // console.log("HELOOOOOOO");
    // if(future_collision!=1)
    vec3.add(sphere.translation,sphere.translation,vec3.scale(temp,lookAt,velocity));   

       //document.getElementById("mission").innerHTML = "YOU DON'T HAVE CONTROL OVER THE FORCE. TRY AGAIN"; 

    if(spaceJump==1 && spaceJumpCounter<jumpTime)
    {
        var v;
        v = jumpVelocity - gravity * spaceJumpCounter;
        spaceJumpCounter = spaceJumpCounter + jumpTime/10;
        // translateModel(vec3.scale(temp,Up,viewDelta));
        vec3.add(sphere.translation,sphere.translation,vec3.scale(temp,Up,v));   
    }
    else if(spaceJumpCounter>jumpTime)
    {
        sphere_bottom = vec3.add(sphere_bottom,sphere.translation,vec3.fromValues(sphere.x,sphere.y-sphere.r,sphere.z));
        var surface = get_surface_level(sphere_bottom, inputTriangles,sphere);
        time = Math.sqrt(2 *(sphere_bottom[1]-surface)/gravity);
        freeFallTime=0;

        spaceJump=0;
        spaceJumpCounter=0;
        freefall_velocity=0;
        // freefall_flag=1;
    }

    var surface = get_surface_level(sphere_bottom, inputTriangles,sphere);
    if(time=-1)
    {
        time = Math.sqrt(2 *(sphere_bottom[1]-(-1))/gravity);
        // freeFallTime=
    }
    // console.log("surface : ",surface);
    // console.log("freeFallTime : ",surface);

    // console.log("bottom y coordinate :", sphere_bottom[1]);
    // console.log("surface:",surface);
    // console.log
    // console.log("b:", sphere_bottom[1]);
    // console.log("s:",surface);
    // console.log("t:",sphere.translation[1]);    
    // emulate freefall
    if(sphere_bottom[1]-surface>0.0001 && spaceJump==0 && freeFallTime < time)
    {
        // console.log("hello");
        var v=0;
        v = freefall_velocity - gravity * freeFallTime;
        freeFallTime = freeFallTime + time/20;   
        {
            var a = vec3.create();
            vec3.add(sphere.translation,sphere.translation,vec3.scale(temp,Up,v));      
            a=vec3.add(a,sphere.translation,vec3.fromValues(sphere.x,sphere.y-sphere.r,sphere.z));
            freefall_flag=1;
        }
    }
    else if(freefall_flag==1)
    {
        // console.log("b:", sphere_bottom[1]);
        // console.log("s:",surface);
        sphere.translation[1]=surface+sphere.r-sphere.y;
        // console.log("t:",sphere.translation[1]);
        freefall_flag=0;
        freeFallTime=0;
    }

    // side shift 
    var side_surface;
    if(left==1 && right==0)
    {
        side_surface = get_side_surface_level(sphere_left, inputTriangles, right); // right = 1 for left
    }
    else if(right==1 && left ==0)
        side_surface = get_side_surface_level(sphere_right, inputTriangles, right); // right = 0 for right
    if(sideJump==1 && sideJumpCounter<sidejumpTime)
    {
        var v;
        v = sidejumpVelocity - sidegravity * sideJumpCounter;
        sideJumpCounter = sideJumpCounter + sidejumpTime/10;
        // translateModel(vec3.scale(temp,Up,viewDelta));

        var sidetemp = vec3.create(), temp2 = vec3.create();
        if(left == 1 && right==0)
        {
          //  console.log("going left");
          //   console.log(side_surface);
            vec3.add(sidetemp,sphere.translation,vec3.scale(temp,viewRight,v));
            temp2 = vec3.add(sphere_left,sidetemp,vec3.fromValues(sphere.x-sphere.r,sphere.y,sphere.z));        
            // console.log(sidetemp[0]);
            if(side_surface < temp2[0])   
                vec3.add(sphere.translation,sphere.translation,vec3.scale(temp,viewRight,v));   
            else
                left=0;
        }
        else if(right==1 && left ==0)
        {
           // console.log("going right");
           //  console.log(side_surface);
            vec3.add(sidetemp,sphere.translation,vec3.scale(temp,viewRight,-v));   
            // console.log(sidetemp[0]);
            temp2 = vec3.add(sphere_right,sidetemp,vec3.fromValues(sphere.x+sphere.r,sphere.y,sphere.z));        
            if(side_surface > temp2[0])
                vec3.add(sphere.translation,sphere.translation,vec3.scale(temp,viewRight,-v));   
            else
                right=0;
        }
    }
    else if(sideJumpCounter>sidejumpTime)
    {
        left=0;
        right=0;
        sideJump=0;
        sideJumpCounter=0;
    }



    // predict future front collision 
    var front_collision = check_Dead_or_Alive(sphere_front,sphere_center,inputTriangles);
    if(check_collision(sphere_front,sphere_center,inputTriangles)!=0)
    {
        // console.log("Its collided now");
        future_collision=1; // well, actually its in the present           
    }
    
    if(front_collision!=0)
    {   
        var nextZ = vec3.create();
        var temp = vec3.create();
        var v = velocity ; // worked for acc = 0.003 and able to predict 3.6 ahead.
        vec3.add(nextZ,sphere.translation,vec3.scale(temp,lookAt,v));
        vec3.add(temp,nextZ,vec3.fromValues(sphere.x,sphere.y,sphere.z+sphere.r));        

        // console.log("Future collision");
        // console.log("sphere_front_now: ",sphere.z+sphere.translation[2]+sphere.r);
        // console.log("front Collision: ",front_collision);
        // console.log("sphere_front_later: ",temp[2]);

        if(temp[2] > front_collision && front_collision > sphere_front[2])
        {
            console.log("Future collision");
            future_collision=1;   
            sphere.translation[2] = front_collision - sphere.z - sphere.r;
        }
        // console.log(future_collision);
    }
    var display_score=0;
    if(level_transition!=1)
    {
        score=Math.ceil(Eye[2]+1);
        fuel_level = fuel_level-0.002;
        display_score = current_score+score;
    }
        oxygen_level=oxygen_level-0.001;
    
    var vel_now = velocity*100;
    var current_level = level_completed+1;
    this.displayContext.clearRect(0, 0, this.displayContext.canvas.width, this.displayContext.canvas.height);
    this.displayContext.font = '15pt Calibri';
    this.displayContext.fillStyle = 'white';
    this.displayContext.fillText("Score :"+display_score, 5, 20);
    this.displayContext.fillText("HighScore :"+HighScore,830,20); // 330
    this.displayContext.fillText("Velocity :"+vel_now.toFixed(2),5,40);
    this.displayContext.fillText("Level :"+current_level,440,620); // 210, 480
    this.displayContext.fillText("Oxygen : "+oxygen_level.toFixed(0),2,60);
    this.displayContext.fillText("Fuel : "+fuel_level.toFixed(0),2,80);

    if(oxygen_level < 0 || fuel_level < 0)
    {
        window.alert("Game Over. Refresh to restart");
    }
    
    if(level_transition==1)
    {   
        if(temp_peak_velocity>0)
        {
            // console.log("pappa");
            // console.log(temp_peak_velocity);
            level_transition=0;
            Eye[2]=defaultEye[2];
            Center[2]=defaultCenter[2];
            temp_peak_velocity=0;
            transition_init_flag=0;
            // console.log(Eye);
        }   
        else if(transition_init_flag==0)
        {
            // console.log("pappu");
            var offset = vec3.fromValues(20,0,0);
            Center = vec3.add(Center,defaultCenter,vec3.scale(offset,offset,level_completed)); 
            Eye = vec3.add(Eye,defaultEye,offset);
            Eye[2]=Eye[2]+250;
            Center[2]=Center[2]+250;
            transition_init_flag=1;
        }
        else
        {
            var v,temp;
            
            if(transitionCounter<0.345)
            {
                v = -transition_acceleration*transitionCounter;
            }
            else{
                // console.log("Haaloo ");
                v =  -2 + transition_acceleration*(transitionCounter-0.345);
                 
            }
            // console.log(oxygen);
                temp_peak_velocity=v;
            transitionCounter = transitionCounter + transition_time/10000;
            console.log("velocity :",v );
            console.log("temp peak: ", temp_peak_velocity);
            console.log("time: ", transitionCounter);
            vec3.add(Eye,Eye,vec3.scale(temp,lookAt,v));   
            vec3.add(Center,Center,vec3.scale(temp,lookAt,v));
        }

    }
    else if(sphere_center[1] < 0 ||future_collision||oxygen_level==0||fuel_level==0)
    {
        
        this.engine.sound.playSound("tryagain",true);

        if(score+current_score > HighScore)
        {
            HighScore = current_score+score;
            // window.alert("New High Score:"+score);
        }
        
        if(Eye[2] >= 250)
        {
            current_score = current_score+score; 
            level_completed=level_completed+1; // add +1 till 10

            if(document.getElementById("SoundCheck").checked == false)
            {
                this.engine.sound.stopSound("level"+sound_count);
                sound_count = sound_count+1;
                this.engine.sound.playSound("level"+sound_count,true);
            }
            // console.log(level_completed);
            var offset = vec3.fromValues(20,0,0);
            if(level_completed<NUMBER_OF_LEVELS)
            {
                sphere.translation = vec3.add(sphere.translation,vec3.fromValues(0,0,0),vec3.scale(offset,offset,level_completed));
                level_transition=1;
                // Center = vec3.add(Center,defaultCenter,offset); 
                // Eye = vec3.add(Eye,defaultEye,offset);
                velocity=0;
                document.getElementById("status").innerHTML = "THE FORCE IS STRONG WITH YOU. LEVEL COMPLETED";
                //window.alert("LEVEL COMPLETED");   
            }
            else
                //window.alert("GAME COMPLETED");      
            document.getElementById("status").innerHTML = "THE DEATH STAR HAS BEEN DESTROYED. GAME COMPLETED";

        }   
        else
        {
            
            restart_level(sphere);
            restart=0;
            future_collision=0;
            // window.alert("TRY AGAIN");
            document.getElementById("status").innerHTML = "YOU DON'T HAVE CONTROL OVER THE FORCE. TRY AGAIN";
        }
    }   
}

var oxygen_level=100;
var fuel_level=200;
var sound_count = 1;
var freefall_flag=0;
var time=-1;
var future_collision=0;
var restart=0;
var level_completed=0;
var current_score=0;
var level_transition=0;
var transition_velocity = 60;
var transition_time = 110;
var transition_acceleration = 5.6;
var transition_init_flag=0;
var transitionCounter=0;
var temp_peak_velocity=0;
function get_surface_level(sphere_bottom, inputTriangles,sphere)
{
    var length = inputTriangles.length;
    var surface= -1;

    for(var i = 0; i < length; i++)
    {
        // console.log(sphere_bottom[2]," ", inputTriangles[i].limitbaseZ[0]);
        if(sphere_bottom[2] > inputTriangles[i].limitbaseZ[0] && sphere_bottom[2] < inputTriangles[i].limitbaseZ[1])
        {
            // console.log("NUSM");
            if((sphere_bottom[0]+sphere.r/3) > inputTriangles[i].limitbaseX[0] && (sphere_bottom[0]-sphere.r/3) < inputTriangles[i].limitbaseX[1])
            {
                    // console.log(inputTriangles[i].id);
                if(surface < inputTriangles[i].surfaceHeight)
                {
                    surface = inputTriangles[i].surfaceHeight;
                }
            }   
        }            
    }
    // console.log("surface : ",surface);
    return surface;
}

function get_side_surface_level(sphere_side, inputTriangles, side)
{
    var length = inputTriangles.length;
    var surface;
    if(side==0)
        surface= -10;
    else if(side ==1)
        surface = 10*NUMBER_OF_LEVELS+100; // greater than all edges to the right

    for(var i = 0; i < length; i++)
    {
        if(sphere_side[2] > inputTriangles[i].limitbaseZ[0] && sphere_side[2] < inputTriangles[i].limitbaseZ[1])
        {
            if(sphere_side[1] > inputTriangles[i].limitbaseY[0] && sphere_side[1] < inputTriangles[i].limitbaseY[1])
            {
                if(side == 0 && surface < inputTriangles[i].surfaceLeftRightFront[1] && sphere_side[0] > inputTriangles[i].surfaceLeftRightFront[1])
                {
                    surface = inputTriangles[i].surfaceLeftRightFront[1];
                    // console.log(inputTriangles[i].id);
                }
                else if(side == 1 && surface > inputTriangles[i].surfaceLeftRightFront[0] && sphere_side[0] < inputTriangles[i].surfaceLeftRightFront[0])
                {
                    surface = inputTriangles[i].surfaceLeftRightFront[0];
                }
            }


        }            
    }
    // console.log("surface : ",surface);
    return surface;   
}

var ship_Z_before;
function check_Dead_or_Alive(sphere_front,sphere_center, inputTriangles)
{
    var length = inputTriangles.length;
    var closest_surface = 400;
    // console.log("sphere_front",sphere_front);
    for(var i = 0; i < length; i++)
    {
        // console.log(sphere_bottom[2]," ", inputTriangles[i].limitbaseZ[0]);
        if(sphere_front[1] > inputTriangles[i].limitbaseY[0] && sphere_front[1] < inputTriangles[i].limitbaseY[1])
        {
            // console.log("NUSM");
            if(sphere_front[0] > inputTriangles[i].limitbaseX[0] && sphere_front[0] < inputTriangles[i].limitbaseX[1])
             {
            //     // console.log("id :",inputTriangles[i].id);
            //     // console.log("center",sphere_center[2]);
            //     // console.log("Z obj", inputTriangles[i].surfaceLeftRightFront[2]);
                if(closest_surface > inputTriangles[i].surfaceLeftRightFront[2])
                {
                    closest_surface = inputTriangles[i].surfaceLeftRightFront[2];
                }
             }
            // // spaceship too fast
            // else if(ship_Z_before < inputTriangles[i].surfaceLeftRightFront[2] && sphere_center[2] > inputTriangles[i].surfaceLeftRightFront[2])
            // {
            //     return inputTriangles[i].surfaceLeftRightFront[2];
            // }
        }            
    }
    // console.log("surface : ",surface);
    ship_Z_before=sphere_center[2];
    if(closest_surface!=400)
        return closest_surface;
    else
        return 0;       
}

function check_collision(sphere_front,sphere_center, inputTriangles)
{
    var length = inputTriangles.length;
    // console.log("sphere_front",sphere_front);
    for(var i = 0; i < length; i++)
    {
        // console.log(sphere_bottom[2]," ", inputTriangles[i].limitbaseZ[0]);
        if(sphere_front[1] > inputTriangles[i].limitbaseY[0] && sphere_front[1] < inputTriangles[i].limitbaseY[1])
        {
            // console.log("NUSM");
            if(sphere_front[0] > inputTriangles[i].limitbaseX[0] && sphere_front[0] < inputTriangles[i].limitbaseX[1])
            {
                // console.log("id :",inputTriangles[i].id);
                // console.log("center",sphere_center[2]);
                // console.log("Z obj", inputTriangles[i].surfaceLeftRightFront[2]);
                if(sphere_front[2] > inputTriangles[i].surfaceLeftRightFront[2] && sphere_center[2] < inputTriangles[i].surfaceLeftRightFront[2])
                {
                    return inputTriangles[i].surfaceLeftRightFront[2];
                }
            }
            // spaceship too fast
            // else if(ship_Z_before < inputTriangles[i].surfaceLeftRightFront[2] && sphere_center[2] > inputTriangles[i].surfaceLeftRightFront[2])
            // {
            //     return inputTriangles[i].surfaceLeftRightFront[2];
            // }
        }            
    }
    // console.log("surface : ",surface);
    // ship_Z_before=sphere_center[2];
    return 0;       

}

function restart_level(sphere)
{
    Eye = vec3.fromValues(Eye[0],defaultEye[1],defaultEye[2]); // eye position in world space
    Center = vec3.fromValues(Center[0],defaultCenter[1],defaultCenter[2]); // view direction in world space
    Up = vec3.clone(defaultUp); // view up vector in world space
    Score=0;
    var offset = vec3.fromValues(20*level_completed,0,0);
    sphere.translation = vec3.add(sphere.translation,vec3.fromValues(0,0,0),offset); 
    velocity=0;
}

/* MAIN -- HERE is where execution begins after window load */

function main() {
    var game = new Skyroads();
    if(game.loadContent() != true)
      return;
    game.init();
    setInterval(game.engine.gameLoop.bind(game.engine), 20);
  } // end main

function Skyroads() {
    // this.canvas = document.getElementById("whyupdate");
    // this.context = this.canvas.getContext('2d');

    this.textCanvas = document.getElementById("TextCanvas");
    timeNode = document.createTextNode("");
    this.textCanvas.appendChild(timeNode);
    this.displayContext = this.textCanvas.getContext("2d");

    this.imageCanvas = document.getElementById("ImageCanvas"); // create a 2d canvas
    this.webglCanvas = document.getElementById("WebGLCanvas"); // create a webgl canvas

    inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles"); // read in the triangle data
    inputSpheres = getJSONFile(INPUT_SPHERES_URL,"spheres"); // read in the sphere dat 
    this.engine = new Engine( this.webglCanvas, inputTriangles , inputSpheres );

  }
  
Skyroads.prototype.loadContent = function () {

    // Set background image 
    var cw = this.imageCanvas.width, ch = this.imageCanvas.height;
    imageContext = this.imageCanvas.getContext("2d");
    var bkgdImage = new Image();
    bkgdImage.src = "https://kspatil2.github.io/stars.jpg";
    bkgdImage.onload = function () {
        var iw = bkgdImage.width, ih = bkgdImage.height;
        imageContext.drawImage(bkgdImage, 0, 0, iw, ih, 0, 0, cw, ch);
    } // end onload callback

    return true;
}

Skyroads.prototype.init = function () {
    
    this.engine.sound.initSound();
    
       //Bind game level listeners
    this.engine.input.setKeyboardPressHandler(this.keyPressed.bind(this));
    //this.engine.collision.setCollisionHandler(this.handleCollission.bind(this));
    this.engine.setDrawHandler(this.draw.bind(this));
    this.engine.setUpdateHandler(this.UpdateScoreAndShit.bind(this));
    this.engine.setDrawHandler(this.draw.bind(this));

    this.engine.sound.playSound("level1",true);
    
}
    

Skyroads.prototype.draw = function(){
    this.engine.draw();
}

Skyroads.prototype.keyPressed = function(event) {
    

    // spaceship motion
    
    var time=1;
    switch (event) {
        
        // model selection
        case "Space":
                if(spaceJump!=1) // ensure no jump called between another jump 
                {
                    // sound for jump    
                    this.engine.sound.playSound("jump",true);
                    spaceJump=1;
                    spaceJumpCounter=0.0;
                }
                // jumpTime=0;    
                // yet to write double jump ... well, what do u know ... already did it
            break;
        case "ArrowRight": // select next triangle set
                if(sideJump!=1) // ensure no jump called between another jump 
                {   
                    left=0;
                    right=1;
                    sideJump=1;
                    sideJumpCounter=0.0;
                }
            break;
        case "ArrowLeft": // select previous triangle set
                if(sideJump!=1) // ensure no jump called between another jump 
                {   
                    left=1;
                    right=0;
                    sideJump=1;
                    sideJumpCounter=0.0;
                }
                // translateModel(vec3.scale(temp,viewRight,viewDelta));
            break;
        case "ArrowUp": // select next sphere
                if(level_transition==0)
                    velocity = velocity + acceleration*time;
            break;
        case "ArrowDown": // select previous sphere
                if(velocity>0)
                {
                    velocity = velocity - deacceleration*time;
                    if(velocity<0)
                        velocity=0;

                }
                
            break;
            
    } // end switch
} // end handleKeyDown


