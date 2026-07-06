
# Info

## Installing

Using npm:

```bash
$ npm install @bdxi/beldex-money-format
```


## Usage

```js
const beldex_amount_format_utils = require("@bdxi/beldex-money-format");
const JSBigInt = require("@bdxi/beldex-bigint").BigInteger;
const amount = new JSBigInt("1000000000");

const amount_str = beldex_amount_format_utils.formatMoney(amount);
-----

## License

See `LICENSE.txt` for license.

All source code copyright © 2023 by Beldex. All rights reserved.