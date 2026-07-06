"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _lit = require("lit");

var _ExchangeNavigationController = _interopRequireDefault(require("../Controllers/ExchangeNavigationController"));

var _changenowExchangeIntegration = require("@bdxi/changenow-exchange-integration");

var _templateObject, _templateObject2;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var fiatApi = new _changenowExchangeIntegration.FiatApi({
  apiKey: "b1c7ed0a20710e005b65e304b74dce3253cd9ac16009b57f4aa099f2707d64a9"
});

var BuyWithFiatLoadingScreenChangenowView = /*#__PURE__*/function (_ExchangeNavigationCo) {
  (0, _inherits2["default"])(BuyWithFiatLoadingScreenChangenowView, _ExchangeNavigationCo);

  var _super = _createSuper(BuyWithFiatLoadingScreenChangenowView);

  function BuyWithFiatLoadingScreenChangenowView() {
    (0, _classCallCheck2["default"])(this, BuyWithFiatLoadingScreenChangenowView);
    return _super.call(this);
  }

  (0, _createClass2["default"])(BuyWithFiatLoadingScreenChangenowView, [{
    key: "connectedCallback",
    value: function () {
      var _connectedCallback = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                (0, _get2["default"])((0, _getPrototypeOf2["default"])(BuyWithFiatLoadingScreenChangenowView.prototype), "connectedCallback", this).call(this);

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function connectedCallback() {
        return _connectedCallback.apply(this, arguments);
      }

      return connectedCallback;
    }()
  }, {
    key: "render",
    value: function render() {
      // We're going to use conditionals and classes to determine which elements to hide
      return (0, _lit.html)(_templateObject || (_templateObject = (0, _taggedTemplateLiteral2["default"])(["\n            \n        "])));
    }
  }], [{
    key: "styles",
    get: function get() {
      return (0, _lit.css)(_templateObject2 || (_templateObject2 = (0, _taggedTemplateLiteral2["default"])(["\n        .form-field-title {\n            max-width: 100%;\n            margin: 15px 0 8px 0;\n            user-select: none;\n            display: block;\n            text-align: left;\n            color: #F8F7F8;\n            font-family: Native-Light, input, menlo, monospace;\n            -webkit-font-smoothing: subpixel-antialiased;\n            font-size: 10px;\n            letter-spacing: 0.5px;\n            font-weight: 300;\n        }\n        div#currency-table {\n            padding: 0;\n        }\n        .full-width {\n            width: 100% !important;\n        }\n        #getOfferLoader {\n            float: left;\n            // min-height: 28px;\n            padding: 0px 24px 0 0;\n            display: none;\n        }\n        #getOffer {\n            font-family: Native-Light, input, menlo, monospace;\n            -webkit-font-smoothing: subpixel-antialiased;\n            font-size: 10px;\n            letter-spacing: 0.5px;\n            font-weight: 300;\n            color: rgb(158, 156, 158);\n            padding-left: 0px;\n        }\n        .activityIndicators.graphicAndLabel > div.loader {\n            display: inline-block;\n            position: relative;\n            top: 0px;\n        }\n        .activityIndicators.on-normal-background .loader > .block {\n            background-color: #383638;\n            animation: block-animate-normal-bg .75s infinite ease-in-out;\n        }\n        .activityIndicators .loader > .block1 {\n            animation-delay: -1.2s !important;\n        }\n        .activityIndicators .loader > .block2 {\n            animation-delay: -1.0s !important;\n        }\n        .activityIndicators .loader > .block3 {\n            animation-delay: -0.8s !important;\n        }\n        #tx-fee {\n            float: right;\n            padding: 0px 13px 7px 6px;\n        }\n        #minimum-fee-text, #tx-fee, #addressValidationLoaderText {\n            font-size: 10px;\n        }\n        #btc-address {\n            clear: both;\n            padding: 0px 13px 7px 0px;\n        }\n        #addressValidationLoader {\n            font-family: Native-Light, input, menlo, monospace;\n            -webkit-font-smoothing: subpixel-antialiased;\n            font-size: 10px;\n            letter-spacing: 0.5px;\n            font-weight: 300;\n            color: rgb(158, 156, 158);\n            padding-left: 0px;\n            padding: 0px 24px 0 0;\n            display: none;\n        }\n        #addressValidationLoader .loader {\n            float: left;\n        }\n        #addressValidationLoaderText {\n            float: left;\n            font-size: 10px;\n        }\n        .activityIndicators.graphicAndLabel > span {\n            display: inline-block;\n        }\n        #validation-messages, #address-messages, #server-messages {\n            max-width: fit-content;\n        }\n        .currencySelect {\n            right: 5px;\n            left: auto;\n        }\n        .currencySelect {\n            font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n            -webkit-font-smoothing: subpixel-antialiased;\n            font-size: 11px;\n            font-weight: 400;\n            letter-spacing: 0.5px;\n            text-indent: 10px;\n            color: rgb(223, 222, 223);\n            background-color: rgba(80, 74, 80, 0.55);\n            position: absolute;\n            left: 117.5px;\n            width: 56px;\n            height: 29.5px;\n            border: 0px;\n            padding: 0px;\n            border-radius: 0px 4px 4px 0px;\n            -webkit-appearance: none;\n            top: 24px;\n        }\n        #minimum-fee {\n            float: right;\n        }\n        #minimum-fee-text, #tx-fee, #addressValidationLoaderText {\n            font-size: 10px;\n            margin-top: 8px;\n            color: rgb(158, 156, 158);\n            display: inline-block;\n        }\n        .full-width td {\n            display: block;\n            width: 100%;\n            clear: both;\n        }\n        input#inCurrencyValue, input#outCurrencyValue {\n            width: calc(100% - 70px);\n            padding: 0px 0px;\n            text-indent: 148px;\n            position: relative;\n            right: 40px;\n            left: 0px;\n            padding: 0px 3px;\n            margin-right: 5px;\n            text-indent: 20px;\n            min-width: 104px;\n        }\n        .textInput {\n            display: inline-block;\n            height: 29px;\n            width: 80px;\n            border-radius: 4px;\n            border: 1px solid rgba(0, 0, 0, 0);\n            text-align: right;\n            font-size: 13px;\n            font-weight: 200;\n            padding: 0px 63px 0px 7px;\n            font-family: Native-Light, input, menlo, monospace;\n            outline: none;\n            box-shadow: rgba(56, 54, 56, 0.5) 0px 0.5px 0px 0px, rgb(22, 20, 22) 0px 0.5px 0px 0px inset;\n            color: rgb(223, 222, 223);\n            background-color: rgb(29, 27, 29);\n        }\n        .currencySelect {\n            right: 5px;\n            left: auto;\n        }\n        .longTextInput {\n            display: block;\n            height: 29px;\n            width: calc((100% - 2px) - 14px);\n            border-radius: 4px;\n            border: 1px solid rgba(0, 0, 0, 0);\n            text-align: left;\n            font-size: 13px;\n            font-weight: 200;\n            padding: 0px 7px;\n            font-family: Native-Light, input, menlo, monospace;\n            outline: none;\n            box-shadow: rgba(56, 54, 56, 0.5) 0px 0.5px 0px 0px, rgb(22, 20, 22) 0px 0.5px 0px 0px inset;\n            color: rgb(223, 222, 223);\n            background-color: rgb(29, 27, 29);\n        }\n        "])));
      /*
          #getOfferLoader {
              float: left;
              // min-height: 28px;
          }
          #getOfferLoader div { 
              // display: none; 
          }
          #getOfferLoader {
              padding: 0px 24px 0 0;
              display: none;
          }
          #tx-fee {
              float: right;
          }
          #btc-address {
              clear: both;
          }
      
      */
    }
  }]);
  return BuyWithFiatLoadingScreenChangenowView;
}((0, _ExchangeNavigationController["default"])(_lit.LitElement));

exports["default"] = BuyWithFiatLoadingScreenChangenowView;
customElements.define('buy-with-fiat-loading-screen-changenow', BuyWithFiatLoadingScreenChangenowView);