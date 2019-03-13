import { IImageData } from './image-data.i';

/**
 * Interface of an image object
 * @author vincent fillon
 * @export
 * @interface IImage
 */
export interface IImage {
  id: number;
  data: IImageData;
  src?: string;
}
