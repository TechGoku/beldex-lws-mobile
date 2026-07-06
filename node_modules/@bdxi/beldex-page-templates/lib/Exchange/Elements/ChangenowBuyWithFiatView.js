"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ChangenowBuyWithFiatView = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

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

var ChangenowBuyWithFiatView = /*#__PURE__*/function (_ExchangeNavigationCo) {
  (0, _inherits2["default"])(ChangenowBuyWithFiatView, _ExchangeNavigationCo);

  var _super = _createSuper(ChangenowBuyWithFiatView);

  function ChangenowBuyWithFiatView() {
    var _this;

    (0, _classCallCheck2["default"])(this, ChangenowBuyWithFiatView);
    _this = _super.call(this);
    _this.context = {};
    _this.displayLoadingScreen = false;
    _this.displayEstimateRetrieval = false;
    _this.displayOrderScreen = false;
    _this.displayConfirmationScreen = false;
    _this.displayCurrencyLoadingIndicator = true;
    _this.displayPurchaseButton = true;
    _this.errorString = false;
    _this.clickHandler = _this.clickHandler;
    _this.estimateDetails = {
      convertedAmount: "",
      expected_to_amount: "",
      estimatedExchangeRate: "",
      estimatedExchangeRateString: "",
      id: "",
      initial_from_currency: "",
      initial_expected_from_amount: "",
      networkFee: "",
      redirected_amount: "",
      serviceFees: "",
      serviceFeeString: "",
      bankFeeString: "",
      to_currency: "",
      networkFeeString: ""
    };
    _this.estimatedFiatRange = {};
    _this.estimatedFiatRangeString = "";
    _this.estimatedCryptoRangeString = "";
    _this.estimatedCryptoRange = {};
    _this.fiatMinMaxString = "";
    _this.inCurrencyCode = "EUR";
    _this.inCurrencyName = "Euro";
    _this.inCurrencyValue = "200";
    _this.outCurrencyCode = "XMR";
    _this.outCurrencyName = "Monero";
    _this.outCurrencyValue = "";
    _this.estimateUsingFiat = true;
    _this.outCurrencyValue = "";
    _this.redirectUrl = "";
    _this.fiatCurrencies = [{
      "block_explorer_url_mask": null,
      "currency_type": "FIAT",
      "default_exchange_value": "300",
      "enabled": true,
      "has_external_id": false,
      "id": "4881817401",
      "is_available": null,
      "is_featured": null,
      "is_stable": null,
      "logo_url": "",
      "name": "",
      "networks": [],
      "ticker": ""
    }];
    _this.selectedFiatCurrency = "EUR"; //this.setScreenTitle("Buy Monero With Fiat");

    _this.wallets = [{}];
    return _this;
  }

  (0, _createClass2["default"])(ChangenowBuyWithFiatView, [{
    key: "updateSelectedCurrency",
    value: // This function listens for a custom event dispatched from the select box. 
    // It uses the details to update the desired currency
    function () {
      var _updateSelectedCurrency = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(event) {
        var _this2 = this;

        var prepopulatedCurrencyValueExists, rangeQueryArray, _yield$Promise$all$ca, _yield$Promise$all$ca2, estimatedFiatRange, formatOptions, currencyFormatter;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.clearEstimate();
                prepopulatedCurrencyValueExists = false; // Handle case where the user has input the amount already

                if (this.inCurrencyCode !== "---" && this.inCurrencyValue.length > 0) {
                  prepopulatedCurrencyValueExists = true;
                }

                this.fiatMinMaxString = "";
                this.inCurrencyCode = event.detail.selectValue;
                this.inCurrencyName = event.detail.selectText;
                this.displayMinMaxLoadingIndicator = true;

                if (prepopulatedCurrencyValueExists) {
                  this.handleCurrencyInputResponse();
                }

                rangeQueryArray = [this.fiatApi.getMinMaxRange(this.inCurrencyCode, "XMR")];
                _context.next = 11;
                return Promise.all(rangeQueryArray)["catch"](function (error) {
                  // console.error(error);
                  // console.error(error.message);
                  _this2.fiatMinMaxString = "There was an error retrieving the minimum and maximum values for the specified currency";
                });

              case 11:
                _yield$Promise$all$ca = _context.sent;
                _yield$Promise$all$ca2 = (0, _slicedToArray2["default"])(_yield$Promise$all$ca, 1);
                estimatedFiatRange = _yield$Promise$all$ca2[0];
                this.displayMinMaxLoadingIndicator = false;
                this.estimatedFiatRange = estimatedFiatRange; //this.estimatedCryptoRange = estimatedCryptoRange;
                //this.estimatedCryptoRangeString = `${estimatedCryptoRange.min} - ${estimatedCryptoRange.max}`

                formatOptions = {
                  style: 'currency',
                  currency: this.inCurrencyCode
                };
                currencyFormatter = new Intl.NumberFormat(undefined, formatOptions);
                this.estimatedFiatRange.min = currencyFormatter.format(estimatedFiatRange.min);
                this.estimatedFiatRange.max = currencyFormatter.format(estimatedFiatRange.max);
                this.estimatedFiatRangeString = "".concat(this.estimatedFiatRange.min, " - ").concat(this.estimatedFiatRange.max);
                this.fiatMinMaxString = "You can exchange between ".concat(estimatedFiatRange.min, " ").concat(this.inCurrencyCode, " and ").concat(estimatedFiatRange.max, " ").concat(this.inCurrencyCode);

              case 22:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function updateSelectedCurrency(_x) {
        return _updateSelectedCurrency.apply(this, arguments);
      }

      return updateSelectedCurrency;
    }()
    /**
     * This function initialises the selected currency and the input value
     */

  }, {
    key: "initSelectedCurrency",
    value: function () {
      var _initSelectedCurrency = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var _this3 = this;

        var rangeQueryArray, _yield$Promise$all$ca3, _yield$Promise$all$ca4, estimatedFiatRange, formatOptions, currencyFormatter;

        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                this.fiatMinMaxString = "Busy loading minimum and maximum values for Euro";
                this.inCurrencyCode = "EUR";
                this.inCurrencyName = "Euro";
                this.displayMinMaxLoadingIndicator = false;
                rangeQueryArray = [this.fiatApi.getMinMaxRange(this.inCurrencyCode, "XMR")];
                _context2.next = 7;
                return Promise.all(rangeQueryArray)["catch"](function (error) {
                  // console.error(error);
                  // console.error(error.message);
                  _this3.fiatMinMaxString = "There was an error retrieving the minimum and maximum values for the specified currency";
                });

              case 7:
                _yield$Promise$all$ca3 = _context2.sent;
                _yield$Promise$all$ca4 = (0, _slicedToArray2["default"])(_yield$Promise$all$ca3, 1);
                estimatedFiatRange = _yield$Promise$all$ca4[0];
                this.displayMinMaxLoadingIndicator = false;
                this.estimatedFiatRange = estimatedFiatRange; // this.estimatedCryptoRange = estimatedCryptoRange;
                // this.estimatedCryptoRangeString = `${estimatedCryptoRange.min} - ${estimatedCryptoRange.max}`

                formatOptions = {
                  style: 'currency',
                  currency: this.inCurrencyCode
                };
                currencyFormatter = new Intl.NumberFormat(undefined, formatOptions);
                this.estimatedFiatRange.min = currencyFormatter.format(estimatedFiatRange.min);
                this.estimatedFiatRange.max = currencyFormatter.format(estimatedFiatRange.max);
                this.estimatedFiatRangeString = "".concat(this.estimatedFiatRange.min, " - ").concat(this.estimatedFiatRange.max);
                this.fiatMinMaxString = "You can exchange between ".concat(estimatedFiatRange.min, " ").concat(this.inCurrencyCode, " and ").concat(estimatedFiatRange.max, " ").concat(this.inCurrencyCode);

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function initSelectedCurrency() {
        return _initSelectedCurrency.apply(this, arguments);
      }

      return initSelectedCurrency;
    }()
  }, {
    key: "fireEstimateEvent",
    value: function () {
      var _fireEstimateEvent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3(event) {
        var options, estimatePostEvent, estimateResponse, estimateDetails, serviceFees;
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                options = {
                  detail: {},
                  bubbles: true,
                  composed: true
                };
                estimatePostEvent = new CustomEvent("fire-estimate-event", options);
                this.dispatchEvent(estimatePostEvent, options);
                _context3.next = 5;
                return this.fiatApi.createExchangeTransaction(this.inCurrencyValue, this.inCurrencyCode, "XMR", this.selectedWallet.public_address);

              case 5:
                estimateResponse = _context3.sent;
                // todo -- service fee can be array of multiple fees -- bank fee not always charged
                estimateDetails = {
                  convertedAmount: estimateResponse.convertedAmount,
                  expected_to_amount: estimateResponse.expected_to_amount,
                  estimatedExchangeRate: estimateResponse.estimate_breakdown.estimatedExchangeRate,
                  estimatedExchangeRateString: estimateResponse.estimate_breakdown.estimatedExchangeRate + " " + estimateResponse.to_currency,
                  id: estimateResponse.id,
                  initial_from_currency: estimateResponse.initial_from_currency,
                  initial_expected_from_amount: estimateResponse.expected_from_amount,
                  networkFee: estimateResponse.estimate_breakdown.networkFee,
                  redirected_amount: estimateResponse.redirected_amount,
                  serviceFees: estimateResponse.estimate_breakdown.serviceFees,
                  serviceFeeString: "N/A",
                  bankFeeString: "N/A",
                  to_currency: estimateResponse.to_currency,
                  networkFeeString: estimateResponse.estimate_breakdown.networkFee.amount + " " + estimateResponse.estimate_breakdown.networkFee.currency
                };
                serviceFees = estimateResponse.serviceFees;
                estimateResponse.estimate_breakdown.serviceFees.forEach(function (fee) {
                  if (fee.name.toUpperCase() === "BANK FEE") {
                    estimateDetails.bankFeeString = fee.amount + " " + fee.currency;
                  } else if (fee.name.toUpperCase() == "SERVICE FEE") {
                    estimateDetails.serviceFeeString = fee.amount + " " + fee.currency;
                  }
                });
                this.redirectUrl = estimateResponse.redirect_url;
                this.estimateDetails = estimateDetails;

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function fireEstimateEvent(_x2) {
        return _fireEstimateEvent.apply(this, arguments);
      }

      return fireEstimateEvent;
    }()
  }, {
    key: "redirectToURL",
    value: function () {
      var _redirectToURL = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
        var estimateResponse;
        return _regenerator["default"].wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                this.displayPurchaseButton = false;
                this.displayPurchaseRedirectIndicator = true;
                _context4.prev = 2;
                _context4.next = 5;
                return this.fiatApi.createExchangeTransaction(this.inCurrencyValue, this.inCurrencyCode, "XMR", this.selectedWallet.public_address);

              case 5:
                estimateResponse = _context4.sent;
                this.openExternal(estimateResponse.redirect_url);
                this.displayPurchaseRedirectIndicator = false;
                _context4.next = 14;
                break;

              case 10:
                _context4.prev = 10;
                _context4.t0 = _context4["catch"](2);
                console.error("Failure with redirect"); // Error communicating with server to retrieve response -- show error

                this.errorString = _context4.t0.message;

              case 14:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[2, 10]]);
      }));

      function redirectToURL() {
        return _redirectToURL.apply(this, arguments);
      }

      return redirectToURL;
    }()
  }, {
    key: "openExternal",
    value: function () {
      var _openExternal = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5(url) {
        return _regenerator["default"].wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (!(typeof this.context.shell !== "undefined")) {
                  _context5.next = 4;
                  break;
                }

                // Electron passes the shell variable as part of context            
                this.context.shell.openExternal(url);
                _context5.next = 10;
                break;

              case 4:
                if (!(typeof this.context.deviceInfo !== "undefined" && this.context.deviceInfo.platform == "ios")) {
                  _context5.next = 9;
                  break;
                }

                _context5.next = 7;
                return this.context.capacitorBrowser.open({
                  url: url
                });

              case 7:
                _context5.next = 10;
                break;

              case 9:
                // Web and Android Capacitor codebase            
                window.open(url, "_blank");

              case 10:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function openExternal(_x3) {
        return _openExternal.apply(this, arguments);
      }

      return openExternal;
    }()
  }, {
    key: "renderStyles",
    value: function renderStyles() {
      // These styles are necessary in instances where we have a top-right action button
      var styleElement = document.getElementById("lit-styles");

      if (styleElement === null) {
        var styles = document.createElement("style");
        styles.innerHTML = "\n                #stack-view-stage-view {\n                    z-index: 21 !important;\n                }\n                #leftBarButtonHolderView {\n                    z-index: 10;\n                }\n                #rightBarButtonHolderView {\n                    display: none;\n                }\n                #navigation-bar-view-sub-wrapper {\n                    display: none;\n                } \n                changenow-buy-with-fiat-view {\n                    z-index: 50;\n                }\n            ";
        styles.id = "lit-styles";
        var navigationView = document.getElementById("NavigationBarView");
        navigationView.appendChild(styles);
      }
    }
  }, {
    key: "updateSelectedWallet",
    value: function updateSelectedWallet(event) {
      // Updates wallet on primary form 
      this.selectedWallet = event.detail.wallet;
      this.displayEnterCurrencyPrompt = false;
    }
  }, {
    key: "connectedCallback",
    value: function () {
      var _connectedCallback = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
        var apiIsAvailable, enabledCurrencies, fiatCurrencies, i, hasValidPaymentMethod, paymentMethodArray, j;
        return _regenerator["default"].wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                (0, _get2["default"])((0, _getPrototypeOf2["default"])(ChangenowBuyWithFiatView.prototype), "connectedCallback", this).call(this);
                this.renderStyles();
                this.fiatApi = fiatApi;
                this.wallets = this.context.walletsListController.records; //this.initSelectedCurrency.bind(this);

                this.updateSelectedCurrency.bind(this);
                this.handleCurrencyInputResponse();
                this.addEventListener('searchable-select-update', this.updateSelectedCurrency);
                this.addEventListener('wallet-selector-update', this.updateSelectedWallet);
                this.displayLoadingScreen = true;
                this.displayOrderScreen = true;
                this.displayMinMaxLoadingIndicator = true;
                _context6.next = 13;
                return this.checkAPIIsAvailable();

              case 13:
                apiIsAvailable = _context6.sent;
                enabledCurrencies = [];
                this.initSelectedCurrency();

                if (!apiIsAvailable) {
                  _context6.next = 36;
                  break;
                }

                this.displayLoadingScreen = false;
                this.displayOrderScreen = true;
                _context6.prev = 19;
                _context6.next = 22;
                return this.fiatApi.getAvailableFiatCurrencies();

              case 22:
                fiatCurrencies = _context6.sent;

                for (i = 0; i < fiatCurrencies.length; i++) {
                  hasValidPaymentMethod = false;
                  paymentMethodArray = fiatCurrencies[i].networks[0].payment_methods;

                  for (j = 0; j < paymentMethodArray.length; j++) {
                    if (paymentMethodArray[j].deposit_enabled === true) {
                      hasValidPaymentMethod = true;
                    }
                  }

                  if (hasValidPaymentMethod) {
                    enabledCurrencies.push(fiatCurrencies[i]);
                  }
                }

                this.fiatCurrencies = enabledCurrencies;
                this.requestUpdate(); // TODO: Check if this is necessary
                //this.displayLoadingScreen = false;

                this.displayCurrencyLoadingIndicator = false;
                this.displayOrderScreen = true;
                _context6.next = 34;
                break;

              case 30:
                _context6.prev = 30;
                _context6.t0 = _context6["catch"](19);
                this.displayErrorResponse = true;
                this.displayErrorString = _context6.t0.message;

              case 34:
                _context6.next = 37;
                break;

              case 36:
                console.error("Our exchange partner is temporarily unavailable. Please try again later.");

              case 37:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[19, 30]]);
      }));

      function connectedCallback() {
        return _connectedCallback.apply(this, arguments);
      }

      return connectedCallback;
    }() // Returns true when API is available.
    // Returns false when API is unavailable
    // Throws errors in any other scenario

  }, {
    key: "checkAPIIsAvailable",
    value: function () {
      var _checkAPIIsAvailable = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
        var response;
        return _regenerator["default"].wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.prev = 0;
                _context7.next = 3;
                return this.fiatApi.getFiatAPIStatus();

              case 3:
                response = _context7.sent;

                if (!(response.message == "OK")) {
                  _context7.next = 8;
                  break;
                }

                return _context7.abrupt("return", true);

              case 8:
                return _context7.abrupt("return", false);

              case 9:
                _context7.next = 14;
                break;

              case 11:
                _context7.prev = 11;
                _context7.t0 = _context7["catch"](0);
                // TODO: build out better error handling
                console.error("API not available -- network error or unexpected error or ChangeNow response object's format changed");

              case 14:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this, [[0, 11]]);
      }));

      function checkAPIIsAvailable() {
        return _checkAPIIsAvailable.apply(this, arguments);
      }

      return checkAPIIsAvailable;
    }()
  }, {
    key: "getTransactionEstimate",
    value: function () {
      var _getTransactionEstimate = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
        var response;
        return _regenerator["default"].wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.prev = 0;
                _context8.next = 3;
                return this.fiatApi.getTransactionEstimate();

              case 3:
                response = _context8.sent;

                if (!(response.message == "OK")) {
                  _context8.next = 8;
                  break;
                }

                return _context8.abrupt("return", true);

              case 8:
                return _context8.abrupt("return", false);

              case 9:
                _context8.next = 14;
                break;

              case 11:
                _context8.prev = 11;
                _context8.t0 = _context8["catch"](0);
                // TODO: build out better error handling
                console.error("API not available -- network error or unexpected error or ChangeNow response object's format changed");

              case 14:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this, [[0, 11]]);
      }));

      function getTransactionEstimate() {
        return _getTransactionEstimate.apply(this, arguments);
      }

      return getTransactionEstimate;
    }()
  }, {
    key: "clearEstimate",
    value: function clearEstimate() {
      // We cannot unset the keys on this object because rendering depends on it
      this.displayPurchaseButton = true;
      this.estimateDetails = {
        convertedAmount: "",
        expected_to_amount: "",
        estimatedExchangeRate: "",
        estimatedExchangeRateString: "",
        id: "",
        initial_from_currency: "",
        initial_expected_from_amount: "",
        networkFee: "",
        redirected_amount: "",
        serviceFees: "",
        serviceFeeString: "",
        bankFeeString: "",
        to_currency: "",
        networkFeeString: ""
      };
    }
  }, {
    key: "handleCurrencyInput",
    value: function handleCurrencyInput(event) {
      var _this4 = this;

      this.clearEstimate();
      var eventPath = event.path || event.composedPath && event.composedPath();

      if (eventPath[0].id == "inCurrencyValue") {
        this.inCurrencyValue = eventPath[0].value;
      } else if (eventPath[0].id == "outCurrencyValue") {
        this.outCurrencyValue = eventPath[0].value;
      }

      if (this.estimateRequestTimer !== 'undefined') {
        clearTimeout(this.estimateRequestTimer);
      }

      this.estimateRequestTimer = setTimeout(function () {
        if (_this4.inCurrencyCode.length > 0) {
          // TODO: Put this into standalone function 
          _this4.handleCurrencyInputResponse();
        } else {
          _this4.displayEnterCurrencyPrompt = true;
        }
      }, 2000);
    }
  }, {
    key: "handleCurrencyInputResponse",
    value: function () {
      var _handleCurrencyInputResponse = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9() {
        var response, estimateDetails;
        return _regenerator["default"].wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                this.displayEstimateRetrieval = true;
                this.displayErrorResponse = false;
                _context9.prev = 2;
                _context9.next = 5;
                return this.fiatApi.getTransactionEstimate(this.inCurrencyValue, this.inCurrencyCode, "XMR");

              case 5:
                response = _context9.sent;
                estimateDetails = {};
                estimateDetails.convertedAmount = response.converted_amount.amount; //estimateDetails.expected_to_amount = response.expected_to_amount;

                estimateDetails.estimatedExchangeRate = response.estimated_exchange_rate;
                estimateDetails.estimatedExchangeRateString = response.estimated_exchange_rate + " " + response.to_currency; //estimateDetails.id = response.id;

                estimateDetails.initial_from_currency = response.from_currency;
                estimateDetails.initial_expected_from_amount = this.inCurrencyValue;
                estimateDetails.networkFee = response.network_fee.amount; //estimateDetails.redirected_amount = response.redirected_amount;

                estimateDetails.serviceFees = response.service_fees;
                estimateDetails.to_currency = response.to_currency; //this.outCurrencyValue = response.value;

                estimateDetails.expected_to_amount = response.value;
                estimateDetails.networkFeeString = response.network_fee.amount + " " + response.network_fee.currency;
                estimateDetails.serviceFeeString = "N/A";
                estimateDetails.bankFeeString = "N/A";
                response.service_fees.forEach(function (fee) {
                  if (fee.name.toUpperCase() === "BANK FEE") {
                    estimateDetails.bankFeeString = fee.amount + " " + fee.currency;
                  } else if (fee.name.toUpperCase() == "SERVICE FEE") {
                    estimateDetails.serviceFeeString = fee.amount + " " + fee.currency;
                  }
                });
                this.estimateDetails = estimateDetails;
                _context9.next = 28;
                break;

              case 23:
                _context9.prev = 23;
                _context9.t0 = _context9["catch"](2);
                console.error(_context9.t0, _context9.t0.message);

                if (_context9.t0.isAxiosError && (0, _typeof2["default"])(_context9.t0.response.data) === "object" && typeof _context9.t0.response.data.message === "string") {
                  this.errorString = _context9.t0.response.data.message;
                } else {
                  this.errorString = _context9.t0.message;
                }

                this.displayErrorResponse = true;

              case 28:
                this.displayEstimateRetrieval = false;

              case 29:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this, [[2, 23]]);
      }));

      function handleCurrencyInputResponse() {
        return _handleCurrencyInputResponse.apply(this, arguments);
      }

      return handleCurrencyInputResponse;
    }() // NB: Thoroughly test this code on Android

  }, {
    key: "createRenderRoot",
    value: function createRenderRoot() {
      var _this5 = this;

      var root = (0, _get2["default"])((0, _getPrototypeOf2["default"])(ChangenowBuyWithFiatView.prototype), "createRenderRoot", this).call(this);
      root.addEventListener('click', function (event) {
        console.log('click from WS');
        _this5.shadowName = event.target.localName; //event.target.click();

        if (event.target.localName === 'searchable-select') {}
      });
      root.addEventListener('touchend', function (event) {
        if (event.target.localName == "input") {
          event.target.focus();
        } else {
          var inputs = _this5.querySelectorAll("input");

          inputs.forEach(function (input) {
            input.blur();
          });
        }

        if (event.target.id == "confirmation-button") {
          _this5.redirectToURL();
        }
      });
      return root;
    }
  }, {
    key: "render",
    value: function render() {
      // We're going to use conditionals and classes to determine which elements to hide
      return (0, _lit.html)(_templateObject || (_templateObject = (0, _taggedTemplateLiteral2["default"])(["\n        <div id=\"changenow-buy-with-fiat\">\n            <div class=\"submit-button-wrapper\">\n                &nbsp;\n            </div>\n            <div class=\"content-container empty-page-content-container\">\n                <buy-with-fiat-loading-screen-changenow ?hidden=", "></buy-with-fiat-loading-screen-changenow>\n                <div ?hidden=", ">\n                    <div class=\"exchangeScreen exchange-page-panel\">\n                        <div class=\"content-container exchange-page-content-container\" id=\"orderForm\">\n                        <div class=\"form_field wallet-select-wrapper\">\n                            <wallet-selector .wallets=", "></wallet-selector>\n                        </div>\n                        <div class=\"form_field\" id=\"currency-table\">\n                            <table class=\"full-width\">\n                                <tbody><tr>\n                                    <td>   \n                                        <div class=\"field_title form-field-title\">", " \n                                            <div style=\"position: relative; left: 0px; top: 0px; padding: 2px 0 0 0;\">\n                                                <span class=\"field_title form-field-title label-spacing\" style=\"margin-top: 0px;\">AMOUNT</span>\n                                                <input id=\"inCurrencyValue\" \n                                                    @input=", " \n                                                    class=\"textInput currencyInput\" \n                                                    type=\"text\" \n                                                    .placeholder=", " \n                                                    .value=", ">\n                                                <div id=\"inCurrencySelector\">\n                                                    <searchable-select .values=", "></searchable-select>\n                                                    <!-- <select id=\"inCurrencySelectList\" class=\"currencySelect\">\n                                                        <option value=\"XMR\">XMR</option>\n                                                    </select> -->\n                                                </div>\n                                            </div>\n                                            <div id=\"transaction-range\">\n                                                <span id=\"transaction-range\" class=\"field_title form-field-title\">", "</span>\n                                                <div id=\"currency-loader\">\n                                                    <!-- <activity-indicator .loadingText=", " ?hidden=", "></activity-indicator> -->\n                                                    <activity-indicator .loadingText=", " ?hidden=", "></activity-indicator>\n                                                    <activity-indicator .loadingText=", " ?hidden=", "></activity-indicator>\n                                                    <div id=\"errorResponse\" ?hidden=", ">\n                                                        <span id=\"errorResponseText\" class=\"form-field-title\">\n                                                            ", "\n                                                        </span>\n                                                    </div>\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </td>\n                                    <td>\n                                        <!--\n                                        <div id=\"inInputDiv\" class=\"field_title form-field-title\"><span id=\"outCurrencyTickerCode\">XMR</span> you will receive\n                                            <div class=\"\" style=\"position: relative; left: 0px; top: 0px; padding: 2px 0 0 0\">\n                                                <span class=\"field_title form-field-title label-spacing\" style=\"margin-top: 0px;\">AMOUNT</span>\n                                                <span id=\"outCurrencyValue\">", "</span>\n                                                <!-- CN API doesn't support getting a fiat value to pay from a crypto amount yet\n                                                    <input id=\"outCurrencyValue\" \n                                                    @input=", " \n                                                    class=\"textInput currencyInput\" \n                                                    type=\"text\" \n                                                    .placeholder=", " \n                                                    .value=", "> \n                                                <div id=\"outCurrencySelector\">\n                                                    <select id=\"outCurrencySelectList\" class=\"currencySelect\">\n                                                        <option value=\"XMR\">XMR</option>\n                                                    </select>\n                                                </div>\n                                                <div class=\"selectIndicator\" style=\"right: 12px; top: 33px;\"></div>\n                                            </div>\n                                        </div>\n                                        -->\n                                    </td>\n    </tr>\n                            </tbody></table>\n                        </div>\n\n            \n                        <div class=\"form_field\" id=\"getOfferLoader\">\n            </div>\n            <div class=\"form_field\" id=\"estimate-details\">\n                <!-- {\"id\":\"4900188772\",\"status\":\"new\",\"email\":null,\"errors\":[],\"status_details\":null,\"from_currency\":\"GBP\",\"initial_from_currency\":\"GBP\",\"from_network\":null,\"from_currency_with_network\":null,\"from_amount\":\"0\",\"deposit_type\":\"VISA_MC1\",\"payout_type\":\"CRYPTO_THROUGH_CN\",\"expected_from_amount\":\"75.5555\",\"initial_expected_from_amount\":\"75.5555\",\"to_currency\":\"XMR\",\"to_network\":null,\"to_currency_with_network\":null,\"to_amount\":null,\"output_hash\":null,\"expected_to_amount\":\"0.3075642\",\"location\":\"ZA\",\"created_at\":\"2021-09-03T09:13:04.822Z\",\"updated_at\":\"2021-09-03T09:13:04.822Z\",\"partner_id\":\"5833338174\",\"external_partner_link_id\":null,\"estimate_breakdown\":{\"toAmount\":\"0.3075642\",\"fromAmount\":75.5555,\"serviceFees\":[{\"name\":\"Bank fee\",\"amount\":\"3.02222\",\"currency\":\"GBP\"},{\"name\":\"Service fee\",\"amount\":\"2.25\",\"currency\":\"GBP\"}],\"convertedAmount\":{\"amount\":\"70.28328\",\"currency\":\"GBP\"},\"estimatedExchangeRate\":\"0.00437606\",\"networkFee\":{\"amount\":\"0.001\",\"currency\":\"XMR\"}},\"payout\":{\"address\":\"47joJKcNWs66f6ein9qTTVFyzeGnmBEGWKomSuMmqwaBYGj7gv2RvFRRUy1xtzpn6qE8BBpDnuFbp44qe9X1XmK78vqXaij\",\"extra_id\":\"1\"},\"redirect_url\":\"https://payments.guardarian.com/checkout?tid=4900188772\"} -->\n                <div class=\"estimate-wrapper\" ?hidden=", ">\n                    <div class=\"estimate-row even-row\">\n                        <div class=\"estimate-label\">You send</div>\n                        <div class=\"estimate-value\">\n                            ", " ", "\n                        </div>\n                    </div>\n                    <div class=\"estimate-row odd-row\">\n                        <div class=\"estimate-label\">Bank Fee</div>\n                        <div class=\"estimate-value\">", "</div>\n                    </div>\n                    <div class=\"estimate-row even-row\">\n                        <div class=\"estimate-label\">Service Fee</div>\n                        <div class=\"estimate-value\">", "</div>\n                    </div>\n                    <div class=\"estimate-row odd-row\">\n                        <div class=\"estimate-label\">Network Fee</div>\n                        <div class=\"estimate-value\">", "</div>\n                    </div>\n                    <div class=\"estimate-row even-row\">\n                        <div class=\"estimate-label\">Estimated Rate</div>\n                        <div class=\"estimate-value\">", "</div>\n                    </div>\n                    <div class=\"estimate-row odd-row\">\n                        <div class=\"estimate-label\">You receive </div>\n                        <div class=\"estimate-value\">~ ", " XMR</div>    \n                    </div>\n                    <div class=\"estimate-row even-row\">\n                        <div class=\"estimate-label\"></div>\n                        <div class=\"estimate-value\">\n                            <a @click=", " ?hidden=", " class=\"confirmation-button\" id=\"confirmation-button\">Buy XMR</a>\n                            <activity-indicator .loadingText=", " ?hidden=", "></activity-indicator>\n                        </div>    \n                    </div>\n                    <div class=\"estimate-row odd-row\">\n                        <div class=\"estimate-label\"></div>\n                        <div class=\"estimate-value\">* Please note that this is an estimate, and that your final rate may differ. The exchange and the quoted rate are controlled by our third-party partner.</div>    \n                    </div>\n                </div>\n            </div>\n                \n        <style>\n        #addressValidationLoader {\n            float: left;\n            // min-height: 28px;\n\n        }\n        #addressValidationLoader .loader {\n            float: left;\n        }\n        #addressValidationLoaderText {\n            float: left;\n        }\n        .exchange-cross {\n            color: #d80000;\n            font-size: 18px;\n            position: relative;\n            top: 2px;\n        }\n        .exchange-tick {\n            color: #00CD00;\n            font-size: 18px;\n            position: relative;\n            top: 2px;\n        }\n        #addressValidationLoader div { \n            // display: none; \n        }\n        #addressValidationLoader {\n            padding: 0px 24px 0 0;\n            display: none;\n        }\n        \n        </style>\n\n            </div>\n        </div>\n                \n        </div>\n    </div>\n                </div></div></div>\n            </div>\n        </div>\n        "])), !this.displayLoadingScreen, !this.displayOrderScreen, this.wallets, this.inCurrencyName.length == 0 ? "Please select a currency" : this.inCurrencyName + " you will pay", this.handleCurrencyInput, this.estimatedFiatRangeString.length > 0 ? this.estimatedFiatRangeString : "00.00", this.inCurrencyValue, this.fiatCurrencies, this.fiatMinMaxString, "Loading supported currencies", !this.displayCurrencyLoadingIndicator, "Retrieving minimum and maximum transaction amount limits", !this.displayMinMaxLoadingIndicator, "Busy retrieving estimate", !this.displayEstimateRetrieval, !this.displayErrorResponse, this.errorString, this.outCurrencyValue, this.handleCurrencyInput, this.estimatedCryptoRangeString.length > 0 ? this.estimatedCryptoRangeString : "00.00", this.outCurrencyValue, Object.keys(this.estimateDetails).length > 0 && Object.keys(this.estimateDetails.expected_to_amount).length == 0, this.estimateDetails.initial_expected_from_amount, this.estimateDetails.initial_from_currency, this.estimateDetails.bankFeeString, this.estimateDetails.serviceFeeString, this.estimateDetails.networkFeeString, this.estimateDetails.estimatedExchangeRateString, this.estimateDetails.expected_to_amount, this.redirectToURL, !this.displayPurchaseButton, "Busy finalising estimate and redirecting you to our partner", !this.displayPurchaseRedirectIndicator);
    }
  }], [{
    key: "styles",
    get: function get() {
      return (0, _lit.css)(_templateObject2 || (_templateObject2 = (0, _taggedTemplateLiteral2["default"])(["\n        #changenow-buy-with-fiat {\n            margin: 20px;\n        }\n        .submit-button-wrapper {\n            position: fixed;\n            top: -45px;\n            right: 16px;\n            width: 15%;\n            min-width: 41px;\n            height: 41px;\n            z-index: 12;\n        }\n        .submit-button {\n            z-index: 13;\n            position: fixed;\n            right: 16px;\n            font-weight: bold;\n            top: -40px;\n            z-index: 10000;\n        }\n        .exchange-screen-panel {\n            margin: 15px;\n        }\n        .submit-button, .confirmation-button {\n            cursor: default;\n            border-radius: 3px;\n            height: 24px;\n            font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n            text-align: center;\n            border: none;\n            text-decoration: none;\n            line-height: 24px;\n            box-sizing: border-box;\n            width: auto;\n            padding: 0px 8px;\n            background-color: rgb(0, 198, 255);\n            box-shadow: rgb(22 20 22) 0px 0.5px 1px 0px, rgb(255 255 255 / 20%) 0px 0.5px 0px 0px inset;\n            color: rgb(22, 20, 22);\n            -webkit-font-smoothing: subpixel-antialiased;\n            font-size: 12px;\n            font-weight: bold;\n            letter-spacing: 0.5px;\n            float: right;\n            margin-top: 5px;\n            -webkit-app-region: no-drag;\n        }\n        \n        .hidden {\n            display: none !important;\n        }\n        .form-field-title {\n            max-width: 100%;\n            margin: 15px 0 8px 0;\n            user-select: none;\n            display: block;\n            text-align: left;\n            color: #F8F7F8;\n            font-family: Native-Light, input, menlo, monospace;\n            -webkit-font-smoothing: subpixel-antialiased;\n            font-size: 10px;\n            letter-spacing: 0.5px;\n            font-weight: 300;\n        }\n        div#currency-table {\n            padding: 0;\n        }\n        .full-width {\n            width: 100% !important;\n        }\n        #getOfferLoader {\n            float: left;\n            // min-height: 28px;\n            padding: 0px 24px 0 0;\n            display: none;\n        }\n        #getOffer {\n            font-family: Native-Light, input, menlo, monospace;\n            -webkit-font-smoothing: subpixel-antialiased;\n            font-size: 10px;\n            letter-spacing: 0.5px;\n            font-weight: 300;\n            color: rgb(158, 156, 158);\n            padding-left: 0px;\n        }\n        .activityIndicators.graphicAndLabel > div.loader {\n            display: inline-block;\n            position: relative;\n            top: 0px;\n        }\n        .activityIndicators.on-normal-background .loader > .block {\n            background-color: #383638;\n            animation: block-animate-normal-bg .75s infinite ease-in-out;\n        }\n        .activityIndicators .loader > .block1 {\n            animation-delay: -1.2s !important;\n        }\n        .activityIndicators .loader > .block2 {\n            animation-delay: -1.0s !important;\n        }\n        .activityIndicators .loader > .block3 {\n            animation-delay: -0.8s !important;\n        }\n        #tx-fee {\n            float: right;\n            padding: 0px 13px 7px 6px;\n        }\n        #minimum-fee-text, #tx-fee, #addressValidationLoaderText {\n            font-size: 10px;\n        }\n        #btc-address {\n            clear: both;\n            padding: 0px 13px 7px 0px;\n        }\n        #addressValidationLoader {\n            font-family: Native-Light, input, menlo, monospace;\n            -webkit-font-smoothing: subpixel-antialiased;\n            font-size: 10px;\n            letter-spacing: 0.5px;\n            font-weight: 300;\n            color: rgb(158, 156, 158);\n            padding-left: 0px;\n            padding: 0px 24px 0 0;\n            display: none;\n        }\n        #addressValidationLoader .loader {\n            float: left;\n        }\n        #addressValidationLoaderText {\n            float: left;\n            font-size: 10px;\n        }\n        .activityIndicators.graphicAndLabel > span {\n            display: inline-block;\n        }\n        #validation-messages, #address-messages, #server-messages {\n            max-width: fit-content;\n        }\n        .currencySelect {\n            right: 5px;\n            left: auto;\n        }\n        .currencySelect {\n            font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n            -webkit-font-smoothing: subpixel-antialiased;\n            font-size: 11px;\n            font-weight: 400;\n            letter-spacing: 0.5px;\n            text-indent: 10px;\n            color: rgb(223, 222, 223);\n            background-color: rgba(80, 74, 80, 0.55);\n            position: absolute;\n            left: 117.5px;\n            width: 56px;\n            height: 29.5px;\n            border: 0px;\n            padding: 0px;\n            border-radius: 0px 4px 4px 0px;\n            -webkit-appearance: none;\n            top: 24px;\n        }\n        #minimum-fee {\n            float: right;\n        }\n        #minimum-fee-text, #tx-fee, #addressValidationLoaderText {\n            font-size: 10px;\n            margin-top: 8px;\n            color: rgb(158, 156, 158);\n            display: inline-block;\n        }\n        .full-width td {\n            display: block;\n            width: 100%;\n            clear: both;\n        }\n        input#inCurrencyValue, input#outCurrencyValue {\n            width: calc(100% - 70px);\n            padding: 0px 0px;\n            text-indent: 148px;\n            position: relative;\n            right: 40px;\n            left: 0px;\n            padding: 0px 3px;\n            margin-right: 5px;\n            text-indent: 20px;\n            min-width: 104px;\n        }\n        span#outCurrencyValue {\n            width: calc(100% - 70px);\n            padding: 0px 0px;\n            text-indent: 148px;\n            position: relative;\n            right: 40px;\n            left: 0px;\n            padding: 0px 3px;\n            margin-right: 5px;\n            text-indent: 20px;\n            min-width: 104px;\n        }\n        .textInput {\n            display: inline-block;\n            height: 29px;\n            width: 80px;\n            border-radius: 4px;\n            border: 1px solid rgba(0, 0, 0, 0);\n            text-align: right;\n            font-size: 13px;\n            font-weight: 200;\n            padding: 0px 63px 0px 7px;\n            font-family: Native-Light, input, menlo, monospace;\n            outline: none;\n            box-shadow: rgba(56, 54, 56, 0.5) 0px 0.5px 0px 0px, rgb(22, 20, 22) 0px 0.5px 0px 0px inset;\n            color: rgb(223, 222, 223);\n            background-color: rgb(29, 27, 29);\n        }\n        .currencySelect {\n            right: 5px;\n            left: auto;\n        }\n        .longTextInput {\n            display: block;\n            height: 29px;\n            width: calc((100% - 2px) - 14px);\n            border-radius: 4px;\n            border: 1px solid rgba(0, 0, 0, 0);\n            text-align: left;\n            font-size: 13px;\n            font-weight: 200;\n            padding: 0px 7px;\n            font-family: Native-Light, input, menlo, monospace;\n            outline: none;\n            box-shadow: rgba(56, 54, 56, 0.5) 0px 0.5px 0px 0px, rgb(22, 20, 22) 0px 0.5px 0px 0px inset;\n            color: rgb(223, 222, 223);\n            background-color: rgb(29, 27, 29);\n        }\n        #inCurrencySelector {\n            float: right;\n        }\n        #currency-loader {\n            float: right;\n        }\n        .even-row {\n            background-color: #3f3e3f !important;\n        }\n        .odd-row {\n            background-color: rgb(56, 54, 56) !important;\n        }\n        /** Exchange estimate details */\n\n        .estimate-label {\n            margin: 10px 0px 0px 15px;\n            font-size: 13px;\n            font-family: Native-Light, input, menlo, monospace;\n            font-weight: 800;\n            -webkit-font-smoothing: subpixel-antialiased;\n        }\n        .estimate-value {\n            margin: 10px 15px 0px 0px;\n            font-size: 13px;\n            font-family: Native-Light, input, menlo, monospace;\n            font-weight: 100;\n            -webkit-font-smoothing: subpixel-antialiased;\n        }\n        #estimate-details {\n            display: block;\n            outline: none;\n            height: auto;\n            width: 100%;\n            padding: 0px;\n            box-sizing: border-box;\n            appearance: none;\n            background: rgb(56, 54, 56);\n            border-width: 0px;\n            box-shadow: rgb(22 20 22) 0px 0.5px 1px 0px, rgb(73 71 73) 0px 0.5px 0px 0px inset;\n            border-radius: 5px;\n            text-align: left;\n            font-size: 14px;\n            color: rgb(252, 251, 252);\n        }\n        .estimate-row {\n            display: flex;\n            align-items: center;\n            justify-content: space-between;\n            margin-bottom: 0px;\n            width: 100%;\n            padding: 10px 0px 20px;\n        }\n        .estimate-row:first-of-type {\n            border-radius: 10px 10px 0px 0px;\n        }\n        .estimate-row:last-of-type {\n            border-radius: 0px 0px 10px 10px;\n        }\n        .wallet-select-wrapper {\n            position: relative;\n        }\n        "])));
    }
  }, {
    key: "properties",
    get: function get() {
      return {
        /* Display values */
        displayLoadingScreen: {
          type: Boolean
        },
        displayEstimateRetrieval: {
          type: Boolean
        },
        displayOrderScreen: {
          type: Boolean
        },
        displayPurchaseButton: {
          type: Boolean
        },
        displayPurchaseRedirectIndicator: {
          type: Boolean
        },
        displayErrorString: {
          type: Boolean
        },
        displayEnterCurrencyPrompt: {
          type: Boolean
        },
        errorString: {
          type: String
        },
        fiatCurrencies: {
          type: Array,
          reflect: true
        },
        estimatedFiatRange: {
          type: Object
        },
        estimatedCryptoRange: {
          type: Object
        },
        estimateDetails: {
          type: Object
        },
        estimatedFiatRangeString: {
          type: String
        },
        estimatedCryptoRangeString: {
          type: String
        },
        inCurrencyCode: {
          type: String
        },
        inCurrencyName: {
          type: String
        },
        inCurrencyValue: {
          type: String
        },
        outCurrencyCode: {
          type: String
        },
        outCurrencyName: {
          type: String
        },
        outCurrencyValue: {
          type: String
        },
        estimateUsingFiat: {
          type: Boolean
        },
        context: {
          type: Object
        },
        redirectUrl: {
          type: String
        },
        selectedWallet: {
          type: Object
        }
      };
    }
  }]);
  return ChangenowBuyWithFiatView;
}((0, _ExchangeNavigationController["default"])(_lit.LitElement));

exports.ChangenowBuyWithFiatView = ChangenowBuyWithFiatView;

try {
  customElements.define('changenow-buy-with-fiat-view', ChangenowBuyWithFiatView);
} catch (error) {// already defined
}