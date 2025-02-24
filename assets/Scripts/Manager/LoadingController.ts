// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { clientEvent } from "../Core/observer/clientEvent";
import Utils from "../Utils/Utils";
import { EventName } from "./EventName";
import { GameConstant } from "./GameConstant";
import { LINECONFIG, LineConfig } from "../Game/LineConfig";
import SoundController from "./SoundController";
import { AudioPlayId } from "../Core/audio/AudioPlayId";
import PopupController from "./PopupController";
import { Cfg } from "./Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingController extends cc.Component {

    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;

    @property(cc.Label)
    percentLabel: cc.Label = null;

    @property(cc.Node)
    startBtn: cc.Node = null;

    @property(cc.Node)
    iconTemple: cc.Node = null;


    private gameSceneLoaded: boolean = false;
    private _isAuthorized: boolean = false;
    private _configLoaded: boolean = false;
    private _buyFreeSpinDataLoaded: boolean = true;
    private _isLoadRes: boolean = false;
    onEnable() {
        clientEvent.on(EventName.AuthorizationLoaded, this.OnAuthorizationLoaded, this);
        clientEvent.on(EventName.ConfigLoaded, this.OnConfigLoaded, this);
        clientEvent.on(EventName.BuyFreeSpinDataLoaded, this.OnBuyFreeSpinDataLoaded, this);
    }

    onDisable() {
        clientEvent.off(EventName.AuthorizationLoaded, this.OnAuthorizationLoaded, this);
        clientEvent.off(EventName.ConfigLoaded, this.OnConfigLoaded, this);
        clientEvent.off(EventName.BuyFreeSpinDataLoaded, this.OnBuyFreeSpinDataLoaded, this);
        clientEvent.off(EventName.loadedRes, this.OnLoadRes, this);
    }

    onDestroy() {
        // clientEvent.off(EventName.UpdateRemoteConfig, this.updateAuthPollingInterval, this);
    }

    protected onLoad(): void {
        this.startBtn.on(cc.Node.EventType.TOUCH_START, this.loadGameScene, this);
    }

    start() {
        // clientEvent.on(EventName.UpdateRemoteConfig, this.updateAuthPollingInterval, this);
        this.LoadingSceneMain();
        // let arrNewConfig = [];
        // LINECONFIG.winLinesConfig.forEach((line)=>{
        //     // cc.log("line",line);
        //     let newline = line.map((num)=>{
        //         return num - 1;
        //     })
        //     cc.log("newLine",newline);
        //     arrNewConfig.push(newline)
        // });
        // cc.log("arrNewConfig: ", JSON.stringify(arrNewConfig));
    }

    // updateAuthPollingInterval(configJson: cc.JsonAsset) {
    //     if (!configJson) return;
    //     const interval = configJson['AUTH_POLLING_INTERVAL'] as number;
    //     if (interval != undefined && interval != null) {
    //         Cfg.authPollingInterval = interval;
    //     }
    // }

    pollingAuth() {
        // no need for polling in loading scene?
    }

    public LoadingSceneMain(): void {
        cc.director.preloadScene(GameConstant.SCENE.GAME_SCENE, (completedCount, totalCount, item,) => {
            let fillProgress = (completedCount / totalCount) * 0.7 + (this._isAuthorized ? 0.1 : 0) + (this._configLoaded ? 0.1 : 0) + (this._buyFreeSpinDataLoaded ? 0.1 : 0);
            if (this.progressBar.progress > fillProgress)
                return;
            this.progressBar.progress = fillProgress;
            this.percentLabel.string = Math.floor(fillProgress * 100) + '%'
            this.iconTemple.position = cc.v3(this.progressBar.node.getContentSize().width * (fillProgress - 0.5) + 10, -5, 0);
        }, () => {
            if (cc.sys.isBrowser) {
                window.parent.postMessage({ GameSceneLoaded: true }, '*');
            }
            this.gameSceneLoaded = true;

            this.checkLoadAllCompleted();
        });
    }

    private checkLoadAllCompleted(): void {
        // if (this.gameSceneLoaded && this._isAuthorized && this._configLoaded && this._buyFreeSpinDataLoaded && this._buyFreeSpinDataLoaded && this._isLoadBundleData) {
        if (this.gameSceneLoaded && this._isAuthorized && this._configLoaded) {
            this.progressBar.node.active = false;
            this.percentLabel.node.active = false;

            this.startBtn.active = true;
        }
    }

    private OnAuthorizationLoaded(data: any) {
        this._isAuthorized = true;

        this.checkLoadAllCompleted();
    }

    private OnConfigLoaded(data: any) {
        this._configLoaded = true;

        this.checkLoadAllCompleted();
    }

    private OnBuyFreeSpinDataLoaded(data: any) {
        this._buyFreeSpinDataLoaded = true;

        this.checkLoadAllCompleted();
    }

    // OnLoadBundleDataFinish(state) {
    //     this._isLoadBundleData = true;
    //     this.checkLoadAllCompleted();
    // }

    private OnLoadRes(state){
        this._isLoadRes = true;

        this.checkLoadAllCompleted();
    }


    loadGameScene() {
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxButtonTap);
        setTimeout(()=>{
            cc.director.loadScene(GameConstant.SCENE.GAME_SCENE);
        }, 1000)

        let data = {};
        data["callFunc"] = ()=>{
            
        }
        PopupController.instance.showPrTrainsitionEffect(data).then(() => {

        });
        // this.scheduleOnce(() => {

        // }, 0.8);
    }
    // update (dt) {}
}
