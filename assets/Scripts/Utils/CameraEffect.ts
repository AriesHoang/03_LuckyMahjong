// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import ShakeAction from "../Core/ShakeAction";



const {ccclass, property} = cc._decorator;

@ccclass
export default class CameraEffect extends cc.Component {
    public static instance: CameraEffect;

    protected onLoad(): void {
        CameraEffect.instance = this;
    }

    shakeCameraOnce () {
        let action = ShakeAction.create(0.1,0,0.3);
        this.node.runAction(action);
    }

}
