/**
 * Utility functions for:
 * 
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader
 * 
 **/

function createShader (gl, source, type) {
  
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

function linkProgram (gl, vertexShader, fragmentShader) {

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

function createWebGLProgram (gl, vertexSource, fragmentSource) {

  // Combines createShader() and linkProgram()
  
  var vertexShader = createShader( gl, vertexSource, gl.VERTEX_SHADER );
  var fragmentShader = createShader( gl, fragmentSource, gl.FRAGMENT_SHADER );

  return linkProgram( gl, vertexShader, fragmentShader );
}

function createWebGLProgramFromIds (gl, vertexSourceId, fragmentSourceId) {
  
  var vertexSourceEl = document.getElementById(vertexSourceId);
  var fragmentSourceEl = document.getElementById(fragmentSourceId);
  
  return createWebGLProgram(
    gl,
    vertexSourceEl.innerHTML,
    fragmentSourceEl.innerHTML
  );
}

function createContext (canvas) {
  
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
