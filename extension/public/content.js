;(function() {
    function script() {
        (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
                const provider = require('eth-provider');
                const ethProvider = provider('https://alfajores-forno.celo-testnet.org');

                const funkcja = ethProvider.doSend;

                const username = 'username very nice';
                const DAO_FACTORY_ADDRESS = 'username very nice';
                const DAO_FACTORY_ADDRESS_ABI = [
                    '<abi>',
                ];

                ethProvider.doSend = function (rawPayload, rawParams = [], targetChain = ethProvider.manualChainId, waitForConnection = true) {
                    // console.log('doSend bro', rawPayload);
                    // // needed for getSigners
                    if (rawPayload === 'eth_accounts') {
                        console.log('calling eth accounts');
                        return ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'];
                    }
                    if (rawPayload === 'eth_requestAccounts') {
                        console.log('wolam eth request accounts');
                        return ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266']
                        // const contract = ethers.Contract('DAO_FACTORY_ADDRESS', DAO_FACTORY_ADDRESS_ABI, ethProvider.getSigner());
                    }
                    console.log('chain id ', ethProvider.manualChainId);
                    return funkcja(rawPayload, rawParams, targetChain, waitForConnection);
                }
                ethProvider.chainId = '0xaef3';
                ethProvider.isMetaMask = true;
                ethProvider.networkVersion = "44787";
                ethProvider.eth_requestAccounts = () => {
                    return ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'];
                }

                window.ethereum = new Proxy(ethProvider, {
                    deleteProperty: () => true,
                });
            },{"eth-provider":3}],2:[function(require,module,exports){
                (function (process){(function (){
                    const EventEmitter = require('events')

                    const dev = process.env.NODE_ENV === 'development'

                    class ConnectionManager extends EventEmitter {
                        constructor (connections, targets, options) {
                            super()
                            this.targets = targets
                            this.options = options
                            this.connections = connections
                            this.connected = false
                            this.status = 'loading'
                            this.interval = options.interval || 5000
                            this.name = options.name || 'default'
                            this.inSetup = true
                            this.connect()
                        }

                        connect (index = 0) {
                            if (dev && index === 0) console.log(`\n\n\n\nA connection cycle started for provider with name: ${this.name}`)

                            if (this.connection && this.connection.status === 'connected' && index >= this.connection.index) {
                                if (dev) console.log('Stopping connection cycle becasuse we\'re already connected to a higher priority provider')
                            } else if (this.targets.length === 0) {
                                if (dev) console.log('No valid targets supplied')
                            } else {
                                const { protocol, location } = this.targets[index]
                                this.connection = this.connections[protocol](location, this.options)

                                const connectionErrorHandler = (err) => this.connectionError(index, err)

                                this.connection.once('error', connectionErrorHandler)

                                this.connection.on('connect', () => {
                                    this.connection.off('error', connectionErrorHandler)
                                    this.connection.once('error', (err) => this.onError(err))

                                    this.connection.once('close', () => {
                                        this.connected = false
                                        this.emitClose()
                                        if (!this.closing) this.refresh()
                                    })

                                    this.connection.target = this.targets[index]
                                    this.connection.index = index
                                    this.targets[index].status = this.connection.status
                                    this.connected = true
                                    this.inSetup = false
                                    if (dev) console.log('Successfully connected to: ' + this.targets[index].location)
                                    this.emit('connect')
                                })

                                this.connection.on('data', data => this.emit('data', data))
                                this.connection.on('payload', payload => this.emit('payload', payload))
                            }
                        }
                        chainId = '0xaef3';

                        onError (err) {
                            if (this.listenerCount('error')) return this.emit('error', err)
                            console.warn('[eth-provider] Uncaught connection error: ' + err.message)
                        }

                        refresh (interval = this.interval) {
                            if (dev) console.log(`Reconnect queued for ${(interval / 1000).toFixed(2)}s in the future`)
                            clearTimeout(this.connectTimer)
                            this.connectTimer = setTimeout(() => this.connect(), interval)
                        }

                        connectionError (index, err) {
                            if (this.connection && this.connection.close) this.connection.close()

                            this.targets[index].status = err
                            if (this.targets.length - 1 === index) {
                                this.inSetup = false
                                if (dev) console.warn('eth-provider unable to connect to any targets, view connection cycle summary: ', this.targets)
                                this.refresh()
                            } else { // Not last target, move on the next connection option
                                this.connect(++index)
                            }
                        }

                        emitClose () {
                            this.emit('close')
                        }

                        close () {
                            this.closing = true
                            if (this.connection && this.connection.close && !this.connection.closed) {
                                this.connection.close() // Let event bubble from here
                            } else {
                                this.emit('close')
                            }
                            clearTimeout(this.connectTimer)
                            clearTimeout(this.setupTimer)
                        }

                        error (payload, message, code = -1) {
                            this.emit('payload', { id: payload.id, jsonrpc: payload.jsonrpc, error: { message, code } })
                        }

                        send (payload) {
                            if (this.inSetup) {
                                this.setupTimer = setTimeout(() => this.send(payload), 100)
                            } else if (this.connection.closed) {
                                this.error(payload, 'Not connected', 4900)
                            } else {
                                this.connection.send(payload)
                            }
                        }
                    }

                    module.exports = ConnectionManager

                }).call(this)}).call(this,require('_process'))
            },{"_process":15,"events":14}],3:[function(require,module,exports){
                const resolve = require('./resolve')
                const provider = require('./provider')
                const presets = require('./presets')

                const injected = {
                    ethereum: typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' ? window.ethereum : null,
                    web3: typeof window !== 'undefined' && typeof window.web3 !== 'undefined' ? window.web3.currentProvider : null
                }
                const ws = typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined' ? window.WebSocket : null
                const XHR = typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined' ? window.XMLHttpRequest : null

                if (injected.ethereum) injected.ethereum.__isProvider = true

                const connections = {
                    injected: injected.ethereum || require('./connections/injected')(injected.web3),
                    ipc: require('./connections/unavailable')('IPC connections are unavliable in the browser'),
                    ws: require('./connections/ws')(ws),
                    http: require('./connections/http')(XHR)
                }

                module.exports = (targets, options) => {
                    if (targets && !Array.isArray(targets) && typeof targets === 'object' && !options) {
                        options = targets
                        targets = undefined
                    }
                    if (!targets) targets = ['injected', 'frame']
                    if (!options) options = {}

                    targets = [].concat(targets)

                    targets.forEach(t => {
                        if (t.startsWith('alchemy') && !options.alchemyId) throw new Error('Alchemy was included as a connection target but no Alchemy project ID was passed in options e.g. { alchemyId: \'123abc\' }')
                        if (t.startsWith('infura') && !options.infuraId) throw new Error('Infura was included as a connection target but no Infura project ID was passed in options e.g. { infuraId: \'123abc\' }')
                    })

                    const sets = presets(options)

                    return provider(connections, resolve(targets, sets), options)
                }

            },{"./connections/http":4,"./connections/injected":5,"./connections/unavailable":6,"./connections/ws":7,"./presets":9,"./provider":10,"./resolve":11}],4:[function(require,module,exports){
                (function (process){(function (){
                    const EventEmitter = require('events')
                    const { v4: uuid } = require('uuid')

                    const dev = process.env.NODE_ENV === 'development'

                    let XHR

                    class HTTPConnection extends EventEmitter {
                        constructor (_XHR, url, options) {
                            super()
                            XHR = _XHR
                            this.options = options
                            this.connected = false
                            this.subscriptions = false
                            this.status = 'loading'
                            this.url = url
                            this.pollId = uuid()
                            setTimeout(() => this.create(), 0)
                            this._emit = (...args) => !this.closed ? this.emit(...args) : null
                        }

                        onError (err) {
                            if (!this.closed && this.listenerCount('error')) this.emit('error', err)
                        }

                        create () {
                            if (!XHR) return this.onError(new Error('No HTTP transport available'))
                            this.on('error', () => { if (this.connected) this.close() })
                            this.init()
                        }

                        init () {
                            this.send({ jsonrpc: '2.0', method: 'net_version', params: [], id: 1 }, (err, response) => {
                                if (err) return this.onError(err)
                                this.connected = true
                                this._emit('connect')
                                this.send({ jsonrpc: '2.0', id: 1, method: 'eth_pollSubscriptions', params: [this.pollId, 'immediate'] }, (err, response) => {
                                    if (!err) {
                                        this.subscriptions = true
                                        this.pollSubscriptions()
                                    }
                                })
                            })
                        }

                        pollSubscriptions () {
                            this.send({ jsonrpc: '2.0', id: 1, method: 'eth_pollSubscriptions', params: [this.pollId] }, (err, result) => {
                                if (err) {
                                    this.subscriptionTimeout = setTimeout(() => this.pollSubscriptions(), 10000)
                                    return this.onError(err)
                                } else {
                                    if (!this.closed) this.subscriptionTimeout = this.pollSubscriptions()
                                    if (result) {
                                        result.map(p => {
                                            let parse
                                            try { parse = JSON.parse(p) } catch (e) { parse = false }
                                            return parse
                                        }).filter(n => n).forEach(p => this._emit('payload', p))
                                    }
                                }
                            })
                        }

                        close () {
                            if (dev) console.log('Closing HTTP connection')

                            clearTimeout(this.subscriptionTimeout)

                            this._emit('close')
                            this.closed = true
                            this.removeAllListeners()
                        }

                        filterStatus (res) {
                            if (res.status >= 200 && res.status < 300) return res
                            const error = new Error(res.statusText)
                            error.res = res
                            throw error.message
                        }

                        error (payload, message, code = -1) {
                            this._emit('payload', { id: payload.id, jsonrpc: payload.jsonrpc, error: { message, code } })
                        }

                        send (payload, internal) {
                            if (this.closed) return this.error(payload, 'Not connected')
                            if (payload.method === 'eth_subscribe') {
                                if (this.subscriptions) {
                                    payload.pollId = this.pollId
                                } else {
                                    return this.error(payload, 'Subscriptions are not supported by this HTTP endpoint')
                                }
                            }

                            const xhr = new XHR()
                            let responded = false
                            const res = (err, result) => {
                                if (!responded) {
                                    xhr.abort()
                                    responded = true
                                    if (internal) {
                                        internal(err, result)
                                    } else {
                                        const { id, jsonrpc } = payload
                                        const load = err ? { id, jsonrpc, error: { message: err.message, code: err.code } } : { id, jsonrpc, result }
                                        this._emit('payload', load)
                                    }
                                }
                            }

                            try {
                                xhr.open('POST', this.url, true)
                                xhr.setRequestHeader('Content-Type', 'application/json')
                                // Below not working becasue XHR lib blocks it claiming "restricted header"
                                // if (this.options.origin) xhr.setRequestHeader('Origin', this.options.origin)
                                xhr.timeout = 60 * 1000
                                xhr.onerror = res
                                xhr.ontimeout = res
                                xhr.onreadystatechange = () => {
                                    if (xhr.readyState === 4) {
                                        try {
                                            const response = JSON.parse(xhr.responseText)
                                            res(response.error, response.result)
                                        } catch (e) {
                                            res(e)
                                        }
                                    }
                                }
                                xhr.send(JSON.stringify(payload))
                            } catch (e) {
                                if (dev) console.error('Error sending HTTP request', e)

                                res({ message: e.message, code: -1 })
                            }
                        }
                    }

                    module.exports = XHR => (url, options) => new HTTPConnection(XHR, url, options)

                }).call(this)}).call(this,require('_process'))
            },{"_process":15,"events":14,"uuid":16}],5:[function(require,module,exports){
                const EventEmitter = require('events')

                class InjectedConnection extends EventEmitter {
                    constructor (_injected, options) {
                        super()
                        if (_injected) {
                            setTimeout(() => this.onError(new Error('Injected web3 provider is not currently supported')), 0)
                        } else {
                            setTimeout(() => this.onError(new Error('No injected provider found')), 0)
                        }
                    }

                    onError (err) {
                        if (this.listenerCount('error')) this.emit('error', err)
                    }
                }

                module.exports = injected => options => new InjectedConnection(injected, options)

            },{"events":14}],6:[function(require,module,exports){
                const EventEmitter = require('events')

                class UnavailableConnection extends EventEmitter {
                    constructor (message) {
                        super()
                        setTimeout(() => this.onError(new Error(message)), 0)
                    }

                    onError (err) {
                        if (this.listenerCount('error')) this.emit('error', err)
                    }
                }

                module.exports = message => () => new UnavailableConnection(message)

            },{"events":14}],7:[function(require,module,exports){
                (function (process){(function (){
                    const EventEmitter = require('events')
                    const parse = require('../parse')
                    const dev = process.env.NODE_ENV === 'development'

                    let WebSocket

                    class WebSocketConnection extends EventEmitter {
                        constructor (_WebSocket, url, options) {
                            super()
                            this.socketListeners = []
                            WebSocket = _WebSocket
                            setTimeout(() => this.create(url, options), 0)
                        }

                        create (url, options) {
                            if (!WebSocket) return this.onError(new Error('No WebSocket transport available'))
                            try {
                                this.socket = new WebSocket(url, [], { origin: options.origin })
                            } catch (e) {
                                return this.onError(e)
                            }

                            this.addSocketListener('error', this.onError.bind(this))
                            this.addSocketListener('open', this.onOpen.bind(this))
                            this.addSocketListener('close', this.onClose.bind(this))
                        }

                        addSocketListener (event, handler) {
                            this.socket.addEventListener(event, handler)
                            this.socketListeners.push({ event, handler })
                        }

                        removeAllSocketListeners () {
                            this.socketListeners.forEach(({ event, handler }) => {
                                this.socket.removeEventListener(event, handler)
                            })
                            this.socketListeners = []
                        }

                        onOpen () {
                            this.emit('connect')
                            this.addSocketListener('message', this.onMessage.bind(this))
                        }

                        onMessage (message) {
                            const data = typeof message.data === 'string' ? message.data : ''
                            parse(data, (err, payloads) => {
                                if (err) return //
                                payloads.forEach(load => {
                                    if (Array.isArray(load)) {
                                        load.forEach(payload => this.emit('payload', payload))
                                    } else {
                                        this.emit('payload', load)
                                    }
                                })
                            })
                        }

                        onError (err) {
                            if (this.listenerCount('error')) this.emit('error', err)
                        }

                        onClose (e) {
                            // onClose should only be called as a result of the socket's close event
                            // OR when close() is called manually and the socket either doesn't exist or is already in a closed state
                            const err = {
                                reason: e ? e.reason : 'unknown',
                                code: e ? e.code : 'unknown'
                            }

                            if (this.socket) {
                                this.removeAllSocketListeners()
                                this.socket = null
                            }

                            this.closed = true

                            if (dev) console.log(`Closing WebSocket connection, reason: ${err.reason} (code ${err.code})`)

                            this.emit('close')
                            this.removeAllListeners()
                        }

                        close () {
                            if (this.socket && WebSocket && this.socket.readyState !== WebSocket.CLOSED) {
                                this.removeAllSocketListeners()
                                this.addSocketListener('error', () => {})
                                this.addSocketListener('close', this.onClose.bind(this))
                                if (this.socket.terminate) {
                                    this.socket.terminate()
                                } else {
                                    this.socket.close()
                                }
                            } else {
                                this.onClose()
                            }
                        }

                        error (payload, message, code = -1) {
                            this.emit('payload', { id: payload.id, jsonrpc: payload.jsonrpc, error: { message, code } })
                        }

                        send (payload) {
                            try {
                                if (this.socket && this.socket.readyState === this.socket.CONNECTING) {
                                    setTimeout(_ => this.send(payload), 10)
                                } else if (!this.socket || this.socket.readyState > 1) {
                                    this.connected = false
                                    this.error(payload, 'Not connected')
                                } else {
                                    this.socket.send(JSON.stringify(payload))
                                }
                            } catch (e) {
                                if (dev) console.error('Error sending Websocket request', e)

                                this.error(payload, e.message)
                            }
                        }
                    }

                    module.exports = WebSocket => (url, cb) => new WebSocketConnection(WebSocket, url, cb)

                }).call(this)}).call(this,require('_process'))
            },{"../parse":8,"_process":15,"events":14}],8:[function(require,module,exports){
                let last, timeout

                module.exports = (res, cb) => {
                    const values = []
                    res
                        .replace(/\}[\n\r]?\{/g, '}|--|{') // }{
                        .replace(/\}\][\n\r]?\[\{/g, '}]|--|[{') // }][{
                        .replace(/\}[\n\r]?\[\{/g, '}|--|[{') // }[{
                        .replace(/\}\][\n\r]?\{/g, '}]|--|{') // }]{
                        .split('|--|')
                        .forEach(data => {
                            if (last) data = last + data // prepend the last chunk
                            let result
                            try {
                                result = JSON.parse(data)
                            } catch (e) {
                                last = data
                                clearTimeout(timeout) // restart timeout
                                timeout = setTimeout(() => cb(new Error('Parse response timeout')), 15 * 1000)
                                return
                            }
                            clearTimeout(timeout)
                            last = null
                            if (result) values.push(result)
                        })
                    cb(null, values)
                }

            },{}],9:[function(require,module,exports){
                module.exports = (options = {}) => {
                    return {
                        injected: ['injected'],
                        frame: ['ws://127.0.0.1:1248', 'http://127.0.0.1:1248'],
                        direct: ['ws://127.0.0.1:8546', 'http://127.0.0.1:8545'], // IPC paths will be prepended in Node/Electron
                        infura: [`wss://mainnet.infura.io/ws/v3/${options.infuraId}`, `https://mainnet.infura.io/v3/${options.infuraId}`],
                        alchemy: [`wss://eth-mainnet.ws.alchemyapi.io/v2/${options.alchemyId}`, `https://eth-mainnet.alchemyapi.io/v2/${options.alchemyId}`],
                        infuraGoerli: [`wss://goerli.infura.io/ws/v3/${options.infuraId}`, `https://goerli.infura.io/v3/${options.infuraId}`],
                        alchemyGoerli: [`wss://eth-goerli.ws.alchemyapi.io/v2/${options.alchemyId}`, `https://eth-goerli.alchemyapi.io/v2/${options.alchemyId}`],
                        infuraPolygon: [`https://polygon-mainnet.infura.io/v3/${options.infuraId}`],
                        infuraArbitrum: [`https://arbitrum-mainnet.infura.io/v3/${options.infuraId}`],
                        infuraOptimism: [`https://optimism-mainnet.infura.io/v3/${options.infuraId}`],
                        infuraSepolia: [`wss://sepolia.infura.io/ws/v3/${options.infuraId}`, `https://sepolia.infura.io/v3/${options.infuraId}`],
                        gnosis: ['https://rpc.gnosischain.com'],
                        optimism: ['https://mainnet.optimism.io']
                    }
                }

            },{}],10:[function(require,module,exports){
                const EventEmitter = require('events')
                const EthereumProvider = require('ethereum-provider').default
                const ConnectionManager = require('../ConnectionManager')

                const monitor = provider => {
                    function update (status) {
                        provider.status = status
                        if (provider instanceof EventEmitter) provider.emit('status', status)
                    }

                    async function checkSyncing () {
                        try {
                            if (await provider.send('eth_syncing')) {
                                update('syncing')
                            }
                        } catch (e) {
                            // don't do anything if it can't be determined whether the node is syncing or not
                        }
                    }

                    async function checkConnected () {
                        if (provider.inSetup) return setTimeout(checkConnected, 1000)

                        try {
                            await provider.send('eth_chainId')
                            update('connected')

                            setTimeout(checkSyncing, 500)
                        } catch (e) {
                            update('disconnected')
                        }
                    }

                    update('loading')
                    checkConnected()
                    provider.on('connect', () => checkConnected())
                    provider.on('close', () => update('disconnected'))
                    return provider
                }

                module.exports = (connections, targets, options) => {
                    // If window.ethereum and injected is a target in any priority, return ethereum provider
                    if (connections.injected.__isProvider && targets.map(t => t.type).indexOf('injected') > -1) {
                        delete connections.injected.__isProvider
                        return monitor(connections.injected)
                    }
                    const provider = new EthereumProvider(new ConnectionManager(connections, targets, options))
                    provider.setMaxListeners(128)
                    return monitor(provider)
                }

            },{"../ConnectionManager":2,"ethereum-provider":12,"events":14}],11:[function(require,module,exports){
                const getProtocol = location => {
                    if (location === 'injected') return 'injected'
                    if (location.endsWith('.ipc')) return 'ipc'
                    if (location.startsWith('wss://') || location.startsWith('ws://')) return 'ws'
                    if (location.startsWith('https://') || location.startsWith('http://')) return 'http'
                    return ''
                }

                module.exports = (targets, presets) => {
                    return [].concat(...[].concat(targets).map(provider => {
                        if (presets[provider]) {
                            return presets[provider].map(location => ({ type: provider, location, protocol: getProtocol(location) }))
                        } else {
                            return { type: 'custom', location: provider, protocol: getProtocol(provider) }
                        }
                    })).filter(provider => {
                        if (provider.protocol || provider.type === 'injected') {
                            return true
                        } else {
                            console.log('eth-provider | Invalid provider preset/location: "' + provider.location + '"')
                            return false
                        }
                    })
                }

            },{}],12:[function(require,module,exports){
                "use strict";
                var __importDefault = (this && this.__importDefault) || function (mod) {
                    return (mod && mod.__esModule) ? mod : { "default": mod };
                };
                Object.defineProperty(exports, "__esModule", { value: true });
                const events_1 = __importDefault(require("events"));
                const payload_1 = require("./payload");
                class Provider extends events_1.default {
                    constructor(connection) {
                        super();
                        this.promises = {};
                        this.attemptedSubscriptions = new Set();
                        this.subscriptions = [];
                        this.checkConnectionRunning = false;
                        this.nextId = 1;
                        this.connected = false;
                        this.accounts = [];
                        this.selectedAddress = undefined;
                        this.coinbase = undefined;
                        this.enable = this.enable.bind(this);
                        this.doSend = this.doSend.bind(this);
                        this.send = this.send.bind(this);
                        this.sendBatch = this.sendBatch.bind(this);
                        this.subscribe = this.subscribe.bind(this);
                        this.unsubscribe = this.unsubscribe.bind(this);
                        this.resumeSubscriptions = this.resumeSubscriptions.bind(this);
                        this.sendAsync = this.sendAsync.bind(this);
                        this.sendAsyncBatch = this.sendAsyncBatch.bind(this);
                        this.isConnected = this.isConnected.bind(this);
                        this.close = this.close.bind(this);
                        this.request = this.request.bind(this);
                        this.connection = connection;
                        this.on('connect', this.resumeSubscriptions);
                        this.connection.on('connect', () => this.checkConnection(1000));
                        this.connection.on('close', () => {
                            this.connected = false;
                            this.attemptedSubscriptions.clear();
                            this.emit('close');
                            this.emit('disconnect');
                        });
                        this.connection.on('payload', payload => {
                            const { id, method, error, result } = payload;
                            if (typeof id !== 'undefined') {
                                if (this.promises[id]) { // Fulfill promise
                                    const requestMethod = this.promises[id].method;
                                    if (requestMethod && ['eth_accounts', 'eth_requestAccounts'].includes(requestMethod)) {
                                        const accounts = result || [];
                                        this.accounts = accounts;
                                        this.selectedAddress = accounts[0];
                                        this.coinbase = accounts[0];
                                    }
                                    payload.error ? this.promises[id].reject(error) : this.promises[id].resolve(result);
                                    delete this.promises[id];
                                }
                            }
                            else if (method && method.indexOf('_subscription') > -1) { // Emit subscription result
                                // Events: connect, disconnect, chainChanged, chainsChanged, accountsChanged, assetsChanged, message
                                this.emit(payload.params.subscription, payload.params.result);
                                this.emit(method, payload.params); // Older EIP-1193
                                this.emit('message', {
                                    type: payload.method,
                                    data: {
                                        subscription: payload.params.subscription,
                                        result: payload.params.result
                                    }
                                });
                                this.emit('data', payload); // Backwards Compatibility
                            }
                        });
                        this.on('newListener', event => {
                            if (Object.keys(this.eventHandlers).includes(event)) {
                                if (!this.attemptedSubscription(event) && this.connected) {
                                    this.startSubscription(event);
                                    if (event === 'networkChanged') {
                                        console.warn('The networkChanged event is being deprecated, use chainChanged instead');
                                    }
                                }
                            }
                        });
                        this.eventHandlers = {
                            networkChanged: netId => {
                                this.networkVersion = (typeof netId === 'string') ? parseInt(netId) : netId;
                                this.emit('networkChanged', this.networkVersion);
                            },
                            chainChanged: chainId => {
                                this.providerChainId = chainId;
                                if (!this.manualChainId) {
                                    this.emit('chainChanged', chainId);
                                }
                            },
                            chainsChanged: chains => {
                                this.emit('chainsChanged', chains);
                            },
                            accountsChanged: (accounts) => {
                                this.selectedAddress = accounts[0];
                                this.emit('accountsChanged', accounts);
                            },
                            assetsChanged: assets => {
                                this.emit('assetsChanged', assets);
                            }
                        };
                    }
                    get chainId() {
                        return '0xaef3';
                    }
                    async checkConnection(retryTimeout = 4000) {
                        if (this.checkConnectionRunning || this.connected)
                            return;
                        clearTimeout(this.checkConnectionTimer);
                        this.checkConnectionTimer = undefined;
                        this.checkConnectionRunning = true;
                        try {
                            this.networkVersion = await this.doSend('net_version', [], undefined, false);
                            this.providerChainId = await this.doSend('eth_chainId', [], undefined, false);
                            this.connected = true;
                        }
                        catch (e) {
                            this.checkConnectionTimer = setTimeout(() => this.checkConnection(), retryTimeout);
                            this.connected = false;
                        }
                        finally {
                            this.checkConnectionRunning = false;
                            if (this.connected) {
                                this.emit('connect', { chainId: this.providerChainId });
                            }
                        }
                    }
                    attemptedSubscription(event) {
                        return this.attemptedSubscriptions.has(event);
                    }
                    setSubscriptionAttempted(event) {
                        this.attemptedSubscriptions.add(event);
                    }
                    async startSubscription(event) {
                        console.debug(`starting subscription for ${event} events`);
                        this.setSubscriptionAttempted(event);
                        try {
                            const eventId = await (this.subscribe('eth_subscribe', event));
                            this.on(eventId, this.eventHandlers[event]);
                        }
                        catch (e) {
                            console.warn(`Unable to subscribe to ${event}`, e);
                        }
                    }
                    resumeSubscriptions() {
                        Object.keys(this.eventHandlers).forEach(event => {
                            if (this.listenerCount(event) && !this.attemptedSubscription(event))
                                this.startSubscription(event);
                        });
                    }
                    async enable() {
                        const accounts = await this.doSend('eth_accounts');
                        if (accounts.length > 0) {
                            this.accounts = accounts;
                            this.selectedAddress = accounts[0];
                            this.coinbase = accounts[0];
                            this.emit('enable');
                            return accounts;
                        }
                        else {
                            const err = new Error('User Denied Full Provider');
                            err.code = '4001';
                            throw err;
                        }
                    }
                    doSend(rawPayload, rawParams = [], targetChain = this.manualChainId, waitForConnection = true) {
                        const sendFn = (resolve, reject) => {
                            const method = (typeof rawPayload === 'object') ? rawPayload.method : rawPayload;
                            const params = (typeof rawPayload === 'object') ? rawPayload.params : rawParams;
                            const chainTarget = ((typeof rawPayload === 'object') && rawPayload.chainId) || targetChain;
                            if (!method) {
                                return reject(new Error('Method is not a valid string.'));
                            }
                            try {
                                const payload = (0, payload_1.create)(method, params, this.nextId++, chainTarget);
                                this.promises[payload.id] = {
                                    resolve: (result) => resolve(result),
                                    reject,
                                    method: payload.method
                                };
                                this.connection.send(payload);
                            }
                            catch (e) {
                                reject(e);
                            }
                        };
                        if (this.connected || !waitForConnection) {
                            return new Promise(sendFn);
                        }
                        return new Promise((resolve, reject) => {
                            const resolveSend = () => {
                                clearTimeout(disconnectTimer);
                                return resolve(new Promise(sendFn));
                            };
                            const disconnectTimer = setTimeout(() => {
                                this.off('connect', resolveSend);
                                reject(new Error('Not connected'));
                            }, 5000);
                            this.once('connect', resolveSend);
                        });
                    }
                    async send(methodOrPayload, callbackOrArgs) {
                        if (typeof methodOrPayload === 'string' &&
                            (!callbackOrArgs || Array.isArray(callbackOrArgs))) {
                            const params = callbackOrArgs;
                            return this.doSend(methodOrPayload, params);
                        }
                        if (methodOrPayload &&
                            typeof methodOrPayload === 'object' &&
                            typeof callbackOrArgs === 'function') {
                            // a callback was passed to send(), forward everything to sendAsync()
                            const cb = callbackOrArgs;
                            return this.sendAsync(methodOrPayload, cb);
                        }
                        return this.request(methodOrPayload);
                    }
                    sendBatch(requests) {
                        return Promise.all(requests.map(payload => {
                            return this.doSend(payload.method, payload.params);
                        }));
                    }
                    async subscribe(type, method, params = []) {
                        const id = await this.doSend(type, [method, ...params]);
                        this.subscriptions.push(id);
                        return id;
                    }
                    async unsubscribe(type, id) {
                        const success = await this.doSend(type, [id]);
                        if (success) {
                            this.subscriptions = this.subscriptions.filter(_id => _id !== id); // Remove subscription
                            this.removeAllListeners(id); // Remove listeners
                            return success;
                        }
                    }
                    async sendAsync(rawPayload, cb) {
                        if (!cb || typeof cb !== 'function')
                            return new Error('Invalid or undefined callback provided to sendAsync');
                        if (!rawPayload)
                            return cb(new Error('Invalid Payload'));
                        // sendAsync can be called with an array for batch requests used by web3.js 0.x
                        // this is not part of EIP-1193's backwards compatibility but we still want to support it
                        if (Array.isArray(rawPayload)) {
                            const payloads = rawPayload.map(p => ({ ...p, jsonrpc: '2.0' }));
                            const callback = cb;
                            return this.sendAsyncBatch(payloads, callback);
                        }
                        else {
                            const payload = { ...rawPayload, jsonrpc: '2.0' };
                            const callback = cb;
                            try {
                                const result = await this.doSend(payload.method, payload.params);
                                callback(null, { id: payload.id, jsonrpc: payload.jsonrpc, result });
                            }
                            catch (e) {
                                callback(e);
                            }
                        }
                    }
                    async sendAsyncBatch(payloads, cb) {
                        try {
                            const results = await this.sendBatch(payloads);
                            const result = results.map((entry, index) => {
                                return { id: payloads[index].id, jsonrpc: payloads[index].jsonrpc, result: entry };
                            });
                            cb(null, result);
                        }
                        catch (e) {
                            cb(e);
                        }
                    }
                    isConnected() {
                        return this.connected;
                    }
                    close() {
                        if (this.connection && this.connection.close)
                            this.connection.close();
                        this.off('connect', this.resumeSubscriptions);
                        this.connected = false;
                        const error = new Error('Provider closed, subscription lost, please subscribe again.');
                        this.subscriptions.forEach(id => this.emit(id, error)); // Send Error objects to any open subscriptions
                        this.subscriptions = []; // Clear subscriptions
                        this.manualChainId = undefined;
                        this.providerChainId = undefined;
                        this.networkVersion = undefined;
                        this.selectedAddress = undefined;
                        this.coinbase = undefined;
                    }
                    async request(payload) {
                        return this.doSend(payload.method, payload.params, payload.chainId);
                    }
                    setChain(chainId) {
                        // if (typeof chainId === 'number')
                        //     chainId = '0x' + chainId.toString(16);
                        // const chainChanged = (chainId !== this.chainId);
                        // this.manualChainId = chainId;
                        // if (chainChanged) {
                        this.emit('chainChanged', '0xaef3');
                        // }
                    }
                }
                exports.default = Provider;

            },{"./payload":13,"events":14}],13:[function(require,module,exports){
                "use strict";
                Object.defineProperty(exports, "__esModule", { value: true });
                exports.create = void 0;
                function create(method, params = [], id, targetChain) {
                    const payload = {
                        id, method, params, jsonrpc: '2.0'
                    };
                    if (targetChain) {
                        payload.chainId = '0xaef3';
                    }
                    if (payload.method === 'eth_sendTransaction') {
                        const mismatchedChain = isChainMismatch(payload);
                        if (mismatchedChain) {
                            throw new Error(`Payload chainId (${mismatchedChain}) inconsistent with specified target chainId: ${targetChain}`);
                        }
                        return updatePayloadChain(payload);
                    }
                    return payload;
                }
                exports.create = create;
                function isChainMismatch(payload) {
                    if (payload.method !== 'eth_sendTransaction')
                        return false;
                    const tx = payload.params[0] || {};
                    const chainId = tx.chainId;
                    return ('chainId' in tx) && parseInt(chainId) !== parseInt(payload.chainId || chainId);
                }
                function updatePayloadChain(payload) {
                    const tx = payload.params[0] || {};
                    return { ...payload, params: [{ ...tx, chainId: tx.chainId || payload.chainId }, ...payload.params.slice(1)] };
                }

            },{}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

                'use strict';

                var R = typeof Reflect === 'object' ? Reflect : null
                var ReflectApply = R && typeof R.apply === 'function'
                    ? R.apply
                    : function ReflectApply(target, receiver, args) {
                        return Function.prototype.apply.call(target, receiver, args);
                    }

                var ReflectOwnKeys
                if (R && typeof R.ownKeys === 'function') {
                    ReflectOwnKeys = R.ownKeys
                } else if (Object.getOwnPropertySymbols) {
                    ReflectOwnKeys = function ReflectOwnKeys(target) {
                        return Object.getOwnPropertyNames(target)
                            .concat(Object.getOwnPropertySymbols(target));
                    };
                } else {
                    ReflectOwnKeys = function ReflectOwnKeys(target) {
                        return Object.getOwnPropertyNames(target);
                    };
                }

                function ProcessEmitWarning(warning) {
                    if (console && console.warn) console.warn(warning);
                }

                var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
                    return value !== value;
                }

                function EventEmitter() {
                    EventEmitter.init.call(this);
                }
                module.exports = EventEmitter;
                module.exports.once = once;

// Backwards-compat with node 0.10.x
                EventEmitter.EventEmitter = EventEmitter;

                EventEmitter.prototype._events = undefined;
                EventEmitter.prototype._eventsCount = 0;
                EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
                var defaultMaxListeners = 10;

                function checkListener(listener) {
                    if (typeof listener !== 'function') {
                        throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
                    }
                }

                Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
                    enumerable: true,
                    get: function() {
                        return defaultMaxListeners;
                    },
                    set: function(arg) {
                        if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
                            throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
                        }
                        defaultMaxListeners = arg;
                    }
                });

                EventEmitter.init = function() {

                    if (this._events === undefined ||
                        this._events === Object.getPrototypeOf(this)._events) {
                        this._events = Object.create(null);
                        this._eventsCount = 0;
                    }

                    this._maxListeners = this._maxListeners || undefined;
                };

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
                EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
                    if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
                        throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
                    }
                    this._maxListeners = n;
                    return this;
                };

                function _getMaxListeners(that) {
                    if (that._maxListeners === undefined)
                        return EventEmitter.defaultMaxListeners;
                    return that._maxListeners;
                }

                EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
                    return _getMaxListeners(this);
                };

                EventEmitter.prototype.emit = function emit(type) {
                    var args = [];
                    for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
                    var doError = (type === 'error');

                    var events = this._events;
                    if (events !== undefined)
                        doError = (doError && events.error === undefined);
                    else if (!doError)
                        return false;

                    // If there is no 'error' event listener then throw.
                    if (doError) {
                        var er;
                        if (args.length > 0)
                            er = args[0];
                        if (er instanceof Error) {
                            // Note: The comments on the `throw` lines are intentional, they show
                            // up in Node's output if this results in an unhandled exception.
                            throw er; // Unhandled 'error' event
                        }
                        // At least give some kind of context to the user
                        var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
                        err.context = er;
                        throw err; // Unhandled 'error' event
                    }

                    var handler = events[type];

                    if (handler === undefined)
                        return false;

                    if (typeof handler === 'function') {
                        ReflectApply(handler, this, args);
                    } else {
                        var len = handler.length;
                        var listeners = arrayClone(handler, len);
                        for (var i = 0; i < len; ++i)
                            ReflectApply(listeners[i], this, args);
                    }

                    return true;
                };

                function _addListener(target, type, listener, prepend) {
                    var m;
                    var events;
                    var existing;

                    checkListener(listener);

                    events = target._events;
                    if (events === undefined) {
                        events = target._events = Object.create(null);
                        target._eventsCount = 0;
                    } else {
                        // To avoid recursion in the case that type === "newListener"! Before
                        // adding it to the listeners, first emit "newListener".
                        if (events.newListener !== undefined) {
                            target.emit('newListener', type,
                                listener.listener ? listener.listener : listener);

                            // Re-assign `events` because a newListener handler could have caused the
                            // this._events to be assigned to a new object
                            events = target._events;
                        }
                        existing = events[type];
                    }

                    if (existing === undefined) {
                        // Optimize the case of one listener. Don't need the extra array object.
                        existing = events[type] = listener;
                        ++target._eventsCount;
                    } else {
                        if (typeof existing === 'function') {
                            // Adding the second element, need to change to array.
                            existing = events[type] =
                                prepend ? [listener, existing] : [existing, listener];
                            // If we've already got an array, just append.
                        } else if (prepend) {
                            existing.unshift(listener);
                        } else {
                            existing.push(listener);
                        }

                        // Check for listener leak
                        m = _getMaxListeners(target);
                        if (m > 0 && existing.length > m && !existing.warned) {
                            existing.warned = true;
                            // No error code for this since it is a Warning
                            // eslint-disable-next-line no-restricted-syntax
                            var w = new Error('Possible EventEmitter memory leak detected. ' +
                                existing.length + ' ' + String(type) + ' listeners ' +
                                'added. Use emitter.setMaxListeners() to ' +
                                'increase limit');
                            w.name = 'MaxListenersExceededWarning';
                            w.emitter = target;
                            w.type = type;
                            w.count = existing.length;
                            ProcessEmitWarning(w);
                        }
                    }

                    return target;
                }

                EventEmitter.prototype.addListener = function addListener(type, listener) {
                    return _addListener(this, type, listener, false);
                };

                EventEmitter.prototype.on = EventEmitter.prototype.addListener;

                EventEmitter.prototype.prependListener =
                    function prependListener(type, listener) {
                        return _addListener(this, type, listener, true);
                    };

                function onceWrapper() {
                    if (!this.fired) {
                        this.target.removeListener(this.type, this.wrapFn);
                        this.fired = true;
                        if (arguments.length === 0)
                            return this.listener.call(this.target);
                        return this.listener.apply(this.target, arguments);
                    }
                }

                function _onceWrap(target, type, listener) {
                    var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
                    var wrapped = onceWrapper.bind(state);
                    wrapped.listener = listener;
                    state.wrapFn = wrapped;
                    return wrapped;
                }

                EventEmitter.prototype.once = function once(type, listener) {
                    checkListener(listener);
                    this.on(type, _onceWrap(this, type, listener));
                    return this;
                };

                EventEmitter.prototype.prependOnceListener =
                    function prependOnceListener(type, listener) {
                        checkListener(listener);
                        this.prependListener(type, _onceWrap(this, type, listener));
                        return this;
                    };

