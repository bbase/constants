import WAValidator from "wallet-address-validator";
export const etherscan_api_key = "8FISWFNZET4P2J451BY5I5GERA5MZG34S2";
export const darkColors = {
    primary: {
        light: "#d3d9ee",
        main: "#6b80c5",
        dark: "#3c50a3",
        contrastText: "#fff",
    },
};
export const MAX_DECIMAL = 6;
export const MAX_DECIMAL_FIAT = 2;
export const isTestnet = true;

export const transferABI = [{ constant: !1, inputs: [{ name: "_to", type: "address" }, { name: "_value", type: "uint256" }], name: "transfer", outputs: [{ name: "", type: "bool" }], type: "function" }];

export const getAtomicValue = (config: any, rel, base) => {
    return config[rel] ? config[rel].decimals : 10 ** config[base].assets[rel].decimals;
};
export const getConfig = (config: any, rel: string, base: string) => {
    return config[rel] ? config[rel] : {
        explorer: config[base].explorer,
        api: config[base].api,
        rpc: config[base].rpc, ...config[base].assets[rel]};
};

export const isValidAddress = (config: any, address, rel, base) => {
    let networkType = `prod`;
    if (config[base].code == 1) {
        networkType = `testnet`;
    }
    switch (base) {
        case "BTC":
        case "NEO":
        case "NANO":
            if (WAValidator.validate(address, rel, networkType)) { return true; }
        case "XRP":
            return true;
        default:
        case "ETH":
            if (WAValidator.validate(address, base, networkType)) { return true; }
            break;
    }
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
