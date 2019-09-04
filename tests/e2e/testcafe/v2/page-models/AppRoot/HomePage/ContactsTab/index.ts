import { BaseWebComponent } from "../../../BaseWebComponent";
import { LeftRail } from './LeftRail';
import { AllContactsPage } from "./AllContacts";
//import { CompanyDirectoryPage } from './CompanyDirectory';

class Entry extends BaseWebComponent {
    async enter() {
      await this.t.click(this.self);
    }
  
    async shouldBeOpened() {
      await this.t.expect(this.self.hasClass('selected')).ok();
    }
  
    get name() {
      return this.self.find('p');
    }
  
    async shouldBeNamed(name: string) {
      await this.t.expect(this.name.withExactText(name).exists).ok();
    }
  }


export class ContactsTab extends BaseWebComponent {
    get self() {
      return this.getSelectorByAutomationId('contacts-all-contacts-tab');
    }
  
    get leftRail() {
      return this.getComponent(LeftRail);
    }
  
    getSubEntry(automationId: string) {
      return this.getComponent(Entry, this.getSelectorByAutomationId(automationId));
    }
  
    get allContactsEntry() {
      return this.getSubEntry('contacts-all-contacts-tab') 
    }
  
    get companydirectoryEntry() {
      return this.getSubEntry('contacts-company-tab')
    }
  
    get allContactsPage() {
      return this.getComponent(AllContactsPage); 
    }
  
    // get companyDirectoryPage() {
    //   return this.getComponent(CompanydirectoryPage);
    // }
  }