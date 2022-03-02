import { GuildMember, Options, ManagerEvents } from "../../constants";
import { TypedEmitter } from "tiny-typed-emitter";
import { Database } from "../Database";

export interface XPManager {
  options: Options;
  database: Database;
}

/**
 * @class
 * @classdesc An additional module responsible for XP.
 */
export class XPManager extends TypedEmitter<ManagerEvents> {
  /**
   * @param {Options} options Module Options
   */
  constructor(options: Options) {
    super();

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
   * The method responsible for adding XP to the user.
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

      const data = await this.database.add(memberID, guildID, "xp", amount);
      res(data);

      const member = await this.database.createMemberData(memberID, guildID);
      const requiredXP = await this.xpForNextLevel(memberID, guildID);
      if (member["xp"] >= requiredXP) {
        await this.database.subtract(memberID, guildID, "xp", member["xp"]);
        await this.database.add(memberID, guildID, "level", 1);

        this.emit("newLevel", {
          guildID,
          memberID,
          level: member["level"] + 1,
        });
      }

      return;
    });
  }

  /**
   * The method responsible for subtracting XP from the user.
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
        "xp",
        amount
      );

      return res(data);
    });
  }

  /**
   * The method responsible for setting XP to the user.
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
      member["xp"] = amount;

      const data = await this.database.set(guildID, guild);
      return res(data.members.find((x) => x.id === memberID));
    });
  }

  /**
   * A method showing the required amount of XP for the next level.
   *
   * @param {String} memberID Member ID
   * @param {String} guildID Guild ID
   *
   * @returns {Promise<Number>}
   */
  xpForNextLevel(memberID: string, guildID: string): Promise<number> {
    return new Promise(async (res, rej) => {
      await this.database.createGuildData(guildID);

      const data = await this.database.createMemberData(memberID, guildID);
      const requiredLevel = data.level + 1;
      const formula = 5 * (requiredLevel ^ 2) + 50 * requiredLevel + 100;

      return res(formula);
    });
  }
}
