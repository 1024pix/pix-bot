module.exports = (triggerId) => {
  return {
    "trigger_id": `${triggerId}`,
    "view": {
      "type": "modal",
      "callback_id": "release-type-selection",
      "title": {
        "type": "plain_text",
        "text": "Publier une release",
        "emoji": true
      },
      "submit": {
        "type": "plain_text",
        "text": "Publier",
        "emoji": true
      },
      "close": {
        "type": "plain_text",
        "text": "Annuler",
        "emoji": true
      },
      "blocks": [
        {
          "type": "input",
          "block_id": "publish-release-type",
          "label": {
            "type": "plain_text",
            "text": " Type de release",
            "emoji": true
          },
          "element": {
            "type": "plain_text_input",
            "action_id": "release-type-value",
            "placeholder": {
              "type": "plain_text",
              "text": "Ex : minor, major or patch",
              "emoji": true
            }
          }
        },
      ]
    }
  }
};
