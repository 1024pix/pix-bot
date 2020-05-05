const axios = require('axios');
const _ = require('lodash');
const config = require('../config');

const color = {
    'team-evaluation': '#FDEEC1',
    'team-prescription': '#F2B2A8',
    'team-captains': '#a6ea5d',
    'team-certif': '#B7CEF5',
    'team-acces': '#A2DCC1',
};

function getUrlForGithub(label) {
    label = label.replace(/ /g, '%20');
    return `https://api.github.com/search/issues?q=is:pr+is:open+archived:false+sort:updated-desc+user:1024pix+label:${label}`;
}

async function getDataFromGithub (label) {
    const url = getUrlForGithub(label);
    const githubToken = config.github.token;
    const config = {
        headers: {
            'Authorization': 'token ' + githubToken
        }
    };
    return axios.get(url, config)
        .then(response => {
            return response.data.items;
        })
        .catch(error => {
            console.log(error);
        });
}

function createResponseForSlack(pullRequests, label) {
    const resp = {
        response_type: 'in_channel',
        text: 'PRs à review pour '+label,
        attachments: []
    };
    pullRequests.forEach((prs) => {
        resp.attachments.push({
            color: color[label],
            pretext: '',
            fields: [
                { value: `<${prs.html_url}|${prs.title}>`, short: false},
            ],
        });
    });
    return resp;
}

module.exports = {

    async getPullRequests(label) {
        const pullRequests = await getDataFromGithub(label);
        return createResponseForSlack(pullRequests, label)
    }
};
