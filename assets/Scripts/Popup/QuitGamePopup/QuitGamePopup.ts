// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Cfg } from "../../Manager/Config";
import BasePopup from "../../Stageloading/BasePopup";
import Utils from "../../Utils/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QuitGamePopup extends BasePopup {

    public show(data?: any): void {
        this.node.active = true;
        cc.Tween.stopAllByTarget(this.node);
        this.node.opacity = 0;
        cc.tween(this.node).to(0.3, { opacity: 255 }).start();
    }

    onCancelQuitGamePressed() {
        this.node.active = false;
    }

    onQuitButtonPressed() {
        Utils.exitApp(Cfg.redirectURL);
    }

    // update (dt) {}
}
