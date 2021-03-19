export class Injector {
  // tslint:disable-next-line:no-any
  private map: Map<string, any> = new Map();

  public get<T>(key: string): T {
    return this.map.get(key);
  }

  public set<T>(key: string, value: T): void {
    this.map.set(key, value);
  }
}

export const injector = new Injector();
