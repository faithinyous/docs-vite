## Quasar

All doc is here https://quasar.dev/

### After install need to change some detail to make it easier to use

Edit Quasar config in quasar.conf.js

1. edit build -> vueRouterMode to 'history'
2. add env using || so that it will use the default value if the env is not set. I suggest dont set .env outside as it
   will always have some problem when deploy using cloudflare

```json
{
   build: {
      vueRouterMode: 'history',
      env: {
         API_BASE_URL: process.env.API_BASE_URL || 'https://localhost:5001'
      }
   }
}
```

#### Setting up i18next

i18next is improved version of i18n (Does not work with SSR)

Add package to dependency

```batch
yarn add i18next i18next-vue
```

1. create new file i18next.ts under boot

   ```ts
   import { boot } from "quasar/wrappers";

   import messages from "src/i18n";
   import i18next from "i18next";
   import I18NextVue from "i18next-vue";
   import { LocalStorage } from "quasar";

   export default boot(async ({ app }) => {
     const lang = LocalStorage.getItem("lang")?.toString();
     await i18next.init({
       lng: lang || "en-US",
       resources: messages,
     });

     // Set i18n instance on app
     app.use(I18NextVue, { i18next });
   });
   ```

2. Change i18n/index.ts to the follow code

   ```ts
   import enUS from "./en-US";
   import thTH from "./th-TH";

   export default {
     "en-US": { translation: enUS },
     "th-TH": { translation: thTH },
   };
   ```

3. Change i18n/en-US.ts to the follow code. Import other language file if needed

   ```ts
   import btn from "./btn";

   const general = {
     save: "save",
   };

   export default { general, btn };
   ```

4. Usages example

   ```vue
   <!-- adding to the component -->
   <q-btn color="primary" :label="$t('btn.submit')" no-caps @click="scrollTo" />

   <!-- directly using in the div -->
   <div>
   {{ $t('genera.save') }}
   </div>
   ```

5. Add boot to quasar.conf.js

   ```json
   {
     "boot": ["i18next"]
   }
   ```
