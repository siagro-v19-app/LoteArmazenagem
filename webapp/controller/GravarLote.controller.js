sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecLoteArmazenagem/helpers/LocalEstoqueHelpDialog",
	"br/com/idxtecLoteArmazenagem/helpers/ParceiroNegocioHelpDialog",
	"br/com/idxtecLoteArmazenagem/helpers/ProdutoHelpDialog",
	"br/com/idxtecLoteArmazenagem/helpers/TabelaTarifaHelpDialog",
	"br/com/idxtecLoteArmazenagem/services/Session"
], function(Controller, History, MessageBox, JSONModel, LocalEstoqueHelpDialog, ParceiroNegocioHelpDialog,
	ProdutoHelpDialog, TabelaTarifaHelpDialog, Session) {
	"use strict";

	return Controller.extend("br.com.idxtecLoteArmazenagem.controller.GravarLote", {
		onInit: function(){
			var oRouter = this.getOwnerComponent().getRouter();
			
			oRouter.getRoute("gravarlote").attachMatched(this._routerMatch, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			
			this._operacao = null;
			this._sPath = null;
			
			var oJSONModel = new JSONModel();
			this.getOwnerComponent().setModel(oJSONModel,"model");
		},
		
		armazemReceived: function(){
			this.getView().byId("armazem").setSelectedKey(this.getModel("model").getProperty("/Armazem"));
		},
		
		parceiroNegocioReceived: function() {
			this.getView().byId("cliente").setSelectedKey(this.getModel("model").getProperty("/Cliente"));
		},
		
		tabelaReceived: function(){
			this.getView().byId("tabela").setSelectedKey(this.getModel("model").getProperty("/Tabela"));
		},
		
		produtoReceived: function(){
			this.getView().byId("produto").setSelectedKey(this.getModel("model").getProperty("/Produto"));
		},
		
		handleSearchArmazem: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			LocalEstoqueHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchParceiro: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			ParceiroNegocioHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchTabela: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			TabelaTarifaHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		handleSearchProduto: function(oEvent){
			var sInputId = oEvent.getParameter("id");
			ProdutoHelpDialog.handleValueHelp(this.getView(), sInputId, this);
		},
		
		_routerMatch: function(){
			var oParam = this.getOwnerComponent().getModel("parametros").getData();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getOwnerComponent().getModel("view");
			
			this._operacao = oParam.operacao;
			this._sPath = oParam.sPath;
			
			if (this._operacao === "incluir"){
				
				oViewModel.setData({
					titulo: "Inserir Lote"
				});
			
				var oNovoLote = {
					"Id": 0,
					"Descricao": "",
					"Armazem": 0,
					"Cliente": 0,
					"Tabela": 0,
					"Data": new Date(),
					"Produto": 0,
					"Saldo": 0.00,
					"ReferenciaExterna": "",
					"Observacoes": "",
					"Encerrado": false,
					"Empresa" : Session.get("EMPRESA_ID"),
					"Usuario": Session.get("USUARIO_ID"),
					"EmpresaDetails": { __metadata: { uri: "/Empresas(" + Session.get("EMPRESA_ID") + ")"}},
					"UsuarioDetails": { __metadata: { uri: "/Usuarios(" + Session.get("USUARIO_ID") + ")"}}
				};
				
				oJSONModel.setData(oNovoLote);
				
			} else if (this._operacao === "editar"){
				
				oViewModel.setData({
					titulo: "Editar Lote"
				});
				
				oModel.read(oParam.sPath,{
					success: function(oData) {
						oJSONModel.setData(oData);
					}
				});
			}
		},
		
		onSalvar: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			
			if (this._operacao === "incluir") {
				this._createLote();
			} else if (this._operacao === "editar") {
				this._updateLote();
			}
		},
		
		_goBack: function(){
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			
			if (sPreviousHash !== undefined) {
					window.history.go(-1);
			} else {
				oRouter.navTo("lotearmazenagem", {}, true);
			}
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			oDados.LocalEstoqueDetails = {
				__metadata: {
					uri: "/LocalEstoques(" + oDados.Armazem + ")"
				}
			};
			
			oDados.ParceiroNegocioDetails = {
				__metadata: {
					uri: "/ParceiroNegocios(" + oDados.Cliente + ")"
				}
			};
			
			oDados.ProdutoDetails = {
				__metadata: {
					uri: "/Produtos(" + oDados.Produto + ")"
				}
			};
			
			oDados.TabelaTarifaDetails = {
				__metadata: {
					uri: "/TabelaTarifas(" + oDados.Tabela + ")"
				}
			};

			return oDados;
		},
		
		_createLote: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.create("/LoteArmazenagems", this._getDados(), {
				success: function() {
					MessageBox.success("Lote inserido com sucesso!", {
						onClose: function(){
							that._goBack(); 
						}
					});
				}
			});
		},
		
		_updateLote: function() {
			var oModel = this.getOwnerComponent().getModel();
			var that = this;
			
			oModel.update(this._sPath, this._getDados(), {
					success: function() {
					MessageBox.success("Lote alterado com sucesso!", {
						onClose: function(){
							that._goBack();
						}
					});
				}
			});
		},
		
		_checarCampos: function(oView){
			if(oView.byId("descricao").getValue() === "" || oView.byId("armazem").getValue() === ""
			|| oView.byId("cliente").getValue() === "" || oView.byId("tabela").getValue() === ""
			|| oView.byId("data").getDateValue() === "" || oView.byId("produto").getValue() === ""
			|| oView.byId("saldo").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		onVoltar: function(){
			this._goBack();
		},
		
		getModel : function(sModel) {
			return this.getOwnerComponent().getModel(sModel);	
		}
	});
});