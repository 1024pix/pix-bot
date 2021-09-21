const { Tag } = require('./Tags');
const PullRequestGroup = require('./PullRequestGroup');

class PullRequestGroupFactory {

  static build() {
    return [
      new PullRequestGroup({
        tagToGrab: Tag.FEATURE,
        groupTitle: '### :rocket: Enhancement',
      }),
      new PullRequestGroup({
        tagToGrab: Tag.TECH,
        groupTitle: '### :building_construction: Tech',
      }),
      new PullRequestGroup({
        tagToGrab: Tag.BUGFIX,
        groupTitle: '### :bug: Bug fix',
      }),
      new PullRequestGroup({
        tagToGrab: Tag.OTHERS,
        groupTitle: '### :coffee: Various',
      }),
    ];
  }
}

module.exports = PullRequestGroupFactory;
