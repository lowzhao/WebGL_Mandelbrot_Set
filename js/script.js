var gl;
var scale = 1.0;
var go_up_by = 0.0;
var go_right_by = -1.0;

var vertex_shader_src = `
attribute vec2 vert_pos;
attribute vec3 vert_color;

varying vec3 frag_color;
varying vec2 vert_pos2;
varying float d;
varying float w;
varying float h;
varying float zoom;
varying float go_up_by;
varying float go_right_by;

uniform mat4 mat_proj;
uniform float curr;

uniform float real_w;
uniform float real_h;
uniform float real_zoom;
uniform float real_go_up_by;
uniform float real_go_right_by;

void main() {
	frag_color = vert_color;
	vert_pos2 = vert_pos;
	d = curr;
	w = real_w;
	h = real_h;
	zoom = real_zoom;
	go_up_by = real_go_up_by;
	go_right_by = real_go_right_by;
	gl_Position = mat_proj * vec4(vert_pos, 0.0, 1.0);
}
`
fragment_shader_src = 
`
precision mediump float;
varying vec3 frag_color;
varying vec2 vert_pos2;
varying float d;

varying float w;
varying float h;
varying float zoom;
varying float go_right_by;
varying float go_up_by;

const vec2 zeroz = vec2(0,0);
const int steps = 500;


vec2 cmpxmul(in vec2 a, in vec2 b) {
	return vec2(a.x * a.x - a.y * a.y + b.x, a.y * a.x * 2.0 + b.y);
}

float cmpxmag(in vec2 c) {
    return sqrt(c.x * c.x + c.y * c.y);
}

void main() {
	vec2 tmp2 = vec2((vert_pos2.x *zoom + go_right_by) * ( w / h ), vert_pos2.y * zoom + go_up_by);
	vec2 tmp = vec2(d,0);
	tmp = cmpxmul(tmp, tmp2);
	float i_float;

	for (int i = 0; i < steps; i++){
		tmp = cmpxmul(tmp, tmp2);
		i_float = float(i);
		if ((abs(tmp.x - tmp2.x) < 0.00001) && (abs(tmp.y - tmp2.y) < 0.00001)){
			break;
		} else if(cmpxmag(tmp) > 2.0){
			break;
		}
	}

	if (cmpxmag(tmp) > 2.0){
		gl_FragColor = vec4((100.0 - i_float)/100.0,(100.0 - i_float)/100.0,(100.0 - i_float)/100.0, 1.0);
	}else{
		gl_FragColor = vec4(0,0,0, 1.0);
	}
}
`

var mat_proj = new Float32Array(16);

function resize_canvas(){
	const canvas = document.querySelector("#can")
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl.viewport(0, 0, window.innerWidth, window.innerHeight)
}

function main()
{
	gl = document.querySelector("#can").getContext("webgl");

	function zoom(event) {
		event.preventDefault();
	  
		scale += event.deltaY * -scale/1000;
	  
		// Restrict scale
		scale = Math.min(Math.max(.00001, scale), 1);
	  
		// // Apply scale transform
		// el.style.transform = `scale(${scale})`;
	  }
	  
	  const el = document.querySelector('#can');
	  el.onwheel = zoom;


	  document.onkeydown = checkKey;

	  function checkKey(e) {
	  
		  e = e || window.event;
	  
		  if (e.keyCode == '38') {
			  // up arrow
			  go_up_by += scale / 20;
		  }
		  else if (e.keyCode == '40') {
			  // down arrow
			  go_up_by -= scale / 20;
		  }
		  else if (e.keyCode == '37') {
			 // left arrow
			  go_right_by -= scale / 20;
		  }
		  else if (e.keyCode == '39') {
			 // right arrow
			  go_right_by += scale / 20;
		  }
	  }



	window.addEventListener('resize', resize_canvas, false);
	resize_canvas();

	// Only continue if WebGL is available and working
	if (gl === null)
	{
		alert("Unable to initialize WebGL. Your browser or machine may not support it.");
		return;
	}

	// Set clear color to black, fully opaque
	console.log('creating shaders');
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create vertex shader
	console.log('creating shaders');
	const vertexShader = create_shader(gl.VERTEX_SHADER, vertex_shader_src)
	const fragmentShader = create_shader(gl.FRAGMENT_SHADER, fragment_shader_src)
	
	console.log('creating program');
	const program = create_program(vertexShader, fragmentShader)
	gl.useProgram(program);
	
	identity(mat_proj);

	console.log('creating triangles');
	let triangle = [ 
		1,1,    1,1,0,
		-1,-1,  1,0,1,
		1, -1,   0,1,1,


		1,1,    1,1,0,
		-1,-1,  1,0,1,
		-1, 1,   1,1,1,
	];


	start_i = 0;
	max_i = 1;
	steps_i = 0.001;

	dont_change = false;

	i = start_i;
	reverse_now = true;
	setInterval(
		()=>{
			draw_advance(triangle, program, i)
			if (! dont_change){
				
			if (i > max_i){
				reverse_now = true;
			}
			if (i < start_i){
				reverse_now = false;
			}
			if (reverse_now){
				i -= steps_i;
			}else{
				i += steps_i;
			}
		}

		},
		50
	)

	// let loop = () =>{
	// 	// triangle = [ 
	// 	// 	1,1,    1,1,0,
	// 	// 	-1,-1,  1,0,1,
	// 	// 	1, -1,   0,1,1,
	
	
	// 	// 	1,1,    1,1,0,
	// 	// 	-1,-1,  1,0,1,
	// 	// 	-1, 1,   1,1,1,
	// 	// ];
		draw_advance(triangle, program, 0)
	// 	requestAnimationFrame(loop)
	// }
	// requestAnimationFrame(loop)
}
window.onload = main