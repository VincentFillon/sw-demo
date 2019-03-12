import Dexie from 'dexie';
import { IImage } from '../models';

export class DBService extends Dexie {
  private _dbVersion: number;
  private _images: Dexie.Table<IImage, number>;

  constructor(dbName: string, dbVersion: number) {
    super(dbName);
    this.dbVersion = dbVersion;

    this.version(this.dbVersion).stores({
      images: '++index, data, src'
    });
    this.images = this.table('images');
  }

  /**
   * Getter dbVersion
   * @return {number}
   */
  public get dbVersion(): number {
    return this._dbVersion;
  }

  /**
   * Setter dbVersion
   * @param {number} value
   */
  public set dbVersion(value: number) {
    this._dbVersion = value;
  }

  /**
   * Getter images
   * @return {Dexie.Table<IImage, number>}
   */
  public get images(): Dexie.Table<IImage, number> {
    return this._images;
  }

  /**
   * Setter images
   * @param {Dexie.Table<IImage, number>} value
   */
  public set images(value: Dexie.Table<IImage, number>) {
    this._images = value;
  }
}
