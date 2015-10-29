var InteractionState = function() {
	this._isMouseDown = false;
	this._keysDown = {};
};

InteractionState.prototype = {
	setMouseDownState: function(mouseIsDown) {
		this._isMouseDown = mouseIsDown;
	},
	
	setKeyState: function(charCode, state) {
		this._keysDown[charCode] = state;
	},
	
	isMouseDown: function() {
		return this._isMouseDown;
	},
	
	isMouseUp: function() {
		return !this.isMouseDown();
	},
	
	isKeyDown: function(charCode) {
		if (!this._keysDown.hasOwnProperty(charCode)) {
			return false;
		}
		
		return this._keysDown[charCode];
	}
};