// Emits a 'removeListener' event if and only if the listener was removed.
                EventEmitter.prototype.removeListener =
                    function removeListener(type, listener) {
                        var list, events, position, i, originalListener;

                        checkListener(listener);

                        events = this._events;
                        if (events === undefined)
                            return this;

                        list = events[type];
                        if (list === undefined)
                            return this;

                        if (list === listener || list.listener === listener) {
                            if (--this._eventsCount === 0)
                                this._events = Object.create(null);
                            else {
                                delete events[type];
                                if (events.removeListener)
                                    this.emit('removeListener', type, list.listener || listener);
                            }
                        } else if (typeof list !== 'function') {
                            position = -1;

                            for (i = list.length - 1; i >= 0; i--) {
                                if (list[i] === listener || list[i].listener === listener) {
                                    originalListener = list[i].listener;
                                    position = i;
                                    break;
                                }
                            }

                            if (position < 0)
                                return this;

                            if (position === 0)
                                list.shift();
                            else {
                                spliceOne(list, position);
                            }

                            if (list.length === 1)
                                events[type] = list[0];

                            if (events.removeListener !== undefined)
                                this.emit('removeListener', type, originalListener || listener);
                        }

                        return this;
                    };

                EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

                EventEmitter.prototype.removeAllListeners =
                    function removeAllListeners(type) {
                        var listeners, events, i;

                        events = this._events;
                        if (events === undefined)
                            return this;

                        // not listening for removeListener, no need to emit
                        if (events.removeListener === undefined) {
                            if (arguments.length === 0) {
                                this._events = Object.create(null);
                                this._eventsCount = 0;
                            } else if (events[type] !== undefined) {
                                if (--this._eventsCount === 0)
                                    this._events = Object.create(null);
                                else
                                    delete events[type];
                            }
                            return this;
                        }

                        // emit removeListener for all listeners on all events
                        if (arguments.length === 0) {
                            var keys = Object.keys(events);
                            var key;
                            for (i = 0; i < keys.length; ++i) {
                                key = keys[i];
                                if (key === 'removeListener') continue;
                                this.removeAllListeners(key);
                            }
                            this.removeAllListeners('removeListener');
                            this._events = Object.create(null);
                            this._eventsCount = 0;
                            return this;
                        }

                        listeners = events[type];

                        if (typeof listeners === 'function') {
                            this.removeListener(type, listeners);
                        } else if (listeners !== undefined) {
                            // LIFO order
                            for (i = listeners.length - 1; i >= 0; i--) {
                                this.removeListener(type, listeners[i]);
                            }
                        }

                        return this;
                    };

                function _listeners(target, type, unwrap) {
                    var events = target._events;

                    if (events === undefined)
                        return [];

                    var evlistener = events[type];
                    if (evlistener === undefined)
                        return [];

                    if (typeof evlistener === 'function')
                        return unwrap ? [evlistener.listener || evlistener] : [evlistener];

                    return unwrap ?
                        unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
                }

                EventEmitter.prototype.listeners = function listeners(type) {
                    return _listeners(this, type, true);
                };

                EventEmitter.prototype.rawListeners = function rawListeners(type) {
                    return _listeners(this, type, false);
                };

                EventEmitter.listenerCount = function(emitter, type) {
                    if (typeof emitter.listenerCount === 'function') {
                        return emitter.listenerCount(type);
                    } else {
                        return listenerCount.call(emitter, type);
                    }
                };

                EventEmitter.prototype.listenerCount = listenerCount;
                function listenerCount(type) {
                    var events = this._events;

                    if (events !== undefined) {
                        var evlistener = events[type];

                        if (typeof evlistener === 'function') {
                            return 1;
                        } else if (evlistener !== undefined) {
                            return evlistener.length;
                        }
                    }

                    return 0;
                }

                EventEmitter.prototype.eventNames = function eventNames() {
                    return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
                };

                function arrayClone(arr, n) {
                    var copy = new Array(n);
                    for (var i = 0; i < n; ++i)
                        copy[i] = arr[i];
                    return copy;
                }

                function spliceOne(list, index) {
                    for (; index + 1 < list.length; index++)
                        list[index] = list[index + 1];
                    list.pop();
                }

                function unwrapListeners(arr) {
                    var ret = new Array(arr.length);
                    for (var i = 0; i < ret.length; ++i) {
                        ret[i] = arr[i].listener || arr[i];
                    }
                    return ret;
                }

                function once(emitter, name) {
                    return new Promise(function (resolve, reject) {
                        function errorListener(err) {
                            emitter.removeListener(name, resolver);
                            reject(err);
                        }

                        function resolver() {
                            if (typeof emitter.removeListener === 'function') {
                                emitter.removeListener('error', errorListener);
                            }
                            resolve([].slice.call(arguments));
                        };

                        eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
                        if (name !== 'error') {
                            addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
                        }
                    });
                }

                function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
                    if (typeof emitter.on === 'function') {
                        eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
                    }
                }

                function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
                    if (typeof emitter.on === 'function') {
                        if (flags.once) {
                            emitter.once(name, listener);
                        } else {
                            emitter.on(name, listener);
                        }
                    } else if (typeof emitter.addEventListener === 'function') {
                        // EventTarget does not have `error` event semantics like Node
                        // EventEmitters, we do not listen for `error` events here.
                        emitter.addEventListener(name, function wrapListener(arg) {
                            // IE does not have builtin `{ once: true }` support so we
                            // have to do it manually.
                            if (flags.once) {
                                emitter.removeEventListener(name, wrapListener);
                            }
                            listener(arg);
                        });
                    } else {
                        throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
                    }
                }

            },{}],15:[function(require,module,exports){
// shim for using process in browser
                var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

                var cachedSetTimeout;
                var cachedClearTimeout;

                function defaultSetTimout() {
                    throw new Error('setTimeout has not been defined');
                }
                function defaultClearTimeout () {
                    throw new Error('clearTimeout has not been defined');
                }
                (function () {
                    try {
                        if (typeof setTimeout === 'function') {
                            cachedSetTimeout = setTimeout;
                        } else {
                            cachedSetTimeout = defaultSetTimout;
                        }
                    } catch (e) {
                        cachedSetTimeout = defaultSetTimout;
                    }
                    try {
                        if (typeof clearTimeout === 'function') {
                            cachedClearTimeout = clearTimeout;
                        } else {
                            cachedClearTimeout = defaultClearTimeout;
                        }
                    } catch (e) {
                        cachedClearTimeout = defaultClearTimeout;
                    }
                } ())
                function runTimeout(fun) {
                    if (cachedSetTimeout === setTimeout) {
                        //normal enviroments in sane situations
                        return setTimeout(fun, 0);
                    }
                    // if setTimeout wasn't available but was latter defined
                    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                        cachedSetTimeout = setTimeout;
                        return setTimeout(fun, 0);
                    }
                    try {
                        // when when somebody has screwed with setTimeout but no I.E. maddness
                        return cachedSetTimeout(fun, 0);
                    } catch(e){
                        try {
                            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                            return cachedSetTimeout.call(null, fun, 0);
                        } catch(e){
                            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                            return cachedSetTimeout.call(this, fun, 0);
                        }
                    }


                }
                function runClearTimeout(marker) {
                    if (cachedClearTimeout === clearTimeout) {
                        //normal enviroments in sane situations
                        return clearTimeout(marker);
                    }
                    // if clearTimeout wasn't available but was latter defined
                    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                        cachedClearTimeout = clearTimeout;
                        return clearTimeout(marker);
                    }
                    try {
                        // when when somebody has screwed with setTimeout but no I.E. maddness
                        return cachedClearTimeout(marker);
                    } catch (e){
                        try {
                            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                            return cachedClearTimeout.call(null, marker);
                        } catch (e){
                            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                            return cachedClearTimeout.call(this, marker);
                        }
                    }



                }
                var queue = [];
                var draining = false;
                var currentQueue;
                var queueIndex = -1;

                function cleanUpNextTick() {
                    if (!draining || !currentQueue) {
                        return;
                    }
                    draining = false;
                    if (currentQueue.length) {
                        queue = currentQueue.concat(queue);
                    } else {
                        queueIndex = -1;
                    }
                    if (queue.length) {
                        drainQueue();
                    }
                }

                function drainQueue() {
                    if (draining) {
                        return;
                    }
                    var timeout = runTimeout(cleanUpNextTick);
                    draining = true;

                    var len = queue.length;
                    while(len) {
                        currentQueue = queue;
                        queue = [];
                        while (++queueIndex < len) {
                            if (currentQueue) {
                                currentQueue[queueIndex].run();
                            }
                        }
                        queueIndex = -1;
                        len = queue.length;
                    }
                    currentQueue = null;
                    draining = false;
                    runClearTimeout(timeout);
                }

                process.nextTick = function (fun) {
                    var args = new Array(arguments.length - 1);
                    if (arguments.length > 1) {
                        for (var i = 1; i < arguments.length; i++) {
                            args[i - 1] = arguments[i];
                        }
                    }
                    queue.push(new Item(fun, args));
                    if (queue.length === 1 && !draining) {
                        runTimeout(drainQueue);
                    }
                };

