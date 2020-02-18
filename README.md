# scalingo-app-switch

1/ Get the sources
```
git clone git@github.com:1024pix/scalingo-app-manager.git && cd scalingo-app-manager
```

2/ Create a `.env` file with variables:

- SCALINGO_API_URL=[String]
- SCALINGO_TOKEN=[String]
- JOB_START_REVIEW_APPS=[Cron expression]
- JOB_STOP_REVIEW_APPS=[Cron expression]

3/ Fetch the project dependencies 
```
npm install
```

4/ Start the application
```
npm start
```