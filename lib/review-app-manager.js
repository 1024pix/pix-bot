const getScalingoClient = require('./scalingo-client').getClient;

class ReviewAppManager {

  managedApps = [];

  async scale(app, formation) {
    const scalingoClient = await getScalingoClient();
    console.log(`Scaling app ${app.name} to ${formation.amount} containers…`);
    try {
      await scalingoClient.Containers.scale(app.name, formation);
      console.log(`App ${app.name} scaled successfully`);
      this.managedApps.push(app);
    } catch (err) {
      if (err._data && err._data.error === 'no change in containers formation') {
        console.log(`App ${app.name} not scaled due to unchanged formation. This app will not be managed.`);
      } else {
        console.error(err);
      }
    }
  }

  async stopActiveReviewApps() {
    this.managedApps = [];
    const scalingoClient = await getScalingoClient();
    const apps = await scalingoClient.Apps.all();
    const activeReviewApps = apps
      .filter((app) => app.name.includes('-review-pr'))
      .filter((app) => app.status === 'new' || app.status === 'running');
    return Promise.all(activeReviewApps.map(async (app) => {
      return this.scale(app, [{ name: 'web', size: 'S', amount: 0 }]);
    }));
  }

  async restartManagedReviewApps() {
    return Promise.all(this.managedApps.map((app) => {
      return this.scale(app, [{ name: 'web', size: 'S', amount: 1 }]);
    }));
  }

}

module.exports = new ReviewAppManager();
