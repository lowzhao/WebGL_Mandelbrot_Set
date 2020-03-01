function create_shader(shader_type, shader_src){
	const shader = gl.createShader(shader_type);

	gl.shaderSource(shader, shader_src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		alert('Cannot compile shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function create_program(...shaders){
	const shaderProgram = gl.createProgram();
	for (let shader of shaders){
		gl.attachShader(shaderProgram, shader);
	}
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}
	gl.validateProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.VALIDATE_STATUS)){
		console.error('Unable to validate the shader program: '+ gl.getProgramInfoLog(shaderProgram));
		return null;
	}
	return shaderProgram;
}

function draw_(triangles, program){
	const triangle_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangle_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangles), gl.STATIC_DRAW);

	const positionAttribLocation = gl.getAttribLocation(program, 'vert_pos');
	gl.vertexAttribPointer(
		positionAttribLocation,
		2, // number of elements per attribute
		gl.FLOAT,
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT,
		0 // offset from the beginning
	)
	gl.enableVertexAttribArray(positionAttribLocation);

	const colorAttribLocation = gl.getAttribLocation(program, 'vert_color');
	gl.vertexAttribPointer(
		colorAttribLocation,
		3, // number of elements per attribute
		gl.FLOAT,
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT,
		2 * Float32Array.BYTES_PER_ELEMENT// offset from the beginning
	)
	gl.enableVertexAttribArray(colorAttribLocation);

	const mat_proj_loc = gl.getUniformLocation(program, 'mat_proj');
	gl.uniformMatrix4fv(mat_proj_loc, gl.FALSE, mat_proj);

	gl.drawArrays(gl.TRIANGLES, 0, Math.floor(triangles.length/5));
}

function draw_advance(triangles, program, val){
	const d_loc = gl.getUniformLocation(program, 'curr');
	gl.uniform1f(d_loc, val);


	const w_loc = gl.getUniformLocation(program, 'real_w');
	gl.uniform1f(w_loc,  window.innerWidth);
	
	const h_loc = gl.getUniformLocation(program, 'real_h');
	gl.uniform1f(h_loc, window.innerHeight);

	const zoom_loc = gl.getUniformLocation(program, 'real_zoom');
	gl.uniform1f(zoom_loc, scale);


	const go_up_by_loc = gl.getUniformLocation(program, 'real_go_up_by');
	gl.uniform1f(go_up_by_loc, go_up_by);

	const go_right_by_loc = gl.getUniformLocation(program, 'real_go_right_by');
	gl.uniform1f(go_right_by_loc, go_right_by);

	// console.log(document.querySelector("#can").clientWidth)

	draw_(triangles,program)
}





function clearWhite(){
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}

function clearBlack(){
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
}