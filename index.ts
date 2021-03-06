import { C, RB, ConfigType, IAssetType} from './interfaces';
export * from './interfaces';
import WAValidator from "wallet-address-validator";
import axios from "axios";
import { Socket } from 'phoenix';
import { http2Ws } from 'app/utils';
import * as omnijs from 'app/omnijs';
import { hexlify } from 'ethers/utils';
export const isTestnet = process.env.NODE_ENVX == 'production' || process.env.NODE_ENVX == 'test' ? false : true;
export const etherscan_api_key = "8FISWFNZET4P2J451BY5I5GERA5MZG34S2";
export const config = isTestnet ? require(`app/constants/shared/test_config`).default : require(`app/constants/shared/config`).default;
export const explorer_api = isTestnet ? "https://blockchainbalancetest.herokuapp.com" : "https://blockchainbalance.herokuapp.com";
export const MAX_DECIMAL = 6;
export const MAX_DECIMAL_FIAT = 2;
export const REFRESH_TIMEOUT = 10000;
export const transferABI = ["function transfer(address to, uint amount)"];

export const getAtomicValue = (rb: RB): number => {
    return config[rb.rel] ? 10 ** config[rb.rel].decimals : 10 ** config[rb.base].assets[rb.rel].decimals;
};
export const getConfig = (rb: RB): ConfigType | ConfigType & IAssetType =>  {
    return config[rb.rel] ? config[rb.rel] : {
        ...config[rb.base]
        , ...config[rb.base].assets[rb.rel]};
};

export const isValidAddress = (config: C, address: string, rb: RB): boolean => {
    if(rb.base == "VET"){
        rb = {base: "ETH", rel: "ETH" }
    }
    let networkType = `prod`;
    if (isTestnet) {
        networkType = `testnet`;
    }
    if (WAValidator.validate(address, config[rb.base].hasOwnProperty("assets") ? rb.base: rb.rel, networkType)) return true;
    return false;
};
const coininfo = require('coininfo')
export const getNetwork = (ticker) => {
    const t = isTestnet ? "-TEST": "";
    const network = coininfo(`${ticker}${t}`).toBitcoinJS()  
    return network;
}
export const toBitcoinJS = (o) => {
    return {...o, 
        messagePrefix: "\x18Bitcoin Signed Message:\n", // TODO
        bip32: {
            public: o.versions.bip32.public,
            private: o.versions.bip32.private,
        },
        pubKeyHash: o.versions.public,
        scriptHash: o.versions.scripthash,
        wif: o.versions.private,
        dustThreshold: null};
};

export const numberWithCommas = (x) => {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
};
export const smartTrim = (string, maxLength) => {
    if (!string) { return string; }
    if (maxLength < 1) { return string; }
    if (string.length <= maxLength) { return string; }
    if (maxLength == 1) { return string.substring(0, 1) + "..."; }

    let midpoint = Math.ceil(string.length / 2);
    let toremove = string.length - maxLength;
    let lstrip = Math.ceil(toremove / 2);
    let rstrip = toremove - lstrip;
    return string.substring(0, midpoint - lstrip) + "..."
        + string.substring(midpoint + rstrip);
};

const socket = new Socket(http2Ws(`${explorer_api}/socket`))
socket.connect()

let info_channel = socket.channel("info")
info_channel.join()

export const initSocket = (walletStore) => {
    info_channel.on("pong_balance", msg => {
        const list = msg.list;
        list.map(o=>{
            if (list.rel == "NANO" && o.pending > 0) {
                //pendingSyncNano({ config, rb: { rel: o.rel, base: o.rel }, balance: o.balance, pending: o.pending, address: self.keys[o.rel].address, options: { publicKey: self.keys[o.rel].publicKey, wif: self.keys[o.rel].wif } });
            }
            walletStore.setBalance(o.rel, {balance: o.balance, pending: o.pending || 0});
        })
    })
    info_channel.on("pong_txs", msg => {
        walletStore.setTxs(msg.txs);
    })
    return { info_channel, socket };
}
export const syncTxs = ({ rel, base, address }) => {
    info_channel.push('ping_txs', {
        rel: rel,
        base: base,
        address: address,
    })
}

export const syncBalances = (keys) => {
    const coins = Object.keys(config).map((o) => {
        return {
            ticker: o,
            address: keys.get(o).address
        }
    })
    setInterval(()=>{
        info_channel.push('ping_balance', { coins })
    }, REFRESH_TIMEOUT)
}

export const syncFiatPrices = async(priceStore) => {
    let allcoins = [];
    for (const x in config) {
        allcoins.push(x);
        if (config.assets) {
            allcoins = allcoins.concat(Object.keys(config.assets));
        }
    }
    const data = await axios.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${([].concat.apply([], [allcoins])).join()}&tsyms=${priceStore.fiat.name}`);
    Object.keys(data.data).map((o) => {
        priceStore.setFiatPrice(o, { ticker: o, value: data.data[o][priceStore.fiat.name] });
    });
}

export const sendExecute = async ({ address, amount, _data = "", walletStore }) => {
    const rb = {rel: walletStore.rel, base: walletStore.base};
    let extra = {};
    if (config[rb.base].dualFee) {
        extra = {
            gasLimit: hexlify(walletStore.gasLimit),
            gasPrice: hexlify(walletStore.gasPrice),
        }
    }
    const keys = walletStore.getKey(rb.rel, rb.base)
    return await omnijs.send(
        rb,
        keys.address,
        address,
        amount,
        {
            wif: keys.wif,
            fees: walletStore.fees,
            publicKey: keys.publicKey,
            balance: walletStore.balances.get(rb.rel),
            ...extra,
        });
}