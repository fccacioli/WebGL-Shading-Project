function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	var cosX = Math.cos(rotationX), sinX = Math.sin(rotationX);
	var cosY = Math.cos(rotationY), sinY = Math.sin(rotationY);

	
	var rotX = [
		1, 0,     0,    0,
		0, cosX,  sinX, 0,
		0, -sinX, cosX, 0,
		0, 0,     0,    1
	];
	var rotY = [
		cosY, 0, -sinY, 0,
		0,    1, 0,     0,
		sinY, 0, cosY,  0,
		0,    0, 0,     1
	];
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	
	var mv = MatrixMult( trans, MatrixMult( rotY, rotX ) );
	return mv;
}


class MeshDrawer
{
	constructor()
	{
		
		this.prog = InitShaderProgram( meshVS, meshFS );

		
		this.mvp        = gl.getUniformLocation( this.prog, 'mvp' );
		this.mv         = gl.getUniformLocation( this.prog, 'mv' );
		this.normalMat  = gl.getUniformLocation( this.prog, 'normalMat' );
		this.swap       = gl.getUniformLocation( this.prog, 'swap' );
		this.showTex    = gl.getUniformLocation( this.prog, 'showTex' );
		this.hasTex     = gl.getUniformLocation( this.prog, 'hasTex' );
		this.lightDir   = gl.getUniformLocation( this.prog, 'lightDir' );
		this.shininess  = gl.getUniformLocation( this.prog, 'shininess' );
		this.sampler    = gl.getUniformLocation( this.prog, 'tex' );

		
		this.vertPosLoc   = gl.getAttribLocation( this.prog, 'pos' );
		this.texCoordLoc  = gl.getAttribLocation( this.prog, 'txc' );
		this.normalLoc    = gl.getAttribLocation( this.prog, 'nrm' );

		
		this.vertBuffer   = gl.createBuffer();
		this.texBuffer    = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();

		
		this.texture = gl.createTexture();
		this.textureLoaded = false;

		
		this.numTriangles = 0;
		this.swapYZ( false );
		this.showTexture( true );
	}

	setMesh( vertPos, texCoords, normals )
	{
		this.numTriangles = vertPos.length / 3;

		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.texBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW );

		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer );
		gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW );
	}

	swapYZ( swap )
	{
		gl.useProgram( this.prog );
		gl.uniform1i( this.swap, swap ? 1 : 0 );
	}

	draw( matrixMVP, matrixMV, matrixNormal )
	{
		gl.useProgram( this.prog );

		gl.uniformMatrix4fv( this.mvp, false, matrixMVP );
		gl.uniformMatrix4fv( this.mv,  false, matrixMV );
		gl.uniformMatrix3fv( this.normalMat, false, matrixNormal );

		
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vertBuffer );
		gl.vertexAttribPointer( this.vertPosLoc, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vertPosLoc );

		
		gl.bindBuffer( gl.ARRAY_BUFFER, this.texBuffer );
		gl.vertexAttribPointer( this.texCoordLoc, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.texCoordLoc );

		
		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBuffer );
		gl.vertexAttribPointer( this.normalLoc, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.normalLoc );

		
		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, this.texture );
		gl.uniform1i( this.sampler, 0 );

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}

	setTexture( img )
	{
		gl.useProgram( this.prog );
		gl.bindTexture( gl.TEXTURE_2D, this.texture );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );
		gl.generateMipmap( gl.TEXTURE_2D );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );

		this.textureLoaded = true;
		gl.uniform1i( this.hasTex, 1 );
	}

	showTexture( show )
	{
		gl.useProgram( this.prog );
		gl.uniform1i( this.showTex, show ? 1 : 0 );
	}

	setLightDir( x, y, z )
	{
		gl.useProgram( this.prog );
		gl.uniform3f( this.lightDir, x, y, z );
	}

	setShininess( shininess )
	{
		gl.useProgram( this.prog );
		gl.uniform1f( this.shininess, shininess );
	}
}



var meshVS = `
	attribute vec3 pos;
	attribute vec2 txc;
	attribute vec3 nrm;

	uniform mat4 mvp;
	uniform mat4 mv;
	uniform mat3 normalMat;
	uniform int  swap;

	varying vec2 vTxc;
	varying vec3 vNormal;   // normale in camera space
	varying vec3 vPosCam;   // posizione in camera space

	void main()
	{
		vec3 p = pos;
		vec3 n = nrm;
		if ( swap == 1 ) {
			p = vec3( pos.x, pos.z, pos.y );
			n = vec3( nrm.x, nrm.z, nrm.y );
		}
		gl_Position = mvp * vec4(p, 1.0);
		vTxc        = txc;
		vNormal     = normalMat * n;
		vPosCam     = ( mv * vec4(p, 1.0) ).xyz;
	}
`;


var meshFS = `
	precision mediump float;

	uniform sampler2D tex;
	uniform int   showTex;
	uniform int   hasTex;
	uniform vec3  lightDir;   // già in camera space
	uniform float shininess;

	varying vec2 vTxc;
	varying vec3 vNormal;
	varying vec3 vPosCam;

	void main()
	{
		vec3 N = normalize( vNormal );
		vec3 L = normalize( lightDir );
		vec3 V = normalize( -vPosCam );         // camera in (0,0,0)
		vec3 H = normalize( L + V );

		// Kd: bianco oppure texture
		vec3 Kd = vec3(1.0);
		if ( showTex == 1 && hasTex == 1 ) {
			Kd = texture2D( tex, vTxc ).rgb;
		}
		vec3 Ks = vec3(1.0);

		float diff = max( dot(N, L), 0.0 );
		float spec = pow( max( dot(N, H), 0.0 ), shininess );

		// I = (1,1,1)
		vec3 color = Kd * diff + Ks * spec;

		gl_FragColor = vec4( color, 1.0 );
	}
`;