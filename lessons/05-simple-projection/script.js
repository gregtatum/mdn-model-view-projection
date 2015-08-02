/*
  The last step of filling in the W component can actually be accomplished with
  a simple matrix. Start with the identity matrix:
*/

  var identity = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 0,
	0, 0, 0, 1,
  ];

  MDN.multiplyPoint( identity, [2,3,4,1] );
  //> [2, 3, 4, 1]


// Then move the last column's 1 up one space.
  
  var copyZ = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, 1,
	0, 0, 0, 0,
  ];

  MDN.multiplyPoint( copyZ, [2,3,4,1] );
  //> [2, 3, 4, 4]


// However in the last example we performed (z + 1) * scaleFactor
  
  var scaleFactor = 0.5;

  var simpleProjection = [
	1, 0, 0, 0,
	0, 1, 0, 0,
	0, 0, 1, scaleFactor,
	0, 0, 0, scaleFactor,
  ];

  MDN.multiplyPoint( simpleProjection, [2,3,4,1] );
  //> [2, 3, 4, 2.5]


// Breaking this out a little further we can see how the works
  
  var x = (2*1) + (3*0) + (4*0) + (1*0) 
  var y = (2*0) + (3*1) + (4*0) + (1*0) 
  var z = (2*0) + (3*0) + (4*1) + (1*0) 
  var w = (2*0) + (3*0) + (4*scaleFactor) + (1*scaleFactor) 
  

// The last line could be simplified to:

  w = (4 * scaleFactor) + (1 * scaleFactor)

// Then factoring out the scaleFactor

  w = (4 + 1) * scaleFactor

/*
  Which is exactly (z + 1) * scaleFactor that we used in the previous example.

  In the code below there is an additional .computeSimpleProjectionMatrix() method.
  This is called in the .draw() method and is passed the scale factor. Adjust this
  scale factor to verify that it works the same as the previous example.
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

CubeDemo.prototype.computeSimpleProjectionMatrix = function( scaleFactor ) {
	
	this.transforms.projection = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, scaleFactor, // Note the extra scale factor here
		0, 0, 0, scaleFactor
	]
	
	// This matrix copies the point and sets the W component to 1 + (z * scaleFactor)
	
};

CubeDemo.prototype.computeModelMatrix = function( now ) {

  //Scale down by 20%
  var scale = MDN.scaleMatrix(0.2, 0.2, 0.2);
  
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
  this.computeSimpleProjectionMatrix( 0.5 );
  
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