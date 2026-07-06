"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _lit = require("lit");

var _ExchangeNavigationController = _interopRequireDefault(require("../Controllers/ExchangeNavigationController"));

var _templateObject, _templateObject2, _templateObject3;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var ExchangeLandingPage = /*#__PURE__*/function (_ExchangeNavigationCo) {
  (0, _inherits2["default"])(ExchangeLandingPage, _ExchangeNavigationCo);

  var _super = _createSuper(ExchangeLandingPage);

  function ExchangeLandingPage() {
    var _this;

    (0, _classCallCheck2["default"])(this, ExchangeLandingPage);
    _this = _super.call(this);
    _this.clickHandler = _this.clickHandler;
    _this.context = {};
    _this.providerServices = [{
      service_provider: "changenow",
      title: "Exchange Monero for other cryptocurrencies (fixed rate)",
      description: "\n                    Use a fixed rate when you want to avoid the risk of a fluctuating exchange rate. \n                    Due to the inherent risk, fixed rate exchanges have a higher minimum. \n                    With this method of exchange, you are guaranteed to receive the amount you are quoted.",
      navigationType: "internalLink",
      destination: "changenowFixedRateView"
    }, {
      service_provider: "guardarian",
      title: "Buy Monero using fiat currency",
      description: "\n                    No Monero? No problem! Seamlessly purchase Monero using your debit / credit card, and get your purchased Monero automatically paid into your wallet.",
      navigationType: "internalLink",
      destination: "changenowBuyWithFiatView"
    }, {
      service_provider: "localmonero",
      title: "Buy Monero using LocalMonero",
      description: "\n                    LocalMonero is a marketplace that allows you to buy and sell Monero person-to-person. They act as an escrow service, ensuring that deals between buyers and sellers are concluded safely",
      navigationType: "externalUrl",
      destination: "https://localmonero.co?rc=h2t1"
    }];
    return _this;
  }

  (0, _createClass2["default"])(ExchangeLandingPage, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      (0, _get2["default"])((0, _getPrototypeOf2["default"])(ExchangeLandingPage.prototype), "connectedCallback", this).call(this);
      this.renderStyles();
      this.addEventListener('provider-card-clicked', this.handleProviderCardClicked); // const shadow = this.shadowRoot;
      // const childNodes = Array.from(shadow.childNodes);
      // console.log(childNodes);
      // console.log(this);
      // console.log(this.shadowRoot);
      // console.log(this.childNodes);
      // setTimeout(() => {
      //     childNodes.forEach((node, index) => {
      //         // console.log(node);
      //         // console.log(index);
      //         if (typeof(node.id) !== "undefined" && node.id === "exchange-landing-page") {
      //             let cN = node.children;
      //             // console.log("Victory");
      //             // console.log(cN);
      //             Array.from(cN).forEach((childValue, index) => {
      //                 // console.log(childValue);
      //                 if (childValue.nodeName == "PROVIDER-CARD") {
      //                     console.log("Victory 2");
      //                 }
      //                 // console.log("cN AEL")
      //                 childValue.addEventListener('touchstart', (event) => {
      //                     console.log("Touch start");
      //                     console.log(event);
      //                     this.handleAppleClick(event);
      //                 })
      //             });
      //         }
      //     })
      // }, 600);
    }
  }, {
    key: "handleAppleClick",
    value: function handleAppleClick(event) {
      if (event.srcElement.service.navigationType == 'externalUrl') {
        this.openExternal(this.service.destination);
      } else if (event.srcElement.navigationType == 'internalLink') {
        this.navigateToPage(this.service.destination);
      }
    }
  }, {
    key: "handleProviderCardClicked",
    value: function handleProviderCardClicked(event) {
      if (event.detail.navigationType == 'externalUrl') {
        this.openExternal(event.detail.destination);
      } else if (event.detail.navigationType == 'internalLink') {
        this.navigateToPage(event.detail.destination);
      }
    }
  }, {
    key: "openClickableLink",
    value: function openClickableLink(event, context) {
      // We need to determine whether we're invoking this via Electron or via a browser, and adjust accordingly
      var referrer_id = event.srcElement.getAttribute("referrer_id");
      var url = event.srcElement.getAttribute("url");
      var paramStr = event.srcElement.getAttribute("param_str");

      if (typeof this.context.shell !== "undefined") {
        // Electron passes the shell variable as part of context
        if (referrer_id.length > 0) {
          var urlToOpen = url + "?" + paramStr + "=" + referrer_id;
          context.shell.openExternal(urlToOpen);
        } else {
          context.shell.openExternal("https://localmonero.co");
        }
      } else {
        // Web (and Capacitor?) codebase
        if (referrer_id.length > 0) {
          var _urlToOpen = url + "?" + paramStr + "=" + referrer_id;

          window.open(_urlToOpen);
        } else {
          window.open("https://localmonero.co");
        }
      }
    }
  }, {
    key: "openExternal",
    value: function openExternal(url) {
      // Check whether we're on desktop, or web and Android
      if (typeof this.context.shell !== "undefined") {
        // Electron passes the shell variable as part of context            
        this.context.shell.openExternal(url);
      } else {
        // Web (and Capacitor?) codebase            
        window.open(url, "_blank");
      }
    }
  }, {
    key: "handleTouchEvent",
    value: function handleTouchEvent(event) {
      console.log("Handle click event");
      console.log(event);
    }
  }, {
    key: "handleClickEvent",
    value: function handleClickEvent(event) {
      console.log("Handle click event");
      console.log(event);
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var i = 0;
      return (0, _lit.html)(_templateObject || (_templateObject = (0, _taggedTemplateLiteral2["default"])(["\n        <div id=\"exchange-landing-page\">\n            ", "            \n        </div>\n        "])), this.providerServices.map(function (service, index) {
        return (0, _lit.html)(_templateObject2 || (_templateObject2 = (0, _taggedTemplateLiteral2["default"])(["<provider-card .service=", " .context=", " @click=\"", "\"></provider-card>"])), service, _this2.context, _this2.handleClickEvent);
      }));
    }
  }], [{
    key: "styles",
    get: function get() {
      return (0, _lit.css)(_templateObject3 || (_templateObject3 = (0, _taggedTemplateLiteral2["default"])(["\n            #exchange-landing-page {\n                margin-top: 20px;\n                touch-action: manipulation !important;\n            }\n            provider-card {\n                touch-action: manipulation !important;\n            }\n            * {\n                touch-action: none;\n            }\n        "])));
    }
  }, {
    key: "properties",
    get: function get() {
      return {
        context: Object
      };
    }
  }]);
  return ExchangeLandingPage;
}((0, _ExchangeNavigationController["default"])(_lit.LitElement));

exports["default"] = ExchangeLandingPage;

try {
  customElements.define('exchange-landing-page', ExchangeLandingPage);
} catch (error) {// already defined
}