# Custom app build and deploy steps

If fresh clone of the repository:

- first `npm install`
- then `ionic build`

If not already created or if needed to recreate the mobile apps.

- run `npx cap add ios`
- run `npx cap add android`

Follow the instructions in the following sections to complete the setup.

## iOS

Open the project in xcode

- run `npx cap sync ios`
- run `npx cap open ios`

At this point running in the emulator should work but device will not since both signing and bitcode issues need to be addressed.

- in the App got to `Signing & Capabilities` and choose a Team (assuming `Automatically manage signing` is checked and certificates are already loaded in xcode)

- in the App go to `Build Settings` and search for `Enable Bitcode`, set to `No`

- Copy the `post_install` custom changes from the podfile in `custom/ios/Podfile` to the `ios/App/Podfile`

- run `npx cap sync ios`

At this point running in both the emulator or device should work.

### Deploy to apple app store

Update the WebRTC binary to include only the arm binaries using `ios_arch.js` which is found in `node_modules/cordova-plugin-iosrtc/extra`.

- run `cd node_modules/cordova-plugin-iosrtc/extra` (make sure you are in the plugin `extra` directory)
- run `node ios_arch.js --extract`
- run `node ios_arch.js --device`
- run `node ios_arch.js --clean`

Sync the changes to the app

- run `cd ../../../` (make sure you are in the project root directory again)
- run `npx cap sync ios`

See: [Build Instructions](https://github.com/cordova-rtc/cordova-plugin-iosrtc/blob/master/docs/Building.md) For more details

At this point we are ready to perform the production build and submit to the app store.

## Android

Open the project in android studio

- run `npx cap sync android`
- run `npx cap open android`
- wait for gradle build

Before the app will work in the emulator there are some changes required.

- In the AndroidManifest.xml set `usesCleartextTraffic` to `true`:

```
<application
  android:usesCleartextTraffic="true">
```