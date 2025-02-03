import PlayerData from "../Data/PlayerData";
import { Cfg } from "../Manager/Config";
import RootData from "../Manager/RootData";


const { ccclass, property } = cc._decorator;

@ccclass
export default class CurrencyConverter {
    
    static getCreditString(num: number, displayCurrency: boolean = false, isInteger: boolean = false): string {
        const data =  RootData.instance.FindComponent(PlayerData).authorizeData;
        let str: string = '';
        // if (data.currency.mode == 'THIN' && data.currency.isThinEnabled && !(num > -1e3 && num < 1e3)) {
        //     str = CurrencyConverter.getThinCreditString(num, isInteger);
        // } else {
            str = CurrencyConverter.getFormattedCreditString(num, isInteger);
        // }
        if (displayCurrency) {
            str = Cfg.currency + ' ' + str;
        }
        return str;
    }

    static getFormattedCreditString(num: number, isInteger: boolean = false): string {
        //clamp away js auto added decimal part
        const clamped_num = parseFloat(num.toFixed(10));
        let result_str = clamped_num.toString();
        //locale
        const locale_opt = {
            minimumFractionDigits: isInteger ? 0 : Cfg.decimalDigits,
            maximumFractionDigits: isInteger ? 0 : Cfg.decimalDigits,
            style: 'decimal'
        };
        result_str = clamped_num.toLocaleString(undefined, locale_opt);
        return result_str;
    }

    static getThinCreditString(num: number, isInteger: boolean = false): string {
        const locale_opt = {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
            style: 'decimal'
        };
        let newVal = Math.trunc(num);
        let thin_char: string = '';

        let isNegativeValue = false;
        if(newVal < 0){
            isNegativeValue = true;
            newVal *= -1;
        }

        if (newVal >= 1e3 && newVal < 1e6) {
            newVal = newVal / 1e3;
            thin_char = 'K';
        }
        if (newVal >= 1e6 && newVal < 1e9) {
            newVal = newVal / 1e6;
            thin_char = 'M';
        }
        if (newVal >= 1e9 && newVal < 1e12) {
            newVal = newVal / 1e9;
            thin_char = 'B';
        }
        if (newVal >= 1e12) {
            newVal = newVal / 1e12;
            thin_char = 'T';
        }
        //round DOWN to 3 digits after decimal point
        const re = new RegExp("(\\d+\\.\\d{3})(\\d)");
        const m = newVal.toString().match(re);
        newVal = m ? parseFloat(m[1]) : newVal;
        let result_str: string = newVal.toLocaleString(undefined, locale_opt);
        if (isNegativeValue) {
            result_str = '-' + result_str;
        }
        result_str += thin_char;
        return result_str;
    }
}
