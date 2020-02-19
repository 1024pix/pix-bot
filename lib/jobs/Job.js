const CronJob = require('cron').CronJob;

class Job {

  constructor(name, cronTime, onTick) {
    this.name = name;
    this.cron = new CronJob({ cronTime, onTick, startNow: true, timeZone: 'Europe/Paris' });
  }
}

module.exports = Job;
