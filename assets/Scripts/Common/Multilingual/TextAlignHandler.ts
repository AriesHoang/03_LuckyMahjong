// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class TextAlignHandler extends cc.Component {

    // LIFE-CYCLE CALLBACKS:
    private width: number = -1;
    private height: number = -1;

    onLoad () {
        // this.updateLabelString();
    }

    start () {
        this.updateLabelString();
    }

    // update (dt) {}
    updateLabelString() {
        if(this.width == -1){
            this.width = this.node.width;
            this.height = this.node.height;

            this.node.getComponent(cc.Label).overflow = cc.Label.Overflow.NONE;
        }


        const text = this.node.getComponent(cc.Label).string; // Replace with your desired label string

        // Split the text into individual words
        const words = text.split(" ");

        // Create a variable to store the final label string
        let finalString = "";

        // Iterate through each word
        for (let i = 0; i < words.length; i++) {
            const word = words[i];

            // Temporarily append the current word to the final string
            const tempString = finalString + word;

            // Check if adding the word exceeds the label's width
            if (this.calculateTextWidth(tempString) > this.width) {
                // If it exceeds, add a new line character before adding the word
                if (finalString !== "") {
                    finalString += "\n";
                }
            }

            // Add the word to the final string
            finalString += word;

            // Add a space after the word except for the last word
            if (i !== words.length - 1) {
                finalString += " ";
            }

            // Check if adding the word exceeds the maximum height
            if (this.calculateTextHeight(finalString) > this.height) {
                // Reduce the font size until the label's content height is less than or equal to the maximum height
                while (this.calculateTextHeight(finalString) > this.height) {
                    this.node.getComponent(cc.Label).fontSize -= 1;
                    this.node.getComponent(cc.Label).lineHeight = this.node.getComponent(cc.Label).fontSize;
                    this.node.getComponent(cc.Label)['_forceUpdateRenderData'](true);
                }
            }
        }

        // Assign the final string to the label
        this.node.getComponent(cc.Label).string = finalString;

        // Shrink the font size until the label's content width is greater than the label's width
        while (this.calculateTextWidth(finalString) > this.width) {
            this.node.getComponent(cc.Label).fontSize -= 1;
            this.node.getComponent(cc.Label).lineHeight = this.node.getComponent(cc.Label).fontSize;
            this.node.getComponent(cc.Label)['_forceUpdateRenderData'](true);
        }
    }

    calculateTextWidth(text) {
        this.node.getComponent(cc.Label).string = text;
        this.node.getComponent(cc.Label)['_forceUpdateRenderData'](true);
        const measuredWidth = this.node.getContentSize().width;
        return measuredWidth;
    }
    calculateTextHeight(text) {
        const lineHeight = this.node.getComponent(cc.Label).lineHeight;
        const lines = text.split('\n');
        const totalHeight = lineHeight * lines.length;
        return totalHeight;
    }
}