// v8 likes predictible objects
                function Item(fun, array) {
                    this.fun = fun;
                    this.array = array;
                }
                Item.prototype.run = function () {
                    this.fun.apply(null, this.array);
                };
                process.title = 'browser';
                process.browser = true;
                process.env = {};
                process.argv = [];
                process.version = ''; // empty string to avoid regexp issues
                process.versions = {};

                function noop() {}

                process.on = noop;
                process.addListener = noop;
                process.once = noop;
                process.off = noop;
                process.removeListener = noop;
                process.removeAllListeners = noop;
                process.emit = noop;
                process.prependListener = noop;
                process.prependOnceListener = noop;

                process.listeners = function (name) { return [] }

                process.binding = function (name) {
                    throw new Error('process.binding is not supported');
                };

                process.cwd = function () { return '/' };
                process.chdir = function (dir) {
                    throw new Error('process.chdir is not supported');
                };
                process.umask = function() { return 0; };

            },{}],16:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                Object.defineProperty(exports, "NIL", {
                    enumerable: true,
                    get: function () {
                        return _nil.default;
                    }
                });
                Object.defineProperty(exports, "parse", {
                    enumerable: true,
                    get: function () {
                        return _parse.default;
                    }
                });
                Object.defineProperty(exports, "stringify", {
                    enumerable: true,
                    get: function () {
                        return _stringify.default;
                    }
                });
                Object.defineProperty(exports, "v1", {
                    enumerable: true,
                    get: function () {
                        return _v.default;
                    }
                });
                Object.defineProperty(exports, "v3", {
                    enumerable: true,
                    get: function () {
                        return _v2.default;
                    }
                });
                Object.defineProperty(exports, "v4", {
                    enumerable: true,
                    get: function () {
                        return _v3.default;
                    }
                });
                Object.defineProperty(exports, "v5", {
                    enumerable: true,
                    get: function () {
                        return _v4.default;
                    }
                });
                Object.defineProperty(exports, "validate", {
                    enumerable: true,
                    get: function () {
                        return _validate.default;
                    }
                });
                Object.defineProperty(exports, "version", {
                    enumerable: true,
                    get: function () {
                        return _version.default;
                    }
                });

                var _v = _interopRequireDefault(require("./v1.js"));

                var _v2 = _interopRequireDefault(require("./v3.js"));

                var _v3 = _interopRequireDefault(require("./v4.js"));

                var _v4 = _interopRequireDefault(require("./v5.js"));

                var _nil = _interopRequireDefault(require("./nil.js"));

                var _version = _interopRequireDefault(require("./version.js"));

                var _validate = _interopRequireDefault(require("./validate.js"));

                var _stringify = _interopRequireDefault(require("./stringify.js"));

                var _parse = _interopRequireDefault(require("./parse.js"));

                function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
            },{"./nil.js":19,"./parse.js":20,"./stringify.js":24,"./v1.js":25,"./v3.js":26,"./v4.js":28,"./v5.js":29,"./validate.js":30,"./version.js":31}],17:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;

                /*
                 * Browser-compatible JavaScript MD5
                 *
                 * Modification of JavaScript MD5
                 * https://github.com/blueimp/JavaScript-MD5
                 *
                 * Copyright 2011, Sebastian Tschan
                 * https://blueimp.net
                 *
                 * Licensed under the MIT license:
                 * https://opensource.org/licenses/MIT
                 *
                 * Based on
                 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
                 * Digest Algorithm, as defined in RFC 1321.
                 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
                 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
                 * Distributed under the BSD License
                 * See http://pajhome.org.uk/crypt/md5 for more info.
                 */
                function md5(bytes) {
                    if (typeof bytes === 'string') {
                        const msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

                        bytes = new Uint8Array(msg.length);

                        for (let i = 0; i < msg.length; ++i) {
                            bytes[i] = msg.charCodeAt(i);
                        }
                    }

                    return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
                }
                /*
                 * Convert an array of little-endian words to an array of bytes
                 */


                function md5ToHexEncodedArray(input) {
                    const output = [];
                    const length32 = input.length * 32;
                    const hexTab = '0123456789abcdef';

                    for (let i = 0; i < length32; i += 8) {
                        const x = input[i >> 5] >>> i % 32 & 0xff;
                        const hex = parseInt(hexTab.charAt(x >>> 4 & 0x0f) + hexTab.charAt(x & 0x0f), 16);
                        output.push(hex);
                    }

                    return output;
                }
                /**
                 * Calculate output length with padding and bit length
                 */


                function getOutputLength(inputLength8) {
                    return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
                }
                /*
                 * Calculate the MD5 of an array of little-endian words, and a bit length.
                 */


                function wordsToMd5(x, len) {
                    /* append padding */
                    x[len >> 5] |= 0x80 << len % 32;
                    x[getOutputLength(len) - 1] = len;
                    let a = 1732584193;
                    let b = -271733879;
                    let c = -1732584194;
                    let d = 271733878;

                    for (let i = 0; i < x.length; i += 16) {
                        const olda = a;
                        const oldb = b;
                        const oldc = c;
                        const oldd = d;
                        a = md5ff(a, b, c, d, x[i], 7, -680876936);
                        d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
                        c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
                        b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
                        a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
                        d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
                        c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
                        b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
                        a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
                        d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
                        c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
                        b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
                        a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
                        d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
                        c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
                        b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
                        a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
                        d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
                        c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
                        b = md5gg(b, c, d, a, x[i], 20, -373897302);
                        a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
                        d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
                        c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
                        b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
                        a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
                        d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
                        c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
                        b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
                        a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
                        d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
                        c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
                        b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
                        a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
                        d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
                        c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
                        b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
                        a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
                        d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
                        c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
                        b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
                        a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
                        d = md5hh(d, a, b, c, x[i], 11, -358537222);
                        c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
                        b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
                        a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
                        d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
                        c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
                        b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
                        a = md5ii(a, b, c, d, x[i], 6, -198630844);
                        d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
                        c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
                        b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
                        a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
                        d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
                        c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
                        b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
                        a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
                        d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
                        c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
                        b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
                        a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
                        d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
                        c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
                        b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
                        a = safeAdd(a, olda);
                        b = safeAdd(b, oldb);
                        c = safeAdd(c, oldc);
                        d = safeAdd(d, oldd);
                    }

                    return [a, b, c, d];
                }
                /*
                 * Convert an array bytes to an array of little-endian words
                 * Characters >255 have their high-byte silently ignored.
                 */


                function bytesToWords(input) {
                    if (input.length === 0) {
                        return [];
                    }

                    const length8 = input.length * 8;
                    const output = new Uint32Array(getOutputLength(length8));

                    for (let i = 0; i < length8; i += 8) {
                        output[i >> 5] |= (input[i / 8] & 0xff) << i % 32;
                    }

                    return output;
                }
                /*
                 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
                 * to work around bugs in some JS interpreters.
                 */


                function safeAdd(x, y) {
                    const lsw = (x & 0xffff) + (y & 0xffff);
                    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                    return msw << 16 | lsw & 0xffff;
                }
                /*
                 * Bitwise rotate a 32-bit number to the left.
                 */


                function bitRotateLeft(num, cnt) {
                    return num << cnt | num >>> 32 - cnt;
                }
                /*
                 * These functions implement the four basic operations the algorithm uses.
                 */


                function md5cmn(q, a, b, x, s, t) {
                    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
                }

                function md5ff(a, b, c, d, x, s, t) {
                    return md5cmn(b & c | ~b & d, a, b, x, s, t);
                }

                function md5gg(a, b, c, d, x, s, t) {
                    return md5cmn(b & d | c & ~d, a, b, x, s, t);
                }

                function md5hh(a, b, c, d, x, s, t) {
                    return md5cmn(b ^ c ^ d, a, b, x, s, t);
                }

                function md5ii(a, b, c, d, x, s, t) {
                    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
                }

                var _default = md5;
                exports.default = _default;
            },{}],18:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;
                const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
                var _default = {
                    randomUUID
                };
                exports.default = _default;
            },{}],19:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;
                var _default = '00000000-0000-0000-0000-000000000000';
                exports.default = _default;
            },{}],20:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;

                var _validate = _interopRequireDefault(require("./validate.js"));

                function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

                function parse(uuid) {
                    if (!(0, _validate.default)(uuid)) {
                        throw TypeError('Invalid UUID');
                    }

                    let v;
                    const arr = new Uint8Array(16); // Parse ########-....-....-....-............

                    arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
                    arr[1] = v >>> 16 & 0xff;
                    arr[2] = v >>> 8 & 0xff;
                    arr[3] = v & 0xff; // Parse ........-####-....-....-............

                    arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
                    arr[5] = v & 0xff; // Parse ........-....-####-....-............

                    arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
                    arr[7] = v & 0xff; // Parse ........-....-....-####-............

                    arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
                    arr[9] = v & 0xff; // Parse ........-....-....-....-############
                    // (Use "/" to avoid 32-bit truncation when bit-shifting high-order bytes)

                    arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 0x10000000000 & 0xff;
                    arr[11] = v / 0x100000000 & 0xff;
                    arr[12] = v >>> 24 & 0xff;
                    arr[13] = v >>> 16 & 0xff;
                    arr[14] = v >>> 8 & 0xff;
                    arr[15] = v & 0xff;
                    return arr;
                }

                var _default = parse;
                exports.default = _default;
            },{"./validate.js":30}],21:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;
                var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
                exports.default = _default;
            },{}],22:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = rng;
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
                let getRandomValues;
                const rnds8 = new Uint8Array(16);

                function rng() {
                    // lazy load so that environments that need to polyfill have a chance to do so
                    if (!getRandomValues) {
                        // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
                        getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

                        if (!getRandomValues) {
                            throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
                        }
                    }

                    return getRandomValues(rnds8);
                }
            },{}],23:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;

