const config = require('../../config');
const metabaseService = require('../services/metabase');
module.exports = {
  async duplicate(request) {
    const dashboardId = request.payload['dashboard-id'];
    const sessionId = await metabaseService.login();
    const dashboard = await metabaseService.getDashboard({ dashboardId, sessionId });

    /*
    getDashboard...
    Créer nouveau Dashboard
    Pour chaque ordered_cards :
      getCard
      Créer un nouvel objet avec :
        remplace les variables du type {{orgaId}} par l'id de l'orga ciblé envoyé en payload
        Créer la nouvelle carte avec un POST card
        Ajouter la carte au nouveau dashboard (avec les mêmes parameter-mapping, sizeX, sizeY, col, row)
     */
    console.log(dashboard);
    return dashboard;
  },
};
