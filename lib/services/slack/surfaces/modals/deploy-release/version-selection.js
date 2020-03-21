module.exports = (triggerId) => {
  return {
    "trigger_id": `${triggerId}`,
    "view": {
      "type": "modal",
      "callback_id": "deploy-release-version-selection",
      "title": {
        "type": "plain_text",
        "text": "Déployer une version",
        "emoji": true
      },
      "submit": {
        "type": "plain_text",
        "text": "Déployer",
        "emoji": true
      },
      "close": {
        "type": "plain_text",
        "text": "Annuler",
        "emoji": true
      },
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `Vous êtes sur le point de déployer la version *${releaseVersion}* en production.`
          },
          "block_id": "text1"
        }
      ]
    }
  }
};
