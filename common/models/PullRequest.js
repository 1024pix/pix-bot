import { Tags } from './Tags.js';

export default class PullRequest {
  constructor({ html_url, number, title }) {
    this.htmlUrl = html_url;
    this.number = number;
    this.title = title;

    this.tag = Tags.getTagByTitle(this.title);
  }

  toString() {
    const titleWithDot = this.title.endsWith('.') ? this.title : `${this.title}.`;
    return `- [#${this.number}](${this.htmlUrl}) ${titleWithDot}`;
  }
}