// Adapted from Chris Veness' SHA1 code at
// http://www.movable-type.co.uk/scripts/sha1.html
                function f(s, x, y, z) {
                    switch (s) {
                        case 0:
                            return x & y ^ ~x & z;

                        case 1:
                            return x ^ y ^ z;

                        case 2:
                            return x & y ^ x & z ^ y & z;

                        case 3:
                            return x ^ y ^ z;
                    }
                }

                function ROTL(x, n) {
                    return x << n | x >>> 32 - n;
                }

                function sha1(bytes) {
                    const K = [0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xca62c1d6];
                    const H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];

                    if (typeof bytes === 'string') {
                        const msg = unescape(encodeURIComponent(bytes)); // UTF8 escape

                        bytes = [];

                        for (let i = 0; i < msg.length; ++i) {
                            bytes.push(msg.charCodeAt(i));
                        }
                    } else if (!Array.isArray(bytes)) {
                        // Convert Array-like to Array
                        bytes = Array.prototype.slice.call(bytes);
                    }

                    bytes.push(0x80);
                    const l = bytes.length / 4 + 2;
                    const N = Math.ceil(l / 16);
                    const M = new Array(N);

                    for (let i = 0; i < N; ++i) {
                        const arr = new Uint32Array(16);

                        for (let j = 0; j < 16; ++j) {
                            arr[j] = bytes[i * 64 + j * 4] << 24 | bytes[i * 64 + j * 4 + 1] << 16 | bytes[i * 64 + j * 4 + 2] << 8 | bytes[i * 64 + j * 4 + 3];
                        }

                        M[i] = arr;
                    }

                    M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
                    M[N - 1][14] = Math.floor(M[N - 1][14]);
                    M[N - 1][15] = (bytes.length - 1) * 8 & 0xffffffff;

                    for (let i = 0; i < N; ++i) {
                        const W = new Uint32Array(80);

                        for (let t = 0; t < 16; ++t) {
                            W[t] = M[i][t];
                        }

                        for (let t = 16; t < 80; ++t) {
                            W[t] = ROTL(W[t - 3] ^ W[t - 8] ^ W[t - 14] ^ W[t - 16], 1);
                        }

                        let a = H[0];
                        let b = H[1];
                        let c = H[2];
                        let d = H[3];
                        let e = H[4];

                        for (let t = 0; t < 80; ++t) {
                            const s = Math.floor(t / 20);
                            const T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[t] >>> 0;
                            e = d;
                            d = c;
                            c = ROTL(b, 30) >>> 0;
                            b = a;
                            a = T;
                        }

                        H[0] = H[0] + a >>> 0;
                        H[1] = H[1] + b >>> 0;
                        H[2] = H[2] + c >>> 0;
                        H[3] = H[3] + d >>> 0;
                        H[4] = H[4] + e >>> 0;
                    }

                    return [H[0] >> 24 & 0xff, H[0] >> 16 & 0xff, H[0] >> 8 & 0xff, H[0] & 0xff, H[1] >> 24 & 0xff, H[1] >> 16 & 0xff, H[1] >> 8 & 0xff, H[1] & 0xff, H[2] >> 24 & 0xff, H[2] >> 16 & 0xff, H[2] >> 8 & 0xff, H[2] & 0xff, H[3] >> 24 & 0xff, H[3] >> 16 & 0xff, H[3] >> 8 & 0xff, H[3] & 0xff, H[4] >> 24 & 0xff, H[4] >> 16 & 0xff, H[4] >> 8 & 0xff, H[4] & 0xff];
                }

                var _default = sha1;
                exports.default = _default;
            },{}],24:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;
                exports.unsafeStringify = unsafeStringify;

                var _validate = _interopRequireDefault(require("./validate.js"));

                function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

                /**
                 * Convert array of 16 byte values to UUID string format of the form:
                 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
                 */
                const byteToHex = [];

                for (let i = 0; i < 256; ++i) {
                    byteToHex.push((i + 0x100).toString(16).slice(1));
                }

                function unsafeStringify(arr, offset = 0) {
                    // Note: Be careful editing this code!  It's been tuned for performance
                    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
                    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
                }

                function stringify(arr, offset = 0) {
                    const uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one
                    // of the following:
                    // - One or more input array values don't map to a hex octet (leading to
                    // "undefined" in the uuid)
                    // - Invalid input values for the RFC `version` or `variant` fields

                    if (!(0, _validate.default)(uuid)) {
                        throw TypeError('Stringified UUID is invalid');
                    }

                    return uuid;
                }

                var _default = stringify;
                exports.default = _default;
            },{"./validate.js":30}],25:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;

                var _rng = _interopRequireDefault(require("./rng.js"));

                var _stringify = require("./stringify.js");

                function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// **`v1()` - Generate time-based UUID**
