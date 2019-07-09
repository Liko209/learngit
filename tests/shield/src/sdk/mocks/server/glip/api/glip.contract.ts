import { ITeamPost } from "./team/team.post.contract";

export interface IGlipApi {
  team: {
    put: ITeamPost;
    post: ITeamPost;
  }
}