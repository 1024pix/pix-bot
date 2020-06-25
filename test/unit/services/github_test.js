const { describe, it } = require('mocha');
const { expect } = require('chai');
const { sinon } = require('../test-helper');
const axios = require('axios');
const githubService = require('../../../lib/services/github');

describe('#getPullRequests', function() {
    const items = [
        { html_url: 'http://test1.fr', title: 'PR1'},
        { html_url: 'http://test2.fr', title: 'PR2'},
    ];
    beforeEach(() => {
        sinon.stub(axios, 'get').resolves({ data: { items: items } });
    });

    it('should return the response for slack', async function() {
        // given
        const expectedResponse = {
            response_type: 'in_channel',
            text: 'PRs à review pour team-certif',
            attachments: [
                {color: '#B7CEF5', pretext: '', fields: [{value: '<http://test1.fr|PR1>', short: false}]},
                {color: '#B7CEF5', pretext: '', fields: [{value: '<http://test2.fr|PR2>', short: false}]}
            ]
        };

        // when
        const response = await githubService.getPullRequests('team-certif');

        // then
        expect(response).to.deep.equal(expectedResponse);
    });

    it('should call the Github API with the label without space', async function() {
        // given
        const expectedUrl = 'https://api.github.com/search/issues?q=is:pr+is:open+archived:false+sort:updated-desc+user:1024pix+label:Tech%20Review%20Needed';

        // when
        const response = await githubService.getPullRequests('Tech Review Needed');

        // then
        sinon.assert.calledWith(axios.get, expectedUrl);
    });

});
