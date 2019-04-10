sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"br/com/idxtecLoteArmazenagem/model/models",
	"br/com/idxtecLoteArmazenagem/services/ErrorHandler"
], function(UIComponent, Device, models, ErrorHandler) {
	"use strict";

	return UIComponent.extend("br.com.idxtecLoteArmazenagem.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {
			this._oErrorHandler = new ErrorHandler(this);
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.setModel(models.createViewModel(), "view");
			
			this.getRouter().initialize();
		},
		
		destroy: function(){
			this._oErrorHandler.destroy();
			
			UIComponent.prototype.destroy.apply(this, arguments);
		},
		
		getContentDensityClass: function(){
			if(!this._sContentDensityClass){
				if(!sap.ui.Device.support.touch){
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});