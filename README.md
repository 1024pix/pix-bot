# Pix Bot (ex-SAM)

Pix Bot is this smart person who thinks of turning off the light when leaving the office and turning on the coffee machine when arriving in the morning.

Pix Bot is this eco-responsible application that preserves resources (yours 💰 and those of the planet 🌍) while ensuring comfortable activity for the team.

Pix Bot helps developers and teams who host their applications on [Scalingo](https://scalingo.com) to manage them pragmatically and economically.

Services provided by Pix Bot:
- shut down Review Apps, at the time you want, every day of the week
- re-start stopped Review Apps, when you want, every day of the week
- deploy a specific release into production via secured API
- deploy a specific release into production via a Slack command or shortcut

Pix Bot is deployed into two apps:
- Pix Bot Build: contains the commands for the development tools
- Pix Bot Run: contains the commands related to the releases

## Getting started

### Run locally

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

### Test the endpoint on Slack

If you want to test your new endpoint before deploying it, 
you will need to run your server locally and make it visible (with [ngrok][] for example).

Add your new slash command to the corresponding manifest: ./{run,build}/controllers/manifest.js.

Go to [https://api.slack.com/apps](https://api.slack.com/apps), and create a new slack app, and create it from a manifest. The manifest is available a {ngrok_url}/{run,build}/manifest.

### Test slack views

Go to http://localhost:3000/slackviews to test and debug slack views.


### Get test coverage

``` shell
cd api
npm run local:test:coverage
```

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
