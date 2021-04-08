// Gallery/Camera photo
export interface Photo {
  filename: string;
  filepath: string;
  webviewPath?: string;
  data: string; // base64 data
  isSelected: boolean;
  index: number;
}

// Cloud photo
export interface UploadPhoto {
  id: string;
  url: string;
  sortPosition: number;
  path: string;
  index: number;
}

export interface PhotosState {
  photos: Array<Photo>; // Gallery/Camera photo
  uploadPhotos: Array<UploadPhoto>; // Cloud photo
}