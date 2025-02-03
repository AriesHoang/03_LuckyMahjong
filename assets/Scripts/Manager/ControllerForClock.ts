// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { GameCertification } from "./Config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    start() {
        let x = this.getComponent(cc.Widget);
        if (GameCertification.show_clock || GameCertification.show_game_name) {
            x.bottom = 20;
            x.top = -20
        } else {
            x.bottom = 0;
            x.top = 0
        }




    }

    // update (dt) {}
}
