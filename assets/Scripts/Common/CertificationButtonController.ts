// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { GameCertification } from "../Manager/Config";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CertificationButtonController extends cc.Component {


    @property(cc.Node)
    turboBtn: cc.Node = null;

    @property(cc.Node)
    plusBtn: cc.Node = null;

    @property(cc.Node)
    minusBtn: cc.Node = null;

    @property(cc.Node)
    autoBtn: cc.Node = null;

    @property(cc.Node)
    settingBtn: cc.Node = null;

    @property(cc.Node)
    quitBtn: cc.Node = null;

    @property(cc.Node)
    soundBtn: cc.Node = null;

    @property(cc.Node)
    infoBtn: cc.Node = null;

    @property(cc.Node)
    historyBtn: cc.Node = null;

    @property(cc.Node)
    closeBtn: cc.Node = null;

    // onLoad () {}

    start () {
        this.checkCertificationData();
    }
    checkCertificationData(){

        this.turboBtn.active = GameCertification.show_turbo_feature;

        this.autoBtn.active = GameCertification.show_autoplay_feature;

        this.soundBtn.active = GameCertification.show_sound_feature;

        this.historyBtn.active = GameCertification.show_history_feature;
        

        this.quitBtn.parent.active = GameCertification.show_quit_feature;
        this.quitBtn.active = GameCertification.show_quit_feature;
    }
}
