"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChangenowFloatingRateView = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _lit = require("lit");

var _ExchangeNavigationController = _interopRequireDefault(require("../Controllers/ExchangeNavigationController"));

var _templateObject;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ChangenowFloatingRateView = /*#__PURE__*/function (_ExchangeNavigationCo) {
  (0, _inherits2["default"])(ChangenowFloatingRateView, _ExchangeNavigationCo);

  var _super = _createSuper(ChangenowFloatingRateView);

  function ChangenowFloatingRateView() {
    var _this;

    (0, _classCallCheck2["default"])(this, ChangenowFloatingRateView);
    _this = _super.call(this);
    _this.clickHandler = _this.clickHandler;
    return _this;
  }

  (0, _createClass2["default"])(ChangenowFloatingRateView, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      (0, _get2["default"])((0, _getPrototypeOf2["default"])(ChangenowFloatingRateView.prototype), "connectedCallback", this).call(this);
      console.log("Page Template view connected to DOM");
      console.log(this);
    }
  }, {
    key: "clickHandler",
    value: function clickHandler(event) {
      console.log(event);
    }
  }, {
    key: "render",
    value: function render() {
      return (0, _lit.html)(_templateObject || (_templateObject = (0, _taggedTemplateLiteral2["default"])(["\n        <div id=\"exchange-landing-page\">\n            <div>Landing page</div>\n                Floating Rate  \n            </div>\n        </div>\n        "])));
    }
  }]);
  return ChangenowFloatingRateView;
}((0, _ExchangeNavigationController["default"])(_lit.LitElement));

exports.ChangenowFloatingRateView = ChangenowFloatingRateView;

try {
  customElements.define('changenow-floating-rate-view', ChangenowFloatingRateView);
} catch (error) {// already defined
}