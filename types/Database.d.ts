import { GuildData, GuildMember, Options } from "../src/constants";
import { Logger } from "./Logger";
import Enmap from "enmap";

export declare interface Database {
  options: Options;
  database: Enmap<string, GuildData>;
  logger: Logger;
  ready: boolean;
}

export class Database {
  constructor(options: Options);

  private init(): boolean;

  add<K extends keyof GuildMember>(
    memberID: string,
    guildID: string,
    prop: K,
    value: number
  ): Promise<GuildMember>;

  subtract<K extends keyof GuildMember>(
    memberID: string,
    guildID: string,
    prop: K,
    value: number
  ): Promise<GuildMember>;

  set(guildID: string, data: GuildData): Promise<GuildData>;
  createGuildData(guildID: string): Promise<GuildData>;
  createMemberData(memberID: string, guildID: string): Promise<GuildMember>;
}
