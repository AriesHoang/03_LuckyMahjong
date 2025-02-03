import { Cfg } from "../Manager/Config";


const { ccclass, property } = cc._decorator;

@ccclass
export default class WordWrap extends cc.Component {

    @property(String)
    excludeWrapLang: String[] = [];

    private str = "";

    protected onLoad(): void {
        this.str = this.node.getComponent(cc.Label).string;
    }

    wordwrap(text: string, maxLineWidth: number) {
        return text.replace(new RegExp(`(?![^\\n]{1,${maxLineWidth}}$)([^\\n]{1,${maxLineWidth}})\\s`, "g"), "$1\n");
    }

    start(): void {
        cc.log("wrap word", this.str);
        let cclabel = this.node.getComponent(cc.Label);

        let ind = this.excludeWrapLang.indexOf(Cfg.language)
        if (ind > -1) {
            cclabel.enableWrapText = true;
            return;
        }

        let str = this.wordwrap(this.str, 5);
        cclabel.string = str;
    }
}