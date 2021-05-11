const { EventEmitter } = require("events");
const { existsSync, writeFileSync, readFileSync } = require('fs');
const mongoose = require('mongoose');

const events = new EventEmitter();

// [Models]
const LevelingModel = require('../models/Leveling');

/**
 * @class Leveling
 * @description Main class that Enables Leveling System!
 */
module.exports = class Leveling {
    /**
     * [Module Options]
     * 
     * @param {object} options
     * @param {string} options.type [Type of Database]
     * @param {string} options.mongoPath [Ex: 'mongodb://localhost/mongodbtest']
     * @param {string} options.jsonPath [Ex: './db/leveling.json']
     */
    constructor(options = {}) {
        this.isReady = false;
        this.version = (require('../../package.json').version);
        this.options = options;
        this.logger = new Logger();
        this.db;

        this.initModule();
    }

    // [EventEmitter]

    /**
     * @param {'newLevel' | 'addXP' | 'subtractXP' | 'setXP' | 'setLevel'} event 
     * @param {Function} fn
     */
    on(event, fn) {
        events.on(event, fn)
    }
    /**
     * @param {'newLevel' | 'addXP' | 'subtractXP' | 'setXP' | 'setLevel'} event 
     * @param {Function} fn 
     */
    once(event, fn) {
        events.once(event, fn)
    }

    /**
     * @param {'newLevel' | 'addXP' | 'subtractXP' | 'setXP' | 'setLevel'} event 
     * @param {Function} fn 
     */
    emit(event, ...args) {
        events.emit(event, args[0])
    }

    // [Methods]
    
    /**
     * [Adds XP to User]
     * 
     * @param {string} memberID 
     * @param {string} guildID 
     * @param {number} amount 
     */
    async addXP(memberID, guildID, amount) {
        if(!this.isReady) return this.logger.error('Module isn\'t loaded!');

        if(!memberID) return this.logger.error('\'memberID\' is needed for addXP method!');
        if(!guildID) return this.logger.error('\'guildID\' is needed for addXP method!');

        if((typeof memberID) !== 'string') return this.logger.error('\'memberID\' is not a String (addXP method)!');
        if((typeof guildID) !== 'string') return this.logger.error('\'guildID\' is not a String (addXP method)!');

        return new Promise(async(res, rej) => {
            if(this.options.type === 'mongodb') {
                try {
                    const userData = await LevelingModel.findOne({
                        memberID,
                        guildID
                    });
        
                    if(userData === null) await this.createUser(memberID, guildID);
                    else {
                        await LevelingModel.findOneAndUpdate(
                            {
                                memberID,
                                guildID
                            },
                            {
                                xp: Number(userData.xp + amount)
                            }
                        ).exec();
        
                        const newUser = await LevelingModel.findOne({
                            memberID,
                            guildID
                        });
        
                        const formula = Number(5 * Math.pow(newUser.level, 2) + 50 * newUser.level + 100);
        
                        if(Number(newUser.xp) > formula) {
                            await LevelingModel.findOneAndUpdate(
                                {
                                    memberID,
                                    guildID,
                                },
                                {
                                    xp: Number(0),
                                    level: Number(newUser.level + 1),
                                }
                            ).exec();
        
                            events.emit('newLevel', {
                                userID: memberID,
                                guildID,
                                level: Number(newUser.level + 1)
                            });
                        };

                        events.emit('addXP', {
                            type: 'addXP',
                            userID: memberID,
                            guildID,
                            oldXP: Number(userData.xp),
                            newXP: Number(newUser.xp),
                        });
                    }

                    return res(true);
                } catch (error) {
                    rej(
                        this.logger.error(error.message)
                    );
                }
            }
            else if(this.options.type === 'json') {
                try {
                    const data = JSON.parse(readFileSync(this.options.jsonPath).toString())
                
                    const userData = data.find((user) => user.guildID === guildID && user.memberID === memberID);
                    if(!userData) this.createUserJSON(memberID, guildID);
                    
                    userData.xp += amount;
        
                    const formula = Number(5 * Math.pow(userData.level, 2) + 50 * userData.level + 100);
        
                    if(Number(userData.xp) > formula) {
                        userData.level++;
                        userData.xp = 0;
        
                        events.emit('newLevel', {
                            userID: memberID,
                            guildID,
                            level: Number(userData.level)
                        });
                    };

                    events.emit('addXP', {
                        type: 'addXP',
                        userID: memberID,
                        guildID,
                        oldXP: Number(userData.xp - amount),
                        newXP: Number(userData.xp),
                    });
                    
                    writeFileSync(this.options.jsonPath, JSON.stringify(data, null, '\t'));

                    return res(true);
                } catch (error) {
                    rej(
                        this.logger.error(error.message)
                    );
                }
            };
        });
    }

    /**
     * [Subtracts XP to User]
     * 
     * @param {string} memberID 
     * @param {string} guildID 
     * @param {number} amount 
     */
    async subtractXP(memberID, guildID, amount) {
        if(!this.isReady) return this.logger.error('Module isn\'t loaded!');

        if(!memberID) return this.logger.error('\'memberID\' is needed for subtractXP method!');
        if(!guildID) return this.logger.error('\'guildID\' is needed for subtractXP method!');

        if((typeof memberID) !== 'string') return this.logger.error('\'memberID\' is not a String (subtractXP method)!');
        if((typeof guildID) !== 'string') return this.logger.error('\'guildID\' is not a String (subtractXP method)!');

        return new Promise(async(res, rej) => {
            if(this.options.type === 'mongodb') {
                try {
                    const userData = await LevelingModel.findOne({
                        memberID,
                        guildID
                    });
        
                    if(userData === null) await this.createUser(memberID, guildID);
                    else {
                        if(Number(userData.xp) < amount) return this.logger.warn(`Cannot subtract ${amount} XP to User!\nHe hasn't enought XP to do this.`);
                        else await LevelingModel.findOneAndUpdate(
                            {
                                memberID,
                                guildID,
                            },
                            {
                                xp: Number(userData.xp - amount),
                            }
                        ).exec();

                        const newUser = await LevelingModel.findOne({
                            memberID,
                            guildID
                        });

                        events.emit('subtractXP', {
                            type: 'subtractXP',
                            userID: memberID,
                            guildID,
                            oldXP: Number(userData.xp),
                            newXP: Number(newUser.xp),
                        });
        
                        return res(true);
                    }
                } catch (error) {
                    rej(
                        this.logger.error(error.message)
                    );
                }
            }
            else if(this.options.type === 'json') {
                try {
                    const data = JSON.parse(readFileSync(this.options.jsonPath).toString())
                
                    const userData = data.find((user) => user.guildID === guildID && user.memberID === memberID);
                    if(!userData) this.createUserJSON(memberID, guildID);
                    if(Number(userData.xp) < amount)  return this.logger.warn(`Cannot subtract ${amount} XP to User!\nHe hasn't enought XP to do this.`);
                    
                    userData.xp -= amount;

                    events.emit('subtractXP', {
                        type: 'subtractXP',
                        userID: memberID,
                        guildID,
                        oldXP: Number(userData.xp + amount),
                        newXP: Number(newUser.xp),
                    });

                    writeFileSync(this.options.jsonPath, JSON.stringify(data, null, '\t'));
                    return res(true);
                } catch (error) {
                    rej(
                        this.logger.error(error.message)
                    );
                }
            };
        });
    }

    /**
     * [XP to new Level of User]
     * 
     * @param {string} memberID 
     * @param {string} guildID 
     */
    async xpFor(memberID, guildID) {
        if(!this.isReady) return this.logger.error('Module isn\'t loaded!');

        if(!memberID) return this.logger.error('\'memberID\' is needed for xpFor method!');
        if(!guildID) return this.logger.error('\'guildID\' is needed for xpFor method!');

        if((typeof memberID) !== 'string') return this.logger.error('\'memberID\' is not a String (xpFor method)!');
        if((typeof guildID) !== 'string') return this.logger.error('\'guildID\' is not a String (xpFor method)!');

        return new Promise(async(res, rej) => {
            if(this.options.type === 'mongodb') {
                const userData = await LevelingModel.findOne({
                    memberID,
                    guildID
                });
    
                if(userData === null) await this.createUser(memberID, guildID);
                else {
                    try {
                        const formula = Number(5 * Math.pow(userData.level, 2) + 50 * userData.level + 100);
                        const nextXP = (formula - userData.xp);

                        return res(Number(nextXP));
                        
                    } catch (error) {
                        return rej(
                            this.logger.error(error.message)
                        );
                    }
                }
            }
            else if(this.options.type === 'json') {
                const data = JSON.parse(readFileSync(this.options.jsonPath).toString())
                
               const userData = data.find((user) => user.guildID === guildID && user.memberID === memberID);
                if(!userData) this.createUserJSON(memberID, guildID);

                const formula = Number(5 * Math.pow(userData.level, 2) + 50 * userData.level + 100);
                const nextXP = (formula - userData.xp);

                return res(Number(nextXP));
            };
        });
    }

    /**
     * [Sets XP to User]
     * 
     * @param {string} memberID 
     * @param {string} guildID 
     * @param {number} amount 
     */
    async setXP(memberID, guildID, amount) {
        if(!this.isReady) return this.logger.error('Module isn\'t loaded!');

        if(!memberID) return this.logger.error('\'memberID\' is needed for setXP method!');
        if(!guildID) return this.logger.error('\'guildID\' is needed for setXP method!');
        if(!amount) return this.logger.error('\'amount\' is needed for setXP method!');

        if((typeof memberID) !== 'string') return this.logger.error('\'memberID\' is not a String (setXP method)!');
        if((typeof guildID) !== 'string') return this.logger.error('\'guildID\' is not a String (setXP method)!');
        if((typeof amount) !== 'number') return this.logger.error('\'amount\' is not a Number (setXP method)!');

        return new Promise(async(res, rej) => {
            if(this.options.type === 'mongodb') {
                try {
                    const userData = await LevelingModel.findOne({
                        memberID,
                        guildID
                    });
        
                    if(userData === null) await this.createUser(memberID, guildID);
                    else {
                        await LevelingModel.findOneAndUpdate(
                            {
                                memberID,
                                guildID
                            },
                            {
                                xp: Number(amount)
                            }
                        ).exec();

                        const newUser = await LevelingModel.findOne({
                            memberID,
                            guildID
                        });

                        events.emit('setXP', {
                            type: 'setXP',
                            userID: memberID,
                            guildID,
                            oldXP: Number(userData.xp),
                            newXP: Number(newUser.xp),
                        });

                        return res(true);
                    } 
                } catch (error) {
                    return rej(
                        this.logger.error(error.message)
                    );
                }
            }
            else if(this.options.type === 'json') {
                try {
                    const data = JSON.parse(readFileSync(this.options.jsonPath).toString());

                    const userData = data.find((user) => user.guildID === guildID && user.memberID === memberID);
                    if(!userData) this.createUserJSON(memberID, guildID);
                    else {
                        const oldXP = Number(userData.xp);

                        userData.xp = Number(amount);

                        events.emit('setXP', {
                            type: 'setXP',
                            userID: memberID,
                            guildID,
                            oldXP,
                            newXP: Number(newUser.xp),
                        });
                        
                        writeFileSync(this.options.jsonPath, JSON.stringify(data, null, '\t'));
                        return res(true);
                    };
                } catch (error) {
                    return rej(
                        this.logger.error(error.message)
                    );
                }
            }
        })
    }

    /**
     * [Sets Level to User]
     * 
     * @param {string} memberID 
     * @param {string} guildID 
     * @param {number} amount 
     */
    async setLevel(memberID, guildID, amount) {
        if(!this.isReady) return this.logger.error('Module isn\'t loaded!');

        if(!memberID) return this.logger.error('\'memberID\' is needed for setXP method!');
        if(!guildID) return this.logger.error('\'guildID\' is needed for setXP method!');
        if(!amount) return this.logger.error('\'amount\' is needed for setXP method!');

        if((typeof memberID) !== 'string') return this.logger.error('\'memberID\' is not a String (setXP method)!');
        if((typeof guildID) !== 'string') return this.logger.error('\'guildID\' is not a String (setXP method)!');
        if((typeof amount) !== 'number') return this.logger.error('\'amount\' is not a Number (setXP method)!');

        return new Promise(async(res, rej) => {
            if(this.options.type === 'mongodb') {
                try {
                    const userData = await LevelingModel.findOne({
                        memberID,
                        guildID
                    });
        
                    if(userData === null) await this.createUser(memberID, guildID);
                    else {
                        await LevelingModel.findOneAndUpdate(
                            {
                                memberID,
                                guildID
                            },
                            {
                                level: Number(amount)
                            }
                        ).exec();

                        const newUser = await LevelingModel.findOne({
                            memberID,
                            guildID
                        });

                        events.emit('setLevel', {
                            type: 'setLevel',
                            userID: memberID,
                            guildID,
                            oldLevel: Number(userData.level),
                            newLevel: Number(newUser.level),
                        });

                        return res(true);
                    } 
                } catch (error) {
                    return rej(
                        this.logger.error(error.message)
                    );
                }
            }
            else if(this.options.type === 'json') {
                try {
                    const data = JSON.parse(readFileSync(this.options.jsonPath).toString());

                    const userData = data.find((user) => user.guildID === guildID && user.memberID === memberID);
                    if(!userData) this.createUserJSON(memberID, guildID);
                    else {
                        const oldLevel = Number(userData.level);

                        userData.level = Number(amount);

                        events.emit('setLevel', {
                            type: 'setLevel',
                            userID: memberID,
                            guildID,
                            oldLevel,
                            newLevel: Number(userData.level),
                        });

                        writeFileSync(this.options.jsonPath, JSON.stringify(data, null, '\t'));
                        return res(true);
                    };
                } catch (error) {
                    return rej(
                        this.logger.error(error.message)
                    );
                }
            }
        })
    }

    /**
     * [Gets User Data]
     * 
     * @param {string} memberID 
     * @param {string} guildID 
     */
    async get(memberID, guildID) {
        if(!this.isReady) return this.logger.error('Module isn\'t loaded!');

        if(!memberID) return this.logger.error('\'memberID\' is needed for get method!');
        if(!guildID) return this.logger.error('\'guildID\' is needed for get method!');
        if((typeof memberID) !== 'string') return this.logger.error('\'memberID\' is not a String (get method)!');
        if((typeof guildID) !== 'string') return this.logger.error('\'guildID\' is not a String (get method)!');

        if(this.options.type === 'mongodb') {
            return new Promise(async(res, rej) => {
                try {
                    const userData = await LevelingModel.findOne({
                        memberID,
                        guildID
                    });
        
                    if(userData === null) await this.createUser(memberID, guildID);
                    else return res(userData);
                } catch (error) {
                    return rej(
                        this.logger.error(error.message)
                    );
                }
            });
        }
        else if(this.options.type === 'json') {
            return new Promise((res, rej) => {
               try {
                    const data = JSON.parse(readFileSync(this.options.jsonPath).toString());

                    const userData = data.find((user) => user.guildID === guildID && user.memberID === memberID);
                    if(!userData) this.createUserJSON(memberID, guildID);
                    else return res(userData);
               } catch (error) {
                    return rej(
                        this.logger.error(error.message)
                    );
               } 
            });
        }
    }

    /**
     * [Method to get Level Leaderboard]
     * 
     * @param {string} guildID 
     */
    async leaderboard(guildID) {
        if(!this.isReady) return this.logger.error('Module isn\'t loaded!');

        if(!guildID) return this.logger.error('\'guildID\' is needed for leaderboard method!');
        if((typeof guildID) !== 'string') return this.logger.error('\'guildID\' is not a String (leaderboard method)!');

        if(this.options.type === 'mongodb') {
            return new Promise(async(res, rej) => {
                try {
                    const guildData = await LevelingModel.find({
                        guildID
                    });

                    const sortedArray = guildData.sort((a, b) => b.level - a.level);
                    
                    return res(sortedArray);
                } catch (error) {
                    return rej(
                        this.logger.error(error.message)
                    );
                }
            });
        }
        else if(this.options.type === 'json') {
            return new Promise(async(res, rej) => {
                try {
                    const data = JSON.parse(readFileSync(this.options.jsonPath).toString());

                    const guildData = data.find((user) => user.guildID === guildID);
                    if(!guildData) return rej(this.logger.error('Leaderboard cannot create because Server isn\'t founded in DB.'));
                    else {
                        const sortedArray = guildData.sort((a, b) => b.level - a.level);
                        return res(sortedArray);
                    };
                } catch (error) {
                    return rej(
                        this.logger.error(error.message)
                    );
                }
            });
        }
    }

    /**
     * [Creating User Table | MongoDB | Private]
     * 
     * @param {string} memberID 
     * @param {string} guildID
     * 
     * @private
     */
    async createUser(memberID, guildID) {
        if(!this.isReady) return this.logger.error('Module isn\'t loaded!');

        if(!memberID) return this.logger.error('\'memberID\' is needed for createUser method!');
        if(!guildID) return this.logger.error('\'guildID\' is needed for createUser method!');

        if((typeof memberID) !== 'string') return this.logger.error('\'memberID\' is not a String (createUser method)!');
        if((typeof guildID) !== 'string') return this.logger.error('\'guildID\' is not a String (createUser method)!');

        return new Promise(async(res, rej) => {
            try {
                await new LevelingModel({
                    memberID,
                    guildID,
                    level: 1,
                    xp: 0
                }).save();
        
                return res(true);
            } catch (error) {
                rej(
                    this.logger.error(error.message)
                );
            }
        });
    }

    /**
     * [Creating User Table | JSON | Private]
     * 
     * @param {string} memberID 
     * @param {string} guildID
     * 
     * @private
     */
    async createUserJSON(memberID, guildID) {
        if(!this.isReady) return this.logger.error('Module isn\'t loaded!');

        if(!memberID) return this.logger.error('\'memberID\' is needed for createUserJSON method!');
        if(!guildID) return this.logger.error('\'guildID\' is needed for createUserJSON method!');

        if((typeof memberID) !== 'string') return this.logger.error('\'memberID\' is not a String (createUserJSON method)!');
        if((typeof guildID) !== 'string') return this.logger.error('\'guildID\' is not a String (createUserJSON method)!');

        return new Promise(async(res, rej) => {
            try {
                const data = JSON.parse(readFileSync(this.options.jsonPath).toString());

                const searchData = {
                    memberID,
                    guildID
                };

                if(!data.includes(searchData)) {
                    data.push({
                        memberID,
                        guildID,
                        level: 1,
                        xp: 0
                    });
                }
                else {
                    return rej(
                        this.logger.warn('User is already in DB!')
                    );
                };

                writeFileSync(this.options.jsonPath, JSON.stringify(data, null, '\t'));

                return res(true);
            } catch (error) {
                rej(
                    this.logger.error(error.message)
                );
            }
        });
    }

    /**
     * [Method to Initialize Module | Private]
     * 
     * @private
     */
    async initModule() {
        if(this.options.type === 'mongodb') {
            const mongodbPath = this.options.mongoPath;
            if(!mongodbPath) {
                this.isReady = false;
                return this.logger.warn('No mongoPath writed in Leveling.Options!')
            };
            
            try {
                return await mongoose.connect(mongodbPath, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useFindAndModify: false,
                    useCreateIndex: true
                }, (err) => {
                    if(err) {
                        return this.logger.error('Cannot connect to Database!');
                    }
                    else {
                        this.logger.log('Connected to Database!');
                    
                        this.isReady = true;

                        return this.db = mongoose;
                    };
                })
            } catch (error) {
                this.isReady = false;

                this.logger.error(error.message);
            };
        }
        else if(this.options.type === 'json') {
            const jsonPath = this.options.jsonPath;
            if(!jsonPath) {
                this.isReady = false;

                return this.logger.warn('No jsonPath writed in Leveling.Options!')
            };

            setInterval(() => {
                const fileCheck = existsSync(jsonPath);
                if(!fileCheck) {
                    this.logger.warn('No File founded, creating...');
                    
                    writeFileSync(jsonPath, JSON.stringify([], null, '\t'));
                };

                const content = readFileSync(jsonPath).toString();
                if(!content.startsWith('[') && !content.endsWith(']')) {
                    this.logger.error('DB File has wrong data!');
                };
            }, 1000);
        }
        else {
            return this.logger.error(`Unknown Type '${this.options.type}'`)
        };

        this.isReady = true;
    }
}

class Logger {
    log(...message) {
        return console.log(`[Leveling | ${new Date().toLocaleString()}] ${message}`)
    }

    warn(...message) {
        return console.warn(`[Leveling | ${new Date().toLocaleString()}] ${message}`)
    }

    error(...message) {
        return console.error(`[Leveling | ${new Date().toLocaleString()}] ${message}`)
    }
}

/**
 * Emitted when someone removed their reaction to a giveaway.
 * @event Leveling#newLevel
 * @param {object} data
 * @param {string} data.userID The giveaway instance
 * @param {string} data.guildID The member who remove their reaction giveaway
 * @param {number} data.level The reaction to enter the giveaway
 *
 * @example
 * leveling.on('newLevel', (data) => {
 *      console.log(`${data.userID} reached ${data.level} level!`)
 * });
 */