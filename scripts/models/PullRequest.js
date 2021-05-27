const { Tags } = require('./Tags');

class PullRequest {
  constructor({ htmlUrl, number, title }) {
    this.htmlUrl = htmlUrl;
    this.number = number;
    this.title = title;

    this.tag = Tags.getTagByTitle(this.title);
  }

  toString() {
    return `- [#${this.number}](${this.htmlUrl}) ${this.title}`;
  }
}

module.exports = PullRequest;
