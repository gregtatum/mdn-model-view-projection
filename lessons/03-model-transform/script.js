/*
  Placing points directly into clip space is of limited use. What's better is
  to take model data and transform it into clipspace. The cube is an easy example
  of how to do this. The cube data below consists of vertex positions, the colors
  of the faces of the cube, and the order of the vertex positions that make up
  the individual polygons (in groups of 3). The positions and colors are stored in
  buffers and sent to the shader as attributes, and then operated upon individually.

  Finally a single model matrix is set that represents the transformations that will
  be performed on each position that makes up the model to move it into the correct
  space. In this case, for every frame of the animation
  a series of scale, rotation, and translation matrices move the data into the
  desired spot in clip space. This matrix is set up as a uniform in the shader.
  
  In the shader the position is transformed into a homogeneous coordinate (vec4),
  and multiplied against this model matrix:

    gl_Position = model * vec4(position, 1.0);

  At this point the W value is still 1.0, there is no perspective to this view
  of the cube.
*/

function CubeDemo () {
  
  // Prep the canvas
  this.canvas = document.getElementById("canvas");
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  
  // Grab a context
  this.gl = createContext(this.canvas);

  this.transforms = {}; // All of the matrix transforms
  this.locations = {}; //All of the shader locations
  
  // Get the rest going
  this.buffers = createBuffersForCube(this.gl, createCubeData() );
  this.webglProgram = this.setupProgram();
  
}

CubeDemo.prototype.setupProgram = function() {
  
  var gl = this.gl;
    
  // Setup a WebGL program
  var webglProgram = createWebGLProgramFromIds(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(webglProgram);
  
  // Save the attribute and uniform locations
  this.locations.model = gl.getUniformLocation(webglProgram, "model");
  this.locations.position = gl.getAttribLocation(webglProgram, "position");
  this.locations.color = gl.getAttribLocation(webglProgram, "color");
  
  gl.enableVertexAttribArray(this.locations.position);
  gl.enableVertexAttribArray(this.locations.color);

  // Tell WebGL to test the depth when drawing
  gl.enable(gl.DEPTH_TEST);
  
  return webglProgram;
};

CubeDemo.prototype.computeModelMatrix = function( now ) {

  //Scale down by 30%
  var scale = scaleMatrix(0.5, 0.5, 0.5);
  
  // Rotate a slight tilt
  var rotateX = rotateXMatrix( now * 0.0003 );
  
  // Rotate according to time
  var rotateY = rotateYMatrix( now * 0.0005 );

  // Move slightly down
  var position = translateMatrix(0, -0.1, 0);
  
  // Multiply together, make sure and read them in opposite order
  this.transforms.model = multiplyArrayOfMatrices([
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
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);
  gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0);
  
  // Set the colors attribute
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.colors);
  gl.vertexAttribPointer(this.locations.color, 4, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.elements );
  
};

var cube = new CubeDemo();

cube.draw();