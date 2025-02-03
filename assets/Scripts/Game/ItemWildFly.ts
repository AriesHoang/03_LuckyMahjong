// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemWildFly extends cc.Component {

    @property(sp.Skeleton)
    ske: sp.Skeleton = null;

    playFlyEndWild(): Promise<any> {
        return new Promise((resolve: Function) => {
            this.ske.setAnimation(0, "end_flying", false);
            this.ske.setCompleteListener((trackEntry) => {
                if (trackEntry['animation']['name'] == "end_flying") {
                    resolve()
                }
            });
        })

    }
    playFlyingWild(): Promise<any> {
        return new Promise((resolve: Function) => {
            this.ske.setAnimation(0, "flying", false);
            this.ske.setCompleteListener((trackEntry) => {
                if (trackEntry['animation']['name'] == "flying") {
                    resolve()
                }
            });
        })

    }

    playFlyStartWild(): Promise<any> {
        return new Promise((resolve: Function) => {
            this.ske.setAnimation(0, "start_fly", false);
            this.ske.setCompleteListener((trackEntry) => {
                if (trackEntry['animation']['name'] == "start_fly") {
                    resolve()
                }
            });
        })

    }
}
