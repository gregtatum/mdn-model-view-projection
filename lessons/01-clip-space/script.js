/**
 *  Note: the following functions are from /shared/shaders.js
 *
 *  createContext
 *  createWebGLProgramFromIds
 **/

// Let's make a class that will draw a 2d box with WebGL

function WebGLBox() {
  
  // Setup the canvas and WebGL context
  this.canvas = document.getElementById("canvas");
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.gl = createContext(canvas);
  
  var gl = this.gl; 

  // Setup a WebGL program
  this.webglProgram = createWebGLProgramFromIds(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(this.webglProgram);
  
  // Save the attribute and uniform locations
  this.positionLocation = gl.getAttribLocation(this.webglProgram, "position");
  this.colorLocation = gl.getUniformLocation(this.webglProgram, "color");
  
  // Tell WebGL to test the depth when drawing, so if a square is behind
  // another square it won't be drawn
  gl.enable(gl.DEPTH_TEST);
    
  // Default to a black color
  this.color = [0, 0, 0, 1];
}

// Define a draw method that takes an object with the settings for the 

WebGLBox.prototype.draw = function(settings) {
  
  // Create some attribute data, these are the triangles that will end being
  // drawn to the screen. There are two that form a square.
  
  var data = new Float32Array([
   
    //Triangle 1
    settings.left,  settings.bottom, settings.depth,
    settings.right, settings.bottom, settings.depth,
    settings.left,  settings.top,    settings.depth,
    
    //Triangle 2
    settings.left,  settings.top,    settings.depth,
    settings.right, settings.bottom, settings.depth,
    settings.right, settings.top,    settings.depth
  ]);

  // Use WebGL to draw this onto the screen.
  
  // Note: Creating a new array buffer for every draw call is slow.
  // This function is for illustration purposes only.
  
  var gl = this.gl;
  
  // Create a buffer and bind the data
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  
  // Setup the pointer to our attribute data (the triangles)
  gl.enableVertexAttribArray(this.positionLocation);
  gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);
  
  // Setup the color uniform that will be shared across all triangles
  gl.uniform4fv(this.colorLocation, settings.color);

  // Draw the triangles to the screen
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}


var box = new WebGLBox();

//Draw a red box in the middle
box.draw({
  
  top    : 0.5,             // x
  bottom : -0.5,            // x
  left   : -0.5,            // y
  right  : 0.5,             // y
                            
  depth  : 0,               // z
  color  : [1, 0.4, 0.4, 1] // red
});

//Draw a green box up top
box.draw({

  top    : 0.9,             // x
  bottom : 0,               // x
  left   : -0.9,            // y
  right  : 0.9,             // y
                            
  depth  : 0.5,             // z
  color  : [0.4, 1, 0.4, 1] // green
});

// This box doesn't get drawn because it's outside of clip space. The depth is
// outside of the -1.0 to 1.0 range.
box.draw({

  top    : 1,               // x
  bottom : -1,              // x
  left   : -1,              // y
  right  : 1,               // y
                           
  depth  : 1.5,             // z
  color  : [0.4, 0.4, 1, 1] // blue
});

