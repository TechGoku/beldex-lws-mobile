"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.YatSettingsView = void 0;

var _taggedTemplateLiteral2 = _interopRequireDefault(require("@babel/runtime/helpers/taggedTemplateLiteral"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _lit = require("lit");

var _sweetalert = _interopRequireDefault(require("sweetalert2"));

var _templateObject, _templateObject2;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var YatSettingsView = /*#__PURE__*/function (_LitElement) {
  (0, _inherits2["default"])(YatSettingsView, _LitElement);

  var _super = _createSuper(YatSettingsView);

  function YatSettingsView() {
    (0, _classCallCheck2["default"])(this, YatSettingsView);
    return _super.call(this); // this.clickHandler = this.clickHandler;
    // this.inputRef = createRef();
  }

  (0, _createClass2["default"])(YatSettingsView, [{
    key: "connectedCallback",
    value: function connectedCallback() {
      (0, _get2["default"])((0, _getPrototypeOf2["default"])(YatSettingsView.prototype), "connectedCallback", this).call(this);
      this.wallets = this.context.walletsListController.records; // this.partnerPath = "https://yat.fyi/partner/mymonero"

      this.partnerPath = "https://y.at/partner/mymonero";
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
    key: "handleBuyAYatClickEvent",
    value: function handleBuyAYatClickEvent() {
      // Params:
      // addresses:
      // eid: 
      // refresh_token:  User's refresh token that was received in the response body of redirection to Yat web or as a deep link query parameter in redirection from Yat web in Get a Yat (Flow 1A).
      var partnerPath = this.partnerPath; // 1. Get refresh token
      // 2. Create URL
      // 3. openExternal(url)
      // Uncomment the next line once we have proper Yat management functionality in the core wallet experience
      // let addressString = `0x1001=${this.context.walletsListController.records[0]}`

      this.openExternal(partnerPath);
    } // Presently not used while additional integration is in progress

  }, {
    key: "handleConnectAYatClickEvent",
    value: function () {
      var _handleConnectAYatClickEvent = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var _Swal$fire, refresh_token, walletsString, inputObj, _html, _yield$Swal$fire, address, addressString, refreshToken, partnerPath, _addressString, _partnerPath;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.context.walletsListController.records.length > 0)) {
                  _context.next = 12;
                  break;
                }

                refresh_token = "placeholder";
                inputObj = {};
                this.wallets.forEach(function (wallet) {
                  console.log(wallet);
                  inputObj[wallet.public_address] = wallet.walletLabel;
                  walletsString += "<option value='".concat(wallet.public_address, "'>").concat(wallet.walletLabel, "</option>");
                });
                _html = "\n            <select>\n                ".concat(walletsString, "\n            </select>\n        ");
                _context.next = 7;
                return _sweetalert["default"].fire((_Swal$fire = {
                  input: 'select',
                  inputOptions: inputObj,
                  inputPlaceholder: 'Select a wallet to link to your Yat handle',
                  showCancelButton: true,
                  title: 'Please select a wallet to connect to',
                  background: "#272527",
                  titleColor: "#FFFFFF",
                  color: "#FFFFFF",
                  confirmButtonColor: "#11bbec",
                  confirmButtonText: 'Connect a Yat',
                  cancelButtonText: 'Close',
                  showCloseButton: true
                }, (0, _defineProperty2["default"])(_Swal$fire, "showCancelButton", true), (0, _defineProperty2["default"])(_Swal$fire, "inputOptions", inputObj), (0, _defineProperty2["default"])(_Swal$fire, "inputPlaceholder", 'Select a wallet'), (0, _defineProperty2["default"])(_Swal$fire, "showCancelButton", true), (0, _defineProperty2["default"])(_Swal$fire, "inputValidator", function inputValidator(value) {
                  console.log(value);
                  return new Promise(function (resolve) {
                    console.log(value);

                    if (value !== '') {
                      resolve();
                    } else {
                      resolve('You need to select a wallet');
                    }
                  });
                }), (0, _defineProperty2["default"])(_Swal$fire, "customClass", {
                  confirmButton: 'base-button hoverable-cell navigation-blue-button-enabled action right-save-button',
                  cancelButton: 'base-button hoverable-cell navigation-blue-button-enabled action right-save-button disabled navigation-blue-button-disabled'
                }), _Swal$fire));

              case 7:
                _yield$Swal$fire = _context.sent;
                address = _yield$Swal$fire.value;

                if (address) {
                  addressString = encodeURIComponent("0x1001=".concat(address));
                  refreshToken = "todolol";
                  partnerPath = "".concat(this.partnerPath, "/link-email?addresses=").concat(addressString, "&refresh_token=").concat(refreshToken);
                  this.openExternal(partnerPath);
                } // const { value: wallet_address } = await Swal.fire({
                // 	title: 'Please select a wallet to connect to',
                // 	html: html,
                // 	background: "#272527",
                // 	titleColor: "#FFFFFF",
                // 	color: "#FFFFFF",
                // 	confirmButtonColor: "#11bbec",
                // 	confirmButtonText: 'Connect a Yat',
                // 	cancelButtonText: 'Close',
                // 	showCloseButton: true,
                //     showCancelButton: true,
                //     inputOptions: inputObj,
                //     inputPlaceholder: 'Select a fruit',
                //     showCancelButton: true,
                //     inputValidator: (value) => {
                //         console.log(value);
                //         return new Promise((resolve) => {
                //             if (typeof(value) !== "undefined") {
                //                 resolve()
                //             } else {
                //                 resolve('Broken')
                //             }
                //         })
                //     },
                // 	customClass: {
                // 		confirmButton: 'base-button hoverable-cell navigation-blue-button-enabled action right-save-button',
                // 		cancelButton: 'base-button hoverable-cell navigation-blue-button-enabled action right-save-button disabled navigation-blue-button-disabled'
                //     },
                // });
                // if (wallet_address) {
                //     console.log(wallet_address);
                //     Swal.fire(`You selected: ${wallet_address}`)
                // }


                _context.next = 13;
                break;

              case 12:
                if (this.context.walletsListController.records.length === 1) {
                  // immediate redirect
                  _addressString = "0x1001=".concat(this.wallets.records[0]);
                  _partnerPath = "".concat(this.partnerPath, "}/link-email");
                  this.openExternal(_partnerPath);
                } else {// please log into wallet
                }

              case 13:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function handleConnectAYatClickEvent() {
        return _handleConnectAYatClickEvent.apply(this, arguments);
      }

      return handleConnectAYatClickEvent;
    }() // Presently not used while additional integration is in progress

  }, {
    key: "handleManageAYatClickEvent",
    value: function handleManageAYatClickEvent() {
      // refresh_token:  User's refresh token that was received in the response body of redirection to Yat web or as a deep link query parameter in redirection from Yat web in Get a Yat (Flow 1A).
      // addresses: YAT_TAG_1=ADDRESS_1|YAT_TAG_2=ADDRESS_2|...|YAT_TAG_N=ADDRESS_N
      var partnerPath = "".concat(this.partnerPath, "/manage");
      this.openExternal(partnerPath);
    }
  }, {
    key: "render",
    value: function render() {
      return (0, _lit.html)(_templateObject || (_templateObject = (0, _taggedTemplateLiteral2["default"])(["\n            <!-- <div style=\"\">\n                <a class=\"clickableLinkButton\">ABOUT MYMONERO</a>\n            </div> -->\n            <div class=\"form-field\">\n                <span class=\"field-title\">\n                    <!-- Yat<mym-tooltip allowHTML=\"true\" tooltipContent=\"Yat lets you use emojis as your universal username and identity on the internet.\">?</mym-tooltip> -->\n                    Yat\n                </span>\n            </div>\n            <div>\n                <a id=\"buy-a-yat\" class=\"clickable-link\" @click=", ">Buy a Yat</a>       \n                <mym-tooltip tooltipContent=\"Yat is a platform that lets you buy a URL with emojis in it. You can use your unique URL to link your Monero wallet address, making it easier for people to pay you.\">Test</mym-tooltip>     \n            </div>\n            <!-- <div>\n                <a id=\"connect-a-yat\" class=\"clickable-link\" @click=", ">Connect a Yat</a>\n            </div>\n            <div>\n                <a id=\"manage-a-yat\" class=\"clickable-link\" @click=", ">Manage Yats</a>\n            </div> -->\n        "])), this.handleBuyAYatClickEvent, this.handleConnectAYatClickEvent, this.handleManageAYatClickEvent);
    }
  }], [{
    key: "styles",
    get: function get() {
      return (0, _lit.css)(_templateObject2 || (_templateObject2 = (0, _taggedTemplateLiteral2["default"])(["\n            .clickable-link {\n                color: rgb(17, 187, 236); \n                cursor: pointer; \n                user-select: none; \n                font-family: Native-Light, input, menlo, monospace; \n                -webkit-font-smoothing: subpixel-antialiased; \n                font-size: 10px; \n                letter-spacing: 0.5px; \n                font-weight: 300; \n                width: auto; \n                display: inline; \n                clear: none; \n                -webkit-tap-highlight-color: rgba(0, 0, 0, 0); \n                float: none;\n                text-transform: uppercase;\n            }\n            .field-title {\n                text-transform: uppercase;\n                user-select: none;\n                display: block;\n                text-align: left;\n                color: rgb(248, 247, 248);\n                font-family: Native-Regular, input, menlo, monospace;\n                font-size: 11px;\n                font-weight: lighter;\n            }\n            div {\n                padding: 12px 0px 12px 33px;\n            }\n        "])));
    }
  }, {
    key: "properties",
    get: function get() {
      return {
        context: Object,
        partnerPath: String,
        wallets: Array
      };
    }
  }]);
  return YatSettingsView;
}(_lit.LitElement);

exports.YatSettingsView = YatSettingsView;

try {
  customElements.define('mym-yat-settings-view', YatSettingsView);
} catch (error) {// already defined
}