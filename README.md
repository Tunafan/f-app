# F-App (f-app)

Fisher's best friend in an app built on Quasar, Vue, and Supabase using edge functions

## Install the dependencies
```bash
npm install
```

### Start the app in development mode
```bash
npm run dev
```


### Lint the files
```bash
npm run lint
```


### Build the app for production
```bash
quasar build
```


### Edge functions
If you want to add new functions to the project the setup is as follows:
```bash
cd ./supabase/functions
mkdir name-of-function
cd name-of-function
touch index.ts
```

Then, code your function until ready.
When ready, 
```bash
cd ../../..
npx supabase functions deploy name-of-function
```
