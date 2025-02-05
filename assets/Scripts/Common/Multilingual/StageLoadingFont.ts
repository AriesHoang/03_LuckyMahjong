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
            [supportedTextLanguage[supportedTextLanguage.default]]: { path: "customFonts/default/GALSB", loading: false },
            [supportedTextLanguage[supportedTextLanguage.ja]]: { path: "customFonts/ja_tzh/keifont", loading: false },
            [supportedTextLanguage[supportedTextLanguage.tzh]]: { path: "customFonts/ja_tzh/keifont", loading: false },
            [supportedTextLanguage[supportedTextLanguage.ko]]: { path: "customFonts/ko/BlackHanSans-Regular", loading: false },
            [supportedTextLanguage[supportedTextLanguage.th]]: { path: "customFonts/th/K2D-ExtraBold", loading: false },
            [supportedTextLanguage[supportedTextLanguage.zh]]: { path: "customFonts/zh/FZ-black", loading: false },
            [supportedTextLanguage[supportedTextLanguage.en]]: { path: "customFonts/en_id_vi/Japanese 3017-SVG", loading: false },
            [supportedTextLanguage[supportedTextLanguage.id]]: { path: "customFonts/en_id_vi/Japanese 3017-SVG", loading: false },
            [supportedTextLanguage[supportedTextLanguage.vi]]: { path: "customFonts/en_id_vi/Japanese 3017-SVG", loading: false },
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
