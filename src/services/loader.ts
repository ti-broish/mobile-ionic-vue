import { loadingController } from "@ionic/vue";

export class Loader {

  async showLoading() {
    const loading = await loadingController
      .create({
        cssClass: 'cssLoading',
        message: '',
        duration: 1000000,
      });

    await loading.present();
  }

  async hideLoading() {
    await loadingController.dismiss();
  }
}
