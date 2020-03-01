
function zero(mat){
	for(let idx = 0; idx < 16; idx ++){
		mat[idx] = 0;
	}
}

function identity(mat){
	zero(mat);
	mat[0] = mat[5] = mat[10] = mat[15] = 1.0
}
