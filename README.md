# MonoNFC
Basically a NFC calculator apps for any board games. No more money-on-hand! Go cashless!

# How to build
1. git clone https://github.com/faizulramir/mononfc.git.
2. Run this command:
  ```
  npm install
  ionic cordova platform add android
  ionic cordova run android -l -c (livereload on emulator and consolelog)
  ionic cordova build android (build *.apk)
  ```

# Sample Image
Registration             |  Start Game
:-------------------------:|:-------------------------:
<img src="https://github.com/faizulramir/mononfc/blob/main/img/ss2.png" width="250">  |  <img src="https://github.com/faizulramir/mononfc/blob/main/img/ss4.png" width="250">

History             |  Calculator
:-------------------------:|:-------------------------:
<img src="https://github.com/faizulramir/mononfc/blob/main/img/ss3.png" width="250">  |  <img src="https://github.com/faizulramir/mononfc/blob/main/img/ss1.png" width="250">

# Supported NFC
1. NTAG21*

# Ionic Info
1. Ionic:
   - Ionic CLI          : 6.18.2
   - Ionic Framework    : ionic-angular 3.9.9
   - @ionic/app-scripts : 3.2.4

2. Cordova:
   - Cordova CLI       : 11.0.0
   - Cordova Platforms : android 8.1.0
   - Cordova Plugins   : cordova-plugin-ionic-keyboard 2.2.0, cordova-plugin-ionic-webview 4.2.1, (and 17 other plugins)

3. Utility:
   - cordova-res                          : 0.15.4
   - native-run (update available: 1.7.1) : 1.5.0
