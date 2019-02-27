import { types, Instance } from 'mobx-state-tree';

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
    from?: string;
    data?: string;
    value: string;
}
export interface txParamsType {
    rb: RB;
    address: string;
}
export interface generateKeysType {
    _new?: boolean;
    _passphrase?: string;
    _mnemonic?: string;
    store_mnemonic?: boolean;
    store_passphrase?: boolean;
};

export const AssetType = types.model({
    hash: types.string,
    ticker: types.string,
    name: types.string,
    decimals: types.number,
});
export const TransactionType = types.model({
    from: types.string,
    hash: types.string,
    value: types.number,
    kind: types.string,
    fee: types.number,
    timestamp: types.number,
    confirmations: types.optional(types.number, 0),
    asset: types.maybe(AssetType),
});
export type ITransactionType = Instance<typeof TransactionType>;
export type IAssetType = Instance<typeof AssetType>;

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
export interface AssetsType{
    [key: string]: IAssetType;
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