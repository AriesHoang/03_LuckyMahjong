import { Cfg, supportedTextLanguage } from "../../Manager/Config";
import TextController from "../../Manager/TextController";
import CustomChangeMultilingual from "./CustomChangeMultilingual";
import StageLoadingFont from "./StageLoadingFont";


const { ccclass, property } = cc._decorator;

@ccclass("CustomFont")
class CustomFont {
    @property({ type: cc.Enum(supportedTextLanguage) })
    languageId: supportedTextLanguage = supportedTextLanguage.en;

    public _splitStringCmd: string = "<>";
    @property({

    })
    public get splitStringCmd() {

        return this._splitStringCmd;
    }
    public set splitStringCmd(value) {
        this._splitStringCmd = value;
        let cmd = "/" + value[0] + "[^" + value[1] + "]" + "+" + value[0] + "/g"
        this.splitCmd = new RegExp(cmd)
    }

    public splitCmd: RegExp = /<[^>]+>/g;

    @property(cc.RichText)
    richTextComponent: cc.RichText = null;

    @property()
    public isUseFont: boolean = false;

    @property({
        type: cc.Font,
        visible() {
            return this.isUseFont
        },
    })
    font: cc.Font;


    @property()
    public isBoundaryNeeded: boolean = true;

    @property({ type: cc.macro.TextAlignment })
    horizontalAlign: cc.macro.TextAlignment = cc.macro.TextAlignment.LEFT;

    @property()
    fontSize: number = 40;

    @property()
    lineHeight: number = 50;

    @property()
    fontColor: cc.Color = cc.Color.WHITE;

    @property()
    public enableOutline: boolean = false;
    @property({
        type: cc.Color,
        visible() {
            return this.enableOutline
        },
    })
    public outlineColor: cc.Color = cc.Color.BLACK;
    @property({
        type: Number,
        visible() {
            return this.enableOutline
        },
    })
    public outlineWidth = 1;

    @property()
    public enableShadow: boolean = false;
    @property({
        type: cc.Color,
        visible() {
            return this.enableShadow
        },
    })
    public shadowColor: cc.Color = cc.Color.BLACK;
    @property({
        type: cc.Vec2,
        visible() {
            return this.enableShadow
        },
    })
    public shadowOffset: cc.Vec2 = new cc.Vec2(0, 0);

    @property()
    public isUpperCase: boolean = false;

}

@ccclass
export default class MultilingualImageRichTextTranslator extends cc.Component {

    @property([CustomFont])
    private arrayConfigDataFont: CustomFont[] = [new CustomFont()];

    private maps: Map<string, CustomFont> = null;

    @property()
    public imageRequired: boolean = false;
    @property({
        type: cc.SpriteAtlas,
        visible() {
            return this.imageRequired
        },
    })
    public spriteAtlas = null;
    @property({
        type: [cc.String],
        visible() {
            return this.imageRequired
        },
    })
    public imageNameInAtlas: string[] = [];

    private maxHeight = 0;

    private config: CustomFont = null;
    
    isHaveCustom:boolean = false;
    private customChange:CustomChangeMultilingual =null;

    @property
    keyText: string = '';

    isInit: boolean = false;
    protected onLoad(): void {

        this.maxHeight = this.node.height;

        if (!this.isInit)
            this.init();

        if(this.isHaveCustom) return;
    
        this.updateConfigs();
    }
    protected init(): void {
        this.customChange = this.node.getComponent(CustomChangeMultilingual);
        if( this.customChange){
            this.isHaveCustom =  this.customChange.checkIsHaveConfig(supportedTextLanguage[Cfg.language],this.keyText)
        }

        this.initMaps();

        this.isInit = true;
    }

    setkey(value: string) {
        if (value == "" || !value) return;
        if(this.isHaveCustom) {
            this.customChange.loadKeyForConfig(value);
            return;
        };

        this.keyText = value;
        let text = TextController.getRawText(this.keyText);
        this.updateCustomRichText(text);
    }

    public updateConfigs() {
        let text = TextController.getRawText(this.keyText);
        this.updateCustomRichText(text);
    }

