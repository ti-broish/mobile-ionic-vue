# Ти Броиш - Мobile
Мобилния приложения за платформата за паралелно преброяване Ти Броиш. 

# Инсталиране 

https://ionicframework.com/docs/vue/overview

```
npm install -g @ionic/cli

cd ti-broish

npm install
````

# Конфигуриране

1. Променете API baseURL в ti-broish/services/api.client.ts 
2. Променете firebaseConfig в ti-broish/main.ts

# Стартиране 

cd ti-broish

ionic serve

# Добавяне на мобилните приложения

```
npm run build
ionic capacitor add
```