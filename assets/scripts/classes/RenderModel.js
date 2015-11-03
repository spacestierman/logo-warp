var RenderModel = function()
{
	this._renderMainLogoWithCanvas = true;
	this._renderBackground = true;
};

RenderModel.prototype = {
	shouldRenderMainLogoWithCanvas: function() {
		return this._renderMainLogoWithCanvas;
	},
	
	shouldRenderMainLogoWithStaticImage: function() {
		return !this._renderMainLogoWithCanvas;
	}
};