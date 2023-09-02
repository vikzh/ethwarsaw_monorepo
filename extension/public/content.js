console.log("I am content.js");

const ethereumObject = {
    isInjected: true,
    sendAsync: function (payload, callback) {
        // Implement your Ethereum-related logic here
    },
};

const ethereumProxyHandler = {
    get(target, prop, receiver) {
        // Intercept and handle Ethereum-related calls here
        if (prop === 'request') {
            // Intercept the 'request' method and add custom logic
            return function (args) {
                // Add your custom logic here before calling the real Ethereum provider
                console.log('Intercepted request:', args);
                return target[prop](args); // Call the real Ethereum provider
            };
        } else {
            // For other properties/methods, return them as-is
            return target[prop];
        }
    },
};

// Create the Ethereum proxy
const ethereumProxy = new Proxy(window.ethereum, ethereumProxyHandler);

// Attach your Ethereum object to the window
window.ethereum = ethereumProxy;