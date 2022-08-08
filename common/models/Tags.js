const Tag = Object.freeze({
  BUGFIX: Symbol.for('bugfix'),
  FEATURE: Symbol.for('feature'),
  OTHERS: Symbol.for('others'),
  QUICK_WIN: Symbol.for('quickWin'),
  TECH: Symbol.for('tech'),
});

class Tags {
  static getTagByTitle(title) {
    const typeOfPullRequest = title.substring(1, title.indexOf(']')).replace(/ /g, '_');

    return Tag[typeOfPullRequest] || Tag.OTHERS;
  }

  static isValidTag(data) {
    return Object.values(Tag).includes(data);
  }
}

module.exports = {
  Tag,
  Tags,
};
