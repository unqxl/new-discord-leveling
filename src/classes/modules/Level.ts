import { GuildMember, Options } from "../../constants";
import { Database } from "../Database";

export interface LevelManager {
  options: Options;
  database: Database;
}

/**
 * @class
 * @classdesc An additional module responsible for XP.
 */
export class LevelManager {
  /**
   * @param {Options} options Module Options
   */
  constructor(options: Options) {
    /**
     * Module Options
     * @type {Options}
     */
    this.options = options;

    /**
     * Database
     * @type {Database}
     */
    this.database = new Database(this.options);
  }

  /**
   * The method responsible for adding Level to the user.
   *
   * @param {String} memberID Member ID
   * @param {String} guildID Guild ID
   * @param {Number} amount Amount to Add
   *
   * @returns {Promise<GuildMember>}
   */
  add(memberID: string, guildID: string, amount: number): Promise<GuildMember> {
    return new Promise(async (res, rej) => {
      await this.database.createGuildData(guildID);
      await this.database.createMemberData(memberID, guildID);

      const data = await this.database.add(memberID, guildID, "level", amount);
      return res(data);
    });
  }

  /**
   * The method responsible for subtracting Level from the user.
   *
   * @param {String} memberID Member ID
   * @param {String} guildID Guild ID
   * @param {Number} amount Amount to Subtract
   *
   * @returns {Promise<GuildMember>}
   */
  subtract(
    memberID: string,
    guildID: string,
    amount: number
  ): Promise<GuildMember> {
    return new Promise(async (res, rej) => {
      await this.database.createGuildData(guildID);
      await this.database.createMemberData(memberID, guildID);

      const data = await this.database.subtract(
        memberID,
        guildID,
        "level",
        amount
      );

      return res(data);
    });
  }

  /**
   * The method responsible for setting Level to the user.
   *
   * @param {String} memberID Member ID
   * @param {String} guildID Guild ID
   * @param {Number} amount Amount to Set
   *
   * @returns {Promise<GuildMember>}
   */
  set(memberID: string, guildID: string, amount: number): Promise<GuildMember> {
    return new Promise(async (res, rej) => {
      const guild = await this.database.createGuildData(guildID);
      const member = await this.database.createMemberData(memberID, guildID);
      member["level"] = amount;

      const data = await this.database.set(guildID, guild);
      return res(data.members.find((x) => x.id === memberID));
    });
  }
}
