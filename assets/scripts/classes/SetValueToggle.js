var SetValueToggle = function(object, propertyName, toValue) {
	this._toValue = toValue;
	this._originalValue = object[propertyName];
	this._object = object;
	this._propertyName = propertyName;
}

SetValueToggle.prototype = {
	update: function(isActive) {
		if (isActive) {
			this._object[this._propertyName] = this._toValue;
		}
		else {
			this._object[this._propertyName] = this._originalValue;
		}
	}
};