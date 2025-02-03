import constructor = cc.constructor;

const { ccclass, property } = cc._decorator;

@ccclass
export default class PayLineItem extends cc.Component {

    @property(cc.Node)
    innerPayline: cc.Node = null;

    @property(cc.Label)
    lblIndex: cc.Label = null;

    @property(cc.Node)
    dotNode: cc.Node = null;

    @property(cc.Node)
    borderNode: cc.Node = null;

    initPayLine(idxPayline: number, arrPosLine: Array<number>, showLineNumber : boolean = true) {
        this.lblIndex.node.active =  showLineNumber;
        this.lblIndex.string = (idxPayline < 10 ? "0" : "") + idxPayline.toString();
        let maxValue = Math.max(...arrPosLine);
        if (idxPayline == 31 || idxPayline == 55 || idxPayline == 91)
            maxValue++;

        let totalRow = 4;

        const totalNode = 20;


        // for (let i = 0; i < totalNode; i++) {
        //     let node = cc.instantiate(this.dotNode);
        //     this.innerPayline.addChild(node);
        //     node.active = true;
        //     // if(arrPosLine.indexOf(i) > -1)
        //     node.getComponent(cc.Sprite).enabled = false;
        // }
        for (let i = 0; i < arrPosLine.length; i++) {//2,2,2,2,2
            // let idxInner = (totalRow - 1 - arrPosLine[i]) * 5 + i;

            let idxInner = i * 4 + arrPosLine[i];
            this.innerPayline.children[idxInner].getComponent(cc.Sprite).enabled = true;
        }

        // this.borderNode.setContentSize(cc.size(this.borderNode.getContentSize().width, (this.dotNode.getContentSize().height + (totalRow < 6 ? 2 : 1.5)) * totalRow + 3));

    }




    initPayLine2(idxPayline: number, arrPosLine: Array<number>) {
        this.lblIndex.string = (idxPayline < 10 ? "0" : "") + idxPayline.toString();
        let count = this.innerPayline.childrenCount;
        for (let i = 0; i < count; i++) {
            this.innerPayline.children[i].getComponent(cc.Sprite).enabled = false;
        }
        for (let i = 0; i < arrPosLine.length; i++) {
            let idxInner = i * 3 + arrPosLine[i];
            this.innerPayline.children[idxInner].getComponent(cc.Sprite).enabled = true;
        }
    }
}
