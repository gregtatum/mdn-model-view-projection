/**
 * Utility functions for:
 * 
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader
 * 
 **/

// Define the MDN global if it doesn't already exist
var MDN = window.MDN || {};

MDN.createShader = function (gl, source, type) {
  
  // Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
  
  var shader = gl.createShader( type );
  gl.shaderSource( shader, source );
  gl.compileShader( shader );

  if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
    
    var info = gl.getShaderInfoLog( shader );
    throw "Could not compile WebGL program. \n\n" + info;
  }

  return shader
}

MDN.linkProgram = function (gl, vertexShader, fragmentShader) {

  var program = gl.createProgram();

  gl.attachShader( program, vertexShader );
  gl.attachShader( program, fragmentShader );

  gl.linkProgram( program );

  if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
    var info = gl.getProgramInfoLog(program);
    throw "Could not compile WebGL program. \n\n" + info;
  }
  
  return program;
}

MDN.createWebGLProgram = function (gl, vertexSource, fragmentSource) {

  // Combines MDN.createShader() and MDN.linkProgram()
  
  var vertexShader = MDN.createShader( gl, vertexSource, gl.VERTEX_SHADER );
  var fragmentShader = MDN.createShader( gl, fragmentSource, gl.FRAGMENT_SHADER );

  return MDN.linkProgram( gl, vertexShader, fragmentShader );
}

MDN.createWebGLProgramFromIds = function (gl, vertexSourceId, fragmentSourceId) {
  
  var vertexSourceEl = document.getElementById(vertexSourceId);
  var fragmentSourceEl = document.getElementById(fragmentSourceId);
  
  return MDN.createWebGLProgram(
    gl,
    vertexSourceEl.innerHTML,
    fragmentSourceEl.innerHTML
  );
}

MDN.createContext = function (canvas) {
  
  var gl;
  
  try {
    // Try to grab the standard context. If it fails, fallback to experimental.
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  }
  catch(e) {}
  
  // If we don't have a GL context, give up now
  if (!gl) {
    var message = "Unable to initialize WebGL. Your browser may not support it.";
    alert(message);
    throw new Error(message);
    gl = null;
  }
  
  return gl;
}
