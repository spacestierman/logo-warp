var BooleanToggle = function(object, propertyName, onChangeFunction) {
	this._originalValue = object[propertyName];
	this._object = object;
	this._propertyName = propertyName;
	this._onChangeFunction = onChangeFunction;
}

BooleanToggle.prototype = {
	update: function(isActive) {
		if (typeof isActive !== 'boolean') {
			throw "Bad input."
		}
		
		if (this._object[this._propertyName] != isActive) {
			this._object[this._propertyName] = isActive;
			if (this._onChangeFunction) {
				this._onChangeFunction();
			}
		}
	}
};