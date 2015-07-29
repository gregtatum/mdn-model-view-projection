/*
  Up to this point we've proceeded step by step to create our own 3d rendering setup.
  However the current rig has some issues. For one it gets skewed whenever we resize
  our window. Another is that our simple projection doesn't handle a wide range of
  values for the scene data. Most scenes don't work in clip space and can have a wide
  range of values. It would be helpful to define what distance is relevant to the scene
  so that precision isn't lost in converting the numbers. Finally it's very helpful to
  have a fine-tuned control over what points get placed inside and outside of clip space.
  In the previous examples the corners of the cube in fact occasionally get clipped.

  The perspective matrix is a type of projection matrix that accomplishes all of these
  requirements. The math also starts to get a lot more complicated and won't be explained
  in these examples. In short it combines dividing by W like was done with the previous
  examples plus some ingenious trigonometry manipulations. For more information about the
  math behind it check some of the following links:

  http://www.songho.ca/opengl/gl_projectionmatrix.html
  http://ogldev.atspace.co.uk/www/tutorial12/tutorial12.html
  http://stackoverflow.com/questions/28286057/trying-to-understand-the-math-behind-the-perspective-matrix-in-webgl/28301213#28301213

  One important thing to note about the perspective matrix used below is that it flips
  the z axis. In clip space the z+ goes away from the viewer, while with this matrix
  it comes towards the viewer.


  The MDN.perspectiveMatrix() function takes 4 arguments.

	fieldOfViewInRadians:
		
		This represents the angle of how much is in view in the scene. The larger the number
    is, the more that is visible by the camera. The geometry at the edges becomes more
    and more distorted. This is equivalent to a wide angle lens. When the field of
    view is larger the objects typically get smaller.

    When the field of view is smaller, then the camera can see less and less in the
    scene. The objects are distorted much less by perspective and objects seem much
    close to the camera.

  aspectRatio:

    This is the aspect ratio of the scene, the width divided by height. In these
    examples that's the window width divided by the window height. This parameter
    will finally make the example not warped by the size of the canvas.

  nearClippingPlaneDistance

    This positive number represents the plane that clips off geometry that is too
    close to the camera. Anything at this distance will be at -1 in clip space.
    It shouldn't be set to 0.

  farClippingPlaneDistance
  
	  This positive number represents the plane that clips off geometry that is too
    far away from the camera. Anything at this distance will be at 1 in clip space.
    It should be kept reasonably close to the distance of the geometry so that
    precision errors don't creep into the rendering.
  
	
  In the code below the projection matrix has been swapped out with the
  .computePerspectiveMatrix() method. The position and scale matrix of the model
  has been changed to take it more out of clip space and into a larger coordinate
  system.

  Exercises:

    1) Experiment with the parameters of the perspective matrix and the model matrix.

    2) Swap out the perspective matrix to use orthographic projection. In the shared code
       there is the function MDN.orthographicMatrix() that can replace the
       MDN.perspectiveMatrix() function in .computePerspectiveMatrix().
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

CubeDemo.prototype.computeModelMatrix = function( now ) {

  //Scale up
  var scale = MDN.scaleMatrix(5, 5, 5);
  
  // Rotate a slight tilt
  var rotateX = MDN.rotateXMatrix( now * 0.0003 );
  
  // Rotate according to time
  var rotateY = MDN.rotateYMatrix( now * 0.0005 );

  // Move slightly down
  var position = MDN.translateMatrix(0, 0, -20);
  
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