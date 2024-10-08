# Pix Bot

## Goals
Pix Bot helps developers and teams who host their applications on [Scalingo](https://scalingo.com) to manage them pragmatically and economically.

It offers the following services:
- create a Review App;
- shut down and restart Review Apps, at the time you want, every day of the week;
- deploy a specific release into production via a secured API;
- deploy a specific release into production via a Slack command or shortcut;
- call external service after a deployment (CDN invalidation).

Pix Bot is deployed into two apps:
- Pix Bot Build: contains the commands for the development tools
- Pix Bot Run: contains the commands related to the releases

## Run locally

*1/* Get the sources

```
git clone git@github.com:1024pix/pix-bot.git && cd pix-bot
```

*2/* Execute the configuration script:

```
npm run configure
```

*3/* Start the application

```
npm start
```

*4/* Access the application on http://localhost:3000

*5/* Develop and add wonderful features!

*6/* Testing `publish` script
You can specify the repository you want to use for `publish` on any GitHub repository.

Prerequisites: The repository shall contain `dev`, `master` and `publish` branches.

Command to run the `publish` script:
```sh
GITHUB_OWNER=#github_owner# GITHUB_REPOSITORY=#github_repository# GITHUB_PERSONAL_ACCESS_TOKEN=#github_personal_token# GIT_USER_NAME=#user_name# GIT_USER_EMAIL=#user_email# scripts/publish.sh (path|minor|major)
```

## Deploy an application through Slack

Create a Slack endpoint in [manifest](./run/manifest.js)
```js
manifest.registerSlashCommand({
  command: '/deploy-pix-datawarehouse',
  path: '/slack/commands/create-and-deploy-pix-datawarehouse-release',
  description:
    'Crée une release de Pix-Datawarehouse et la déploie en production (pix-datawarehouse-production & pix-datawarehouse-ex-production)',
  usage_hint: '[patch, minor, major]',
  should_escape: false,
  handler: slackbotController.createAndDeployPixDatawarehouseRelease,
});
```


## Activate review-application for an application

### Register the Scalingo application(s)

Add GitHub repository and Scalingo application name in [the mapping](./build/controllers/github.js)
```js
const repositoryToScalingoAppsReview = {
   <GITHUB-REPOSITORY-NAME>: [<SCALINGO-APPLICATION-NAME>],
     (..)
}
```

You can have more than one Scalingo application per GitHub repository.

### Customize review-application comment
A comment is added to the pull request, including:
- review application URL;
- review application administration URL.

Check if the [default template](./build/templates/pull-request-messages/default.md) fit your needs.
If not, create a custom one in the folder.

## Test 

### GitHub integration

Generate a secret and store it in `.env`file `GITHUB_WEBHOOK_SECRET` variable.

Start the server.
`npm start`

Expose it.
`ngrok http 3000`

Create a webhook on Github organization (or repository) :
- Payload URL = https://<SOMETHING>.ngrok.io/github/webhook
- Content type: application/JSON
- secret = <GITHUB_WEBHOOK_SECRET>
- SSL verification = Disabled
- Which events would you like to trigger this webhook? send me everything

Perform some action on Github and check
- ngrok receive Github request
- pix-bot API process them

### Test the endpoint on Slack

If you want to test your new endpoint before deploying it, 
you will need to run your server locally and make it visible (with [ngrok][] for example).

Add your new slash command to the corresponding manifest: ./{run,build}/controllers/manifest.js.

Go to [https://api.slack.com/apps](https://api.slack.com/apps), and create a new slack app, and create it from a manifest. The manifest is available a {ngrok_url}/{run,build}/manifest.

### Test slack views

Go to http://localhost:3000/slackviews to test and debug slack views.

## Deploy

Pix Bot has a Slack command that allow to release itself:
```
/deploy-pix-bot [patch|minor|major]
```
This command will create a tag, a release commit and deploy the applications Pix Bot Build and Pix Bot Run.

## License

Copyright (c) 2020 GIP PIX.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see [gnu.org/licenses](https://www.gnu.org/licenses/).

[ngrok]: https://ngrok.com/
