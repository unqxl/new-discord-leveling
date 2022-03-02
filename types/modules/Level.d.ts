import { GuildMember, Options } from "../../src/constants";
import { Database } from "../Database";

export interface LevelManager {
  options: Options;
  database: Database;
}

export class LevelManager {
  constructor(options: Options);

  add(memberID: string, guildID: string, amount: number): Promise<GuildMember>;

  subtract(
    memberID: string,
    guildID: string,
    amount: number
  ): Promise<GuildMember>;

  set(memberID: string, guildID: string, amount: number): Promise<GuildMember>;
}
