"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

// This file is a copy of lit-html branch's navigation controller. Move this to appropriate component folder once we roll out lit
// NavigationController is a function that takes a superclass as an argument, and mixins the superclass with navigation controller methods
var ExchangeNavigationController = function ExchangeNavigationController(superClass) {
  return /*#__PURE__*/function (_superClass) {
    (0, _inherits2["default"])(_class, _superClass);

    var _super = _createSuper(_class);

    function _class() {
      (0, _classCallCheck2["default"])(this, _class);
      return _super.apply(this, arguments);
    }

    (0, _createClass2["default"])(_class, [{
      key: "navigateToPage",
      value:
      /* class fields & methods to extend superClass with */
      function navigateToPage(destination) {
        var routeMap = {
          "changenowBuyWithFiatView": "changenow-buy-with-fiat-view",
          "changenowFixedRateView": "changenow-fixed-rate-view",
          "changenowFloatingRateView": "changenow-floating-rate-view",
          "landingPageView": "exchange-landing-page"
        }; //console.log("We want to navigate to " + destination)

        var contentView = document.getElementById('exchange-content-container');
        contentView.innerHTML = "";
        var pageElement = document.createElement(routeMap[destination]);
        pageElement.context = this.context;
        contentView.appendChild(pageElement);

        if (destination !== "landingPageView") {
          this.drawBackButton("landingPageView");
        } else {
          var backButtonDiv = document.getElementById("leftBarButtonHolderView");
          backButtonDiv.innerHTML = "";
        }
      }
    }, {
      key: "drawBackButton",
      value: function drawBackButton(destination) {
        var backButtonDiv = document.getElementById("leftBarButtonHolderView"); // Since the backButtonDiv might have an event listener, we clone and replace it to make sure we don't end up with multiple listener

        backButtonDiv.innerHTML = backButtonDiv.cloneNode(true);
        backButtonDiv.innerHTML = '<div class="base-button hoverable-cell utility grey-menu-button disableable left-back-button" style="cursor: default; -webkit-app-region: no-drag; position: absolute; opacity: 1; left: 0px;"></div>';
        var instance = this;
        backButtonDiv.firstChild.addEventListener('click', function (event) {
          //
          instance.navigateToPage(destination);
        });
      }
    }, {
      key: "renderStyles",
      value: function renderStyles() {
        var styleElement = document.getElementById("lit-styles");

        if (styleElement == null) {
          var styles = document.createElement("style");
          styles.innerHTML = "\n\n                #leftBarButtonHolderView, #rightBarButtonHolderView {\n                    z-index: 10;\n                }\n                #navigation-bar-view-sub-wrapper {\n                    display: none;\n                } \n                .exchangeScreen .empty-page-content-container {\n                    transform: translateY(0px) !important;\n                }\n                #exchange-landing-page {\n                    margin: 20px !important;\n                }\n                #exchange-landing-page .exchange-page-panel {\n                    margin: 0 auto !important;\n                }\n                #exchange-landing-page .exchangeScreen {\n\n                }\n                .exchange-page-panel {\n                    position: relative;\n                    margin: 0 auto;\n                    display: table;\n                    border-radius: 5px;\n                    width: 100% !important;\n                    border: none !important;\n                }\n                .exchange-page-panel .exchange-page-content-container {\n                    margin: 20px 0px !important;\n                }\n            ";
          styles.id = "lit-styles";
          var body = document.body;
          body.appendChild(styles);
        }
      }
    }, {
      key: "clearBackButton",
      value: function clearBackButton() {}
    }, {
      key: "handleBackButtonClickEvent",
      value: function handleBackButtonClickEvent() {}
    }, {
      key: "handleBackButtonTouchEvent",
      value: function handleBackButtonTouchEvent() {}
    }, {
      key: "selfNavigate",
      value: function selfNavigate(page) {
        var routeMap = {
          "changenowBuyWithFiatView": "changenow-buy-with-fiat-view",
          "changenowFixedRateView": "changenow-fixed-rate-view",
          "changenowFloatingRateView": "changenow-floating-rate-view"
        };
        var contentView = document.querySelector('content-view');
        contentView.innerHTML = "";
        var pageElement = document.createElement(routeMap[page]);
        pageElement.context = this.context;
        contentView.appendChild(pageElement);
      }
    }]);
    return _class;
  }(superClass);
};

module.exports = ExchangeNavigationController;