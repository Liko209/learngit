import { GroupService } from 'sdk/src/service';
import SectionGroupHandler from '../../store/handler/SectionGroupHandler';

const groupService: GroupService = GroupService.getInstance();
const sectionHandler = SectionGroupHandler;
function injectParams(...params: any[]) {
  return function decorator(t: any, n: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    if (typeof original === 'function') {
      descriptor.value = (...args: any) =>
        Reflect.apply(original, t, [...args, ...params]);
    }
    return descriptor;
  };
}

export class RouterChangeUtils {
  @injectParams(groupService)
  static accessGroup(id: number, service: GroupService) {
    const accessTime: number = +new Date();
    return service.updateGroupLastAccessedTime({ id, timestamp: accessTime });
  }

  @injectParams(groupService)
  static async groupIdValidator(id: number, service: GroupService) {
    const group = await service.getById(id);
    if (!group) {
      return;
    }
    return service.isValid(group);
  }
  @injectParams(sectionHandler)
  static shouldAccessGroup(id: number, handler: SectionGroupHandler) {
    handler.isInSection(id);
  }

  getLastGroupId = async (): Promise<number | undefined> => {
    let groupId;
    const stateService: StateService = StateService.getInstance();
    const myState = await stateService.getMyState();
    if (!myState) {
      return;
    }
    groupId = myState.last_group_id;
    if (!groupId) {
      return;
    }
    try {
      const groupService: GroupService = GroupService.getInstance();
      const lastGroup = await groupService.getGroupById(groupId);
      if (lastGroup && lastGroup.is_archived) {
        return;
      }
      const profileService: ProfileService = ProfileService.getInstance();
      const isHidden = await profileService.isConversationHidden(groupId);
      if (isHidden) {
        return;
      }
      return groupId;
    } catch (e) {
      console.warn(`Find Group info failed ${groupId}`);
      return;
    }
  }
}
