# Web Components plugin

# Installation

`npm i @bdxi/beldex-web-components`

Usage

To make use of these components, import this module the same way you would a normal NPM package.

In your javascript file:

`require('@bdxi/beldex-web-components');`

This will register the web component custom element tags, making them available for use in your HTML DOM

Then, in your HTML, use any of the custom elements like so:

`<activity-indicator></activity-indicator>`

## Detailed usage documentation
---
### Activity Indicator

Shows an animated indicator alongside an optional text message.

`<activity-indicator .loadingText=${"Loading supported currencies"}></activity-indicator>`

Suggested usage of this element would include a conditional expression to specify whether it should be hidden or not. For example:

`<activity-indicator ?hidden=${this.hideActivityIndicator}></activity-indicator>`

 

---
### Provider Card

`<provider-card .service=${service}></provider-card>`

.service should be a JSON object in the following format:

 

    {

        service_provider: "localbeldex",
        title: "Buy Beldex using LocalBeldex",
        description: "Long description text"
    }



---
### Searchable Select 

A drop-down based select input field. Pass a list of your values in the following format:

    [
        {
            label: "Text to show inside <option> tag", 
            value: "Value for `<option value=${value}>`"
        }
    ]

`<searchable-select .values=${fiatCurrencies}></searchable-select>`

Emits the event `searchable-select-update` once a use selects a value

--- 
### Wallet selector

`<wallet-selector></wallet-selector>`
