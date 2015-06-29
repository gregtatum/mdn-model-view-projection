//Some notes:

var near = 5
var far = 10
var cam = mat4.perspective([], 2, 1, near, far)

// A point at the near plane of the camera
vec4.transformMat4([], [0,0,-5,1], cam)
// Returns [0, 0, -5, 5]
// Divide by W gets you -1 as the Z component

// A point at the far plane of the camera
vec4.transformMat4([], [0,0,-10,1], cam)
// > [0, 0, 10, 10]
// Divide by W gets you 1 as the Z component