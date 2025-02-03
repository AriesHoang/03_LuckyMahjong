import { AudioPlayId } from "../../Core/audio/AudioPlayId";
import RootData from "../../Manager/RootData";
import SoundController from "../../Manager/SoundController";
import History from "./History";
const {ccclass, property} = cc._decorator;
export enum E_CUSTOME_TIME {
    StartDay,
    StartMonth,
    StartYear,
    EndDay,
    EndMonth,
    EndYear,
}
@ccclass
export default class CustomeDate extends cc.Component {
    @property(cc.Node)
    scrollView: cc.Node = null;
    @property(cc.Node)
    contentNum: cc.Node = null;
    @property(cc.Node)
    numDemo: cc.Node = null;
    @property({type:[cc.Node]})
    startDateNodes: Array<cc.Node> = [];  // 0: year, 1: month, 2: day
    @property({type:[cc.Node]})
    endDateNodes: Array<cc.Node> = [];  // 0: year, 1: month, 2: day
    static inst: CustomeDate = null;
    // NOTE: USE THE SAME MONTH INDEX AS JAVASCRIPT DATE - STARTS FROM 0. DAY & YEAR INDEX START FROM 1.
    private _availStartDate: number[] = [];
    private _availStartMonth: number[] = [];
    private _availStartYear: number[] = [];
    private _availEndDate: number[] = [];
    private _availEndMonth: number[] = [];
    private _availEndYear: number[] = [];
    private _isShowSelectionBox: boolean = false;
    private get isShowSelectionBox(): boolean { return this._isShowSelectionBox; }
    private set isShowSelectionBox(v: boolean) {
        this._isShowSelectionBox = v;
        this.scrollView.active = v;
    }
    private _selectedStartDate: Date;
    private _selectedEndDate: Date;
    private _curSelectorType: E_CUSTOME_TIME = null; // 0: year, 1: month, 2: day
    private _queryDateRange: number = 60;   // default to 60 days
    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        CustomeDate.inst = this;
    }
    async start () {
        this.node.active = false;
        await this.initialize();
        // defaul start & end selection dates are today
        this._selectedStartDate = new Date();
        this._selectedEndDate = new Date();
        this.updateAvailableChoices();
        this.updateViewSelectedDate();
    }
    // update (dt) {}
    // data
    async initialize() {
        const apiValue: number = RootData.instance.gamePlayData.getBetHistoryQueryRange();
        if (apiValue != undefined && apiValue != null) {
            this._queryDateRange = apiValue;
        }
    }
    getNormalizeDate(year: number, month: number, day: number): Date {
        // Create a Date object with the given year, month, and day
        let date = new Date(year, month, day); // Month is 0-indexed
        // Check if the created date has the same month as the provided month
        if (date.getMonth() !== month) {
            // The day is invalid, adjust it to the last valid day of the month
            date = new Date(year, date.getMonth(), 0);
        }
        return date;
    }
    getValidDate(inputDate: Date): Date {
        // Create the date from provided parameters
        //const inputDate = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript Date
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to midnight
        // Calculate the date QUERY_RANGE days ago
        const queryRangeDate = new Date(today);
        queryRangeDate.setDate(today.getDate() - this._queryDateRange + 1); // range = number of days allowed
        queryRangeDate.setHours(0, 0, 0, 0); // Normalize queryRangeDate to midnight
        // Validate the input date
        if (inputDate > today) {
            return today; // Return today's date if the input date is later than today
        } else if (inputDate < queryRangeDate) {
            return queryRangeDate; // Return the date QUERY_RANGE days ago if the input date is earlier
        }
        // Return the valid date
        return inputDate;
    }
    setSelectionContent(vals: number[]) {        
        this.contentNum.removeAllChildren();
        vals.forEach((val) => {
            let num = cc.instantiate(this.numDemo);
            num.getChildByName('label').getComponent(cc.Label).string = val.toString();
            if (val < 10)
                num.getChildByName('label').getComponent(cc.Label).string = '0' + val;
            num.parent = this.contentNum;
            num.x = 0;
        });
    }
    updateAvailableChoices() {
        // start
        // update available dates, based on year & month
        this._availStartYear = this.getAvailableYears(null, this._selectedEndDate);
        this._availStartMonth = this.getAvailableMonths(this._selectedStartDate.getFullYear(), null, this._selectedEndDate);
        this._availStartDate = this.getAvailableDates(this._selectedStartDate.getFullYear(), this._selectedStartDate.getMonth(), null, this._selectedEndDate);
        this._availEndYear = this.getAvailableYears(this._selectedStartDate, null);
        this._availEndMonth = this.getAvailableMonths(this._selectedEndDate.getFullYear(), this._selectedEndDate, null);
        this._availEndDate = this.getAvailableDates(this._selectedEndDate.getFullYear(), this._selectedEndDate.getMonth(), this._selectedEndDate, null);
    }
    getAvailableDates(year: number, month: number, minDate: Date, maxDate: Date): number[] {
        const dates: number[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Calculate the date queryRange days ago
        const queryRangeDate = new Date(today);
        queryRangeDate.setDate(today.getDate() - this._queryDateRange + 1); // range = number of days allowed
        queryRangeDate.setHours(0, 0, 0, 0);
        // Loop through the days in the month and check if they are within the range
        for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) {
            const currentDate = new Date(year, month, day);
            if (currentDate >= queryRangeDate && currentDate <= today) {
                dates.push(day);
            }
        }
        return dates;
    }
    getAvailableMonths(year: number, minDate: Date, maxDate: Date): number[] {
        const months: number[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Calculate the date queryRange days ago
        const queryRangeDate = new Date(today);
        queryRangeDate.setDate(today.getDate() - this._queryDateRange + 1); // range = number of days allowed
        queryRangeDate.setHours(0, 0, 0, 0);
        // Loop through the months and check if they are within the range
        for (let month = 0; month < 12; month++) {
            const firstDayOfMonth = new Date(year, month, 1);
            const lastDayOfMonth = new Date(year, month + 1, 0);
            if ((firstDayOfMonth >= queryRangeDate && firstDayOfMonth <= today) ||
                (lastDayOfMonth >= queryRangeDate && lastDayOfMonth <= today)) {
                months.push(month);
            }
        }
        return months;
    }
    getAvailableYears(minDate: Date, maxDate: Date): number[] {
        const years: number[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Calculate the date queryRange days ago
        const queryRangeDate = new Date(today);
        queryRangeDate.setDate(today.getDate() - this._queryDateRange + 1);
        queryRangeDate.setHours(0, 0, 0, 0);
        // Loop through the years and check if they are within the range
        for (let year = queryRangeDate.getFullYear(); year <= today.getFullYear(); year++) {
            years.push(year);
        }
        return years;
    }
    // view
    show() {
        this.node.active = true;
        this.isShowSelectionBox = false;
    }
    confirmOnClick() {
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxOpen);
        this.node.active = false;
        History.inst.numStartYear = this._selectedStartDate.getFullYear();
        History.inst.numStartMonth = this._selectedStartDate.getMonth() + 1;
        History.inst.numStartDay = this._selectedStartDate.getDate();
        History.inst.numEndYear = this._selectedEndDate.getFullYear();
        History.inst.numEndMonth = this._selectedEndDate.getMonth() + 1;
        History.inst.numEndDay = this._selectedEndDate.getDate();
        History.inst.setCustomeDate();
    }
    closeOnClick() {
        this.node.active = false;
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxOpen);
    }
    displayDate(inputDate: Date, yearNode: cc.Node, monthNode: cc.Node, dateNode: cc.Node) {
        yearNode.getComponentInChildren(cc.Label).string = inputDate.getFullYear().toString();
        monthNode.getComponentInChildren(cc.Label).string = (inputDate.getMonth() + 1).toString();
        dateNode.getComponentInChildren(cc.Label).string = inputDate.getDate().toString();
    }
    updateViewSelectedDate() {
        this.displayDate(this._selectedStartDate, this.startDateNodes[0], this.startDateNodes[1], this.startDateNodes[2]);
        this.displayDate(this._selectedEndDate, this.endDateNodes[0], this.endDateNodes[1], this.endDateNodes[2]);
    }
    displayDropdownSelectionBox(pos: cc.Vec2, availVals: number[]) {
        this.scrollView.setPosition(pos);
        this.contentNum.removeAllChildren();
        availVals.forEach((val) => {
            let selectionNode = cc.instantiate(this.numDemo);
            selectionNode.getChildByName('label').getComponent(cc.Label).string = val.toString();
            if (val < 10)
                selectionNode.getChildByName('label').getComponent(cc.Label).string = '0' + val;
            selectionNode.parent = this.contentNum;
            selectionNode.x = 0;
        });
    }
    itemSelected(event) {
        // update data
        const selectedValue: number = parseInt(event.target.getChildByName('label').getComponent(cc.Label).string);
        switch (this._curSelectorType) {
            case E_CUSTOME_TIME.StartYear:
                // normalize date to get April30th instead of May1st from April31st
                this._selectedStartDate = this.getNormalizeDate(selectedValue, this._selectedStartDate.getMonth(), this._selectedStartDate.getDate());
                break;
            case E_CUSTOME_TIME.StartMonth:
                // normalize date to get April30th instead of May1st from April31st
                this._selectedStartDate = this.getNormalizeDate(this._selectedStartDate.getFullYear(), selectedValue - 1, this._selectedStartDate.getDate());
                break;
            case E_CUSTOME_TIME.StartDay:
                // normalize date to get April30th instead of May1st from April31st
                this._selectedStartDate = this.getNormalizeDate(this._selectedStartDate.getFullYear(), this._selectedStartDate.getMonth(), selectedValue);
                break;
            case E_CUSTOME_TIME.EndYear:
                // normalize date to get April30th instead of May1st from April31st
                this._selectedEndDate = this.getNormalizeDate(selectedValue, this._selectedEndDate.getMonth(), this._selectedEndDate.getDate());
                break;
            case E_CUSTOME_TIME.EndMonth:
                this._selectedEndDate = this.getNormalizeDate(this._selectedEndDate.getFullYear(), selectedValue - 1, this._selectedEndDate.getDate());
                break;
            case E_CUSTOME_TIME.EndDay:
                // normalize date to get April30th instead of May1st from April31st
                this._selectedEndDate = this.getNormalizeDate(this._selectedEndDate.getFullYear(), this._selectedEndDate.getMonth(), selectedValue);
                break;
            default:
                break;
        }
        this._selectedStartDate.setHours(0, 0, 0, 0); // Normalize to midnight
        this._selectedEndDate.setHours(0, 0, 0, 0); // Normalize to midnight
        this._selectedStartDate = this.getValidDate(this._selectedStartDate);
        this._selectedEndDate = this.getValidDate(this._selectedEndDate);
        if (this._curSelectorType == E_CUSTOME_TIME.StartYear || this._curSelectorType == E_CUSTOME_TIME.StartMonth || this._curSelectorType == E_CUSTOME_TIME.StartDay) {
            // validate end date following start date
            if (this._selectedEndDate < this._selectedStartDate) {
                this._selectedEndDate = this._selectedStartDate;
            }
        } else {
            // validate start date following end date
            if (this._selectedStartDate > this._selectedEndDate) {
                this._selectedStartDate = this._selectedEndDate;
            }
        }
        this.updateAvailableChoices();
        // UI
        // hide selection box
        this.isShowSelectionBox = false;
        // update selected dates
        this.updateViewSelectedDate();
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxOpen);
    }
    // onToggleSelectionBox
    customeTimeOnClick(event, par) {
        this._curSelectorType = E_CUSTOME_TIME[par as keyof typeof E_CUSTOME_TIME];
        this.isShowSelectionBox = !this.isShowSelectionBox; // toggle
        SoundController.inst.MainAudio.playAudio(AudioPlayId.sfxOpen);
        if (!this.isShowSelectionBox) return;   // close selection box
        // 
        let availVals: number[] = [];
        switch (this._curSelectorType) {
            case E_CUSTOME_TIME.StartYear:
                availVals = this._availStartYear;
                break;
            case E_CUSTOME_TIME.StartMonth:
                availVals = this._availStartMonth.map(v => v + 1);  // month index starts from 0
                break;
            case E_CUSTOME_TIME.StartDay:
                availVals = this._availStartDate;
                break;
            case E_CUSTOME_TIME.EndYear:
                availVals = this._availEndYear;
                break;
            case E_CUSTOME_TIME.EndMonth:
                availVals = this._availEndMonth.map(v => v + 1);    // month index starts from 0
                break;
            case E_CUSTOME_TIME.EndDay:
                availVals = this._availEndDate;
                break;
            default:
                break;
        }
        this.displayDropdownSelectionBox(cc.v2(event.target.x, event.target.y - 50), availVals);
    }
}