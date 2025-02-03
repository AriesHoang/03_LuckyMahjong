import { Signal } from "../Core/observer/Signal";
import UtilsStageLoading from "./UtilsStageLoading";
import CheatMenuController from "../Game/CheatMenuController";
import WinFreeSpinsPopup from "../Popup/WinFreeSpinPopup/WinFreeSpinsPopup";
import WalletBalance from "../Popup/WalletBalance/WalletBalance";
import BetOptions from "../Popup/BetOptions/BetOptions";
import History from "../Popup/History/History";
import AutoSpinOptions from "../Popup/AutoSpinOptions/AutoSpinOptions";
import PayTable from "../Popup/PayTable/PayTable";
import GameRules from "../Popup/GameRules/GameRules";
import BuyFeature from "../Popup/BuyFeature/BuyFeature";
import BigWin from "../Popup/BigWin/BigWin";
import FreespinOutro from "../Popup/FreespinOutro/FreespinOutro";
import QuitGamePopup from "../Popup/QuitGamePopup/QuitGamePopup";
import GameController from "../Game/GameController";
// import IntroMiniGame from "../Popup/IntroMiniGame/IntroMiniGame";
import WinFreespinsInFreespinModePopup from "../Popup/New Folder/WinFreespinsInFreespinModePopup";
import BetOptionsNew from "../Popup/BetOptions/BetOptionsNew";
import JackpotPopup from "../Popup/Jackpot/JackpotPopup";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StageLoadingNode extends cc.Component {
    @property(cc.Node)
    popupContainer: cc.Node = null;
    @property(cc.Prefab)
    WalletBalancePrefab: cc.Prefab = null;
    @property(cc.Prefab)
    BetOptionsPrefab: cc.Prefab = null;

    OnLoadPopupSuccessful: Signal = new Signal();

    // onLoad() {
    // }
    // protected async start() {
    //     // await this.preloadAllAssets();
    // }


    references = {
        WalletBalance: { component: WalletBalance, path: "Prefabs/WalletBalance/WalletBalance", loading: false, zIndex: 0, parent: null, active: true, prefabName: "WalletBalancePrefab" },
        BetOptionsNew: { component: BetOptionsNew, path: "Prefabs/BetOptions/BetOptionsNew", loading: false, zIndex: 0, parent: null, active: true, prefabName: "BetOptionsNewPrefab" },
        AutoSpinOptions: { component: AutoSpinOptions, path: "Prefabs/AutoSpinOptions/AutoSpinOptions", loading: false, zIndex: 0, parent: null, active: true, prefabName: "" },
        CheatMenu: { component: CheatMenuController, path: "Prefabs/cheat_menus", loading: false, zIndex: 1, parent: null, active: false, prefabName: "" },
        WinFreeSpinsPopup: { component: WinFreeSpinsPopup, path: "Prefabs/WinFreeSpinsPopup/WinFreeSpinsPopup", loading: false, zIndex: 1, parent: null, active: false, prefabName: "" },

        History: { component: History, path: "Prefabs/History/History", loading: false, zIndex: 1, parent: null, active: true, prefabName: "" },

        GameRules: { component: GameRules, path: "Prefabs/GameRules/GameRules", loading: false, zIndex: 1, parent: null, active: true, prefabName: "" },
        BuyFeature: { component: BuyFeature, path: "Prefabs/BuyFeature/BuyFeature", loading: false, zIndex: 1, parent: null, active: false, prefabName: "" },
        BigWin: { component: BigWin, path: "Prefabs/BigWin/BigWin", loading: false, zIndex: 1, parent: null, active: false, prefabName: "" },
        FreespinOutro: { component: FreespinOutro, path: "Prefabs/FreespinOutro/FreespinOutro", loading: false, zIndex: 1, parent: null, active: false, prefabName: "" },
        // FreespinGamble: { component: FreespinGamble, path: "Prefabs/FreespinGamble/FreespinGamble", loading: false, zIndex: 1, parent: null, active: false, prefabName: "" },
        QuitGamePopup: { component: QuitGamePopup, path: "Prefabs/QuitGamePopup/QuitGamePopup", loading: false, zIndex: 1, parent: null, active: false, prefabName: "" },
        JackpotPopup: { component: JackpotPopup, path: "Prefabs/Jackpot/JackpotPopup", loading: false, zIndex: 0, parent: null, active: false, prefabName: "" },
        WinFreespinsInFreespinModePopup: { component: WinFreespinsInFreespinModePopup, path: "Prefabs/WinFreespinsInFreespinModePopup/WinFreespinsInFreespinModePopup", loading: false, zIndex: 1, parent: null, active: false, prefabName: "" },
    };

    show(name: string, data?: any) {
        if (this[name]) {
            if (data)
                this[name].show(data);
            else
                this[name].show();
        } else {
            if (this.references[name].loading == false) {
                this.showLoading();
                this.loadResource(name).then(() => {
                    if (this[name]) {
                        this.hideLoading();
                        this.show(name, data);
                    }
                });
            }

            // check neu sau 5s ma ko load duoc thi an loading            
            let call1 = setTimeout(() => {
                if (this[name]) {
                    clearTimeout(call1);
                }
                else {
                    this.references[name].loading = false;
                    this.hideLoading();
                }
            }, 5000);
        }
    }

    async showPr(name: string, data?: any): Promise<any> {

        if (this[name]) {
            if (data)
                return this[name].showPr(data);
            else
                return this[name].showPr();
        } else {
            if (this.references[name].loading == false) {
                this.showLoading();
                await this.loadResource(name);
                if (this[name]) {
                    this.hideLoading();
                    return this.showPr(name, data);
                }

            }

            // check neu sau 5s ma ko load duoc thi an loading            
            let call1 = setTimeout(() => {
                if (this[name]) {
                    clearTimeout(call1);
                }
                else {
                    this.references[name].loading = false;
                    this.hideLoading();
                }
            }, 5000);
        }
    }

    showLoading() {
        // this.loading_splash.Show();
    }

    hideLoading() {
        // this.loading_splash.Hide();
    }


    loadResource(name: string) {
        this.references[name].loading = true;
        return new Promise((resolve, reject) => {
            UtilsStageLoading.loadRes<cc.Prefab>(this.references[name].path, cc.Prefab, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    const nodeX: cc.Node = cc.instantiate(res);
                    if (this.references[name].parent) nodeX.parent = this.references[name].parent;
                    else this.popupContainer.addChild(nodeX);
                    nodeX.active = this.references[name].active;
                    nodeX.zIndex = this.references[name].zIndex;
                    this[name] = nodeX.getComponent(this.references[name].component);

                    this.OnLoadPopupSuccessful.dispatch(this.references[name], this[name]);
                    resolve(0);

                }
            });
        });
    }

    preLoadResource(name: string) {
        return new Promise((resolve, reject) => {
            UtilsStageLoading.preLoadRes<cc.Prefab>(this.references[name].path, cc.Prefab, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    async preloadAllAssets() {
        for (const iterator of Object.keys(this.references)) {
            this.preLoadResource(iterator);
        }
    }
}
