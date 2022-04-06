const { Tags } = require('./Tags');

class PullRequestGroup {

  constructor({ tagToGrab, groupTitle}) {
    if (!Tags.isValidTag(tagToGrab)) {
      throw new TypeError('A valid Tag must be used');
    }

    this.grabbedPullRequests = [];
    this.groupTitle = groupTitle;
    this.tagToGrab = tagToGrab;
  }

  grabPullRequestsByTag(pullRequests) {
    const discardedPullRequests = pullRequests.reduce((accumulator, pullRequest) => {
      if (pullRequest.tag === this.tagToGrab) {
        this.grabbedPullRequests.push(pullRequest);
      } else {
        accumulator.push(pullRequest);
      }
      return accumulator;
    }, []);

    return discardedPullRequests;
  }

  getLinesToDisplay() {
    return this.grabbedPullRequests.length
      ? [this.groupTitle].concat(this.grabbedPullRequests.map((pullRequest) => pullRequest.toString())).concat('')
      : [];
  }
}

module.exports = PullRequestGroup;
