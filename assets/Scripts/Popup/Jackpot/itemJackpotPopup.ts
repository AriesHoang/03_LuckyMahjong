import { E_JACKPOT_TYPE } from "../../Data/GamePlayData";
const { ccclass, property } = cc._decorator;

@ccclass
export default class itemJackpotPopup extends cc.Component {

    @property([cc.SpriteFrame])
    arraySprite: cc.SpriteFrame[] = [];
    @property([cc.SpriteFrame])
    arrayText: cc.SpriteFrame[] = [];
    @property(sp.Skeleton)
    skeleton: sp.Skeleton = null;
    @property(cc.Sprite)
    imgItem: cc.Sprite = null;
    @property(cc.Sprite)
    txtItem: cc.Sprite = null;
    resolve: Function;
    protected onLoad(): void {
        this.skeleton?.setCompleteListener((trackEntry) => {
            if (trackEntry['animation']['name'] == "show_all") {
                // this.BloodAnim(this.numRed,this.numBlue);

                this.resolve();
            }
        });

    }

    playOpenPick(E_JACKPOT_TYPE: E_JACKPOT_TYPE): Promise<any> {
        return new Promise((resolve: Function) => {
            this.imgItem.spriteFrame = this.arraySprite[E_JACKPOT_TYPE];
            this.skeleton.setAnimation(0, "win", false);
            this.txtItem.spriteFrame = this.arrayText[E_JACKPOT_TYPE];
            this.skeleton?.setCompleteListener((trackEntry) => {
                if (trackEntry['animation']['name'] == "win") {
                    // this.BloodAnim(this.numRed,this.numBlue);
                    resolve();
                }
            });
        })
    }

    playOpen(E_JACKPOT_TYPE: E_JACKPOT_TYPE): Promise<any> {
        return new Promise((resolve: Function) => {
            this.resolve = resolve;
            this.imgItem.spriteFrame = this.arraySprite[E_JACKPOT_TYPE];
            this.skeleton.setAnimation(0, "show_all", false);
            this.txtItem.spriteFrame = this.arrayText[E_JACKPOT_TYPE];

        })
    }


    setjackPot(E_JACKPOT_TYPE: E_JACKPOT_TYPE) {
        this.imgItem.spriteFrame = this.arraySprite[E_JACKPOT_TYPE];
        if (this.skeleton)
            this.skeleton.node.active = false;
        this.txtItem.spriteFrame = this.arrayText[E_JACKPOT_TYPE];
    }

    rest() {
        this.skeleton.node.active = true;
        this.skeleton.setAnimation(0, "idle", true);
    }
}
