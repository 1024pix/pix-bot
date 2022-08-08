const { Tags } = require('./Tags');

class PullRequest {
  constructor({ html_url, number, title }) {
    this.htmlUrl = html_url;
    this.number = number;
    this.title = title;

    this.tag = Tags.getTagByTitle(this.title);
  }

  toString() {
    return `- [#${this.number}](${this.htmlUrl}) ${this.title}`;
  }
}

module.exports = PullRequest;
