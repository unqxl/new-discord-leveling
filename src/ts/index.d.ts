declare module 'new-discord-leveling' {
    import { EventEmitter } from 'events';
    import { User, Guild, GuildMember } from 'discord.js';

    class Leveling extends EventEmitter {
        public isReady: boolean;
        public version: string;
        public options: Options;
        public logger: Logger;
        public db;
        
        constructor(options: Options);

        // [Methods]
        /**
         * [Adds XP to User]
         */
        addXP(
            member: (User | GuildMember),
            guild: Guild,
            amount: number
        ): Promise<boolean>;

        /**
         * [Subtracts XP to User]
         */
        subtractXP(
            member: (User | GuildMember),
            guild: Guild,
            amount: number
        ): Promise<boolean>;

        /**
         * [XP to new Level of User]
         */
        xpFor(
            member: (User | GuildMember),
            guild: Guild,
        ): Promise<number>;

        /**
         * [Sets XP to User]
         */
        setXP(
            member: (User | GuildMember),
            guild: Guild,
            amount: number
        ): Promise<boolean>;

        /**
         * [Sets Level to User]
         */
        setLevel(
            member: (User | GuildMember),
            guild: Guild,
            amount: number
        ): Promise<boolean>;

        /**
         * [Gets User Data]
         */
        get(
            member: (User | GuildMember),
            guild: Guild,
        ): Promise<UserData>;
        
        /**
         * [Method to get Level Leaderboard]
         */
        leaderboard(
            guild: Guild,
        ): Promise<Array<UserData>>;

        // [Private Methods]
        private createUser(
            member: (User | GuildMember),
            guild: Guild,
        ): Promise<boolean>;

        private createUserJSON(
            member: (User | GuildMember),
            guild: Guild,
        ): Promise<boolean>;

        // [Events]
        public on<K extends keyof ModuleEvents>(
            event: K,
            listener: (...args: ModuleEvents[K]) => void
        ): this;

        public once<K extends keyof ModuleEvents>(
            event: K,
            listener: (...args: ModuleEvents[K]) => void
        ): this;

        public emit<K extends keyof ModuleEvents>(event: K, ...args: ModuleEvents[K]): boolean;
    }
    
    // [Logger]
    class Logger {
        log(...message: any[]): any;
        warn(...message: any[]): any;
        error(...message: any[]): any;
    }
    
    // [Exporting]
    
    namespace Leveling {}
    export = Leveling;
}

interface Options {
    type: ('mongodb' | 'json');
    mongoPath?: string;
    jsonPath?: string;
}

interface UserData {
    memberID: string;
    guildID: string;
    level: number;
    xp: number;
}

interface ModuleEvents {
    newLevel: [{
        type: 'newLevel';
        memberID: string;
        guildID: string;
        level: number;
    }];

    setXP: [{
        type: 'setXP';
        memberID: string;
        guildID: string;
        oldXP: number;
        newXP: number;
    }];

    setLevel: [{
        type: 'setLevel';
        memberID: string;
        guildID: string;
        oldXP: number;
        newXP: number;
    }];
}