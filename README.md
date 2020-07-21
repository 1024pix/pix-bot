# Pix Bot (ex-SAM)

Pix Bot is this smart person who thinks of turning off the light when leaving the office and turning on the coffee machine when arriving in the morning.

Pix Bot is this eco-responsible application that preserves resources (yours 💰 and those of the planet 🌍) while ensuring comfortable activity for the team.

Pix Bot helps developers and teams who host their applications on [Scalingo](https://scalingo.com) to manage them pragmatically and economically.

Services provided by Pix Bot:
- shut down Review Apps, at the time you want, every day of the week
- re-start stopped Review Apps, when you want, every day of the week
- deploy a specific release into production via secured API
- deploy a specific release into production via a Slack command or shortcut

## Getting started

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

*6/* Testing `publish` and `deploy` scripts
You can specify the repository you want to use for `publish` and `deploy` on any GitHub repository.

Prerequisites: The repository shall contain `dev`, `master` and `publish` branches.

Command to run the `publish` script:
```sh
GITHUB_OWNER=#github_owner# GITHUB_REPOSITORY=#github_repository# GITHUB_USERNAME=#github_username# GITHUB_PERSONAL_ACCESS_TOKEN=#github_personal_token# GIT_USER_NAME=#user_name# GIT_USER_EMAIL=#user_email# scripts/publish.sh (path|minor|major)
```

Command to run the `deploy` script:
```sh
GITHUB_OWNER=#github_owner# GITHUB_REPOSITORY=#github_repository# GITHUB_USERNAME=#github_username# GITHUB_PERSONAL_ACCESS_TOKEN=#github_personal_token# GIT_USER_NAME=#user_name# GIT_USER_EMAIL=#user_email# NEW_PACKAGE_VERSION=#version_to_deploy# scripts/deploy.sh (recette|production)
```

A specific slack command has been created to test a release for a specific [repository](https://github.com/1024pix/pix-bot-release-test)

The Url of the command is
 
_/slack/commands/create-and-deploy-pix-bot-test-release_

you can provide a type of release: _minor_/_major_/_bugfix_, _minor_ is the default


## License

Copyright (c) 2020 GIP PIX.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see [gnu.org/licenses](https://www.gnu.org/licenses/).
