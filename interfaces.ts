import { number } from "prop-types";

export interface RB {
    base: string;
    rel: string;
}
export interface sendType {
    rb: RB;
    from: string;
    address: string;
    amount: number;
    options: sendOptionsType;
}
export interface pendingSendType {
    rb: RB,
    config: C,
    balance: string;
    pending: string;
    address: string,
    options: sendOptionsType;
}
export interface sendOptionsType {
    wif: string;
    publicKey: string;
    fees?: number;
    config?: C;
    gasLimit?: number;
    gasPrice?: number;
    balance?: BalanceType;
}
export interface ethTransactionType {
    nonce: string;
    gasLimit: string;
    gasPrice: string;
    to: string;
    from: string;
    data?: string;
    value: string;
}
export interface txParamsType {
    rb: RB;
    address: string;
    config: C;
}
export interface TransactionType {
    from: string;
    hash: string;
    value: number;
    kind: string;
    fee: number;
    timestamp: number;
    confirmations?: number;
    asset?: AssetType;
}
export interface BalanceType {
    balance: number;
    pending?: number;
    balance_raw?: number | string;
    pending_raw?: number | string;
}
export interface BalancesType {
    [key: string]: BalanceType;
}
export interface ClauseType {
    to: string;
    value: string;
    data: string;
}
export interface WalletType {
    wif: string;
    address: string;
    publicKey: string;
}
export interface AssetType{
    hash: string;
    ticker: string;
    name: string;
    decimals: number;
}
export interface AssetsType{
    [key: string]: AssetType;
}

export interface ConfigType{
    explorer: string;
    api: string;
    code: number;
    decimals: number;
    forks: Array<string>;
    fee_label: string;
    name: string;
    base?: boolean;
    network?: any;
    ofBase?: string;
    rpc?: string;
    assets?: AssetsType;
    
    //eth
    api_tokens?: string;
    dualFee?: boolean;    

    //nano
    noFee?: boolean;
    rep?: string;    

    //vet
    energy_ticker?: string;
    chainTag?: number;    

    //xrp
    node?: string;
}
export interface C {
    [key: string]: ConfigType;
}