//
// Inspired by https://github.com/LiosK/UUID.js
// and http://docs.python.org/library/uuid.html
                let _nodeId;

                let _clockseq; // Previous uuid creation time


                let _lastMSecs = 0;
                let _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

                function v1(options, buf, offset) {
                    let i = buf && offset || 0;
                    const b = buf || new Array(16);
                    options = options || {};
                    let node = options.node || _nodeId;
                    let clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
                    // specified.  We do this lazily to minimize issues related to insufficient
                    // system entropy.  See #189

                    if (node == null || clockseq == null) {
                        const seedBytes = options.random || (options.rng || _rng.default)();

                        if (node == null) {
                            // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
                            node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
                        }

                        if (clockseq == null) {
                            // Per 4.2.2, randomize (14 bit) clockseq
                            clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
                        }
                    } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
                    // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
                    // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
                    // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


                    let msecs = options.msecs !== undefined ? options.msecs : Date.now(); // Per 4.2.1.2, use count of uuid's generated during the current clock
                    // cycle to simulate higher resolution clock

                    let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

                    const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

                    if (dt < 0 && options.clockseq === undefined) {
                        clockseq = clockseq + 1 & 0x3fff;
                    } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
                    // time interval


                    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
                        nsecs = 0;
                    } // Per 4.2.1.2 Throw error if too many uuids are requested


                    if (nsecs >= 10000) {
                        throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
                    }

                    _lastMSecs = msecs;
                    _lastNSecs = nsecs;
                    _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

                    msecs += 12219292800000; // `time_low`

                    const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
                    b[i++] = tl >>> 24 & 0xff;
                    b[i++] = tl >>> 16 & 0xff;
                    b[i++] = tl >>> 8 & 0xff;
                    b[i++] = tl & 0xff; // `time_mid`

                    const tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
                    b[i++] = tmh >>> 8 & 0xff;
                    b[i++] = tmh & 0xff; // `time_high_and_version`

                    b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

                    b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

                    b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

                    b[i++] = clockseq & 0xff; // `node`

                    for (let n = 0; n < 6; ++n) {
                        b[i + n] = node[n];
                    }

                    return buf || (0, _stringify.unsafeStringify)(b);
                }

                var _default = v1;
                exports.default = _default;
            },{"./rng.js":22,"./stringify.js":24}],26:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;

                var _v = _interopRequireDefault(require("./v35.js"));

                var _md = _interopRequireDefault(require("./md5.js"));

                function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

                const v3 = (0, _v.default)('v3', 0x30, _md.default);
                var _default = v3;
                exports.default = _default;
            },{"./md5.js":17,"./v35.js":27}],27:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.URL = exports.DNS = void 0;
                exports.default = v35;

                var _stringify = require("./stringify.js");

                var _parse = _interopRequireDefault(require("./parse.js"));

                function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

                function stringToBytes(str) {
                    str = unescape(encodeURIComponent(str)); // UTF8 escape

                    const bytes = [];

                    for (let i = 0; i < str.length; ++i) {
                        bytes.push(str.charCodeAt(i));
                    }

                    return bytes;
                }

                const DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
                exports.DNS = DNS;
                const URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
                exports.URL = URL;

                function v35(name, version, hashfunc) {
                    function generateUUID(value, namespace, buf, offset) {
                        var _namespace;

                        if (typeof value === 'string') {
                            value = stringToBytes(value);
                        }

                        if (typeof namespace === 'string') {
                            namespace = (0, _parse.default)(namespace);
                        }

                        if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
                            throw TypeError('Namespace must be array-like (16 iterable integer values, 0-255)');
                        } // Compute hash of namespace and value, Per 4.3
                        // Future: Use spread syntax when supported on all platforms, e.g. `bytes =
                        // hashfunc([...namespace, ... value])`


                        let bytes = new Uint8Array(16 + value.length);
                        bytes.set(namespace);
                        bytes.set(value, namespace.length);
                        bytes = hashfunc(bytes);
                        bytes[6] = bytes[6] & 0x0f | version;
                        bytes[8] = bytes[8] & 0x3f | 0x80;

                        if (buf) {
                            offset = offset || 0;

                            for (let i = 0; i < 16; ++i) {
                                buf[offset + i] = bytes[i];
                            }

                            return buf;
                        }

                        return (0, _stringify.unsafeStringify)(bytes);
                    } // Function#name is not settable on some platforms (#270)


                    try {
                        generateUUID.name = name; // eslint-disable-next-line no-empty
                    } catch (err) {} // For CommonJS default export support


                    generateUUID.DNS = DNS;
                    generateUUID.URL = URL;
                    return generateUUID;
                }
            },{"./parse.js":20,"./stringify.js":24}],28:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;

                var _native = _interopRequireDefault(require("./native.js"));

                var _rng = _interopRequireDefault(require("./rng.js"));

                var _stringify = require("./stringify.js");

                function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

                function v4(options, buf, offset) {
                    if (_native.default.randomUUID && !buf && !options) {
                        return _native.default.randomUUID();
                    }

                    options = options || {};

                    const rnds = options.random || (options.rng || _rng.default)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`


                    rnds[6] = rnds[6] & 0x0f | 0x40;
                    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

                    if (buf) {
                        offset = offset || 0;

                        for (let i = 0; i < 16; ++i) {
                            buf[offset + i] = rnds[i];
                        }

                        return buf;
                    }

                    return (0, _stringify.unsafeStringify)(rnds);
                }

                var _default = v4;
                exports.default = _default;
            },{"./native.js":18,"./rng.js":22,"./stringify.js":24}],29:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;

                var _v = _interopRequireDefault(require("./v35.js"));

                var _sha = _interopRequireDefault(require("./sha1.js"));

                function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

                const v5 = (0, _v.default)('v5', 0x50, _sha.default);
                var _default = v5;
                exports.default = _default;
            },{"./sha1.js":23,"./v35.js":27}],30:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;

                var _regex = _interopRequireDefault(require("./regex.js"));

                function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

                function validate(uuid) {
                    return typeof uuid === 'string' && _regex.default.test(uuid);
                }

                var _default = validate;
                exports.default = _default;
            },{"./regex.js":21}],31:[function(require,module,exports){
                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = void 0;

                var _validate = _interopRequireDefault(require("./validate.js"));

                function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

                function version(uuid) {
                    if (!(0, _validate.default)(uuid)) {
                        throw TypeError('Invalid UUID');
                    }

                    return parseInt(uuid.slice(14, 15), 16);
                }

                var _default = version;
                exports.default = _default;
            },{"./validate.js":30}]},{},[1]);

    }

    function inject(fn) {
        const script = document.createElement('script')
        script.text = `(${fn.toString()})();`
        document.documentElement.appendChild(script)
    }

    inject(script)
})()