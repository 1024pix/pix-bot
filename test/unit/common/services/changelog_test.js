import { expect } from 'chai';
import { stub, useFakeTimers } from 'sinon';

import {
  displayPullRequest,
  filterPullRequest,
  generateChangeLogContent,
  getHeadOfChangelog,
  getNewChangeLogLines,
  getTagReleaseDate,
  orderPr,
} from '../../../../common/services/changelog.js';
import github from '../../../../common/services/github.js';

describe('Unit | Common | Services | Changelog', function () {
  describe('#displayPullRequest', function () {
    it('should return a line with correct format from correct PR name', function () {
      // given
      const pullRequest = {
        title: '[BUGFIX] Résolution du problème de surestimation du niveau (US-389).',
        number: 111,
        html_url: 'http://git/111',
      };
      const expectedLine =
        '- [#111](http://git/111) [BUGFIX] Résolution du problème de surestimation du niveau (US-389).';

      // when
      const result = displayPullRequest(pullRequest);

      // then
      expect(result).to.equal(expectedLine);
    });
  });

  describe('#filterPullRequest', function () {
    it('should return only merged PR since last MEP', function () {
      // given
      const date = '2019-01-18T15:29:51Z';
      const pullRequests = [
        {
          id: 1,
          number: 315,
          state: 'closed',
          title:
            '[BUGFIX] Retenter une compétence doit créer une nouvelle évaluation sur la compétence (et non en reprendre une ancienne) (PF-484).',
          created_at: '2019-01-11T15:47:26Z',
          updated_at: '2019-01-23T13:37:47Z',
          closed_at: '2019-01-23T13:37:37Z',
          merged_at: '2019-01-23T13:37:37Z',
          assignee: null,
          milestone: null,
        },
        {
          id: 2,
          number: 316,
          state: 'closed',
          title:
            '[BUGFIX] Retenter une compétence doit créer une nouvelle évaluation sur la compétence (et non en reprendre une ancienne) (PF-484).',
          created_at: '2018-01-11T15:47:26Z',
          updated_at: '2018-01-23T13:37:47Z',
          closed_at: '2018-01-23T13:37:37Z',
          merged_at: '2018-01-23T13:37:37Z',
          assignee: null,
          milestone: null,
        },
        {
          id: 3,
          number: 317,
          state: 'closed',
          title:
            '[BUGFIX] Retenter une compétence doit créer une nouvelle évaluation sur la compétence (et non en reprendre une ancienne) (PF-484).',
          created_at: '2019-01-11T15:47:26Z',
          updated_at: '2019-01-23T13:37:47Z',
          closed_at: '2019-01-23T13:37:37Z',
          merged_at: null,
          assignee: null,
          milestone: null,
        },
      ];

      // when
      const result = filterPullRequest(pullRequests, date);

      // then
      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal(1);
    });
  });

  describe('#getHeadOfChangelog', function () {
    it('should return the head of changelog in correct value', function () {
      // given
      useFakeTimers();
      const headChangelog = '## v2.0.0 (01/01/1970)\n';
      const versionNumber = '2.0.0';

      // when
      const result = getHeadOfChangelog(versionNumber);

      // then
      expect(result).to.equal(headChangelog);
    });
  });

  describe('#orderPr', function () {
    it('should order PR by type', function () {
      // given
      const pullRequests = [
        { title: '[BUGFIX] TEST' },
        { title: 'TEST' },
        { title: '[FEATURE] TEST' },
        { title: '[BUMP] TEST' },
        { title: '[BREAKING] TEST' },
        { title: '[TECH] TEST' },
      ];

      // when
      const result = orderPr(pullRequests);

      // then
      expect(result[0].title).to.equal('[BREAKING] TEST');
      expect(result[1].title).to.equal('[FEATURE] TEST');
      expect(result[2].title).to.equal('[BUGFIX] TEST');
      expect(result[3].title).to.equal('[TECH] TEST');
      expect(result[4].title).to.equal('[BUMP] TEST');
      expect(result[5].title).to.equal('TEST');
    });
  });

  describe('#getTagReleaseDate', function () {
    const repoOwner = '1024pix';
    const repoName = 'pix';
    const tagName = 'v3.193.1';

    beforeEach(function () {
      stub(github, 'getLastCommitUrl')
        .withArgs({ owner: repoOwner, repo: repoName, tagName })
        .resolves(
          `https://api.github.com/repos/${repoOwner}/${repoName}/commits/4c3ad3d377c37023e835ad674578cf06fcb4de7a`,
        );

      stub(github, 'getCommitAtURL')
        .withArgs(
          `https://api.github.com/repos/${repoOwner}/${repoName}/commits/4c3ad3d377c37023e835ad674578cf06fcb4de7a`,
        )
        .resolves({ committer: { date: '2019-01-18T15:29:51Z' } });
    });

    it('should return the date of the last MEP commit', async function () {
      // given
      const expectedDate = '2019-01-18T15:29:51Z';

      // when
      const date = await getTagReleaseDate(repoOwner, repoName, tagName);

      // then
      expect(date).to.be.equal(expectedDate);
    });
  });

  describe('#generateChangeLogContent', function () {
    context('when changelog does not exist', function () {
      it('should create it ', function () {
        // given
        const currentChangelogContent = [];
        const changes = [
          '## v3.55.0 (12/05/2021)',
          '',
          "- [#2950](https://github.com/1024pix/pix/pull/2950) [FEATURE] Afficher les CGUs suivant la langue de l'utilisateur dans Pix Orga (PIX-2354).",
          "- [#2988](https://github.com/1024pix/pix/pull/2988) [FEATURE] Ré-afficher les colonnes supprimées suite à l'ajout de l'index en base de donnée (PIX-2552).",
        ];
        const expectedChangelog = [
          '# PIX Changelog\n',
          '\n',
          '## v3.55.0 (12/05/2021)',
          '',
          "- [#2950](https://github.com/1024pix/pix/pull/2950) [FEATURE] Afficher les CGUs suivant la langue de l'utilisateur dans Pix Orga (PIX-2354).",
          "- [#2988](https://github.com/1024pix/pix/pull/2988) [FEATURE] Ré-afficher les colonnes supprimées suite à l'ajout de l'index en base de donnée (PIX-2552).",
        ];

        // when
        const changeLogContent = generateChangeLogContent({ currentChangelogContent, changes });

        // then
        expect(changeLogContent).to.deep.equal(expectedChangelog);
      });
    });

    context('when changelog exists', function () {
      it('should update it ', function () {
        // given
        const currentChangelogContent = [
          '# PIX Changelog',
          '',
          '## v3.54.0 (11/05/2021)',
          '',
          '- [#2971](https://github.com/1024pix/pix/pull/2971) [FEATURE] Passer les sessions assignées comme sessions "à traiter" (PIX-2571)',
          '- [#2972](https://github.com/1024pix/pix/pull/2972) [FEATURE] Affichage des macarons Pix+Droit sur le certificat utilisateur sur PixApp (PIX-2369)',
        ];
        const changes = [
          '## v3.55.0 (12/05/2021)',
          '',
          "- [#2950](https://github.com/1024pix/pix/pull/2950) [FEATURE] Afficher les CGUs suivant la langue de l'utilisateur dans Pix Orga (PIX-2354).",
          "- [#2988](https://github.com/1024pix/pix/pull/2988) [FEATURE] Ré-afficher les colonnes supprimées suite à l'ajout de l'index en base de donnée (PIX-2552).",
          '',
        ];
        const expectedChangelog = [
          '# PIX Changelog',
          '',
          '## v3.55.0 (12/05/2021)',
          '',
          "- [#2950](https://github.com/1024pix/pix/pull/2950) [FEATURE] Afficher les CGUs suivant la langue de l'utilisateur dans Pix Orga (PIX-2354).",
          "- [#2988](https://github.com/1024pix/pix/pull/2988) [FEATURE] Ré-afficher les colonnes supprimées suite à l'ajout de l'index en base de donnée (PIX-2552).",
          '',
          '## v3.54.0 (11/05/2021)',
          '',
          '- [#2971](https://github.com/1024pix/pix/pull/2971) [FEATURE] Passer les sessions assignées comme sessions "à traiter" (PIX-2571)',
          '- [#2972](https://github.com/1024pix/pix/pull/2972) [FEATURE] Affichage des macarons Pix+Droit sur le certificat utilisateur sur PixApp (PIX-2369)',
        ];

        // when
        const changeLogContent = generateChangeLogContent({ currentChangelogContent, changes });

        // then
        expect(changeLogContent).to.deep.equal(expectedChangelog);
      });
    });
  });

  describe('#getNewChangeLogLines', function () {
    it('should return head of Changelog title and corresponding lines of pull requests grouped by type', function () {
      // given
      const headOfChangelogTitle = '## v3.55.0 (12/05/2021)';

      const pullRequests = [
        {
          html_url: 'https://github.com/foo/foo/pull/100',
          number: 100,
          title: '[FEATURE] PIX-1',
        },
        {
          html_url: 'https://github.com/foo/foo/pull/101',
          number: 101,
          title: '[TECH] PIX-2',
        },
        {
          html_url: 'https://github.com/foo/foo/pull/102',
          number: 102,
          title: '[BUGFIX] PIX-3',
        },
        {
          html_url: 'https://github.com/foo/foo/pull/104',
          number: 104,
          title: 'Foo PIX-4',
        },
      ];

      const expectedNewChangeLogLines = [
        '## v3.55.0 (12/05/2021)',
        '',
        '### :rocket: Amélioration',
        '- [#100](https://github.com/foo/foo/pull/100) [FEATURE] PIX-1.',
        '',
        '### :building_construction: Tech',
        '- [#101](https://github.com/foo/foo/pull/101) [TECH] PIX-2.',
        '',
        '### :bug: Correction',
        '- [#102](https://github.com/foo/foo/pull/102) [BUGFIX] PIX-3.',
        '',
        '### :coffee: Autre',
        '- [#104](https://github.com/foo/foo/pull/104) Foo PIX-4.',
        '',
      ];

      // when
      const result = getNewChangeLogLines({
        headOfChangelogTitle,
        pullRequests,
      });

      // then
      expect(result).to.deep.equal(expectedNewChangeLogLines);
    });
  });
});
