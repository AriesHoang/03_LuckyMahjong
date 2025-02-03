import Utils from "../Utils/Utils";
import { Cfg, supportedLanguage } from "./Config";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TextController extends cc.Component {
    @property([cc.Sprite])
    textSpriteList: cc.Sprite[] = [];

    @property([cc.Label])
    rawTextList: cc.Label[] = [];

    @property(cc.Boolean)
    isAutoReplaceMode: boolean = false;

    @property({ type: [cc.String], visible: function (this: TextController) { return this.isAutoReplaceMode; } })
    namePatternList: string[] = [];

    //image texts
    private static textAtlas: cc.SpriteAtlas = null;
    //raw text, json format
    private static textInfo: any = null;
    //
    private static thaiFont: cc.Font = null;

    public static listObject: { key: string, text: string }[] = [];


    // LIFE-CYCLE CALLBACKS:

    onLoad() {

    }

    start() {
        if (TextController.textInfo) {
            //resources are loaded
            this.replaceText();
            if (this.isAutoReplaceMode) {
                this.autoReplaceRawText();
            }
        }
    }

    // update (dt) {}

    static getTextSpriteFrame(name: string): cc.SpriteFrame {
        return null;
    }

    static setText(sprite: cc.Sprite, name: string) {
        sprite.spriteFrame = null;
    }

    static getRawText(id: string): string {
        return TextController.textInfo[id] ? TextController.textInfo[id] as string : id;
    }
    static getTextInfo() {
        return TextController.textInfo;
    }

    static addTextInfo(obj: { key: string, text: string }, isOverwrite: boolean = true) {
        if (isOverwrite) {
            TextController.textInfo = { ...TextController.textInfo, ...obj };
        } else {
            TextController.textInfo = { ...obj, ...TextController.textInfo };
        }
    }

    loadTextResources(lang: string = null) {
        if (lang == null) lang = Cfg.language;
        lang = "locales/" + lang;
        const load_img_prom: Promise<any> = new Promise((resolve: Function) => {

            //image texts
            cc.resources.load(lang + "/text_atlas", cc.SpriteAtlas, (err, atlas) => {
                if (err) {
                    Utils.consoleLog("Error loading text atlas for lang " + lang);
                    resolve();
                    return;
                }
                if (lang != supportedLanguage[0]) {
                    cc.resources.release(supportedLanguage[0] + "/text_atlas");
                }
                TextController.textAtlas = atlas as cc.SpriteAtlas;
                this.replaceTextImage();
                resolve();
            });
        });

        const common_text_loader: Promise<any> = new Promise((resolve: Function) => {
            cc.resources.load(lang + '/common', (err, assets) => {
                if (err) {
                    Utils.consoleLog('Error loading common text for ' + lang);
                    resolve();
                    return;
                }
                if (assets) {
                    TextController.addTextInfo(JSON.parse(assets.toString()), false);
                }
                resolve();
            });
        });

        const load_text_prom: Promise<any> = new Promise((resolve: Function) => {

            //raw texts
            cc.resources.load(lang + "/text", (err, textAssets) => {
                if (err) {
                    Utils.consoleLog("Error loading raw text for lang " + lang);
                    return;
                }
                if (lang != supportedLanguage[0]) {
                    cc.resources.release("locales/en/text");
                }
                TextController.addTextInfo(JSON.parse(textAssets.toString()), false);

                this.replaceRawText();
                resolve();
            });
        });

        if (lang == "th") {
            cc.resources.load(lang + "/font", (err, fontAssets) => {
                if (err) {
                    Utils.consoleLog("Error loading font for lang " + lang);
                    return;
                }
                if (lang != supportedLanguage[0]) {
                    cc.resources.release("en/font");
                }
                TextController.thaiFont = fontAssets as cc.Font;
                this.replaceRawText();
            });
        }
        return Promise.all([load_img_prom, load_text_prom]);
    }

    private replaceTextImage() {
        let sf: cc.SpriteFrame;
        this.textSpriteList.forEach((sprite) => {
            if (sprite && sprite.spriteFrame) {
                sf = TextController.textAtlas.getSpriteFrame(sprite.spriteFrame.name);
                if (sf) {
                    sprite.spriteFrame = sf;
                }
            }
        });
    }

    private replaceRawText() {
        let text_id: string;
        this.rawTextList.forEach((label) => {
            if (label) {
                //Thai texts does not work well with Arial font
                if (Cfg.language == "th") {
                    label.font = TextController.thaiFont;
                    label.cacheMode = cc.Label.CacheMode.NONE;
                }
                text_id = label.string;
                if (TextController.textInfo[text_id]) {
                    label.string = TextController.textInfo[text_id] as string;
                }
            }
        });
    }

    replaceText() {
        // this.replaceTextImage();
        this.replaceRawText();
    }

    autoReplaceRawText() {
        if (this.namePatternList.length <= 0) {
            return;
        }

        //iterate through all child nodes
        this.node.walk(undefined, (child) => {
            const is_matched: boolean = this.namePatternList.some((pattern) => { return child.name.includes(pattern); });
            if (is_matched) {
                const label = child.getComponent(cc.Label);
                if (label) {
                    //Thai texts does not work well with Arial font
                    if (Cfg.language == "th") {
                        label.font = TextController.thaiFont;
                        label.cacheMode = cc.Label.CacheMode.NONE;
                    }

                    // const splittedString = (label.string.split("#")).filter((str) => str !== '');
                    // if(splittedString.length > 1)
                    // {
                    //     let newString = "";
                    //     splittedString.forEach(element => {
                    //         newString += TextController.textInfo[element] as string;
                    //     });
                    //     if (newString) {
                    //         label.string = newString;
                    //     }
                    // }

                    const content_str = TextController.textInfo[label.string] as string;
                    if (content_str) {
                        label.string = content_str;
                    }
                }
            }
        });
    }
}
