import { GuildMember, Options, ManagerEvents } from "../../src/constants";
import { TypedEmitter } from "tiny-typed-emitter";
import { Database } from "../Database";

export interface XPManager {
  options: Options;
  database: Database;
}

export class XPManager extends TypedEmitter<ManagerEvents> {
  constructor(options: Options);

  add(memberID: string, guildID: string, amount: number): Promise<GuildMember>;

  subtract(
    memberID: string,
    guildID: string,
    amount: number
  ): Promise<GuildMember>;

  set(memberID: string, guildID: string, amount: number): Promise<GuildMember>;
  xpForNextLevel(memberID: string, guildID: string): Promise<number>;
}
