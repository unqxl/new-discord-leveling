export class Logger {
  get time(): string;

  log(message: string, tag: string): void;
  warn(message: string, tag: string): void;
  error(message: string, tag: string): void;
}
