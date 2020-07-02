import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import Tab1 from '../pages/Tab1';
import Tab2 from '../pages/Tab2';
import Tab3 from '../pages/Tab3';

import GlobalStyles from "main/styles/GlobalStyles";
import Normalize from "main/styles/Normalize";
import { ApplicationRouter } from "./Router";
import { appTheme } from "./Theme";
import Pubnub from "pubnub";
import { createPubNubListener } from "pubnub-redux";
import { PubNubProvider } from "pubnub-react";
import { Provider } from "react-redux";
import { createAppStore } from "main/store";
import keyConfiguration from "config/pubnub-keys.json";
import { ThemeProvider } from "styled-components";
import { createTypingIndicatorsListener } from "features/typingIndicator/typingIndicatorModel";

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import '../theme/variables.css';

const pubnubConfig = Object.assign(
  {},
  {
    // Ensure that subscriptions will be retained if the network connection is lost
    restore: true,
    heartbeatInterval: 0
  },
  keyConfiguration
);
const pubnub = new Pubnub(pubnubConfig);

const store = createAppStore({
  pubnub: {
    api: pubnub
  }
});

const leaveApplication = () => {
  // This is required to show the current user leave immediately rather than
  // wating for the timeout period
  pubnub.unsubscribeAll();
};
const App: React.FC = () => {
  useEffect(() => {
    // Start listening for messages and events from PubNub
    pubnub.addListener(createPubNubListener(store.dispatch));
    pubnub.addListener(createTypingIndicatorsListener(store.dispatch));
    return leaveApplication;
  }, []);

  return (
    <IonApp>
      {/* <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route path="/tab1" component={Tab1} exact={true} />
            <Route path="/tab2" component={Tab2} exact={true} />
            <Route path="/tab3" component={Tab3} />
            <Route path="/" render={() => <Redirect to="/tab1" />} exact={true} />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon icon={triangle} />
              <IonLabel>Tab 1</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab2" href="/tab2">
              <IonIcon icon={ellipse} />
              <IonLabel>Tab 2</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tab3">
              <IonIcon icon={square} />
              <IonLabel>Tab 3</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter> */}
      <ThemeProvider theme={appTheme}>
        <Provider store={store}>
          <PubNubProvider client={pubnub}>
            <Normalize />
            <GlobalStyles />
            <ApplicationRouter />
          </PubNubProvider>
        </Provider>
      </ThemeProvider>
    </IonApp>
  );
};

export default App;
