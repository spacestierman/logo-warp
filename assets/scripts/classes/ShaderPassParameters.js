var ShaderPassParameters = function(shaderPass, defaultShow) {
	this._shader = shaderPass;
	this._params = this._buildParams(defaultShow);	
};

ShaderPassParameters.prototype = {
	updateShaderToParameters: function(values) {
		for (var key in this._params) {
  			if (this._params.hasOwnProperty(key) && this._shader.uniforms.hasOwnProperty(key)) {
				this._shader.uniforms[key].value = this._params[key];
			}
		}
		
		if (values) {
			for (var key in values)
			{
				if (values.hasOwnProperty(key) && this._shader.uniforms.hasOwnProperty(key)) {
					this._shader.uniforms[key].value = values[key];
				}
			}
		}
	},
	
	getShader: function() {
		return this._shader;
	},
	
	getParameters: function() {
		return this._params;	
	},
	
	_buildParams: function(defaultShow) {
		var params = {
			show: defaultShow
		};
		for (var key in this._shader.uniforms) {
  			if (this._shader.uniforms.hasOwnProperty(key)) {
				params[key] = this._shader.uniforms[key].value;
			}
		}
		
		return params;
	}	
};