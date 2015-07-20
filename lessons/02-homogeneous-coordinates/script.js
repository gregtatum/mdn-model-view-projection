/*
  The main line of the previous clip space vertex shader contained this code:

      gl_Position = vec4(position, 1.0);
  
  The position variable is what was passed in as an attribute to the shader and
  was defined in the draw method. This is a three dimensional point, but the
  gl_Position variable that ends up getting passed down through the pipeline
  is actually 4 dimensions. Instead of (x,y,z) it is (x,y,z,w). In this example
  the w coordinate is being set to 1.0. The obvious question is "why the extra
  dimension?" It turns out that this addition allows for lots of nice techniques
  for manipulating 3d data.

  A three dimensional point is defined in a typical Cartesian coordinate system.
  The added 4th dimension changes this point into a homogeneous coordinate. It still
  represents a point in 3d space and it can easily be demonstrated how to construct
  this type of coordinate through a pair of simple functions.

*/

function cartesianToHomogeneous (point) {
  
  var x = point[0];
  var y = point[1];
  var z = point[2];
  
  return [x, y, z, 1];
}

function homogeneousToCartesian (point) {

  var x = point[0];
  var y = point[1];
  var z = point[2];
  var w = point[3];
  
  return [x/w, y/w, z/w];
}

/*
  As can be seen, the w component divides the x, y, and z components. When the
  w component is a non-zero real number then homogeneous coordinate easily
  translates back into a normal point in Cartesian space. Now what happens if
  the w component is zero? In JavaScript the value returned would be as follows.
*/

homogeneousToCartesian([10,4,5,0]);

// Evaluates to: [Infinity, Infinity, Infinity]

/*
  This homogeneous coordinate represents some point at infinity. This is a handy
  way to represent a ray shooting off from the origin in a specific direction.
  In addition to a ray, it could also be thought of as a representation of a
  directional vector. If this homogeneous coordinate is multiplied against a
  matrix with a translation then the translation is effectively stripped out.

  TODO - This is in theory, does this actually happen in live code:
  When numbers are extremely large (or extremely small) on computers they begin to
  become less and less precise because there are only so many ones and zeros that
  are used to represent them. The more operations that are done on larger numbers,
  the more and more errors accumulate into the result. When dividing by w, this can
  effectively increase the precision of very large numbers by operating on two
  potentially smaller, less error-prone numbers.

  The final benefit of using homogeneous coordinates is that they fit very nicely
  for multiplying against 4x4 matrices. A vertex must match at least one of the
  dimensions of a matrix in order to be multiplied against it. The 4x4 matrix
  can be used to encode a variety of useful transformations. In fact, the
  typical perspective matrix uses the division by the w component to achieve its
  transformation.

  The clipping of points and polygons from clip space actually happens after
  the homogeneous coordinates have been transformed back into Cartesian coordinates
  (by dividing by w). This final space is known as "normalized device coordinates"
  or NDC. The previous WebGlBox example is included below, but with the addition
  of the w component in the draw call.

  Exercise:

    Play around with these values to see how it affects what is rendered on the
    screen. Note how the previously clipped blue box is brought back into range
    by setting its w component. Try creating a new box that is outside of clip
    space and brought back in by dividing by w.
*/


function WebGLBox() {
  
  // Setup the canvas and WebGL context
  this.canvas = document.getElementById("canvas");
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.gl = createContext(this.canvas);
  
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
    settings.left,  settings.bottom, settings.depth, settings.w,
    settings.right, settings.bottom, settings.depth, settings.w,
    settings.left,  settings.top,    settings.depth, settings.w,
    
    //Triangle 2
    settings.left,  settings.top,    settings.depth, settings.w,
    settings.right, settings.bottom, settings.depth, settings.w,
    settings.right, settings.top,    settings.depth, settings.w
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
  gl.vertexAttribPointer(this.positionLocation, 4, gl.FLOAT, false, 0, 0);
  
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
  w      : 0.7,             // w - enlarge this box

  depth  : 0,               // z
  color  : [1, 0.4, 0.4, 1] // red
});

//Draw a green box up top
box.draw({

  top    : 0.9,             // x
  bottom : 0,               // x
  left   : -0.9,            // y
  right  : 0.9,             // y
  w      : 1.1,             // w - shrink this box

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
  w      : 1.5,             // w - Bring this box into range

  depth  : -1.5,             // z
  color  : [0.4, 0.4, 1, 1] // blue
});
