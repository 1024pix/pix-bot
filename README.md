# Scalingo App Manager (SAM)

SAM is this smart person who thinks of turning off the light when leaving the office and turning on the coffee machine when arriving in the morning.

SAM is this eco-responsible application that preserves resources (yours 💰 and those of the planet 🌍) while ensuring comfortable activity for the team.

SAM helps developers and teams who host their applications on [Scalingo](https://scalingo.com) to manage them pragmatically and economically.

Services provided by SAM:
- shut down Review Apps, at the time you want, every day of the week
- re-start stopped Review Apps, when you want, every day of the week

## Getting started

1/ Fork the repository

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

2/ Create a `.env` file with variables:

```
JOB_START_REVIEW_APPS=0 0 8 * * 1-5 # Every day of the week at 8:00:00
JOB_STOP_REVIEW_APPS=0 0 19 * * 1-5 # Every day of the week at 19:00:00
SCALINGO_API_URL=https://api.osc-fr1.scalingo.com # For 3DS Outscale datacenters
SCALINGO_TOKEN=tk-us-Dk... # Your Scalingo API token
```

3/ Fetch the project dependencies 
```
npm install
```

4/ Start the application
```
npm start
```

5/ Develop and add wonderful features!