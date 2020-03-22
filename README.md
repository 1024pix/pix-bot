# Scalingo App Manager (SAM)

SAM is this smart person who thinks of turning off the light when leaving the office and turning on the coffee machine when arriving in the morning.

SAM is this eco-responsible application that preserves resources (yours 💰 and those of the planet 🌍) while ensuring comfortable activity for the team.

SAM helps developers and teams who host their applications on [Scalingo](https://scalingo.com) to manage them pragmatically and economically.

Services provided by SAM:
- shut down Review Apps, at the time you want, every day of the week
- re-start stopped Review Apps, when you want, every day of the week
- deploy a specific release into production via secured API
- deploy a specific release into production via a Slack command or shortcut

## Getting started

1/ Fork or clone the repository

2/ Create a new Scalingo application

3/ In the environment section, define the required variables (cf. ["Contributing"](#contributing))

4/ Push the forked code on your Scalingo Git repository

```
git push scalingo master
```

## Contributing

1/ Get the sources
```
git clone git@github.com:1024pix/scalingo-app-manager.git && cd scalingo-app-manager
```

2/ Execute the configuration script:
```
npm run configure
```

3/ Start the application
```
npm start
```

4/ Access the application on http://localhost:3000

5/ Develop and add wonderful features!
