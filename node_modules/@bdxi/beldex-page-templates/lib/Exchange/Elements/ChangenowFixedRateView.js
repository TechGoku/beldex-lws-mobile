"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChangenowFixedRateView = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _lit = require("lit");

var _ExchangeNavigationController = _interopRequireDefault(require("../Controllers/ExchangeNavigationController"));

var _templateObject, _templateObject2;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

// Legacy imports for fixed rate exchange
var Utils = require("../Utils/ExchangeUtilityFunctions");

var ExchangeUtils = require("../Utils/ExchangeUtilityFunctions"); // const ValidationLibrary = require('wallet-address-validator')
//const View = require('../../Views/View.web')
// const commonComponents_navigationBarButtons = require('../../MMAppUICommonComponents/navigationBarButtons.web')
// const commonComponents_activityIndicators = require('../../MMAppUICommonComponents/activityIndicators.web')


var JSBigInt = require('@bdxi/beldex-bigint').BigInteger; // important: grab defined export


var beldex_amount_format_utils = require('@bdxi/beldex-money-format');

var ExchangeHelper = require("@bdxi/beldex-exchange-helper");

var exchangeHelper = new ExchangeHelper(); // NB: because of legacy reasons, we don't want this to render inside a shadow dom. We override createRenderRoot to address this

var ChangenowFixedRateView = /*#__PURE__*/function (_ExchangeNavigationCo) {
  (0, _inherits2["default"])(ChangenowFixedRateView, _ExchangeNavigationCo);

  var _super = _createSuper(ChangenowFixedRateView);

  function ChangenowFixedRateView() {
    var _this;

    (0, _classCallCheck2["default"])(this, ChangenowFixedRateView);
    _this = _super.call(this);
    _this.clickHandler = _this.clickHandler;
    return _this;
  }

  (0, _createClass2["default"])(ChangenowFixedRateView, [{
    key: "createRenderRoot",
    value: function createRenderRoot() {
      return this;
    }
  }, {
    key: "connectedCallback",
    value: function connectedCallback() {
      (0, _get2["default"])((0, _getPrototypeOf2["default"])(ChangenowFixedRateView.prototype), "connectedCallback", this).call(this);
      exchangeHelper.doInit(this.context);
    }
  }, {
    key: "sendFunds",
    value: function sendFunds() {
      var in_amount = document.getElementById('in_amount_remaining').innerHTML;
      var send_address = document.getElementById('receiving_subaddress').innerHTML;
      var in_amount_str = '' + in_amount;
      var selectedWallet = document.getElementById('selected-wallet');
      var selectorOffset = selectedWallet.dataset.walletoffset;
      var sweep_wallet = false; // TODO: Add sweeping functionality

      try {
        if (this.context.walletsListController.hasOwnProperty('orderSent')) {
          console.log('Order already sent previously');
        } else {
          this.context.walletsListController.orderSent = false;
        }

        ExchangeUtils["default"].sendFunds(this.context.walletsListController.records[0], in_amount, send_address, sweep_wallet, exchangeHelper.sendFundsValidationStatusCallback, exchangeHelper.handleSendFundsResponseCallback, this.context);
      } catch (error) {
        console.log(error);
      }
    }
  }, {
    key: "clickHandler",
    value: function clickHandler(event) {
      console.log(event);
    }
  }, {
    key: "render",
    value: function render() {
      var exchangeFormTemplate = exchangeHelper.htmlFormTemplate();
      var exchangeFormHtml = exchangeFormTemplate.content.firstElementChild.cloneNode(true);
      return (0, _lit.html)(_templateObject || (_templateObject = (0, _taggedTemplateLiteral2["default"])(["\n        <div id=\"exchange-landing-page\">\n            <div id=\"explanatory-message\" style=\"color: #ffffff;\">&nbsp;</div>\n            ", "\n            </div>\n        </div>\n        <div class=\"submit-button-wrapper\">\n            <button id=\"order-button\" class=\"button submit-button\">Create Order</button>\n        </div>\n        <button id=\"exchange-xmr\" class=\"button\" @click=", ">Exchange</button>\n        <style>\n            #explanatory-message {\n                font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n                color: #ffffff;\n                margin: 20px;\n                font-size: 13px;\n            }\n            .exchangeScreen {\n                border: none !important;\n            }\n            .exchange-page-panel {\n                margin: 42px 0px 42px 0px !important;\n            }\n            #order-button {\n                display: none;\n            }\n            #order-button, #exchange-xmr {\n                cursor: default;\n                border-radius: 3px;\n                height: 24px;\n                font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n                text-align: center;\n                border: none;\n                text-decoration: none;\n                line-height: 24px;\n                box-sizing: border-box;\n                width: auto;\n                padding: 0px 8px;\n                background-color: rgb(0, 198, 255);\n                box-shadow: rgb(22 20 22) 0px 0.5px 1px 0px, rgb(255 255 255 / 20%) 0px 0.5px 0px 0px inset;\n                color: rgb(22, 20, 22);\n                -webkit-font-smoothing: subpixel-antialiased;\n                font-size: 12px;\n                font-weight: bold;\n                letter-spacing: 0.5px;\n                float: right;\n                margin-top: 5px;\n                -webkit-app-region: no-drag;\n                right: 16px;\n                position: absolute;\n                bottom: 10px;\n            }\n            #exchangePage {\n                padding: 0px 0px 50px 0px;\n            }\n            #orderStatusPage {\n                min-height: 390px;\n            }\n            /** TODO: Remove this style once we tweak the exchange module, since LocalMonero has its own provider card */\n            #localmonero {\n                display: none;\n            }\n        </style>\n        "])), exchangeFormHtml, this.sendFunds);
    }
  }], [{
    key: "styles",
    get: function get() {
      return (0, _lit.css)(_templateObject2 || (_templateObject2 = (0, _taggedTemplateLiteral2["default"])(["    \n        .submit-button-wrapper {\n            position: fixed;\n            top: -45px;\n            right: 16px;\n            width: 15%;\n            min-width: 41px;\n            height: 41px;\n            z-index: 12;\n        }\n        .submit-button {\n            z-index: 13;\n            position: fixed;\n            right: 16px;\n            font-weight: bold;\n            top: -40px;\n            z-index: 10000;\n        }\n        .submit-button, .confirmation-button {\n            cursor: default;\n            border-radius: 3px;\n            height: 24px;\n            font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n            text-align: center;\n            border: none;\n            text-decoration: none;\n            line-height: 24px;\n            box-sizing: border-box;\n            width: auto;\n            padding: 0px 8px;\n            background-color: rgb(0, 198, 255);\n            box-shadow: rgb(22 20 22) 0px 0.5px 1px 0px, rgb(255 255 255 / 20%) 0px 0.5px 0px 0px inset;\n            color: rgb(22, 20, 22);\n            -webkit-font-smoothing: subpixel-antialiased;\n            font-size: 12px;\n            font-weight: bold;\n            letter-spacing: 0.5px;\n            float: right;\n            margin-top: 5px;\n            -webkit-app-region: no-drag;\n        }\n        "])));
    }
  }, {
    key: "properties",
    get: function get() {
      return {
        context: Object
      };
    }
  }]);
  return ChangenowFixedRateView;
}((0, _ExchangeNavigationController["default"])(_lit.LitElement));

exports.ChangenowFixedRateView = ChangenowFixedRateView;

try {
  customElements.define('changenow-fixed-rate-view', ChangenowFixedRateView);
} catch (error) {// already defined
}