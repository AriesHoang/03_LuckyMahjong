import { BET_DATA } from "./BetOptionsNew";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BetAmountButton extends cc.Component {
    @property(cc.Node)
    betAmountLabel: cc.Node = null;

    value: number;
    b_level: number;
    // b_size: number;
    // b_line: number;
    b_amount: number;

    setData(data: BET_DATA) {
        this.value = data.b_amount;
        this.b_level = data.b_level;
        // this.b_size = data.b_size;
        // this.b_line = data.b_line;
        this.b_amount = data.b_amount;

        this.node.off(cc.Node.EventType.MOUSE_ENTER);
        this.node.off(cc.Node.EventType.MOUSE_LEAVE);
        this.node.on(cc.Node.EventType.MOUSE_ENTER, () => {

                this.betAmountLabel.color =  new cc.Color().fromHEX("#F0E998");
                this.node.getChildByName("selectImage").active = true;
                this.node.getChildByName("selectImage").opacity = 100;

            }, this);
        this.node.on(cc.Node.EventType.MOUSE_LEAVE, () => {
            if(!this._isSelected)
            {
                this.betAmountLabel.color = cc.Color.WHITE;
                this.node.getChildByName("selectImage").active = false;
                this.node.getChildByName("selectImage").opacity = 255;
            }
        }, this);
    }
    public isDefault = false;

    private _isSelected = false;
    private _currentAmount = "";

    public set isSelected(v: boolean) {
        this._isSelected = v;
        // let defaultColor = new cc.Color().fromHEX("#F0E998");
        // if (v) {
        // }
        this.betAmountLabel.color =  v ? new cc.Color().fromHEX("#FFEB00B3") :
        this.isDefault ? new cc.Color().fromHEX("#F0E998") : cc.Color.WHITE;

        this.node.getChildByName("selectImage").active = v;
    }


    public set amountData(v: string) {
        this._currentAmount = v;

        this.betAmountLabel.getComponent(cc.Label).string = this._currentAmount;
    }
    

}
