import { C, RB, ConfigType, IAssetType} from './interfaces';
export * from './interfaces';
import WAValidator from "wallet-address-validator";
import { Socket } from 'phoenix';
import { http2Ws } from 'app/utils';
const isTestnet = process.env.NODE_ENV !== 'production';
export const etherscan_api_key = "8FISWFNZET4P2J451BY5I5GERA5MZG34S2";
export const config = isTestnet ? require(`app/constants/shared/test_config`).default : require(`app/constants/shared/config`).default;
export const explorer_api = isTestnet ? "https://blockchainbalancetest.herokuapp.com/" : "https://blockchainbalance.herokuapp.com";
export const MAX_DECIMAL = 6;
export const MAX_DECIMAL_FIAT = 2;

export const transferABI = [{ constant: !1, inputs: [{ name: "_to", type: "address" }, { name: "_value", type: "uint256" }], name: "transfer", outputs: [{ name: "", type: "bool" }], type: "function" }];

export const getAtomicValue = (config: C, rb: RB): number => {
    return config[rb.rel] ? config[rb.rel].decimals : 10 ** config[rb.base].assets[rb.rel].decimals;
};
export const getConfig = (config: C, rb: RB): ConfigType | ConfigType & IAssetType =>  {
    return config[rb.rel] ? config[rb.rel] : {
        ...config[rb.base]
        , ...config[rb.base].assets[rb.rel]};
};

export const isValidAddress = (config: C, address: string, rb: RB): boolean => {
    let networkType = `prod`;
    if (config[rb.base].code == 1) {
        networkType = `testnet`;
    }
    if (WAValidator.validate(address, config[rb.base].hasOwnProperty("assets") ? rb.base: rb.rel, networkType)) return true;
    return false;
};

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
        if (msg.ticker == "NANO" && msg.balances.pending > 0) {
            //pendingSyncNano({ config, rb: { rel: msg.ticker, base: msg.ticker }, balance: msg.balances.balance, pending: msg.balances.pending, address: self.keys[msg.ticker].address, options: { publicKey: self.keys[msg.ticker].publicKey, wif: self.keys[msg.ticker].wif } });
        }
        walletStore.setBalance(msg.ticker, msg.balances);
    })
    info_channel.on("pong_tx", msg => {
        walletStore.setTxs(msg);
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
            address: keys[o].address
        }
    })
    info_channel.push('ping_balance', { coins })
}