    initMaps() {
        this.maps = new Map<string, CustomFont>();

        this.arrayConfigDataFont.forEach((obj, i) => {
            // cc.log('initMaps: ' + obj.name + ' ' + i);
            this.maps.set(supportedTextLanguage[obj.languageId].toString(), obj);
        });

        this.config = this.maps.get(Cfg.language);
        if (!this.config) {
            this.config = this.maps.get(supportedTextLanguage[supportedTextLanguage.default].toString());
        }

    }

    async updateCustomRichText(text: string) {

        if (!this.isInit) this.init();

        let ConfigDataFont = this.config;
        if (ConfigDataFont.isUpperCase)
            text = text.toUpperCase()

        if (this.imageRequired)
            text = this.checkIfImagesArePresent(text, ConfigDataFont);

        let nodeX
        if (ConfigDataFont.richTextComponent == null) {
            nodeX = new cc.Node();
            let richtext = nodeX.addComponent(cc.RichText);
            ConfigDataFont.richTextComponent = richtext;

        }

        ConfigDataFont.richTextComponent.node.active = true;

        let richTextComponent = ConfigDataFont.richTextComponent;

        richTextComponent.horizontalAlign = ConfigDataFont.horizontalAlign;

        richTextComponent.node.color = ConfigDataFont.fontColor;
        richTextComponent.fontSize = ConfigDataFont.fontSize;


        if (!ConfigDataFont.isUseFont) {
            richTextComponent.font = StageLoadingFont.getFont();
        } else {
            if (ConfigDataFont.font)
                richTextComponent.font = ConfigDataFont.font;
        }

        richTextComponent.lineHeight = ConfigDataFont.lineHeight;
        richTextComponent.imageAtlas = this.spriteAtlas;


        if (ConfigDataFont.isBoundaryNeeded)
            richTextComponent.maxWidth = this.node.width;
        else
            richTextComponent.maxWidth = -1;

        richTextComponent.string = text;
        if (ConfigDataFont.enableOutline) {
            richTextComponent.string = "<outline color=" + ConfigDataFont.outlineColor.toHEX() + " width=" + ConfigDataFont.outlineWidth + ">" + richTextComponent.string + "</outline>";
        }

        if (nodeX)
            nodeX.parent = this.node;

        this.UpdateFontSize(richTextComponent, this.maxHeight, richTextComponent.lineHeight);

        if (ConfigDataFont.enableShadow)
            this.createShadowLabel(richTextComponent, ConfigDataFont.shadowColor, ConfigDataFont.shadowOffset);

    }


    checkIfImagesArePresent(text: string, ConfigDataFont: CustomFont) {
        let a = ConfigDataFont.splitStringCmd[0] + ConfigDataFont.splitStringCmd[1];
        const modifiedString = text.replace(ConfigDataFont.splitCmd, a)
        const splittedStrings = modifiedString.split(a);

        let newString = "";
        let currentIndex = 0;
        for (let i = 0; i < splittedStrings.length; i++) {
            newString += splittedStrings[i];

            if (i == splittedStrings.length - 1)
                break;
            newString += " <img src=\"" + this.imageNameInAtlas[currentIndex] + "\"/> ";
            currentIndex++;
            if (i >= this.imageNameInAtlas.length - 1) {
                currentIndex = 0;
            }
        }
        return newString;
    }


    UpdateFontSize(_richNode: cc.RichText, maxHeight: number, _fontLineHeight: number) {
        if (_richNode.fontSize > 20 && _richNode.node.height > maxHeight) {
            _fontLineHeight -= 4;
            _richNode.fontSize -= 4;
            _richNode.lineHeight = _fontLineHeight;
            this.UpdateFontSize(_richNode, maxHeight, _fontLineHeight);
        }
        else
            return;

    }
    createShadowLabel(richTextComponent: cc.RichText, shadowColor, shadowOffset) {
        // Get the array of label segments
        const labelSegments = richTextComponent['_labelSegments'];
        for (let i = 0; i < labelSegments.length; i++) {
            const element = labelSegments[i];

            if (labelSegments[i].getComponent(cc.Label)) {
                let shadowComponent = labelSegments[i].addComponent(cc.LabelShadow);
                shadowComponent.color = shadowColor;
                shadowComponent.offset = shadowOffset;
            }
        }
    }
}
