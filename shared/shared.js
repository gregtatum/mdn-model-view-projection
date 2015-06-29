function matrixArrayToCssMatrix(array) {
  return "matrix3d(" + array.join(',') + ")";
}

function multiplyMatrices(a, b) {
  
  // TODO - Simplify for explanation
  // currently taken from https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337
  
  var result = [];
  
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
      a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
      a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  // Cache only the current line of the second matrix
  var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
  result[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  result[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  result[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  result[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  return result;
}

function multiplyArrayOfMatrices(matrices) {
  
  var inputMatrix = matrices[0];
  
  for(var i=1; i < matrices.length; i++) {
    inputMatrix = multiplyMatrices(inputMatrix, matrices[i]);
  }
  
  return inputMatrix;
}

// Generates a perspective matrix
function perspectiveMatrix(fovVertical, aspectRatio, near, far) {
  
  // TODO - This function is a bit of handwaving, can we explain it better?
  
  var f = 1.0 / Math.tan(fovVertical / 2)
  var nf = 1 / (near - far);
    
  var a = f / aspectRatio;
  var b = (far + near) * nf;
  var c = (2 * far * near) * nf;
  
  return [
      a,    0,    0,   0,
      0,    f,    0,   0,
      0,    0,    b,  -1,
      0,    0,    c,   1
  ];
}

function createContext(canvas) {
  
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
