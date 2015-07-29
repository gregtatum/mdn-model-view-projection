/*
  The final step in all of this is to create the view matrix. Right now we can move
  the cube around world space. We can project everything to have perspective, but
  we still can't move the camera.

  The final matrix is the view matrix that represents the camera's position. Imagine
  shooting a movie with a physical camera. This matrix represents the position and
  rotation of that physical camera.

  At this point it would be beneficial to take a step back and look at and label
  the various coordinate systems. First off the cube's vertices are in model
  space. To move the model around the scene these vertices need to be converted into
  world space.

  model space -> model matrix -> world space

  The camera hasn't done anything yet, and the points need to be moved again. Currently
  they are in world space, but then need to be moved to view space.

  world space -> view matrix -> view space

  Finally a projection or perspective needs to be added. This final step will move it
  into clip space.

  view space -> projection matrix -> clip space

  After this step the GPU will clip the out of range vertices, and send the model
  down to the fragment shader for rasterization.

  Exercise:

    1) Move the camera around the scene. Add some rotation matrices to the view matrix
       to look around.

    2) Track the mouse's position. Use 2 rotation matrices to have the camera look
       up and down based on where the user's mouse is on the screen.
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
  
  // Get the rest going
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
  this.locations.view = gl.getUniformLocation(webglProgram, "view");
  this.locations.projection = gl.getUniformLocation(webglProgram, "projection");
  this.locations.position = gl.getAttribLocation(webglProgram, "position");
  this.locations.color = gl.getAttribLocation(webglProgram, "color");
  
  // Tell WebGL to test the depth when drawing
  gl.enable(gl.DEPTH_TEST);
  
  return webglProgram;
};

CubeDemo.prototype.computePerspectiveMatrix = function() {
  
  var fieldOfViewInRadians = Math.PI * 0.5;
  var aspectRatio = window.innerWidth / window.innerHeight;
  var nearClippingPlaneDistance = 1;
  var farClippingPlaneDistance = 50;
  
  this.transforms.projection = MDN.perspectiveMatrix(
    fieldOfViewInRadians,
    aspectRatio,
    nearClippingPlaneDistance,
    farClippingPlaneDistance
  );
};

CubeDemo.prototype.computeViewMatrix = function( now ) {

  var zoomInAndOut = 5 * Math.sin(now * 0.002);
  
  // Move slightly down
  var position = MDN.translateMatrix(0, 0, -20 + zoomInAndOut );
  
  // Multiply together, make sure and read them in opposite order
  this.transforms.view = MDN.multiplyArrayOfMatrices([
    
    //Exercise: rotate the camera view
    position
  ]);
  
};

CubeDemo.prototype.computeModelMatrix = function( now ) {

  //Scale up
  var scale = MDN.scaleMatrix(5, 5, 5);
  
  // Rotate a slight tilt
  var rotateX = MDN.rotateXMatrix( Math.PI * 0.2 );
  
  // Rotate according to time
  var rotateY = MDN.rotateYMatrix( Math.PI * 0.2 );

  // Move slightly down
  var position = MDN.translateMatrix(0, 0, 0);
  
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
  this.computeViewMatrix( now );
  this.computePerspectiveMatrix( 0.5 );
  
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
  gl.uniformMatrix4fv(this.locations.projection, false, new Float32Array(this.transforms.projection));
  gl.uniformMatrix4fv(this.locations.view, false, new Float32Array(this.transforms.view));
  
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