// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Cfg, supportedTextLanguage } from "../../Manager/Config";
import StageLoadingNode from "../../Stageloading/StageLoadingNode";
import UtilsStageLoading from "../../Stageloading/UtilsStageLoading";


export enum FontCategory { Main, Sub1 }

const { ccclass, property } = cc._decorator;

@ccclass
export default class StageLoadingFont extends cc.Component {
    static font: cc.Font[] = [];
    public static instance: StageLoadingFont;

    static references = {
        Main: {
            [supportedTextLanguage[supportedTextLanguage.default]]: { path: "customFont/En + Id + Others + numbers/UTM-Cafeta", loading: false },
            [supportedTextLanguage[supportedTextLanguage.ja]]: { path: "customFont/Jp + Tzh/RFNMU", loading: false },
            [supportedTextLanguage[supportedTextLanguage.ko]]: { path: "customFont/Kr/DXMobrGExtraBold-KSCpc-EUC-H", loading: false },
            [supportedTextLanguage[supportedTextLanguage.th]]: { path: "customFont/Th/JS Korakhot Normal", loading: false },
            [supportedTextLanguage[supportedTextLanguage.zh]]: { path: "customFont/Zh/Sharp(CloudRuiSongCuGBK)Bold Song (Ming) Typeface Chinese Fontt-Simplified Chinese Fonts", loading: false },
            [supportedTextLanguage[supportedTextLanguage.en]]: { path: "customFont/En + Id + Others + numbers/UTM-Cafeta", loading: false },
            [supportedTextLanguage[supportedTextLanguage.id]]: { path: "customFont/En + Id + Others + numbers/UTM-Cafeta", loading: false },
            [supportedTextLanguage[supportedTextLanguage.vi]]: { path: "customFont/Vi/STIXTwoText-SemiBold", loading: false },
        }
    };

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        StageLoadingFont.instance = this;
    }

    static loadFont(language) {
        let prom_arr: Promise<any>[] = [];

        Object.keys(this.references).forEach(category => {
            prom_arr.push(new Promise((resolve: Function) => {
                let config = this.references[category][language]
                if (!config) {
                    config = this.references[category].default
                }
                UtilsStageLoading.loadRes<cc.Font>(config.path, cc.Font, (e, font) => {
                    this.font.push(font);
                    resolve();
                })
            }))

        })

        return Promise.all(prom_arr);
    }

    static getFont(category = 0): cc.Font {
        return this.font[category];
    }

    // update (dt) {}
}
