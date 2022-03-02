import { GuildData, GuildMember, Options } from "../constants";
import { Logger } from "./Logger";
import Enmap from "enmap";

export interface Database {
  options: Options;
  database: Enmap<string, GuildData>;
  logger: Logger;
  ready: boolean;
}

/**
 * @class
 * @classdesc The class responsible for the module database.
 */
export class Database {
  /**
   * @param {Options} options Module Options
   */
  constructor(options: Options) {
    /**
     * Database Options
     * @type {Options}
     */
    this.options = options;

    /**
     * Database
     * @type {Enmap<String, GuildData>}
     */
    this.database = new Enmap({
      name: this.options.dbName,
      dataDir: this.options.dbPath ?? "./",
      wal: false,
    });

    /**
     * Module Logger
     * @type {Logger}
     */
    this.logger = new Logger();

    /**
     * Database State
     * @type {boolean}
     */
    this.ready = false;

    this.init();
  }

  /**
   * @private
   * @returns {boolean}
   */
  private init() {
    this.ready = true;
    this.logger.log("Database loaded!", "Leveling");

    return true;
  }

  /**
   * Method that adds number to property
   *
   * @param {String} memberID Member ID
   * @param {String} guildID Guild ID
   * @param {keyof GuildMember} prop Property to change
   * @param {Number} value Value to Add
   *
   * @returns {Promise<GuildMember>}
   */
  add<K extends keyof GuildMember>(
    memberID: string,
    guildID: string,
    prop: K,
    value: number
  ): Promise<GuildMember> {
    if (!this.ready) {
      this.logger.error(
        "Cannot run method when database isn't started",
        "Leveling"
      );

      return;
    }

    return new Promise(async (res, rej) => {
      await this.createGuildData(guildID);
      await this.createMemberData(memberID, guildID);

      const data = await this.getData(guildID);
      const member = data.members.find((x) => x.id === memberID);

      (member[prop] as number) += value;

      await this.set(guildID, data);
      return res(member);
    });
  }

  /**
   * Method that subtracts number from property
   *
   * @param {String} memberID Member ID
   * @param {String} guildID Guild ID
   * @param {keyof GuildMember} prop Property to change
   * @param {Number} value Value to Subtract
   *
   * @returns {Promise<GuildMember>}
   */
  subtract<K extends keyof GuildMember>(
    memberID: string,
    guildID: string,
    prop: K,
    value: number
  ): Promise<GuildMember> {
    if (!this.ready) {
      this.logger.error(
        "Cannot run method when database isn't started",
        "Leveling"
      );

      return;
    }

    return new Promise(async (res, rej) => {
      await this.createGuildData(guildID);
      await this.createMemberData(memberID, guildID);

      const data = await this.getData(guildID);
      const member = data.members.find((x) => x.id === memberID);

      (member[prop] as number) -= value;

      await this.set(guildID, data);
      return res(member);
    });
  }

  /**
   * Method that Sets new Guild Data
   *
   * @param {String} guildID Guild ID
   * @param {GuildData} data New Guild Data
   *
   * @returns {Promise<GuildData>}
   */
  set(guildID: string, data: GuildData): Promise<GuildData> {
    if (!this.ready) {
      this.logger.error(
        "Cannot run method when database isn't started",
        "Leveling"
      );

      return;
    }

    return new Promise(async (res, rej) => {
      await this.createGuildData(guildID);
      this.database.set(guildID, data);

      return res(this.database.get(guildID));
    });
  }

  /**
   * Method that creates Guild Data
   *
   * @param {String} guildID Guild ID
   * @returns {Promise<GuildData>}
   */
  createGuildData(guildID: string): Promise<GuildData> {
    if (!this.ready) {
      this.logger.error(
        "Cannot run method when database isn't started",
        "Leveling"
      );

      return;
    }

    return new Promise(async (res, rej) => {
      const guild = this.database.get(guildID);
      if (guild) return res(guild);

      this.database.set(guildID, {
        id: guildID,
        members: [],
      });

      return res(this.database.get(guildID));
    });
  }

  /**
   * Method that creates Guild Member Data
   *
   * @param {String} memberID Member ID
   * @param {String} guildID Guild ID
   * @returns {Promise<GuildMember>}
   */
  createMemberData(memberID: string, guildID: string): Promise<GuildMember> {
    if (!this.ready) {
      this.logger.error(
        "Cannot run method when database isn't started",
        "Leveling"
      );

      return;
    }

    return new Promise(async (res, rej) => {
      var guild = await this.createGuildData(guildID);
      if (guild.members.find((x) => x.id === memberID)) {
        return res(guild.members.find((x) => x.id === memberID));
      }

      guild.members.push({
        id: memberID,
        level: 1,
        xp: 0,
      });

      await this.set(guildID, guild);

      return res({
        id: memberID,
        level: 1,
        xp: 0,
      });
    });
  }

  /**
   * Method that returns Guild Member Data
   *
   * @param {String} guildID Guild ID
   * @returns {Promise<GuildData>}
   */
  getData(guildID: string): Promise<GuildData> {
    return new Promise(async (res, rej) => {
      const data = await this.createGuildData(guildID);
      return res(data);
    });
  }
}
