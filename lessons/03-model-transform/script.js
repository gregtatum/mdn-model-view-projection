/*
  Placing points directly into clip space is of limited use. What's better is
  to take model data and transform it into clip space. The cube is an easy example
  of how to do this. The cube data below consists of vertex positions, the colors
  of the faces of the cube, and the order of the vertex positions that make up
  the individual polygons (in groups of 3). The positions and colors are stored in
  buffers and sent to the shader as attributes, and then operated upon individually.

  Finally a single model matrix is set that represents the transformations that will
  be performed on each position that makes up the model to move it into the correct
  space. In this case, for every frame of the animation, a series of scale, rotation,
  and translation matrices move the data into the desired spot in clip space. The
  cube is the size of clip space (-1,-1,-1) to (1,1,1) so it will need to be shrunk
  down to fit. This matrix is sent to the shader having been multiplied in JavaScript
  beforehand.
  
  In the shader each position vertex is first transformed into a homogeneous
  coordinate (vec4), and then multiplied against the model matrix. In

    gl_Position = model * vec4(position, 1.0);

  It may be noted that in JavaScript matrix multiplication requires a function,
  while in the shader it is built into the language with the simple * operator.

  At this point the W value of the transformed point is still 1.0. The cube still
  doesn't have any perspective. The next example will take this setup, and fiddle
  with the W values to provide some perspective.

  Exercise:

    1) Shrink down the box using the scale matrix and position it in different places
    within clip space. Try moving it outside of clip space. Resize the window
    and watch as the box skews out of shape. Add a rotateZ matrix.

    2) Modify the MDN.createCubeData() function in /shared/cube.js to change the underlying
    data for the cube and note how the model transform perserves it. (Make sure and
    restore it once you are done for the other examples.)
    
*/

function CubeDemo () {
  
  // Prep the canvas
  this.canvas = document.getElementById("canvas");
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  
  // Grab a context
  this.gl = MDN.createContext(this.canvas);

  this.transforms = {}; // All of the matrix transforms
  this.locations = {}; //All of the shader locations
  
  // MDN.createBuffersForCube and MDN.createCubeData are located in /shared/cube.js
  this.buffers = MDN.createBuffersForCube(this.gl, MDN.createCubeData() );
  
  this.webglProgram = this.setupProgram();
  
}

CubeDemo.prototype.setupProgram = function() {
  
  var gl = this.gl;
    
  // Setup a WebGL program
  var webglProgram = MDN.createWebGLProgramFromIds(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(webglProgram);
  
  // Save the attribute and uniform locations
  this.locations.model = gl.getUniformLocation(webglProgram, "model");
  this.locations.position = gl.getAttribLocation(webglProgram, "position");
  this.locations.color = gl.getAttribLocation(webglProgram, "color");
  
  // Tell WebGL to test the depth when drawing
  gl.enable(gl.DEPTH_TEST);
  
  return webglProgram;
};

CubeDemo.prototype.computeModelMatrix = function( now ) {

  //See /shared/matrices.js for the definitions of these matrix functions

  //Scale down by 30%
  var scale = MDN.scaleMatrix(0.5, 0.5, 0.5);
  
  // Rotate a slight tilt
  var rotateX = MDN.rotateXMatrix( now * 0.0003 );
  
  // Rotate according to time
  var rotateY = MDN.rotateYMatrix( now * 0.0005 );

  // Move slightly down
  var position = MDN.translateMatrix(0, -0.1, 0);
  
  // Multiply together, make sure and read them in opposite order
  this.transforms.model = MDN.multiplyArrayOfMatrices([
    position, // step 4
    rotateY,  // step 3
    rotateX,  // step 2
    scale     // step 1
  ]);
  
  
  // Performance caveat: in real production code it's best not to create
  // new arrays and objects in a loop. This example chooses code clarity
  // over performance.
};

CubeDemo.prototype.draw = function() {
  
  var gl = this.gl;
  var now = Date.now();
  
  // Compute our matrices
  this.computeModelMatrix( now );
  
  // Update the data going to the GPU
  this.updateAttributesAndUniforms();
  
  // Perform the actual draw
  gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
  
  // Run the draw as a loop
  requestAnimationFrame( this.draw.bind(this) );
};

CubeDemo.prototype.updateAttributesAndUniforms = function() {

  var gl = this.gl;
  
  // Setup the color uniform that will be shared across all triangles
  gl.uniformMatrix4fv(this.locations.model, false, new Float32Array(this.transforms.model));
  
  // Set the positions attribute
  gl.enableVertexAttribArray(this.locations.position);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);
  gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0);
  
  // Set the colors attribute
  gl.enableVertexAttribArray(this.locations.color);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.colors);
  gl.vertexAttribPointer(this.locations.color, 4, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.elements );
  
};

var cube = new CubeDemo();

cube.draw();