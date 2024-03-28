export default class PartialChangeLogGenerator {
  constructor({ headOfChangelogTitle, pullRequestGroups }) {
    this.headOfChangelogTitle = headOfChangelogTitle;
    this.pullRequestGroups = pullRequestGroups;
  }

  grabPullRequestsByTag(pullRequests) {
    return this.pullRequestGroups.reduce((currentValue, currentGroup) => {
      return currentGroup.grabPullRequestsByTag(currentValue);
    }, pullRequests);
  }

  getLinesToDisplay() {
    const linesToDisplay = this.pullRequestGroups
      .map((pullRequestGroup) => pullRequestGroup.getLinesToDisplay())
      .flat();

    return linesToDisplay.length ? [this.headOfChangelogTitle, ''].concat(linesToDisplay).flat() : [];
  }
}
