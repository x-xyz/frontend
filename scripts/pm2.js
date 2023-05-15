/* eslint-disable @typescript-eslint/no-var-requires */
const pm2 = require('pm2');

const workspaces = [
  '@x/models',
  '@x/abis',
  '@x/utils',
  '@x/constants',
  '@x/apis',
  '@x/web3',
  '@x/store',
  '@x/hooks',
  '@x/components',
];

const pm2Apps = workspaces.map((w) => {
  return {
    name: w,
    script: `yarn workspace ${w} build --watch`
  }
});

let appDone = 0

pm2.connect((err) => {
  if (err) {
    console.error(err)
    process.exit(1);
  }

  for (const app of pm2Apps) {
    pm2.start(app, (err) => {
      if (err) {
        console.error(`failed to watch and build workspace ${app.name}:`, err)
      } else {
        console.log(`start watching and building workspace ${app.name}`)
      }

      appDone += 1
      if (appDone === pm2Apps.length) {
        pm2.disconnect()
      }
    })
  }
})
