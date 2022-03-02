export interface Options {
  dbName: string;
  dbPath?: string;
}

export interface ManagerEvents {
  newLevel: (data: NewLevelData) => void;
}

export interface GuildData {
  id: string;
  members: GuildMember[];
}

export interface GuildMember {
  id: string;
  level: number;
  xp: number;
}

interface NewLevelData {
  memberID: string;
  guildID: string;
  level: number;
}

//? [TypeDefs]

/**
 * @typedef {Object} Options
 * @property {String} dbName Database Name
 * @property {String} [dbPath] Path for Database File
 */

/**
 * @typedef {Object} GuildData
 * @property {String} id Guild ID
 * @property {GuildMember[]} members Guild Members Data
 */

/**
 * @typedef {Object} GuildMember
 * @property {String} id Member ID
 * @property {Number} level Member Level
 * @property {Number} xp Member XP
 */
