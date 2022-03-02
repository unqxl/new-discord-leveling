import { GuildMember, Options } from "../src/constants";
import { Database } from "./Database";
import { XPManager } from "./modules/XP";
import { LevelManager } from "./modules/Level";

export declare interface Manager {
  options: Options;
  database: Database;
  ready: boolean;

  xp: XPManager;
  level: LevelManager;
}

export declare class Manager {
  constructor(options: Options);

  getStatistics(memberID: string, guildID: string): Promise<GuildMember>;
}
