import { ref } from "vue";
import { Plugins, CameraResultType, CameraSource, FilesystemDirectory, Capacitor } from "@capacitor/core";
import { Photo } from "@/store/modules/photos/types";

export function usePhotoLibrary() {
  const { Camera, Filesystem } = Plugins;
  const photos = ref<Photo[]>([]);

  const savePhoto = async (data: string, index: number): Promise<Photo> => {
    const fileName = new Date().getTime() + ".jpeg";
    const base64Data = ("data:image/jpeg;base64," + data);

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
    });

    const photo: Photo = {
      filename: fileName,
      filepath: savedFile.uri,
      webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      data: base64Data,
      isSelected: false, 
      index: index
    };

    return photo;
  };

  const takePhoto = async () => {
    const cameraPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      quality: 70,
      width: 2048,
      height: 2048,
      preserveAspectRatio: true,
    });

    if (cameraPhoto.base64String) {
      const photo = await savePhoto(cameraPhoto.base64String, 0);

      photos.value = [photo, ...photos.value];
    }
  };

  const showPhotos = async () => {
    const cameraPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      quality: 70, 
      width: 2048,
      height: 2048,
      preserveAspectRatio: true, 
    });

    if (cameraPhoto.base64String) {
        const photo = await savePhoto(cameraPhoto.base64String, photos.value.length);

        photos.value = [photo, ...photos.value];
    }
  };

  const deletePhoto = async (photo: Photo) => {
    try {
      await Filesystem.deleteFile({
        path: photo.filepath,
        directory: FilesystemDirectory.Data,
      });
    } catch (err) {
      // Handle deletePhoto error
    }
  }

  const deletePhotos = async (photosToDelete: Array<Photo>) => {
    return Promise.all(photosToDelete.map((photo) => deletePhoto(photo)));
  }

  return {
    photos,
    takePhoto,
    showPhotos,
    deletePhoto,
    deletePhotos
  };
}