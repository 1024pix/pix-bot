import { deleteOrphanReviewApps } from '../../../../build/usecases/deleteOrphanReviewApps.js';
import { expect, sinon } from '../../../test-helper.js';

describe('Unit | Build | Usecases | Delete orphan review apps', function () {
  let client;
  let dependencies;

  beforeEach(function () {
    client = {
      getReviewAppsList: sinon.stub().resolves([]),
      deleteReviewApp: sinon.stub().resolves(),
    };
    dependencies = {
      scalingoClient: { getInstance: sinon.stub().resolves(client) },
      github: { getPullRequestState: sinon.stub() },
      reviewAppRepo: { remove: sinon.stub().resolves() },
      repositoryToScalingoAppsReview: {
        pix: [{ appName: 'pix-api-review' }, { appName: 'pix-app-review' }],
        'pix-editor': [{ appName: 'pix-lcms-review' }],
      },
    };
  });

  it('should delete the review apps whose pull request is closed', async function () {
    // given
    client.getReviewAppsList.resolves(['pix-api-review-pr123', 'pix-app-review-pr456']);
    dependencies.github.getPullRequestState
      .withArgs({ repositoryName: 'pix', pullRequestNumber: 123 })
      .resolves({ state: 'closed', isMerged: true });
    dependencies.github.getPullRequestState
      .withArgs({ repositoryName: 'pix', pullRequestNumber: 456 })
      .resolves({ state: 'open', isMerged: false });

    // when
    const result = await deleteOrphanReviewApps({}, dependencies);

    // then
    expect(client.deleteReviewApp).to.have.been.calledOnceWithExactly('pix-api-review-pr123');
    expect(dependencies.reviewAppRepo.remove).to.have.been.calledOnceWithExactly({ name: 'pix-api-review-pr123' });
    expect(result.deleted).to.deep.equal(['pix-api-review-pr123']);
  });

  it('should resolve the pull request on the repository owning the parent application', async function () {
    // given
    client.getReviewAppsList.resolves(['pix-lcms-review-pr7']);
    dependencies.github.getPullRequestState.resolves({ state: 'closed', isMerged: false });

    // when
    await deleteOrphanReviewApps({}, dependencies);

    // then
    expect(dependencies.github.getPullRequestState).to.have.been.calledOnceWithExactly({
      repositoryName: 'pix-editor',
      pullRequestNumber: 7,
    });
  });

  it('should keep the review apps whose parent application is not managed by Pix Bot', async function () {
    // given
    client.getReviewAppsList.resolves(['pix-unknown-review-pr123']);

    // when
    await deleteOrphanReviewApps({}, dependencies);

    // then
    expect(dependencies.github.getPullRequestState).to.not.have.been.called;
    expect(client.deleteReviewApp).to.not.have.been.called;
  });

  it('should keep the review apps whose pull request cannot be found', async function () {
    // given
    client.getReviewAppsList.resolves(['pix-api-review-pr123']);
    dependencies.github.getPullRequestState.resolves(null);

    // when
    await deleteOrphanReviewApps({}, dependencies);

    // then
    expect(client.deleteReviewApp).to.not.have.been.called;
  });

  it('should keep the review apps whose pull request state cannot be read', async function () {
    // given
    client.getReviewAppsList.resolves(['pix-api-review-pr123']);
    dependencies.github.getPullRequestState.rejects(new Error('GitHub is down'));

    // when
    const result = await deleteOrphanReviewApps({}, dependencies);

    // then
    expect(client.deleteReviewApp).to.not.have.been.called;
    expect(result.deleted).to.be.empty;
  });

  it('should not delete more review apps than allowed in a single run', async function () {
    // given
    client.getReviewAppsList.resolves(['pix-api-review-pr1', 'pix-api-review-pr2', 'pix-api-review-pr3']);
    dependencies.github.getPullRequestState.resolves({ state: 'closed', isMerged: true });

    // when
    const result = await deleteOrphanReviewApps({ maxDeletions: 2 }, dependencies);

    // then
    expect(client.deleteReviewApp).to.have.been.calledTwice;
    expect(result.orphans).to.have.lengthOf(3);
    expect(result.deleted).to.have.lengthOf(2);
  });

  it('should not delete anything in dry run mode', async function () {
    // given
    client.getReviewAppsList.resolves(['pix-api-review-pr123']);
    dependencies.github.getPullRequestState.resolves({ state: 'closed', isMerged: true });

    // when
    const result = await deleteOrphanReviewApps({ dryRun: true }, dependencies);

    // then
    expect(client.deleteReviewApp).to.not.have.been.called;
    expect(dependencies.reviewAppRepo.remove).to.not.have.been.called;
    expect(result.orphans).to.deep.equal(['pix-api-review-pr123']);
    expect(result.deleted).to.be.empty;
  });

  it('should keep deleting the other orphans when one deletion fails', async function () {
    // given
    client.getReviewAppsList.resolves(['pix-api-review-pr1', 'pix-app-review-pr2']);
    dependencies.github.getPullRequestState.resolves({ state: 'closed', isMerged: true });
    client.deleteReviewApp.withArgs('pix-api-review-pr1').rejects(new Error('Scalingo APIError'));

    // when
    const result = await deleteOrphanReviewApps({}, dependencies);

    // then
    expect(result.deleted).to.deep.equal(['pix-app-review-pr2']);
    expect(dependencies.reviewAppRepo.remove).to.have.been.calledOnceWithExactly({ name: 'pix-app-review-pr2' });
  });
});
