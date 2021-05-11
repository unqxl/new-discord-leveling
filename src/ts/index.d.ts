declare module 'new-discord-leveling' {
    import { EventEmitter } from 'events';

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
            memberID: string,
            guildID: string,
            amount: number
        ): Promise<any>;

        /**
         * [Subtracts XP to User]
         */
        subtractXP(
            memberID: string,
            guildID: string,
            amount: number
        ): Promise<any>;

        /**
         * [XP to new Level of User]
         */
        xpFor(
            memberID: string,
            guildID: string,
        ): Promise<number>;

        /**
         * [Sets XP to User]
         */
        setXP(
            memberID: string,
            guildID: string,
            amount: number
        ): Promise<any>;

        /**
         * [Sets Level to User]
         */
        setLevel(
            memberID: string,
            guildID: string,
            amount: number
        ): Promise<any>;

        /**
         * [Gets User Data]
         */
        get(
            guildID: string,
        ): Promise<UserData>;
        
        /**
         * [Method to get Level Leaderboard]
         */
        leaderboard(
            guildID: string,
        ): Promise<Array<UserData>>;

        // [Private Methods]
        private createUser(
            memberID: string,
            guildID: string,
        ): Promise<any>;

        private createUserJSON(
            memberID: string,
            guildID: string,
        ): Promise<any>;

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
    
    class Logger {
        log(...message: any[]): any;
        warn(...message: any[]): any;
        error(...message: any[]): any;
    }

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
};

interface ModuleEvents {
    newLevel: [{
        type: 'newLevel';
        userID: string;
        guildID: string;
        level: number;
    }];

    addXP: [{
        type: 'addXP';
        userID: string;
        guildID: string;
        oldXP: number;
        newXP: number;
    }];

    subtractXP: [{
        type: 'subtractXP';
        userID: string;
        guildID: string;
        oldXP: number;
        newXP: number;
    }];

    setXP: [{
        type: 'setXP';
        userID: string;
        guildID: string;
        oldXP: number;
        newXP: number;
    }];

    setLevel: [{
        type: 'setLevel';
        userID: string;
        guildID: string;
        oldXP: number;
        newXP: number;
    }];
}