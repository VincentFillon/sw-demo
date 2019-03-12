import { IImageData } from './image-data.i';

export interface IImage {
  id: number;
  data: IImageData;
  src?: string;
}
