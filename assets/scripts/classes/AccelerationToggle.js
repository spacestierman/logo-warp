var AccelerationToggle = function(object, propertyName, activeAcceleration, maximumValue) {
	this._activeAcceleration = activeAcceleration;
	this._currentAcceleration = 0.0;
	this._maximumValue = maximumValue;
	this._originalValue = object[propertyName];
	this._object = object;
	this._propertyName = propertyName;
}

AccelerationToggle.prototype = {
	update: function(isActive) {
		if (isActive) {
			this._currentAcceleration = this._activeAcceleration;
			this._object[this._propertyName] += this._currentAcceleration; 
			
			this._object[this._propertyName] = Math.min(this._maximumValue, this._object[this._propertyName]);
			this._currentAcceleration *= 0.95;
		}
		else {
			if (this._object[this._propertyName] != this._originalValue) {
				this._object[this._propertyName] -= Math.abs(this._object[this._propertyName] - this._originalValue) * 0.25;
			}
		}
	}
};