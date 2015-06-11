var main = function() {
  var CANVAS = document.getElementById("canvas");
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;
  var aspect = CANVAS.width/CANVAS.height;
  
  var GL;
  try {
    GL = CANVAS.getContext("experimental-webgl", {antialias: true});
  } catch (e) {
    alert("You are not webgl compatible :(");
    return false;
  }
  /*jshint multistr: true */

  var shader_vertex_source = "\n\
attribute vec3 position;\n\
uniform mat4 PVMmatrix;\n\
attribute vec3 color; //the color of the point\n\
varying vec3 vColor;\n\
void main(void) { //pre-built function\n\
gl_Position = PVMmatrix*vec4(position, 1.);\n\
vColor = color;\n\
}";

  var shader_fragment_source = "\n\
precision mediump float;\n\
varying vec3 vColor;\n\
void main(void) {\n\
gl_FragColor = vec4(vColor, 1.);\n\
}";

  var get_shader = function(source, type) {
    var shader = GL.createShader(type);
    GL.shaderSource(shader, source);
    GL.compileShader(shader);
    if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)){
      alert("ERROR IN SHADER : " + GL.getShaderInfoLog(shader));
      return false;
    }
    return shader;
  };

  var shader_vertex = get_shader(shader_vertex_source, GL.VERTEX_SHADER);
  var shader_fragment = get_shader(shader_fragment_source, GL.FRAGMENT_SHADER);
  
  var get_program = function(vertex, fragment){
    var program = GL.createProgram();
    GL.attachShader(program, vertex);
    GL.attachShader(program, fragment);
    GL.linkProgram(program);
    if(!GL.getProgramParameter(program, GL.LINK_STATUS)){
      alert("ERROR IN PROGRAM: " + GL.getProgramInfoLog(program));
      return false;
    }
    return program;
  };
  
  var shader_program = get_program(shader_vertex, shader_fragment);
  
  var _PVMmatrix = GL.getUniformLocation(shader_program, "PVMmatrix");

  var _color = GL.getAttribLocation(shader_program, "color");
  var _position = GL.getAttribLocation(shader_program, "position");

  GL.enableVertexAttribArray(_color);
  GL.enableVertexAttribArray(_position);

  GL.useProgram(shader_program);

  var red = [1,0,0];
  var green = [0,1,0];
  var blue = [0,0,1];
  var yellow = [1,1,0];
  var white = [1,1,1];
  var orange = [1,.5,0];
  
  var v1 = [0,0,0];
  var v2 = [0,1,0];
  var v3 = [1,1,0];
  var v4 = [1,0,0];
  var v5 = [0,0,1];
  var v6 = [0,1,1];
  var v7 = [1,1,1];
  var v8 = [1,0,1];
  var v9 = [.5,.5,1];
  
  var cube_vertex = [].concat(
    v1, yellow, //bottom
    v2, yellow,
    v3, yellow,
    v4, yellow,
    v1, red, //front
    v5, red,
    v8, red,
    v4, red,
    v4, blue, //right
    v8, blue,
    v7, blue,
    v3, blue,
    v1, green, //left
    v2, green,
    v6, green,
    v5, green,
    v2, orange, //back
    v3, orange,
    v7, orange,
    v6, orange,
    v5, white, //top
    v6, white,
    v7, white,
    v8, white
  );
  var CUBE_VERTEX = GL.createBuffer ();
  GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(cube_vertex), GL.STATIC_DRAW);
  var cube_faces = [
    0,1,2,
    0,2,3,
    4,5,6,
    4,6,7,
    8,9,10,
    8,10,11,
    12,13,14,
    12,14,15,
    16,17,18,
    16,18,19,
    20,21,22,
    20,22,23
  ];
  var CUBE_FACES = GL.createBuffer ();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_faces), GL.STATIC_DRAW);
  
  var pyr_vertex = [].concat(
    v1, yellow, //bottom
    v2, yellow,
    v3, yellow,
    v4, yellow,
    v1, green, //front
    v9, green,
    v4, green,
    v4, red,//right
    v9, red,
    v3, red,
    v1, orange,//left
    v2, orange,
    v9, orange,
    v2, blue, //back
    v3, blue,
    v9, blue
  );
  var PYR_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, PYR_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(pyr_vertex), GL.STATIC_DRAW);  
  var pyr_faces = [
    0,1,2,
    0,2,3,
    4,5,6,
    7,8,9,
    10,11,12,
    13,14,15
  ];
  var PYR_FACES = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, PYR_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyr_faces), GL.STATIC_DRAW);
  
  var plane_vertex = [].concat(
    v1, red,
    v2, green,
    v3, blue,
    v4, white
  );
  var PLANE_VERTEX = GL.createBuffer();
  GL.bindBuffer(GL.ARRAY_BUFFER, PLANE_VERTEX);
  GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(plane_vertex), GL.STATIC_DRAW);
  var plane_faces = [
    0,1,2,
    0,2,3
  ];
  var PLANE_FACES = GL.createBuffer();
  GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, PLANE_FACES);
  GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(plane_faces), GL.STATIC_DRAW);
  
  var imat = [1,0,0,0,
              0,1,0,0,
              0,0,1,0,
              0,0,0,0];
  var pmat = function(l, r, b, t, n, f){
    return [2*n/(r-l),0,0,0,
            -(r+l)/(r-l),-(t+b)/(t-b),(f+n)/(f-n),1,
            0,2*n/(t-b),0,0,
            0,0,-2*f*n/(f+n),0];
  };
  var tmat = function(x, y, z){
    return [1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            x,y,z,1];
  };
  var smat = function(x, y, z){
    return [x,0,0,0,
            0,y,0,0,
            0,0,z,0,
            0,0,0,1];
  };
  var rmatx = function(cos, sin){
    return [1,0,0,0,
            0,cos,sin,0,
            0,-sin,cos,0,
            0,0,0,1];
  };
  var rmaty = function(cos, sin){
    return [cos,0,-sin,0,
            0,1,0,0,
            sin,0,cos,0,
            0,0,0,1];
  };
  var rmatz = function(cos, sin){
    return [cos,sin,0,0,
            -sin,cos,0,0,
            0,0,1,0,
            0,0,0,1];
  };
  var mul = function(m1,m2){
    var res = Array(16);
    for(var i = 0; i<4; i++){
      for(var j = 0; j<4; j++){
        var temp = 0;
        for(var k = 0; k<4; k++){
          temp += m1[i+4*k]*m2[k+4*j];
        }
        res[i+4*j] = temp;
      }
    }
    return res;
  };
  var mulv = function(m, v){
    var res = Array(4);
    for(var i = 0; i<4; i++){
      var temp = 0;
      for(var k = 0; k<4; k++){
        temp += m[i+4*k]*v[k];
      }
      res[i] = temp;
    }
    return res;
  };
  var rmat = function(p, n, cos, sin){
    var nxyz = Math.sqrt(n[0]*n[0]+n[1]*n[1]+n[2]*n[2]);
    var nyz = Math.sqrt(n[1]*n[1]+n[2]*n[2]);
    return mul(tmat(-p[0],-p[1],-p[2]),
           mul(rmatx(n[2]/nyz,-n[1]/nyz),
           mul(rmaty(nyz/nxyz,n[0]/nxyz),
           mul(rmatz(cos,sin),
           mul(rmaty(nyz/nxyz,-n[0]/nxyz),
           mul(rmatx(n[2]/nyz,n[1]/nyz),
           tmat(-p[0],-p[1],-p[2])))))));
  };
  
  var cubemovemat = tmat(-2,-.5,0);
  var pyrmovemat = tmat(1,-.5,0);
  var planemovemat = mul(smat(Math.sqrt(17),Math.sqrt(17),1),tmat(-.5,-.5,0));
  var viewmat = mul(tmat(0,7,0),rmatx(Math.cos(Math.PI/6),Math.sin(Math.PI/6)));
  
  var f_near = 5;
  var f_far = 20;
  var f_width = 6;
  
  var eye_off = 1;
  var f_scr = 10;
  
  var f_assym = eye_off*f_near/f_scr;
  
  var pvmatl;
  var pvmatr;
  var cubepvm;
  var pyrpvm;
  var planepvm;
  
  var cur_alpha = 0;
  var cur_beta = 0;
  var cur_gamma = 0;
  
  var update_pv = function(alpha, beta, gamma){
    var rot = mul(rmatz(Math.cos(alpha),Math.sin(alpha)),
              mul(rmatx(Math.cos(beta),Math.sin(beta)),
              rmaty(Math.cos(gamma),Math.sin(gamma))));
    var viewmatl = mul(tmat(eye_off/2,0,0),mul(rot,viewmat));
    var viewmatr = mul(tmat(-eye_off/2,0,0),mul(rot,viewmat));
    var projmatl = pmat(-f_width/2-f_assym,f_width/2-f_assym,-f_width/aspect,f_width/aspect,f_near,f_far);
    var projmatr = pmat(-f_width/2+f_assym,f_width/2+f_assym,-f_width/aspect,f_width/aspect,f_near,f_far);
    pvmatl = mul(projmatl,viewmatl);
    pvmatr = mul(projmatr,viewmatr);
  };
  
  update_pv(0,0,0);
  
  window.addEventListener("devicemotion", function(e) {
    cur_alpha = (cur_alpha + e.rotationRate.alpha * e.interval/1000);
    cur_beta = (cur_beta + e.rotationRate.beta * e.interval/1000);
    cur_gamma = (cur_gamma + e.rotationRate.gamma * e.interval/1000);
    update_pv(-cur_alpha,cur_beta,cur_gamma);
    document.getElementById("Alpha").innerHTML = Math.round(cur_alpha/Math.PI*180);
    document.getElementById("Beta").innerHTML = Math.round(cur_beta/Math.PI*180);
    document.getElementById("Gamma").innerHTML = Math.round(cur_gamma/Math.PI*180);
    }, true);
  
  GL.enable(GL.DEPTH_TEST);
  //GL.depthFunc(GL.LEQUAL);
  GL.clearColor(0.0, 0.0, 0.0, 0.0);
  GL.clearDepth(1.0);
  
  var render = function(pvmat, movemat){
      cubepvm = mul(pvmat,mul(movemat,cubemovemat));
      pyrpvm = mul(pvmat,mul(movemat,pyrmovemat));
      planepvm = mul(pvmat,planemovemat);
      
      GL.uniformMatrix4fv(_PVMmatrix, false, cubepvm);
      GL.bindBuffer(GL.ARRAY_BUFFER, CUBE_VERTEX);
      GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0);
      GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4);
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, CUBE_FACES);
      GL.drawElements(GL.TRIANGLES, 6*2*3, GL.UNSIGNED_SHORT, 0);
      
      GL.uniformMatrix4fv(_PVMmatrix, false, pyrpvm);
      GL.bindBuffer(GL.ARRAY_BUFFER, PYR_VERTEX);
      GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0);
      GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4);
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, PYR_FACES);
      GL.drawElements(GL.TRIANGLES, (2+4)*3, GL.UNSIGNED_SHORT,0);
      
      GL.uniformMatrix4fv(_PVMmatrix, false, planepvm);
      GL.bindBuffer(GL.ARRAY_BUFFER, PLANE_VERTEX);
      GL.vertexAttribPointer(_position, 3, GL.FLOAT, false,4*(3+3),0);
      GL.vertexAttribPointer(_color, 3, GL.FLOAT, false,4*(3+3),3*4);
      GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, PLANE_FACES);
      GL.drawElements(GL.TRIANGLES, 2*3, GL.UNSIGNED_SHORT,0);
  }
  
  var time_old = 0;
  var animate = function(time) {
    var dt = time-time_old;
    time_old = time;
    var phi = time/1000;
    var movemat = rmat([0,0,0],[0,0,1],Math.cos(phi),Math.sin(phi));
    
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    GL.viewport(0.0, 0.0, CANVAS.width/2, CANVAS.height);
    render(pvmatl, movemat);
    GL.viewport(CANVAS.width/2, 0.0, CANVAS.width/2, CANVAS.height);
    render(pvmatr, movemat);
    GL.flush();
    
    window.requestAnimationFrame(animate);
  };
  animate(0);
};