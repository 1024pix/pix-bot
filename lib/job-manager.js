const fs = require('fs');
const path = require('path');

class JobManager {

  jobs = [];

  constructor() {
    const jobsDirectory = path.join(__dirname, 'jobs');
    fs.readdirSync(jobsDirectory).forEach((file) => {
      if (file === 'job.js') return;
      this.jobs.push(require(path.join(jobsDirectory, file)));
    });
  }

  startJobs() {
    this.jobs.forEach((job) => {
      console.log(`Starting job ${job.name}…`);
      try {
        job.cron.start();
        console.log(`Job ${job.name} started with cron time "${job.cron.cronTime}"`);
      } catch(err) {
        console.error(err);
      }
    });
  }

}

module.exports = new JobManager();
