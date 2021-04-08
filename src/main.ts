import { createApp } from 'vue'
import { store, key } from './store'
import { Capacitor, Plugins, StatusBarStyle } from '@capacitor/core'
import { FCM } from '@capacitor-community/fcm';

import App from './App.vue'
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Firebase */
import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "https://<application>.firebaseio.com",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { UserActions } from '@/store/modules/user/actions-types'
import { LocalStorageKeys } from './store/local-storage-keys';


if (Capacitor.isPluginAvailable('StatusBar')) {
  const { StatusBar } = Plugins;
  StatusBar.setStyle({ style: StatusBarStyle.Light });
  StatusBar.setBackgroundColor({ color: '#F0F0F0' });
}

const app = createApp(App)
  .use(IonicVue)
  .use(router);

app.use(store, key);

router.isReady().then(async () => {
  app.mount('#app');

  /**
   * Handle push notifications
   */
  if (Capacitor.isPluginAvailable('PushNotifications')) {
    const { PushNotifications } = Plugins;
    const fcm = new FCM();

    // Ask for permission to use push notifications
    PushNotifications.requestPermission().then(result => {
      if (result.granted) {
        // Register for push notifications
        PushNotifications.register().then(() => {
          // get FCM token for this device
          fcm.getToken().then(({ token }) => {
            if (store && !store.getters['user/isLoggedIn']) {
              localStorage.setItem(LocalStorageKeys.apnToken, token);
            }
          }).catch(err => {
            console.error(`Error getting FCM token`, err);
          })
        })
      }
    });

    PushNotifications.addListener("registration", (token) => {
      localStorage.setItem(LocalStorageKeys.apnToken, token.value);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', action => {
      const page = action.notification.data["page"];
      if (page && page.length > 0) {
        switch (page) {
          case "send-protocol":
            router.replace("/home/send-protocol");
            break;
          case "send-violation":
            router.replace("/home/send-violation");
            break;
          case "protocols":
            router.replace("/home/protocols");
            break;
          case "violations":
            router.replace("/home/violations");
            break;
          default:
            break;
        }
      }

      const protocol = action.notification.data["protocol"];
      if (protocol && protocol.length > 0) {
        localStorage.setItem(LocalStorageKeys.apnProtocol, protocol);
        router.push("/home/protocols/protocol");
      }

      const violation = action.notification.data["violation"];
      if (violation && violation.length > 0) {
        localStorage.setItem(LocalStorageKeys.apnViolation, violation);
        router.push("/home/violations/violation");
      }
    })
  }
});

/**
 * Try to initialize user from localStorage, then setup route protection
 */
store.dispatch(`user/${UserActions.INIT_USER}`)
  .finally(() => {
    router.beforeEach((to, from, next) => {
      if (to.matched.some(record => record.meta.requiresAuth)) {
        if (store && !store.getters['user/isLoggedIn']) {
          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
        } else {
          next()
        }
      } else {
        next() // make sure to always call next()!
      }
    })
  })

defineCustomElements(window);
