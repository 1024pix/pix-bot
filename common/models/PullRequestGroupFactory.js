const { Tag } = require('./Tags');
const PullRequestGroup = require('./PullRequestGroup');

class PullRequestGroupFactory {
  static build() {
    return [
      new PullRequestGroup({
        tagToGrab: Tag.BREAKING,
        groupTitle: '### :boom: BREAKING CHANGE',
      }),
      new PullRequestGroup({
        tagToGrab: Tag.FEATURE,
        groupTitle: '### :rocket: Amélioration',
      }),
      new PullRequestGroup({
        tagToGrab: Tag.TECH,
        groupTitle: '### :building_construction: Tech',
      }),
      new PullRequestGroup({
        tagToGrab: Tag.BUGFIX,
        groupTitle: '### :bug: Correction',
      }),
      new PullRequestGroup({
        tagToGrab: Tag.OTHERS,
        groupTitle: '### :coffee: Autre',
      }),
    ];
  }
}

module.exports = PullRequestGroupFactory;
