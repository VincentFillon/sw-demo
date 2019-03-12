export class CacheService {
  private _cacheName: string;

  constructor(cacheName: string) {
    this.cacheName = cacheName;
  }

  /**
   * Getter cacheName
   * @return {string}
   */
  public get cacheName(): string {
    return this._cacheName;
  }

  /**
   * Setter cacheName
   * @param {string} value
   */
  public set cacheName(value: string) {
    this._cacheName = value;
  }

  public put(key: string, data: any) {
      
  }
}
