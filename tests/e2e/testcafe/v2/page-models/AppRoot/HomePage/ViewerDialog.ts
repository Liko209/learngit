import { BaseWebComponent } from "../../BaseWebComponent";

export class ViewerDialog extends BaseWebComponent {
  get self() {
    return this.getSelectorByAutomationId('Viewer').parent('*[role="dialog"]');
  }

  get title(){
    return this.getSelectorByAutomationId('previewerTitle');
  }

  async shouldBePopup() {
    await this.t.expect(this.exists).ok();
  }

  async shouldBeClosed() {
    await this.t.expect(this.exists).notOk();
  }

  async nameShouldBe(name:string){
    await this.t.expect(this.title.withText(name).exists).ok();
  }
}
