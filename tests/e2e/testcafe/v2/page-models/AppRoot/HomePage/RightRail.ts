import { BaseWebComponent } from "../../BaseWebComponent";




export class RightRail extends BaseWebComponent {

    get self() {
        return this.getSelectorByAutomationId('rightRail');
    }
}