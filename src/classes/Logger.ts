import chalk from "chalk";

/**
 * @class
 * @classdesc The class responsible for logging in the console.
 */
export class Logger {
  /**
   * @returns {String}
   */
  get time() {
    return new Date().toLocaleString("ru");
  }

  /**
   *
   * @param {String} message
   * @param {String} tag
   * @returns {void}
   */
  log(message, tag) {
    return console.log(`[${this.time} | ${tag}] ${chalk.green(message)}`);
  }

  /**
   *
   * @param {String} message
   * @param {String} tag
   * @returns {void}
   */
  warn(message, tag) {
    return console.log(
      `[${this.time} | ${tag}] ${chalk.yellowBright(message)}`
    );
  }

  /**
   *
   * @param {String} message
   * @param {String} tag
   * @returns {void}
   */
  error(message, tag) {
    return console.log(`[${this.time} | ${tag}] ${chalk.red(message)}`);
  }
}
