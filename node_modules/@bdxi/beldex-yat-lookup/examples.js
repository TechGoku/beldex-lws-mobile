
const YatBeldexLookup = require('./index');
let YatBeldexLookup = new YatBeldexLookup({ debugMode: true });
console.log(YatBeldexLookup);
console.log(YatBeldexLookup.getBasePath());
console.log("Valid yat?");
setTimeout(() => {

    //YatBeldexLookup.testEmojisAgainstUnicodePropertyEscape(); 

    // Expect true
    console.log(YatBeldexLookup.isValidYatHandle("😂😂😂"))
    
    // Expect true
    console.log(YatBeldexLookup.isValidYatHandle("🐶"))
    console.log(YatBeldexLookup.isValidYatHandle("🐶🐶"))

    // Expect a false
    console.log(YatBeldexLookup.isValidYatHandle("a😃😃😃"))
    
    // expect true
    // YatBeldexLookup.isValidYatCharacter("🔫").then((response) => {
    //     console.log(response);
    // });
    // // // expect false
    // YatBeldexLookup.isValidYatCharacter("😃").then((response) => {
    //     console.log(response);
    // })
    // // // expect false
    // YatBeldexLookup.isValidYatCharacter("😀").then((response) => {
    //     console.log(response);
    // })
    // // // expect false
    // YatBeldexLookup.isValidYatCharacter("😄").then((response) => {
    //     console.log(response);
    // })
    // // // expect false
    // YatBeldexLookup.isValidYatCharacter("😁").then((response) => {
    //     console.log(response);
    // })
    // // YatBeldexLookup.isValidYatHandle("🔫🔫🔫").then((response) => {
    // //     console.log("Is this handle valid?");
    // //     console.log(response);
    // // })
    YatBeldexLookup.lookupMoneroAddresses("😂😂😂").then((response) => {
        console.log(`Result of monero address lookup`);
        console.log(response);
    })

}, 1000);