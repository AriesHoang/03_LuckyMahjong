export type ItemConfig = {
    symbol: number,
    value: number,
    type: number,
    size:number,
}


export enum E_SYMBOL {
    H1 = 11,
    H2 = 10,
    H3 = 9,
    H4 = 8,
    H5 = 7,
    L1 = 6,
    L2 = 5,
    L3 = 4,
    L4 = 3,
    L5 = 2,
    L6 = 1,
    SCATTER = 12,
    WILD = 13,
    SYMBOL_NUM
}
export const ITEMRED={
    2:"H2",
    5:"H5"
}
export const  ITEMPURPLE = {
    1:"H1",
    4:"H4"
}

export const  ITEMGREEN= {
    3:"H3",
    6:"H6"
}


export const E_SYMBOL_Atlas = {
    1: "12",
    2: "11",
    3: "10",
    4: "9",
    5: "8",
    6: "7",
    7: "6",
    8: "5",
    9: "4",
    10: "3",
    11: "2",
    12: "1",
    13: "0"
}

export enum E_SYMBOL_TYPE {
    NORMAL_BLOCK = 0,
    JACKPOT_BLOCK = 1,
    MONEY_CREDIT_BLOCK = 2,
    COLLECT_BLOCK = 3
}