const Tag = Object.freeze({
  BREAKING: Symbol.for('breakingChange'),
  BUGFIX: Symbol.for('bugfix'),
  BUMP: Symbol.for('bump'),
  FEATURE: Symbol.for('feature'),
  OTHERS: Symbol.for('others'),
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

export { Tag, Tags };
