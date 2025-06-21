// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

const path = require('path');
const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
// const ESLintPlugin = require('eslint-webpack-plugin');

const envJsonPath = path.resolve(__dirname, '.quasar.env.json');
const packageJson = fs.readFileSync('./package.json');
const parsedEnv = JSON.parse(fs.readFileSync(envJsonPath));

const nodeEnv = process.env.NODE_ENV;
const analyze = process.env.ANALYZE;

const version = JSON.parse(packageJson).version || '0.0.0';

module.exports = (ctx) => {
  /** @type {import('@quasar/app-webpack/types/configuration/conf').QuasarConf} */
  const config = {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://quasar.dev/quasar-cli/cli-documentation/boot-files
    boot: [
      'countries',
      'i18n',
      'firebase',
      'bugsnag',
      'globals',
      'localStorage',
      'vuefire',
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-css
    css: [
      'app.scss',
      'editor.scss',
      'fonts.scss',
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v4',
      'fontawesome-v5',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-framework
    framework: {
      iconSet: 'material-icons', // Quasar icon set
      lang: 'en-US', // Quasar language pack

      components: [],
      directives: [],

      // Quasar plugins
      plugins: [
        'Dialog',
        'Loading',
        'Notify',
        'Meta',
        'AppVisibility',
      ],
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
    build: {
      vueRouterMode: 'hash', // available values: 'hash', 'history'

      sourceMap: true,
      devtool: 'source-map',
      env: {
        version,
        ...parsedEnv[nodeEnv],
      },

      rtl: true,

      // rtl: false, // https://quasar.dev/options/rtl-support
      // showProgress: false,
      // gzip: true,
      ...(analyze ? { analyze: true } : {}),

      // Options below are automatically set depending on the env, set them if you want to override
      // preloadChunks: false,
      // extractCSS: false,

      // https://quasar.dev/quasar-cli/cli-documentation/handling-webpack
      extendWebpack(cfg) {
         
        // cfg.resolve.alias = { // @todo: doesn't work for tests suite
        //   ...cfg.resolve.alias,
        //   test: path.resolve(__dirname, './test'),
        // };

        if (nodeEnv !== 'production') {
          cfg.cache = {
            type: 'filesystem',
            cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
            compression: 'gzip',
            name: `quasar-${nodeEnv}-${ctx.modeName}`,
          };
        }

        cfg.module.rules.push({
          resourceQuery: /blockType=i18n/,
          type: 'javascript/auto',
          use: [
            { loader: '@intlify/vue-i18n-loader' },
            { loader: 'yaml-loader' },
          ],
        });
        // const MiniCssExtractPlugin = require("mini-css-extract-plugin");
        // module.exports = {
        //   plugins: [
        //     new MiniCssExtractPlugin({
        //       ignoreOrder: true
        //     })
        //   ],
        //   module: {
        //     rules: [
        //       {
        //         test: /\.css$/i,
        //         use: [MiniCssExtractPlugin.loader, "css-loader"]
        //       }
        //     ]
        //   }
        // };
        // cfg.plugins.push(PrivateMethodsPlugin);

        if (process.env.ENV_TYPE === 'production' && ctx.mode.pwa) {
          cfg.plugins.push(new BugsnagSourceMapUploaderPlugin({
            apiKey: '052c4c9d551d4edcd55c8efecc3bb338',
            appVersion: version,
            publicPath: '../dist/pwa/',
            overwrite: true,
          }));
        }
      },

      chainWebpack(chain) {
        // chain
        //   .plugin('eslint-webpack-plugin')
        //   .use(ESLintPlugin, [{ extensions: ['js', 'vue'] }]);
        // eslint-disable-next-line import/no-extraneous-dependencies
        const nodePolyfillWebpackPlugin = require('node-polyfill-webpack-plugin');
        chain.plugin('node-polyfill').use(nodePolyfillWebpackPlugin);
      },
    },

    // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-devServer
    devServer: {
        https: false,
      port: 8888,
      open: true,
    },

    // animations: 'all', // --- includes all animations
    // https://quasar.dev/options/animations
    animations: 'all',

    // https://quasar.dev/quasar-cli/developing-ssr/configuring-ssr
    ssr: {
      pwa: false,
    },

    // https://quasar.dev/quasar-cli/developing-pwa/configuring-pwa
    pwa: {
      workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      workboxOptions: {
        skipWaiting: false,
        clientsClaim: false,
        maximumFileSizeToCacheInBytes: 20000000,
        importScripts: ['custom-sw-logic.js'],
        navigateFallbackDenylist: [/\/__\/[0-9A-Za-z/]*/], // exclude firebase pages like password resetting
      }, // only for GenerateSW
      manifest: {
        name: 'Fishing app',
        short_name: 'F-app',
        description: 'F-app',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
      id: 'org.cordova.quasar.app',
    },

    // Full list of options: https://quasar.dev/quasar-cli/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
      version,
    },

    bin: {
      linuxAndroidStudio: '/snap/android-studio/current/android-studio/bin/studio.sh',
    },
  };

  return config;
};
