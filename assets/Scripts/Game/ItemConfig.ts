export type ItemConfig = {
    symbol: number,
    value: number,
    type: number,
    size:number,
}


export enum E_SYMBOL {
    H1 = 9,
    H2 = 8,
    H3 = 7,
    H4 = 6,
    L1 = 5,
    L2 = 4,
    L3 = 3,
    L4 = 2,
    L5 = 1,
    SCATTER = 10,
    MULTIPLIER = 11,
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
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
    11: "11",
    12: "0_1",
    13: "Jackpot"
}

export enum E_SYMBOL_TYPE {
    NORMAL_BLOCK = 0,
    JACKPOT_BLOCK = 1,
    MONEY_CREDIT_BLOCK = 2,
    COLLECT_BLOCK = 3
}