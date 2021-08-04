const { Tags } = require('./Tags');

class PullRequestGroup {

  constructor(tagToGrab) {
    if (!Tags.isValidTag(tagToGrab)) {
      throw new TypeError('A valid Tag must be used');
    }
    this.grabbedPullRequests = [];
    this.tagToGrab = tagToGrab;
  }

  grabPullRequestsByTag(pullRequests) {
    const discardedPullRequests = pullRequests.reduce((accumulator, pullRequest) => {
      if(pullRequest.tag === this.tagToGrab) {
        this.grabbedPullRequests.push(pullRequest);
      } else {
        accumulator.push(pullRequest);
      }
      return accumulator;
    }, []);


    return discardedPullRequests;
  }
}

module.exports = PullRequestGroup;
