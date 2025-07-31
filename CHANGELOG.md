# pix-bot Changelog

## v2.1.0 (31/07/2025)


### :rocket: Amélioration
- [#624](https://github.com/1024pix/pix-bot/pull/624) [FEATURE] Éviter de récupérer les infos de la PR quand pas nécessaire.

### :building_construction: Tech
- [#623](https://github.com/1024pix/pix-bot/pull/623) [TECH] Amélioration de la gestion d’erreur dans le client Scalingo.

## v2.0.2 (31/07/2025)


### :rocket: Amélioration
- [#622](https://github.com/1024pix/pix-bot/pull/622) [FEATURE] Corriger erreur 500 quand un label est supprimé.

## v2.0.1 (31/07/2025)


### :rocket: Amélioration
- [#621](https://github.com/1024pix/pix-bot/pull/621) [FEATURE] Suppression de la colonne autodeployEnabled de review-apps.

## v2.0.0 (31/07/2025)


### :rocket: Amélioration
- [#620](https://github.com/1024pix/pix-bot/pull/620) [FEATURE] Supprimer les addons postgres provisionnés sur les fronts (monorepo).
- [#619](https://github.com/1024pix/pix-bot/pull/619) [FEATURE] Bye JP, welcome Hera !.

## v1.134.2 (30/07/2025)


### :rocket: Amélioration
- [#617](https://github.com/1024pix/pix-bot/pull/617) [FEATURE] Création de la colonne autodeployEnabled dans la table review-apps.

## v1.134.1 (30/07/2025)


### :rocket: Amélioration
- [#615](https://github.com/1024pix/pix-bot/pull/615) [FEATURE] Ne pas créer un nouveau commentaire lors d'une réouverture de PR (TECHDAYS-HERA).

### :building_construction: Tech
- [#616](https://github.com/1024pix/pix-bot/pull/616) [TECH] Refactorer createCommitStatus.

### :arrow_up: Montée de version
- [#589](https://github.com/1024pix/pix-bot/pull/589) [BUMP] Update Node.js to v22.17.1.

## v1.134.0 (29/07/2025)


### :rocket: Amélioration
- [#614](https://github.com/1024pix/pix-bot/pull/614) [FEATURE] Générer les liens d’applis et de dashboards dans le commentaire Hera.
- [#613](https://github.com/1024pix/pix-bot/pull/613) [FEATURE] Séparer les déploiements des fronts Pix.
- [#604](https://github.com/1024pix/pix-bot/pull/604) [FEATURE] Générer les checkbox de déploiement des RA.

## v1.133.2 (28/07/2025)


### :rocket: Amélioration
- [#612](https://github.com/1024pix/pix-bot/pull/612) [FEATURE] Gestion du check-ra-deployment sur le label Hera.

## v1.133.1 (28/07/2025)


### :rocket: Amélioration
- [#611](https://github.com/1024pix/pix-bot/pull/611) [FEATURE] Gérer la réouverture d'une pull request flag Hera.

### :building_construction: Tech
- [#609](https://github.com/1024pix/pix-bot/pull/609) [TECH] Supprimer la colonne `review-apps.isDeployed`.

### :bug: Correction
- [#610](https://github.com/1024pix/pix-bot/pull/610) [BUGFIX] Gérer le check-ra-deployment correctement lors d’un synchronize.

## v1.133.0 (25/07/2025)


### :building_construction: Tech
- [#608](https://github.com/1024pix/pix-bot/pull/608) [TECH] Utiliser la colonne `status` de la table `review-apps`.
- [#606](https://github.com/1024pix/pix-bot/pull/606) [TECH] Supprimer un repo archivé.

## v1.131.0 (25/07/2025)


### :rocket: Amélioration
- [#607](https://github.com/1024pix/pix-bot/pull/607) [FEATURE] Ajout d'une colonne status sur review-apps.
- [#603](https://github.com/1024pix/pix-bot/pull/603) [FEATURE] Gérer l’action synchronize sur les PR Hera.
- [#602](https://github.com/1024pix/pix-bot/pull/602) [FEATURE] Sélectionner des apps à dépoyer en éditant le commentaire d'une pull request Hera (tech-days).
- [#601](https://github.com/1024pix/pix-bot/pull/601) [FEATURE] Créer un message spécifique en cas de création de pull request labelisée Hera (tech-days).

### :building_construction: Tech
- [#605](https://github.com/1024pix/pix-bot/pull/605) [TECH] Fermeture de PR Hera.

## v1.130.0 (22/07/2025)


### :rocket: Amélioration
- [#600](https://github.com/1024pix/pix-bot/pull/600) [FEATURE] Permettre de pouvoir tester Pix Bot Integration 🤖.

### :arrow_up: Montée de version
- [#599](https://github.com/1024pix/pix-bot/pull/599) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.21 (dossier racine).

## v1.129.0 (22/07/2025)


### :building_construction: Tech
- [#597](https://github.com/1024pix/pix-bot/pull/597) [TECH] Ajouter la configuration pour déployer les RA de pix-nina.

## v1.128.0 (21/07/2025)


### :rocket: Amélioration
- [#598](https://github.com/1024pix/pix-bot/pull/598) [FEATURE] Ignorer les PRs labelisées Hera.
- [#596](https://github.com/1024pix/pix-bot/pull/596) [FEATURE] Ajouter des notifiers et alertes lors de la création d'une application de production.

### :arrow_up: Montée de version
- [#595](https://github.com/1024pix/pix-bot/pull/595) [BUMP] Update dependency dotenv to v17 (dossier racine).
- [#594](https://github.com/1024pix/pix-bot/pull/594) [BUMP] Update dependency scalingo to ^0.14.0 (dossier racine).

## v1.127.1 (04/07/2025)


### :bug: Correction
- [#592](https://github.com/1024pix/pix-bot/pull/592) [BUGFIX] Corriger le déploiement de la dernière release de pix-exploit en production.

## v1.127.0 (04/07/2025)


### :rocket: Amélioration
- [#591](https://github.com/1024pix/pix-bot/pull/591) [FEATURE] Déployer pix-exploit depuis pix-bot.

## v1.126.1 (02/07/2025)


### :bug: Correction
- [#590](https://github.com/1024pix/pix-bot/pull/590) [BUGFIX] Mettre à jour l'emoji du message de lancement de MEP (PIX-18553).

## v1.126.0 (01/07/2025)


### :rocket: Amélioration
- [#586](https://github.com/1024pix/pix-bot/pull/586) [FEATURE] releaser la version Jira  à la fin du déploiement d'une version en production.

### :arrow_up: Montée de version
- [#588](https://github.com/1024pix/pix-bot/pull/588) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.20 (dossier racine).

## v1.125.1 (30/06/2025)


### :building_construction: Tech
- [#587](https://github.com/1024pix/pix-bot/pull/587) [TECH] Commenter le code vérifiant que le build de la version releasée a bien fonctionné avant de MEP.

### :bug: Correction
- [#585](https://github.com/1024pix/pix-bot/pull/585) [BUGFIX] Corriger le message lors du lancement de la mep.

## v1.125.0 (27/06/2025)


### :rocket: Amélioration
- [#580](https://github.com/1024pix/pix-bot/pull/580) [FEATURE] Mettre à jour le message signalant la fin du déploiement.

### :arrow_up: Montée de version
- [#584](https://github.com/1024pix/pix-bot/pull/584) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.19 (dossier racine).

## v1.124.0 (26/06/2025)


### :building_construction: Tech
- [#583](https://github.com/1024pix/pix-bot/pull/583) [TECH] Augmenter le nombre d'essai l'intervalle de la vérification de démarrage d'une RA.

### :bug: Correction
- [#581](https://github.com/1024pix/pix-bot/pull/581) [BUGFIX] Corriger une typo.

### :arrow_up: Montée de version
- [#582](https://github.com/1024pix/pix-bot/pull/582) [BUMP] Update dependency scalingo to ^0.13.0 (dossier racine).

## v1.123.1 (24/06/2025)


### :bug: Correction
- [#579](https://github.com/1024pix/pix-bot/pull/579) [BUGFIX] Utiliser le nom complet des applications pour le déploiement.

## v1.123.0 (23/06/2025)


### :rocket: Amélioration
- [#574](https://github.com/1024pix/pix-bot/pull/574) [FEATURE] Notifier via slack lorsque le déploiement des applications est terminé.
- [#571](https://github.com/1024pix/pix-bot/pull/571) [FEATURE] Ajouter un template de migration pour la db.

### :building_construction: Tech
- [#572](https://github.com/1024pix/pix-bot/pull/572) [TECH] Modifier l'application template pour les review apps de pix-db-replication.

### :bug: Correction
- [#577](https://github.com/1024pix/pix-bot/pull/577) [BUGFIX] Utiliser le bon level de log au moment des releases.
- [#570](https://github.com/1024pix/pix-bot/pull/570) [BUGFIX] Corriger l'appelle à la fonction d'envoie de message dans la tâche de mise en production.

### :arrow_up: Montée de version
- [#578](https://github.com/1024pix/pix-bot/pull/578) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.18 (dossier racine).
- [#576](https://github.com/1024pix/pix-bot/pull/576) [BUMP] Update dependency sinon to v21 (dossier racine).
- [#575](https://github.com/1024pix/pix-bot/pull/575) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.17 (dossier racine).
- [#565](https://github.com/1024pix/pix-bot/pull/565) [BUMP] Update Node.js to v22.16.0.
- [#573](https://github.com/1024pix/pix-bot/pull/573) [BUMP] Update dependency scalingo to ^0.12.0 (dossier racine).
- [#568](https://github.com/1024pix/pix-bot/pull/568) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.16 (dossier racine).
- [#567](https://github.com/1024pix/pix-bot/pull/567) [BUMP] Update dependency @octokit/rest to v22 (dossier racine).

## v1.122.0 (30/05/2025)


### :rocket: Amélioration
- [#563](https://github.com/1024pix/pix-bot/pull/563) [FEATURE] Lancer la mise en production automatiquement.

### :building_construction: Tech
- [#566](https://github.com/1024pix/pix-bot/pull/566) [TECH] Retourner une erreur lorsqu'au moins une RA n'a pas été déployée.

### :arrow_up: Montée de version
- [#564](https://github.com/1024pix/pix-bot/pull/564) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.15 (dossier racine).
- [#561](https://github.com/1024pix/pix-bot/pull/561) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.14 (dossier racine).
- [#557](https://github.com/1024pix/pix-bot/pull/557) [BUMP] Lock file maintenance (dossier racine).
- [#560](https://github.com/1024pix/pix-bot/pull/560) [BUMP] Update Node.js to v22.15.1.
- [#559](https://github.com/1024pix/pix-bot/pull/559) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.13 (dossier racine).
- [#558](https://github.com/1024pix/pix-bot/pull/558) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.12 (dossier racine).
- [#556](https://github.com/1024pix/pix-bot/pull/556) [BUMP] Update dependency lint-staged to v16 (dossier racine).

## v1.121.0 (14/05/2025)


### :rocket: Amélioration
- [#555](https://github.com/1024pix/pix-bot/pull/555) [FEATURE] Permettre au webhook de release de déployer sur osc-fr1.
- [#549](https://github.com/1024pix/pix-bot/pull/549) [FEATURE] Ajouter un job permettant de déclencher le workflow de release (PIX-17050).

### :bug: Correction
- [#554](https://github.com/1024pix/pix-bot/pull/554) [BUGFIX] Supprimer du code inutile.

### :arrow_up: Montée de version
- [#552](https://github.com/1024pix/pix-bot/pull/552) [BUMP] Update dependency postgres to v16.9.
- [#553](https://github.com/1024pix/pix-bot/pull/553) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.11 (dossier racine).
- [#551](https://github.com/1024pix/pix-bot/pull/551) [BUMP] Update dependency eslint-plugin-mocha to v11 (dossier racine).
- [#545](https://github.com/1024pix/pix-bot/pull/545) [BUMP] Lock file maintenance (dossier racine).
- [#548](https://github.com/1024pix/pix-bot/pull/548) [BUMP] Update dependency postgres to v16.8.
- [#550](https://github.com/1024pix/pix-bot/pull/550) [BUMP] Update Node.js to v22.15.0.

## v1.120.1 (10/04/2025)


### :bug: Correction
- [#547](https://github.com/1024pix/pix-bot/pull/547) [BUGFIX] Corriger le déploiement de securix.

## v1.120.0 (10/04/2025)


### :rocket: Amélioration
- [#546](https://github.com/1024pix/pix-bot/pull/546) [FEATURE]: Ajouter une commande slack de release et de déploiement pour l'application pix-securix.
- [#542](https://github.com/1024pix/pix-bot/pull/542) [FEATURE] Utiliser le nouveau nom de domaine du viewer pix-epreuves.

### :arrow_up: Montée de version
- [#543](https://github.com/1024pix/pix-bot/pull/543) [BUMP] Lock file maintenance (dossier racine).
- [#544](https://github.com/1024pix/pix-bot/pull/544) [BUMP] Update dependency sinon to v20 (dossier racine).

## v1.119.0 (27/03/2025)


### :rocket: Amélioration
- [#541](https://github.com/1024pix/pix-bot/pull/541) [FEATURE] Ajouter le repo securix.

## v1.118.4 (27/03/2025)


### :rocket: Amélioration
- [#540](https://github.com/1024pix/pix-bot/pull/540) [FEATURE] pix-epreuves: Lien vers le viewer de composants.

## v1.118.3 (26/03/2025)


### :coffee: Autre
- [#539](https://github.com/1024pix/pix-bot/pull/539) [REVERT] Revenir à l'ancien template pour Pix exploit.

## v1.118.2 (24/03/2025)


### :building_construction: Tech
- [#538](https://github.com/1024pix/pix-bot/pull/538) [TECH] Ne pas déployer de pix-exploit-front-review-pr-*.

### :arrow_up: Montée de version
- [#537](https://github.com/1024pix/pix-bot/pull/537) [BUMP] Lock file maintenance (dossier racine).

## v1.118.1 (20/03/2025)


### :bug: Correction
- [#536](https://github.com/1024pix/pix-bot/pull/536) [BUGFIX] Ajouter les liens des variables d'environnement pour les pr de pix exploit (PIX-17107).

## v1.118.0 (18/03/2025)


### :rocket: Amélioration
- [#534](https://github.com/1024pix/pix-bot/pull/534) [FEATURE] Ajouter le lien pour la RA de l'interface Pix exploit.

### :arrow_up: Montée de version
- [#535](https://github.com/1024pix/pix-bot/pull/535) [BUMP] Lock file maintenance (dossier racine).

## v1.117.0 (14/03/2025)


### :building_construction: Tech
- [#533](https://github.com/1024pix/pix-bot/pull/533) [TECH] Ajouter pix-exploit-front-review et renommer pix-exploit-review.

## v1.116.0 (14/03/2025)


### :rocket: Amélioration
- [#528](https://github.com/1024pix/pix-bot/pull/528) [FEATURE] Ajouter des commandes Slack pour bloquer ou débloquer les mise en production.
- [#527](https://github.com/1024pix/pix-bot/pull/527) [FEATURE] Autoriser ou non les mises en production (PIX-16839).

### :building_construction: Tech
- [#531](https://github.com/1024pix/pix-bot/pull/531) [TECH] Ajouter nodemon et une commande pour lancer Pix Bot en mode dev.

### :bug: Correction
- [#532](https://github.com/1024pix/pix-bot/pull/532) [BUGFIX] Mettre à jour le commit status check-ra-deployment lorsque le label no-review-app est ajouté à la création de la PR.

### :arrow_up: Montée de version
- [#530](https://github.com/1024pix/pix-bot/pull/530) [BUMP] Update dependency axios to v1.8.2 [SECURITY].

## v1.115.2 (11/03/2025)


### :building_construction: Tech
- [#529](https://github.com/1024pix/pix-bot/pull/529) [TECH] Renommer `pix-data-api-pix` en `pix-api-to-pg`.

### :arrow_up: Montée de version
- [#508](https://github.com/1024pix/pix-bot/pull/508) [BUMP] Update dependency eslint-config-prettier to v10 (dossier racine).
- [#513](https://github.com/1024pix/pix-bot/pull/513) [BUMP] Update dependency nock to v14 (dossier racine).
- [#523](https://github.com/1024pix/pix-bot/pull/523) [BUMP] Update dependency cron to v4 (dossier racine).

## v1.115.1 (04/03/2025)


### :bug: Correction
- [#526](https://github.com/1024pix/pix-bot/pull/526) [BUGFIX] Corriger le fonctionnement du commit status `check-ra-deployment` avec le label `no-review-app`.

### :arrow_up: Montée de version
- [#525](https://github.com/1024pix/pix-bot/pull/525) [BUMP] Lock file maintenance (dossier racine).

## v1.115.0 (28/02/2025)


### :rocket: Amélioration
- [#524](https://github.com/1024pix/pix-bot/pull/524) [FEATURE] Ajouter maddo dans la liste des apps à déployer en integration. .

### :arrow_up: Montée de version
- [#442](https://github.com/1024pix/pix-bot/pull/442) [BUMP] Update dependency sinon to v19 (dossier racine).
- [#479](https://github.com/1024pix/pix-bot/pull/479) [BUMP] Update dependency postgres to v16.6.
- [#522](https://github.com/1024pix/pix-bot/pull/522) [BUMP] Lock file maintenance (dossier racine).
- [#521](https://github.com/1024pix/pix-bot/pull/521) [BUMP] Update Node.js to v22.14.0.

## v1.114.1 (17/02/2025)


### :bug: Correction
- [#520](https://github.com/1024pix/pix-bot/pull/520) [BUGFIX] Redeployer la dernière version d'une app comportant un tiret dans son nom.

### :arrow_up: Montée de version
- [#514](https://github.com/1024pix/pix-bot/pull/514) [BUMP] Lock file maintenance (dossier racine).

## v1.114.0 (17/02/2025)


### :rocket: Amélioration
- [#519](https://github.com/1024pix/pix-bot/pull/519) [FEATURE] Déployer l’application pix-api-maddo-{environment} (PIX-16552).

## v1.113.1 (11/02/2025)


### :rocket: Amélioration
- [#518](https://github.com/1024pix/pix-bot/pull/518) [FEATURE] Donner accès aux statistiques rollup sur les RAs pix-epreuves.

### :bug: Correction
- [#517](https://github.com/1024pix/pix-bot/pull/517) [BUGFIX] Ajouter MaDDo dans le message Github pix-bot.

## v1.113.0 (07/02/2025)


### :rocket: Amélioration
- [#516](https://github.com/1024pix/pix-bot/pull/516) [FEATURE] Déploiement de maddo à la création/mise à jour des reviews app.

### :building_construction: Tech
- [#512](https://github.com/1024pix/pix-bot/pull/512) [TECH] Ajouter des logs pour simplifier le debug de la merge queue.

### :bug: Correction
- [#515](https://github.com/1024pix/pix-bot/pull/515) [BUGFIX] Corriger le sample.env.

## v1.111.0 (28/01/2025)


### :rocket: Amélioration
- [#500](https://github.com/1024pix/pix-bot/pull/500) [FEATURE] Ajouter un bouton permettant de désactiver une règle de blocage auprès du CDN.
- [#511](https://github.com/1024pix/pix-bot/pull/511) [FEATURE] Envoyer le commentaire de déploiement des RAs sur les PRs quelque soit leur état.

### :arrow_up: Montée de version
- [#510](https://github.com/1024pix/pix-bot/pull/510) [BUMP] Update Node.js to v22.13.1.
- [#509](https://github.com/1024pix/pix-bot/pull/509) [BUMP] Lock file maintenance (dossier racine).
- [#507](https://github.com/1024pix/pix-bot/pull/507) [BUMP] Lock file maintenance (dossier racine).
- [#506](https://github.com/1024pix/pix-bot/pull/506) [BUMP] Update dependency scalingo to ^0.11.0 (dossier racine).
- [#504](https://github.com/1024pix/pix-bot/pull/504) [BUMP] Update Node.js to v22.13.0.

## v1.110.1 (10/01/2025)


### :bug: Correction
- [#503](https://github.com/1024pix/pix-bot/pull/503) [BUGFIX] Ajouter des checks de commit à propos du status de merge uniquement sur les PR dans la file de merge.

## v1.110.0 (09/01/2025)


### :rocket: Amélioration
- [#502](https://github.com/1024pix/pix-bot/pull/502) [FEATURE] Mettre à jour le check de commit lorsqu'une PR n'est plus managée par la merge queue.

## v1.109.0 (31/12/2024)


### :rocket: Amélioration
- [#501](https://github.com/1024pix/pix-bot/pull/501) [FEATURE] Indiquer dans les PRs qu'elles sont en cours de merge.

### :building_construction: Tech
- [#497](https://github.com/1024pix/pix-bot/pull/497) [TECH] Simplifier l'usage de la merge queue.

### :arrow_up: Montée de version
- [#499](https://github.com/1024pix/pix-bot/pull/499) [BUMP] Lock file maintenance (dossier racine).
- [#498](https://github.com/1024pix/pix-bot/pull/498) [BUMP] Update dependency scalingo to ^0.10.0 (dossier racine).

## v1.108.4 (23/12/2024)


### :bug: Correction
- [#496](https://github.com/1024pix/pix-bot/pull/496) [BUGFIX] Ne pas jetter d'erreur quand la PR est déjà dans la merge queue.

## v1.108.3 (23/12/2024)


### :bug: Correction
- [#495](https://github.com/1024pix/pix-bot/pull/495) [BUGFIX] Gérer le cas où la check_suite n'est pas liée à une PR.

## v1.108.2 (23/12/2024)


### :bug: Correction
- [#494](https://github.com/1024pix/pix-bot/pull/494) [BUGFIX] Eviter les 500 dans le controller GitHub.

## v1.108.1 (23/12/2024)


### :bug: Correction
- [#493](https://github.com/1024pix/pix-bot/pull/493) [BUGFIX] Corriger le payload attendu lors d'un évènement check_suite.

## v1.108.0 (23/12/2024)


### :rocket: Amélioration
- [#491](https://github.com/1024pix/pix-bot/pull/491) [FEATURE] ajoute à la mergequeue lorsque la check_suite se met à jour.

### :arrow_up: Montée de version
- [#492](https://github.com/1024pix/pix-bot/pull/492) [BUMP] Lock file maintenance (dossier racine).

## v1.107.0 (19/12/2024)


### :rocket: Amélioration
- [#490](https://github.com/1024pix/pix-bot/pull/490) [FEATURE] Avoir une merge queue par repository.

## v1.106.3 (18/12/2024)


### :bug: Correction
- [#489](https://github.com/1024pix/pix-bot/pull/489) [BUGFIX] Corriger l'injection de dépendance dans le controller merge.

### :arrow_up: Montée de version
- [#480](https://github.com/1024pix/pix-bot/pull/480) [BUMP] Update Node.js to v22.12.0.

## v1.106.2 (17/12/2024)


### :building_construction: Tech
- [#486](https://github.com/1024pix/pix-bot/pull/486) [TECH] Supprimer l'action auto-merge.

### :bug: Correction
- [#488](https://github.com/1024pix/pix-bot/pull/488) [BUGFIX] Ajouter la route merge dans les routes du serveur.

## v1.106.1 (17/12/2024)


### :bug: Correction
- [#487](https://github.com/1024pix/pix-bot/pull/487) [BUGFIX] Utiliser octokit pour trigger le dispatch worfklow event.

## v1.106.0 (17/12/2024)


### :rocket: Amélioration
- [#447](https://github.com/1024pix/pix-bot/pull/447) [FEATURE] Gérer une merge queue.

### :building_construction: Tech
- [#483](https://github.com/1024pix/pix-bot/pull/483) [TECH] Ajouter le déploiement des reviews app de pix-exploit.

### :arrow_up: Montée de version
- [#485](https://github.com/1024pix/pix-bot/pull/485) [BUMP] Lock file maintenance (dossier racine).
- [#484](https://github.com/1024pix/pix-bot/pull/484) [BUMP] Lock file maintenance (dossier racine).

### :coffee: Autre
- [#477](https://github.com/1024pix/pix-bot/pull/477) [FEAT] Ajouter un webhook permettant de bloquer une ip et/ou un ja3 depuis Baleen.

## v1.105.3 (10/12/2024)


### :rocket: Amélioration
- [#473](https://github.com/1024pix/pix-bot/pull/473) [FEATURE] Pix-15117 supprimer les RA lors de l'ajout du label no-review-app.

### :bug: Correction
- [#482](https://github.com/1024pix/pix-bot/pull/482) [BUGFIX] Corriger la manière de s'assurer qu'une application est bien une RA.

### :arrow_up: Montée de version
- [#481](https://github.com/1024pix/pix-bot/pull/481) [BUMP] Lock file maintenance (dossier racine).
- [#478](https://github.com/1024pix/pix-bot/pull/478) [BUMP] Update dependency scalingo to ^0.9.0 (dossier racine).
- [#476](https://github.com/1024pix/pix-bot/pull/476) [BUMP] Update dependency mocha to v11 (dossier racine).
- [#475](https://github.com/1024pix/pix-bot/pull/475) [BUMP] Lock file maintenance (dossier racine).
- [#472](https://github.com/1024pix/pix-bot/pull/472) [BUMP] Lock file maintenance (dossier racine).
- [#458](https://github.com/1024pix/pix-bot/pull/458) [BUMP] Update node to v22 (major).
- [#469](https://github.com/1024pix/pix-bot/pull/469) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.3 (dossier racine).
- [#470](https://github.com/1024pix/pix-bot/pull/470) [BUMP] Lock file maintenance (dossier racine).

### :coffee: Autre
- [#471](https://github.com/1024pix/pix-bot/pull/471) [FEAT] Permettre la suppression de RA n'ayant pas "-review-pr" dans leur nom.

## v1.105.2 (14/11/2024)


### :bug: Correction
- [#467](https://github.com/1024pix/pix-bot/pull/467) [BUGFIX] Mettre à jour le statut d'une RA quand elle est recréée.

### :arrow_up: Montée de version
- [#468](https://github.com/1024pix/pix-bot/pull/468) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.2 (dossier racine).

## v1.105.1 (14/11/2024)


### :bug: Correction
- [#466](https://github.com/1024pix/pix-bot/pull/466) [BUGFIX] Insérer les review-apps en base avant le déploiement de Scalingo.

### :arrow_up: Montée de version
- [#465](https://github.com/1024pix/pix-bot/pull/465) [BUMP] Lock file maintenance (dossier racine).

## v1.105.0 (08/11/2024)


### :rocket: Amélioration
- [#461](https://github.com/1024pix/pix-bot/pull/461) [FEATURE] Ajouter un check Github lors du déploiement des review apps (PIX-14768).

### :building_construction: Tech
- [#462](https://github.com/1024pix/pix-bot/pull/462) [TECH] Renommer le endpoint /deploy-pix-data-api-pix.
- [#454](https://github.com/1024pix/pix-bot/pull/454) [TECH] :package:  Ajout d'un client PG.
- [#455](https://github.com/1024pix/pix-bot/pull/455) [TECH] :recycle:  Suppression d'un `await` inutile.

### :arrow_up: Montée de version
- [#459](https://github.com/1024pix/pix-bot/pull/459) [BUMP] Lock file maintenance (dossier racine).
- [#457](https://github.com/1024pix/pix-bot/pull/457) [BUMP] Lock file maintenance.
- [#456](https://github.com/1024pix/pix-bot/pull/456) [BUMP] Update dependency postgres to v16.
- [#453](https://github.com/1024pix/pix-bot/pull/453) [BUMP] Lock file maintenance.
- [#452](https://github.com/1024pix/pix-bot/pull/452) [BUMP] Lock file maintenance.
- [#451](https://github.com/1024pix/pix-bot/pull/451) [BUMP] Update dependency node to v20.18.0.

## v1.104.4 (09/10/2024)


### :bug: Correction
- [#450](https://github.com/1024pix/pix-bot/pull/450) [BUGFIX] Corriger la suppression des RA pour les repo non gérés par Pix Bot (PIX-14712).

## v1.104.3 (09/10/2024)


### :rocket: Amélioration
- [#449](https://github.com/1024pix/pix-bot/pull/449) [FEATURE] Clôturer les review apps depuis Pix Bot (PIX-14712).

### :arrow_up: Montée de version
- [#448](https://github.com/1024pix/pix-bot/pull/448) [BUMP] Update Node.js to v20.18.0.
- [#446](https://github.com/1024pix/pix-bot/pull/446) [BUMP] Lock file maintenance.
- [#445](https://github.com/1024pix/pix-bot/pull/445) [BUMP] Lock file maintenance.

### :coffee: Autre
- [#382](https://github.com/1024pix/pix-bot/pull/382) [DOCUMENTATION] Mise à jour du schéma de déploiement.

## v1.104.2 (26/09/2024)


### :building_construction: Tech
- [#444](https://github.com/1024pix/pix-bot/pull/444) [TECH] Refactorer le controller GitHub.

### :arrow_up: Montée de version
- [#437](https://github.com/1024pix/pix-bot/pull/437) [BUMP] Update node.
- [#443](https://github.com/1024pix/pix-bot/pull/443) [BUMP] Lock file maintenance.

## v1.104.1 (19/09/2024)


### :arrow_up: Montée de version
- [#441](https://github.com/1024pix/pix-bot/pull/441) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.1 (dossier racine).
- [#440](https://github.com/1024pix/pix-bot/pull/440) [BUMP] Lock file maintenance.
- [#439](https://github.com/1024pix/pix-bot/pull/439) [BUMP] Lock file maintenance.
- [#438](https://github.com/1024pix/pix-bot/pull/438) [BUMP] Lock file maintenance.
- [#436](https://github.com/1024pix/pix-bot/pull/436) [BUMP] Lock file maintenance.

## v1.104.0 (23/08/2024)


### :rocket: Amélioration
- [#435](https://github.com/1024pix/pix-bot/pull/435) [FEATURE] Déployer les apps grâce au webhook GitHub sans que le repository soit lié dans Scalingo.

## v1.103.3 (23/08/2024)


### :building_construction: Tech
- [#434](https://github.com/1024pix/pix-bot/pull/434) [TECH] Déplacer le webhook GitHub release dans la partie `run` (PIX-13870).

## v1.103.2 (22/08/2024)


### :bug: Correction
- [#433](https://github.com/1024pix/pix-bot/pull/433) [BUGFIX] Eviter les 500 sur l'appel /github/webhook. .

## v1.103.1 (20/08/2024)


### :arrow_up: Montée de version
- [#432](https://github.com/1024pix/pix-bot/pull/432) [BUMP] Update dependency chai to v5 (dossier racine).

## v1.103.0 (20/08/2024)


### :rocket: Amélioration
- [#430](https://github.com/1024pix/pix-bot/pull/430) [FEATURE] Permettre le déploiement dès la création d'une release (PIX-13870).

### :arrow_up: Montée de version
- [#431](https://github.com/1024pix/pix-bot/pull/431) [BUMP] Update dependency axios to v1.7.4 [SECURITY].
- [#429](https://github.com/1024pix/pix-bot/pull/429) [BUMP] Lock file maintenance.
- [#406](https://github.com/1024pix/pix-bot/pull/406) [BUMP] Update Node.js to ^20.16.0.
- [#425](https://github.com/1024pix/pix-bot/pull/425) [BUMP] Update dependency node-fetch to v3.
- [#422](https://github.com/1024pix/pix-bot/pull/422) [BUMP] Update dependency node to v20.16.0.
- [#421](https://github.com/1024pix/pix-bot/pull/421) [BUMP] Update Node.js to v20.16.0.
- [#420](https://github.com/1024pix/pix-bot/pull/420) [BUMP] Lock file maintenance (dossier racine).

## v1.102.0 (01/08/2024)


### :rocket: Amélioration
- [#418](https://github.com/1024pix/pix-bot/pull/418) [FEATURE] Ajout d'une commande slack pour déploiement de pix-data-api-pix (PIX-13714).

### :arrow_up: Montée de version
- [#417](https://github.com/1024pix/pix-bot/pull/417) [BUMP] Lock file maintenance (dossier racine).

## v1.101.0 (25/07/2024)


### :rocket: Amélioration
- [#416](https://github.com/1024pix/pix-bot/pull/416) [FEATURE] Activer les RA pour pix-api-data-pix.

### :arrow_up: Montée de version
- [#415](https://github.com/1024pix/pix-bot/pull/415) [BUMP] Lock file maintenance (dossier racine).
- [#414](https://github.com/1024pix/pix-bot/pull/414) [BUMP] Lock file maintenance (dossier racine).
- [#413](https://github.com/1024pix/pix-bot/pull/413) [BUMP] Lock file maintenance (dossier racine).

## v1.100.0 (12/07/2024)


### :rocket: Amélioration
- [#412](https://github.com/1024pix/pix-bot/pull/412) [FEATURE] Faire en sorte d'uniquement déployer Pix Api Data.

### :arrow_up: Montée de version
- [#410](https://github.com/1024pix/pix-bot/pull/410) [BUMP] Lock file maintenance (dossier racine).

## v1.99.0 (05/07/2024)


### :rocket: Amélioration
- [#409](https://github.com/1024pix/pix-bot/pull/409) [FEATURE] Activer les RA pour pix-api-data.

### :arrow_up: Montée de version
- [#408](https://github.com/1024pix/pix-bot/pull/408) [BUMP] Lock file maintenance (dossier racine).
- [#407](https://github.com/1024pix/pix-bot/pull/407) [BUMP] Update dependency @octokit/rest to v21 (dossier racine).
- [#405](https://github.com/1024pix/pix-bot/pull/405) [BUMP] Lock file maintenance (dossier racine).
- [#404](https://github.com/1024pix/pix-bot/pull/404) [BUMP] Lock file maintenance (dossier racine).
- [#403](https://github.com/1024pix/pix-bot/pull/403) [BUMP] Lock file maintenance (dossier racine).
- [#402](https://github.com/1024pix/pix-bot/pull/402) [BUMP] Lock file maintenance (dossier racine).
- [#401](https://github.com/1024pix/pix-bot/pull/401) [BUMP] Update dependency node to v20.14.0.
- [#376](https://github.com/1024pix/pix-bot/pull/376) [BUMP] Update dependency eslint to v9.
- [#400](https://github.com/1024pix/pix-bot/pull/400) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.2 (dossier racine).
- [#399](https://github.com/1024pix/pix-bot/pull/399) [BUMP] Lock file maintenance (dossier racine).
- [#398](https://github.com/1024pix/pix-bot/pull/398) [BUMP] Update Node.js to v20.14.0.

## v1.98.3 (29/05/2024)


### :building_construction: Tech
- [#392](https://github.com/1024pix/pix-bot/pull/392) [TECH] Migrer le code en ESM.

### :arrow_up: Montée de version
- [#397](https://github.com/1024pix/pix-bot/pull/397) [BUMP] Update dependency eslint-plugin-n to v17 (dossier racine).
- [#396](https://github.com/1024pix/pix-bot/pull/396) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.1 (dossier racine).
- [#395](https://github.com/1024pix/pix-bot/pull/395) [BUMP] Lock file maintenance (dossier racine).
- [#394](https://github.com/1024pix/pix-bot/pull/394) [BUMP] Update dependency sinon to v18 (dossier racine).
- [#393](https://github.com/1024pix/pix-bot/pull/393) [BUMP] Lock file maintenance (dossier racine).
- [#391](https://github.com/1024pix/pix-bot/pull/391) [BUMP] Update dependency node to v20.13.1.

## v1.98.2 (14/05/2024)


### :bug: Correction
- [#390](https://github.com/1024pix/pix-bot/pull/390) [BUGFIX] Gère le renommage de l'application pix-1d-integration.

## v1.98.1 (14/05/2024)


### :arrow_up: Montée de version
- [#389](https://github.com/1024pix/pix-bot/pull/389) [BUMP] Update dependency node to v20.13.0.

### :coffee: Autre
- [#385](https://github.com/1024pix/pix-bot/pull/385) [BUGIFX] Ne pas afficher les `CHANGES_REQUESTED` si ils ont été traités.

## v1.98.0 (13/05/2024)


### :rocket: Amélioration
- [#388](https://github.com/1024pix/pix-bot/pull/388) [FEATURE] Adapte la publication et le déploiement au renommage de Pix 1d en Pix Junior.

### :arrow_up: Montée de version
- [#387](https://github.com/1024pix/pix-bot/pull/387) [BUMP] Lock file maintenance (dossier racine).
- [#386](https://github.com/1024pix/pix-bot/pull/386) [BUMP] Update Node.js to v20.13.1.

## v1.97.0 (07/05/2024)


### :building_construction: Tech
- [#384](https://github.com/1024pix/pix-bot/pull/384) [TECH] Renomme 1d en Junior.

### :arrow_up: Montée de version
- [#383](https://github.com/1024pix/pix-bot/pull/383) [BUMP] Lock file maintenance (dossier racine).
- [#381](https://github.com/1024pix/pix-bot/pull/381) [BUMP] Lock file maintenance (dossier racine).

## v1.96.0 (26/04/2024)


### :rocket: Amélioration
- [#380](https://github.com/1024pix/pix-bot/pull/380) [FEATURE] Mise à jour du message du bot pour pix-epreuves.

### :arrow_up: Montée de version
- [#379](https://github.com/1024pix/pix-bot/pull/379) [BUMP] Lock file maintenance (dossier racine).
- [#378](https://github.com/1024pix/pix-bot/pull/378) [BUMP] Update dependency node to v20.12.2.
- [#377](https://github.com/1024pix/pix-bot/pull/377) [BUMP] Lock file maintenance (dossier racine).
- [#375](https://github.com/1024pix/pix-bot/pull/375) [BUMP] Update Node.js to v20.12.2.
- [#374](https://github.com/1024pix/pix-bot/pull/374) [BUMP] Update dependency node to v20.12.1.
- [#373](https://github.com/1024pix/pix-bot/pull/373) [BUMP] Lock file maintenance (dossier racine).
- [#372](https://github.com/1024pix/pix-bot/pull/372) [BUMP] Update Node.js to v20.12.1.
- [#371](https://github.com/1024pix/pix-bot/pull/371) [BUMP] Update dependency node to v20.12.0.
- [#370](https://github.com/1024pix/pix-bot/pull/370) [BUMP] Lock file maintenance (dossier racine).
- [#369](https://github.com/1024pix/pix-bot/pull/369) [BUMP] Update Node.js to v20.12.0.
- [#368](https://github.com/1024pix/pix-bot/pull/368) [BUMP] Lock file maintenance (dossier racine).
- [#367](https://github.com/1024pix/pix-bot/pull/367) [BUMP] Lock file maintenance (dossier racine).
- [#365](https://github.com/1024pix/pix-bot/pull/365) [BUMP] Lock file maintenance (dossier racine).

## v1.95.1 (07/03/2024)


### :coffee: Autre
- [#364](https://github.com/1024pix/pix-bot/pull/364) Revert "[FEATURE] Ne pas créer de RA quand la PR est en draft (PIX-9921)".

## v1.95.0 (06/03/2024)


### :rocket: Amélioration
- [#363](https://github.com/1024pix/pix-bot/pull/363) [FEATURE] Ne pas créer de RA quand la PR est en draft (PIX-9921).

### :arrow_up: Montée de version
- [#358](https://github.com/1024pix/pix-bot/pull/358) [BUMP] Lock file maintenance (dossier racine).
- [#359](https://github.com/1024pix/pix-bot/pull/359) [BUMP] Update node.

## v1.94.1 (28/02/2024)


### :building_construction: Tech
- [#362](https://github.com/1024pix/pix-bot/pull/362) [TECH] Utiliser le logger info à la place du logger ok qui n'existe pas.

## v1.94.0 (28/02/2024)


### :bug: Correction
- [#361](https://github.com/1024pix/pix-bot/pull/361) [BUGFIX] Corrige l'utilisation de `logger.info` lors du déploiement d'un repo.

## v1.93.0 (27/02/2024)


### :building_construction: Tech
- [#360](https://github.com/1024pix/pix-bot/pull/360) [TECH]  Permettre la création de review app sur pix-epreuves.

### :arrow_up: Montée de version
- [#357](https://github.com/1024pix/pix-bot/pull/357) [BUMP] Lock file maintenance (dossier racine).
- [#356](https://github.com/1024pix/pix-bot/pull/356) [BUMP] Lock file maintenance (dossier racine).
- [#355](https://github.com/1024pix/pix-bot/pull/355) [BUMP] Update dependency husky to v9 (dossier racine).
- [#354](https://github.com/1024pix/pix-bot/pull/354) [BUMP] Lock file maintenance (dossier racine).
- [#353](https://github.com/1024pix/pix-bot/pull/353) [BUMP] Lock file maintenance (dossier racine).
- [#352](https://github.com/1024pix/pix-bot/pull/352) [BUMP] Update dependency node to v20.11.0.
- [#350](https://github.com/1024pix/pix-bot/pull/350) [BUMP] Update Node.js to v20.11.0.
- [#349](https://github.com/1024pix/pix-bot/pull/349) [BUMP] Update node.
- [#348](https://github.com/1024pix/pix-bot/pull/348) [BUMP] Lock file maintenance (dossier racine).
- [#347](https://github.com/1024pix/pix-bot/pull/347) [BUMP] Lock file maintenance (dossier racine).
- [#344](https://github.com/1024pix/pix-bot/pull/344) [BUMP] Lock file maintenance (dossier racine).
- [#343](https://github.com/1024pix/pix-bot/pull/343) [BUMP] Lock file maintenance (dossier racine).

### :coffee: Autre
- [#351](https://github.com/1024pix/pix-bot/pull/351) PIX-9190 : Enrichir le logger de pix bot.
- [#340](https://github.com/1024pix/pix-bot/pull/340) Ajouter le déploiement de Privatebin depuis slack.

## v1.92.0 (21/12/2023)


### :building_construction: Tech
- [#342](https://github.com/1024pix/pix-bot/pull/342) [TECH] Add 1d and audit-logger to versioned applications.

### :arrow_up: Montée de version
- [#341](https://github.com/1024pix/pix-bot/pull/341) [BUMP] Lock file maintenance (dossier racine).
- [#339](https://github.com/1024pix/pix-bot/pull/339) [BUMP] Lock file maintenance (dossier racine).
- [#337](https://github.com/1024pix/pix-bot/pull/337) [BUMP] Update dependency @1024pix/scalingo-review-app-manager to ^2.1.0 (dossier racine).

## v1.91.0 (06/12/2023)


### :arrow_up: Montée de version
- [#336](https://github.com/1024pix/pix-bot/pull/336) [BUMP] Lock file maintenance (dossier racine).
- [#335](https://github.com/1024pix/pix-bot/pull/335) [BUMP] Update dependency axios-retry to v4 (dossier racine).
- [#334](https://github.com/1024pix/pix-bot/pull/334) [BUMP] Lock file maintenance (dossier racine).

## v1.90.0 (15/11/2023)


### :building_construction: Tech
- [#331](https://github.com/1024pix/pix-bot/pull/331) [TECH] Vérifier si une RA existe avant de la créer.

### :arrow_up: Montée de version
- [#330](https://github.com/1024pix/pix-bot/pull/330) [BUMP] Lock file maintenance (dossier racine).
- [#332](https://github.com/1024pix/pix-bot/pull/332) [BUMP] Update dependency axios to v1.6.0 [SECURITY].

## v1.89.0 (30/10/2023)


### :building_construction: Tech
- [#322](https://github.com/1024pix/pix-bot/pull/322) [TECH] Mettre a jour le chemin de config.js.

### :arrow_up: Montée de version
- [#326](https://github.com/1024pix/pix-bot/pull/326) [BUMP] Update dependency lint-staged to v15 (dossier racine).
- [#328](https://github.com/1024pix/pix-bot/pull/328) [BUMP] Update dependency sinon to v17 (dossier racine).
- [#329](https://github.com/1024pix/pix-bot/pull/329) [BUMP] Update node to v20 (major).
- [#324](https://github.com/1024pix/pix-bot/pull/324) [BUMP] Lock file maintenance (dossier racine).
- [#321](https://github.com/1024pix/pix-bot/pull/321) [BUMP] Update node.

## v1.88.0 (26/09/2023)


### :building_construction: Tech
- [#313](https://github.com/1024pix/pix-bot/pull/313) [TECH] Afficher le label de la team concernée et le lien vers la PR associée au changement de config.

## v1.87.0 (21/09/2023)


### :building_construction: Tech
- [#318](https://github.com/1024pix/pix-bot/pull/318) [TECH] Amélioration de la gestion des appels en échec lors de la récupération des derniers tags.

### :arrow_up: Montée de version
- [#317](https://github.com/1024pix/pix-bot/pull/317) [BUMP] Update dependency sinon to v16 (dossier racine).

### :coffee: Autre
- [#314](https://github.com/1024pix/pix-bot/pull/314) Afficher la progression synthétique des tests.
- [#316](https://github.com/1024pix/pix-bot/pull/316) Ne pas tracer durant les tests.
- [#315](https://github.com/1024pix/pix-bot/pull/315) Empêcher le crash de l'API en cas de configuration incorrecte.

## v1.86.1 (16/09/2023)


### :bug: Correction
- [#312](https://github.com/1024pix/pix-bot/pull/312) [BUGFIX] Corriger le message envoyé sur slack lors de changements du fichier config.js.

## v1.86.0 (15/09/2023)


### :rocket: Amélioration
- [#310](https://github.com/1024pix/pix-bot/pull/310) [FEATURE] :sparkles: Envoyer un message sur slack en cas de changements sur le fichier config.js.

## v1.85.0 (15/09/2023)


### :building_construction: Tech
- [#311](https://github.com/1024pix/pix-bot/pull/311) [TECH] Utiliser un client HTTP pour communiquer avec Slack.

## v1.84.1 (13/09/2023)


### :bug: Correction
- [#309](https://github.com/1024pix/pix-bot/pull/309) [BUGFIX] :bug: Corriger le lien vers le diff dans la vue Slack release-publication-confirmation.

## v1.84.0 (13/09/2023)


### :rocket: Amélioration
- [#307](https://github.com/1024pix/pix-bot/pull/307) [FEATURE] Ajouter un lien vers la diff lors de la création de la release.

## v1.83.1 (12/09/2023)


### :building_construction: Tech
- [#306](https://github.com/1024pix/pix-bot/pull/306) [TECH] Correction de la propriété timezone en timeZone dans le cron de l'autoscaler.

## v1.83.0 (12/09/2023)


### :building_construction: Tech
- [#254](https://github.com/1024pix/pix-bot/pull/254) [TECH] Refactorer le logger.

## v1.82.1 (08/09/2023)


### :building_construction: Tech
- [#303](https://github.com/1024pix/pix-bot/pull/303) [TECH] Ajout de logs quand l'autoscaler démarre.

## v1.82.0 (08/09/2023)


### :building_construction: Tech
- [#298](https://github.com/1024pix/pix-bot/pull/298) [TECH] Ajout d'un job pour configurer automatiquement l'autoscaler d'applications sur Scalingo (PIX-8638).

## v1.81.0 (06/09/2023)


### :arrow_up: Montée de version
- [#302](https://github.com/1024pix/pix-bot/pull/302) [BUMP] :arrow_up: Mettre à jour scalingo-review-app-manager en utilisant le nouveau paquet.

## v1.80.0 (04/09/2023)


### :building_construction: Tech
- [#300](https://github.com/1024pix/pix-bot/pull/300) [TECH] Forcer l'utilisation de node-fetch par Octokit.

### :arrow_up: Montée de version
- [#299](https://github.com/1024pix/pix-bot/pull/299) [BUMP] Lock file maintenance (dossier racine).
- [#279](https://github.com/1024pix/pix-bot/pull/279) [BUMP] Update dependency @octokit/rest to v20 (dossier racine).
- [#284](https://github.com/1024pix/pix-bot/pull/284) [BUMP] Update node to v18 (major).

## v1.79.0 (28/08/2023)


### :building_construction: Tech
- [#296](https://github.com/1024pix/pix-bot/pull/296) [TECH] Tester unitairement la gestion des appels webhook de Github.

## v1.78.0 (25/08/2023)


### :coffee: Autre
- [#294](https://github.com/1024pix/pix-bot/pull/294) Déployer audit-logger automatiquement lors de MER / MEP.

## v1.77.0 (24/08/2023)


### :bug: Correction
- [#293](https://github.com/1024pix/pix-bot/pull/293) [BUGFIX] Vérifier que la configuration Scalingo est fournie avant l'appel d'authentification.

## v1.76.1 (23/08/2023)


### :bug: Correction
- [#292](https://github.com/1024pix/pix-bot/pull/292) [BUGFIX] Gérer les erreurs Scalingo lors du déploiement des applications d'integration.

## v1.76.0 (23/08/2023)


### :rocket: Amélioration
- [#290](https://github.com/1024pix/pix-bot/pull/290) [FEATURE] Déployer l'intégration du monorepo avec Pix Bot (PIX-8933).

### :arrow_up: Montée de version
- [#291](https://github.com/1024pix/pix-bot/pull/291) [BUMP] Lock file maintenance (dossier racine).
- [#289](https://github.com/1024pix/pix-bot/pull/289) [BUMP] Update node.
- [#288](https://github.com/1024pix/pix-bot/pull/288) [BUMP] Update dependency lint-staged to v14 (dossier racine).
- [#287](https://github.com/1024pix/pix-bot/pull/287) [BUMP] Update dependency eslint-config-prettier to v9 (dossier racine).

## v1.75.0 (09/08/2023)


### :building_construction: Tech
- [#285](https://github.com/1024pix/pix-bot/pull/285) [TECH] :sparkles: Ajouter l'application audit-logger dans la configuration des RA du monorepo .

## v1.74.0 (26/07/2023)


### :rocket: Amélioration
- [#271](https://github.com/1024pix/pix-bot/pull/271) [FEATURE] Ajoute le suport du tag `BUMP` en préfixe de PR.

### :coffee: Autre
- [#277](https://github.com/1024pix/pix-bot/pull/277) Ajout d'une commande slack de déploiement pour pix-api-data.

## v1.73.0 (19/07/2023)


### :building_construction: Tech
- [#278](https://github.com/1024pix/pix-bot/pull/278) [TECH] Rend les déploiements déclaratif plutot qu'impératif.

### :coffee: Autre
- [#276](https://github.com/1024pix/pix-bot/pull/276) [BUMP] Lock file maintenance (dossier racine).
- [#275](https://github.com/1024pix/pix-bot/pull/275) [BUMP] Update dependency prettier to v3 (dossier racine).

## v1.72.0 (11/07/2023)


### :coffee: Autre
- [#273](https://github.com/1024pix/pix-bot/pull/273) Activer les review-app de l'application Pix4Pix.

## v1.71.1 (07/07/2023)


### :building_construction: Tech
- [#263](https://github.com/1024pix/pix-bot/pull/263) [TECH] Précise la version de Node complète.

## v1.71.0 (15/06/2023)


### :building_construction: Tech
- [#258](https://github.com/1024pix/pix-bot/pull/258) [TECH] Améliorer le test du déploiement du monorepo.

### :bug: Correction
- [#259](https://github.com/1024pix/pix-bot/pull/259) [BUGFIX] Correction de l'url de Pix1d dans les commentaires de PR (PIX-8336).

## v1.70.0 (14/06/2023)


### :rocket: Amélioration
- [#257](https://github.com/1024pix/pix-bot/pull/257) [FEATURE] Déployer pix1d (PIX-8336).

## v1.69.0 (12/06/2023)


### :rocket: Amélioration
- [#256](https://github.com/1024pix/pix-bot/pull/256) [FEATURE] Ajoute le suport du tag `BREAKING` en préfixe de PR.

## v1.68.2 (12/06/2023)


### :coffee: Autre
- [#255](https://github.com/1024pix/pix-bot/pull/255) [BUMP] Lock file maintenance (dossier racine)

## v1.68.1 (30/05/2023)


### :bug: Correction
- [#253](https://github.com/1024pix/pix-bot/pull/253) [BUGFIX] Un seul évènement génère plusieurs lignes de log

## v1.68.0 (30/05/2023)


### :building_construction: Tech
- [#252](https://github.com/1024pix/pix-bot/pull/252) [TECH] Tracer avec le logger dédié partout (PIX-8176)

## v1.67.0 (25/05/2023)


### :rocket: Amélioration
- [#251](https://github.com/1024pix/pix-bot/pull/251) [FEATURE] Les démarrage de job ne sont pas tracés dans Pix bot (PIX-7053)

## v1.66.1 (16/05/2023)


### :building_construction: Tech
- [#250](https://github.com/1024pix/pix-bot/pull/250) [TECH] Ajout d'un template de commentaire pour Pix Tutos

## v1.66.0 (12/05/2023)


### :coffee: Autre
- [#249](https://github.com/1024pix/pix-bot/pull/249) Remove mail monitoring

## v1.65.0 (04/05/2023)


### :coffee: Autre
- [#246](https://github.com/1024pix/pix-bot/pull/246) Ajouter une slash command slack sur les déploiements de DBT
- [#245](https://github.com/1024pix/pix-bot/pull/245) [BUMP] Lock file maintenance

## v1.64.0 (27/04/2023)


### :rocket: Amélioration
- [#244](https://github.com/1024pix/pix-bot/pull/244) [FEATURE] Migration de l'API manager de Gravitee à Nginx (PIX-7789)

## v1.63.1 (19/04/2023)


### :rocket: Amélioration
- [#242](https://github.com/1024pix/pix-bot/pull/242) [FEATURE] Ajouter les URL de la RA Orga sur .org et de la RA Certif sur .org

### :coffee: Autre
- [#240](https://github.com/1024pix/pix-bot/pull/240) [BUMP] Lock file maintenance
- [#239](https://github.com/1024pix/pix-bot/pull/239) [BUMP] Update Node.js to v16.20.0 (.circleci)
- [#241](https://github.com/1024pix/pix-bot/pull/241) [BUMP] Update dependency node to v16.20.0

## v1.63.0 (31/03/2023)


### :coffee: Autre
- [#238](https://github.com/1024pix/pix-bot/pull/238) Créer des RA en cas de réouverture de PR

## v1.62.1 (30/03/2023)


### :coffee: Autre
- [#237](https://github.com/1024pix/pix-bot/pull/237) Prendre en compte le status ouvert d'une PR lors d'une synchro / dépoloiement de RA 

## v1.62.0 (27/03/2023)


### :building_construction: Tech
- [#236](https://github.com/1024pix/pix-bot/pull/236) [TECH] Utiliser la version de release qui vient d'être crée plutôt que d'appeler l'API Github

### :coffee: Autre
- [#207](https://github.com/1024pix/pix-bot/pull/207)  [TECH] Renommer www en index.js

## v1.61.1 (17/03/2023)


### :coffee: Autre
- [#235](https://github.com/1024pix/pix-bot/pull/235) Déployer le code à la création de la RA

## v1.61.0 (17/03/2023)


### :rocket: Amélioration
- [#233](https://github.com/1024pix/pix-bot/pull/233) [FEATURE] Au push sur une PR, on déploie nous même la review app

## v1.60.0 (17/03/2023)


### :coffee: Autre
- [#234](https://github.com/1024pix/pix-bot/pull/234) :sparkles:  Ajout de l'URL des review-app de scalingo de pix1d    sur les messages github

## v1.59.0 (07/03/2023)


### :building_construction: Tech
- [#231](https://github.com/1024pix/pix-bot/pull/231) [TECH] :sparkles: Réessayer l'invalidation de cache en cas d'échec

## v1.58.0 (06/03/2023)


### :building_construction: Tech
- [#232](https://github.com/1024pix/pix-bot/pull/232) [TECH] Mise à jour des dépendances

### :coffee: Autre
- [#222](https://github.com/1024pix/pix-bot/pull/222) Expliciter la configuration de l'ecoMode

## v1.57.1 (02/03/2023)


### :coffee: Autre
- [#230](https://github.com/1024pix/pix-bot/pull/230) [BUMP] Lock file maintenance

## v1.57.0 (24/02/2023)


### :coffee: Autre
- [#227](https://github.com/1024pix/pix-bot/pull/227) [BUMP] Update dependency node to v16.19.1
- [#229](https://github.com/1024pix/pix-bot/pull/229) :bug: Corriger le déploiement de geoapi

## v1.56.0 (24/02/2023)


### :coffee: Autre
- [#228](https://github.com/1024pix/pix-bot/pull/228) :sparkles: Déployer geoapi via Pix bot

## v1.55.0 (23/02/2023)


### :bug: Correction
- [#214](https://github.com/1024pix/pix-bot/pull/214) [BUGFIX] Corrige le nom de l'application Scalingo de review

### :coffee: Autre
- [#226](https://github.com/1024pix/pix-bot/pull/226) [BUMP] Update Node.js to v16.19.1 (.circleci)

## v1.54.0 (13/02/2023)


### :coffee: Autre
- [#223](https://github.com/1024pix/pix-bot/pull/223) Corriger la suggestion de déploiement Slack

## v1.53.0 (03/02/2023)


### :coffee: Autre
- [#221](https://github.com/1024pix/pix-bot/pull/221) :art: Faire un bump de version mineure par défaut

## v1.52.0 (02/02/2023)


### :rocket: Amélioration
- [#218](https://github.com/1024pix/pix-bot/pull/218) [FEATURE] Déployer pix-lcms-minimal en même temps que la production

### :bug: Correction
- [#220](https://github.com/1024pix/pix-bot/pull/220) [BUGFIX] Corriger le lien vers PixEditor dans le message automatique envoyée au Reviews Apps

### :coffee: Autre
- [#217](https://github.com/1024pix/pix-bot/pull/217) chore(deps): update node.js to v16.19.0
- [#216](https://github.com/1024pix/pix-bot/pull/216) chore(deps): update dependency node to v16.19.0
- [#215](https://github.com/1024pix/pix-bot/pull/215) Mettre à jour les dépendences aussi vite que possible

## v1.51.1 (13/01/2023)


### :bug: Correction
- [#213](https://github.com/1024pix/pix-bot/pull/213) [BUGFIX] Les liens vers l'application Airflow scalingo dans la PR sont invalides

## v1.51.0 (13/01/2023)


### :rocket: Amélioration
- [#212](https://github.com/1024pix/pix-bot/pull/212) [FEATURE] Déployer airflow

## v1.50.2 (12/01/2023)


### :rocket: Amélioration
- [#209](https://github.com/1024pix/pix-bot/pull/209) [FEATURE] Change les liens vers les reviews app

## v1.50.1 (11/01/2023)


### :bug: Correction
- [#211](https://github.com/1024pix/pix-bot/pull/211) [BUGFIX] Corrige le déploiement de pix-360

## v1.50.0 (11/01/2023)


### :rocket: Amélioration
- [#210](https://github.com/1024pix/pix-bot/pull/210) [FEATURE] Déploie pix 360 depuis pix-bot

## v1.49.0 (06/01/2023)


### :bug: Correction
- [#208](https://github.com/1024pix/pix-bot/pull/208) [BUGFIX] Corrige le template d'urls pour les Review Apps.

## v1.48.3 (27/12/2022)


### :bug: Correction
- [#206](https://github.com/1024pix/pix-bot/pull/206) [BUGFIX] Les commentaires de PR ne sont toujours pas encore tout à fait corrects

## v1.48.2 (26/12/2022)


### :bug: Correction
- [#205](https://github.com/1024pix/pix-bot/pull/205) [BUGFIX] Les commentaires de PR ne toujours sont pas tout à fait corrects 

## v1.48.1 (23/12/2022)


### :bug: Correction
- [#204](https://github.com/1024pix/pix-bot/pull/204) [BUGFIX] Les commentaires de PR non sont pas tout à fait corrects

## v1.48.0 (23/12/2022)


### :building_construction: Tech
- [#202](https://github.com/1024pix/pix-bot/pull/202) [TECH] Ajouter un lien vers la review-app dans la pull-request
- [#203](https://github.com/1024pix/pix-bot/pull/203) [TECH] Supprimer le template de PR en doublon
- [#201](https://github.com/1024pix/pix-bot/pull/201) [TECH] Corriger l'orthographe de la notification de déploiement en erreur

## v1.47.0 (19/12/2022)


### :building_construction: Tech
- [#199](https://github.com/1024pix/pix-bot/pull/199) [TECH] Tracer les erreurs Github

## v1.46.0 (16/12/2022)


### :building_construction: Tech
- [#200](https://github.com/1024pix/pix-bot/pull/200) [TECH] Linter les tests de manière homogène

## v1.45.0 (13/12/2022)


### :building_construction: Tech
- [#198](https://github.com/1024pix/pix-bot/pull/198) [TECH] Expliciter la description de l'application

## v1.44.0 (13/12/2022)


### :building_construction: Tech
- [#197](https://github.com/1024pix/pix-bot/pull/197) [TECH] Tracer les appels Github
- [#196](https://github.com/1024pix/pix-bot/pull/196) [TECH] Prévenir les incohérences de dépendances

## v1.43.1 (12/12/2022)


### :building_construction: Tech
- [#186](https://github.com/1024pix/pix-bot/pull/186) [TECH] Créer automatiquement des PR de montées de version
- [#184](https://github.com/1024pix/pix-bot/pull/184) [TECH] Utiliser les templates de configuration par défaut pour Renovate

### :coffee: Autre
- [#194](https://github.com/1024pix/pix-bot/pull/194) Update dependency slack-block-builder to ^2.7.2
- [#195](https://github.com/1024pix/pix-bot/pull/195) Update dependency mocha to ^10.2.0
- [#188](https://github.com/1024pix/pix-bot/pull/188) Update dependency prettier to ^2.8.1
- [#189](https://github.com/1024pix/pix-bot/pull/189) Update dependency scalingo-review-app-manager to ^1.0.5
- [#187](https://github.com/1024pix/pix-bot/pull/187) Update dependency nock to ^13.2.9
- [#183](https://github.com/1024pix/pix-bot/pull/183) chore(deps): update dependency node to v16.18.1
- [#180](https://github.com/1024pix/pix-bot/pull/180) :wrench: Désactiver les limites de PR de renovate
- [#179](https://github.com/1024pix/pix-bot/pull/179) Signaler clairement les PR renovate
- [#176](https://github.com/1024pix/pix-bot/pull/176) chore(deps): update node.js to v16.18.1
- [#174](https://github.com/1024pix/pix-bot/pull/174) Configure renovate
- [#171](https://github.com/1024pix/pix-bot/pull/171) Mettre à jour automatiquement l'environnement

## v1.43.0 (08/12/2022)


### :building_construction: Tech
- [#170](https://github.com/1024pix/pix-bot/pull/170) [TECH] Mise à jour de l'environnement

## v1.42.0 (06/12/2022)


### :building_construction: Tech
- [#169](https://github.com/1024pix/pix-bot/pull/169) [TECH] Mettre à jour environnement (axios, scalingo-cli, octokit/rest)

## v1.41.0 (05/12/2022)


### :building_construction: Tech
- [#167](https://github.com/1024pix/pix-bot/pull/167) [TECH] Mise à jour de l'environnement

## v1.40.0 (05/12/2022)


### :coffee: Autre
- [#168](https://github.com/1024pix/pix-bot/pull/168) Créer une application Scalingo avec une configuration valide via Slack

## v1.39.0 (21/11/2022)


### :building_construction: Tech
- [#166](https://github.com/1024pix/pix-bot/pull/166) [TECH] Tracer le message d'erreur du CDN

## v1.38.0 (18/11/2022)


### :building_construction: Tech
- [#165](https://github.com/1024pix/pix-bot/pull/165) [TECH] Déployer Airflow en production depuis Slack

## v1.37.0 (17/11/2022)


### :coffee: Autre
- [#164](https://github.com/1024pix/pix-bot/pull/164) Mise à jour du nom des application Gravitee APIM

## v1.36.1 (10/11/2022)


### :coffee: Autre
- [#163](https://github.com/1024pix/pix-bot/pull/163) :art: Ecrire les logs d'erreurs sur une ligne

## v1.36.0 (10/11/2022)


### :bug: Correction
- [#162](https://github.com/1024pix/pix-bot/pull/162) [BUGFIX] Corrige les crashs liés aux déploiements de Review Apps Scalingo

### :coffee: Autre
- [#161](https://github.com/1024pix/pix-bot/pull/161) Adding pix-datawarehouse-data to pix-db-replication app

## v1.35.2 (26/10/2022)


### :bug: Correction
- [#160](https://github.com/1024pix/pix-bot/pull/160) [BUGFIX] Mise à jour de scalingo-review-app-manager

## v1.35.1 (26/10/2022)


### :bug: Correction
- [#159](https://github.com/1024pix/pix-bot/pull/159) [BUGFIX] Corrige le nom de l'application scalingo pour le metabase de data

## v1.35.0 (18/10/2022)


### :building_construction: Tech
- [#157](https://github.com/1024pix/pix-bot/pull/157) [TECH] Empêcher le merge si un rebase est en cours
- [#154](https://github.com/1024pix/pix-bot/pull/154) [TECH] Mise à jour des dépendances

### :bug: Correction
- [#158](https://github.com/1024pix/pix-bot/pull/158) [BUGFIX] Mise a jour de scalingo-review-app-manager

## v1.34.0 (14/10/2022)


### :building_construction: Tech
- [#156](https://github.com/1024pix/pix-bot/pull/156) [TECH] Gérer les erreurs inattendues

## v1.33.0 (13/10/2022)


### :rocket: Amélioration
- [#155](https://github.com/1024pix/pix-bot/pull/155) [FEATURE] Déployer Gravitee

## v1.32.0 (27/09/2022)


### :rocket: Amélioration
- [#151](https://github.com/1024pix/pix-bot/pull/151) [FEATURE] Filtrer les PR draft sur la commande Slack /pr-pix 

### :bug: Correction
- [#153](https://github.com/1024pix/pix-bot/pull/153) [BUGFIX] Mise à jour de scalingo-review-app-manager

### :coffee: Autre
- [#152](https://github.com/1024pix/pix-bot/pull/152) [DX] Construction query string Octokit via function

## v1.31.0 (08/09/2022)


### :building_construction: Tech
- [#148](https://github.com/1024pix/pix-bot/pull/148) [TECH] Mettre à jour cron de 1.8 à 2.1

### :bug: Correction
- [#149](https://github.com/1024pix/pix-bot/pull/149) [BUGFIX] Le nom du shortcut de création de l'application est trop long.

### :coffee: Autre
- [#150](https://github.com/1024pix/pix-bot/pull/150) Mentionner MER/MEP au début du label de l'action de release

## v1.30.0 (06/09/2022)


### :building_construction: Tech
- [#147](https://github.com/1024pix/pix-bot/pull/147) [TECH] Linter l'ensemble des fichiers.
- [#144](https://github.com/1024pix/pix-bot/pull/144) [TECH] Créer une application Scalingo depuis Slack
- [#145](https://github.com/1024pix/pix-bot/pull/145) [TECH] Permettre de linter avec autofix avant chaque commit en local, si besoin.

### :coffee: Autre
- [#146](https://github.com/1024pix/pix-bot/pull/146) [CLEANUP] Utilise l'action github d'auto-merge commune

## v1.29.0 (29/08/2022)


### :rocket: Amélioration
- [#142](https://github.com/1024pix/pix-bot/pull/142) [FEATURE] Eviter de déployer une RA si la PR contient le label `no-review-app`. 

## v1.28.1 (09/08/2022)


### :coffee: Autre
- [#140](https://github.com/1024pix/pix-bot/pull/140) :bug: Corriger l'envoi de messages slack

## v1.28.0 (09/08/2022)


### :building_construction: Tech
- [#138](https://github.com/1024pix/pix-bot/pull/138) [TECH] Mise en place Prettier et utilise les règles standard

### :bug: Correction
- [#139](https://github.com/1024pix/pix-bot/pull/139) [BUGFIX] Corrige le déploiement en recette
- [#137](https://github.com/1024pix/pix-bot/pull/137) [BUGFIX] Utiliser les commits entre les 2 releases pour afficher une notification de changement de config lors du déploiement

## v1.27.0 (05/08/2022)


### :rocket: Amélioration
- [#135](https://github.com/1024pix/pix-bot/pull/135) [FEATURE] Être en capacité d'être notifié en cas d'erreur de deploiement

## v1.26.0 (03/08/2022)


### :rocket: Amélioration
- [#134](https://github.com/1024pix/pix-bot/pull/134) [FEATURE] Créer une commande Slack pour donner les rôles par tour lors d'un mob

## v1.25.0 (03/08/2022)


### :building_construction: Tech
- [#133](https://github.com/1024pix/pix-bot/pull/133) [TECH] Utiliser node 16. 

## v1.24.0 (20/06/2022)


### :rocket: Amélioration
- [#132](https://github.com/1024pix/pix-bot/pull/132) [FEATURE] Utilise une seule application de production pour pix-db-stats

### :building_construction: Tech
- [#131](https://github.com/1024pix/pix-bot/pull/131) [TECH] Ajouter une commande de création et de déploiement de Pix Tutos (PIX-5127).

## v1.23.0 (15/06/2022)


### :rocket: Amélioration
- [#129](https://github.com/1024pix/pix-bot/pull/129) [FEATURE] Déploiement de metabase

### :coffee: Autre
- [#126](https://github.com/1024pix/pix-bot/pull/126) [CLEANUP] Supprime la config PIX_APPS_TO_DEPLOY

## v1.22.0 (07/06/2022)


### :rocket: Amélioration
- [#130](https://github.com/1024pix/pix-bot/pull/130) [FEATURE] Ajouter les review apps pour pix-tutos (PIX-5030)

## v1.21.2 (31/05/2022)


### :bug: Correction
- [#128](https://github.com/1024pix/pix-bot/pull/128) [BUGFIX] Corrige le nom des applications déployées pour pix-db-stats

## v1.21.1 (31/05/2022)


### :bug: Correction
- [#127](https://github.com/1024pix/pix-bot/pull/127) [BUGFIX] Corrige la première release

## v1.21.0 (31/05/2022)


### :rocket: Amélioration
- [#125](https://github.com/1024pix/pix-bot/pull/125) [FEATURE] Ajoute le déploiement de pix-db-stats

### :coffee: Autre
- [#122](https://github.com/1024pix/pix-bot/pull/122) [CLEANUP] Sépare le callback d'interactivité de la partie build de la partie run

## v1.20.1 (09/05/2022)


### :bug: Correction
- [#123](https://github.com/1024pix/pix-bot/pull/123) [BUGFIX] Corrige le nom de l'application a déployer pour pix-bot-build

## v1.20.0 (09/05/2022)


### :rocket: Amélioration
- [#120](https://github.com/1024pix/pix-bot/pull/120) [FEATURE] Génére correctement le changelog pour une release après une correction de release à chaud 

### :coffee: Autre
- [#121](https://github.com/1024pix/pix-bot/pull/121) [CLEANUP] Refactoring des modals slack

## v1.19.0 (04/05/2022)


### :coffee: Autre
- [#119](https://github.com/1024pix/pix-bot/pull/119) [REVERT] Génére correctement le changelog pour une release après une correction de release à chaud
- [#117](https://github.com/1024pix/pix-bot/pull/117) [CLEANUP] Ajout de tests sur le endpoint /slack/interactive-endpoint

## v1.18.0 (02/05/2022)


### :rocket: Amélioration
- [#118](https://github.com/1024pix/pix-bot/pull/118) [FEATURE] Rajoute le déploiement des reviews app de pix-pro et de pix-ui
- [#116](https://github.com/1024pix/pix-bot/pull/116) [FEATURE] Factorisation de la génération des routes des commandes slash et du manifest
- [#114](https://github.com/1024pix/pix-bot/pull/114) [FEATURE] Générer le manifest pour configurer les applications slack
- [#101](https://github.com/1024pix/pix-bot/pull/101) [FEATURE] Génére correctement le changelog pour une release après une correction de release à chaud

### :building_construction: Tech
- [#105](https://github.com/1024pix/pix-bot/pull/105) [TECH] Mettre à jour les dépendances

### :coffee: Autre
- [#115](https://github.com/1024pix/pix-bot/pull/115) [CLEANUP] Nettoyer les routes du module common
- [#111](https://github.com/1024pix/pix-bot/pull/111) [CLEANUP] Ajout de tests unitaires sur le script release-pix-repo.sh

## v1.17.0 (20/04/2022)


### :rocket: Amélioration
- [#104](https://github.com/1024pix/pix-bot/pull/104) [FEATURE] Gérer le déploiement des review app sur scalingo

### :coffee: Autre
- [#107](https://github.com/1024pix/pix-bot/pull/107) [CLEANUP] Supprimer l'utilisation de moment.js et nettoyage des dépendances
- [#100](https://github.com/1024pix/pix-bot/pull/100) [CLEANUP] Ajout de tests unitaires sur le script publish.sh
- [#102](https://github.com/1024pix/pix-bot/pull/102) [CLEANUP] Supprimer de la duplication sur le webhook Slack
- [#103](https://github.com/1024pix/pix-bot/pull/103) [CLEANUP] Supprimer le package inutile npm crypto

## v1.16.0 (06/04/2022)


### :coffee: Autre
- [#99](https://github.com/1024pix/pix-bot/pull/99) Revert "[TECH] Monter de version node vers la 16.14 "

## v1.15.0 (05/04/2022)


### :building_construction: Tech
- [#98](https://github.com/1024pix/pix-bot/pull/98) [TECH] Monter de version node vers la 16.14
- [#95](https://github.com/1024pix/pix-bot/pull/95) [TECH] Simplifie le push du tag

## v1.14.0 (23/02/2022)


### :building_construction: Tech
- [#93](https://github.com/1024pix/pix-bot/pull/93) [TECH] Documenter l'accès aux changements d'une release d'un projet Pix

### :bug: Bug fix
- [#96](https://github.com/1024pix/pix-bot/pull/96) [BUGFIX] Utiliser le français dans les titres de groupe des changelogs
- [#94](https://github.com/1024pix/pix-bot/pull/94) [BUGFIX] Suppression de l'étape d'installation des packages npm lors de la release

## v1.13.1 (27/10/2021)


### :bug: Bug fix
- [#91](https://github.com/1024pix/pix-bot/pull/91) [BUGFIX] Meilleur message de succès lors du déploiement d'ember-testing-library

## v1.13.0 (27/10/2021)


### :rocket: Enhancement
- [#90](https://github.com/1024pix/pix-bot/pull/90) [FEATURE] Ajout du support d'ember-testing-library

### :building_construction: Tech
- [#89](https://github.com/1024pix/pix-bot/pull/89) [TECH] Avoir le même workflow de merge que sur les autres repositories.

## v1.12.1 (21/10/2021)


### :bug: Bug fix
- [#88](undefined) [BUGFIX] Utiliser la bon attribut comme lien vers les PR dans le changelog. 

## v1.12.0 (20/10/2021)

- [#87](https://github.com/1024pix/pix-bot/pull/87) [FEATURE] Générer le contenu du Changelog.md en regroupant les pull requests par type (PIX-2593).
- [#85](https://github.com/1024pix/pix-bot/pull/85) [TECH] Mise à jour du client scalingo
- [#86](https://github.com/1024pix/pix-bot/pull/86) [TECH] Notifier s'il y a eu des changements de variables d'environnement lors d'une mise en recette ou d'une mise en production.

## v1.11.0 (27/08/2021)

- [#84](https://github.com/1024pix/pix-bot/pull/84) [TECH] Ne pas permettre de faire de release Pix-UI sans donner de version

## v1.10.0 (09/08/2021)

- [#83](https://github.com/1024pix/pix-bot/pull/83) [TECH] Corrige une typo
- [#82](https://github.com/1024pix/pix-bot/pull/82) [FEAT] Ajout d'un CRON pour déployer Pix site tous les mois pour maintenir les statistiques à jour (PIX-2939).

## v1.9.0 (21/07/2021)

- [#81](https://github.com/1024pix/pix-bot/pull/81) Ne pas afficher les commandes exécutés dans les scripts de publication pour ne pas afficher les tokens en prod
- [#75](https://github.com/1024pix/pix-bot/pull/75) Bump lodash from 4.17.19 to 4.17.21

## v1.8.2 (16/06/2021)

- [#80](https://github.com/1024pix/pix-bot/pull/80) [BUGFIX] Empêcher le run de /deploy-last-version sur une application autre que celle du repo Pix

## v1.8.1 (12/05/2021)


## v1.8.0 (12/05/2021)


## v1.7.0 (12/05/2021)

- [#77](https://github.com/1024pix/pix-bot/pull/77) [TECH] Corriger l'utilisation de la variable BRANCH_NAME dans common.sh
- [#76](https://github.com/1024pix/pix-bot/pull/76) [TECH] Correction de la commande de hotfix Slack

## v1.6.0 (12/05/2021)

- [#73](https://github.com/1024pix/pix-bot/pull/73) [FEATURE] Ajoute la commande de création, publication et déploiement en recette d'un patch (hotfix).
- [#74](https://github.com/1024pix/pix-bot/pull/74) [Feature] Ajout d'info dans les message slack de PRs

## v1.5.0 (20/04/2021)

- [#72](https://github.com/1024pix/pix-bot/pull/72) Redéployer une application via Slack
- [#71](https://github.com/1024pix/pix-bot/pull/71) Affichage des statuts des app en intégration

## v1.4.0 (06/04/2021)

- [#68](https://github.com/1024pix/pix-bot/pull/68) [FEATURE] Obtenir le statut de toutes les apps plutôt qu'une seule
- [#67](https://github.com/1024pix/pix-bot/pull/67) [BUGFIX] Appel à /app-status avec un nom court
- [#69](https://github.com/1024pix/pix-bot/pull/69) [TECH] Supprimer un endpoint inutilisé
- [#70](https://github.com/1024pix/pix-bot/pull/70) Mise à jour de la documentation

## v1.3.0 (31/03/2021)

- [#66](https://github.com/1024pix/pix-bot/pull/66) Pouvoir saisir des noms d'app raccourci sur la commande app-status

## v1.2.0 (29/03/2021)

- [#65](https://github.com/1024pix/pix-bot/pull/65) [FEATURE] Ajout d'un endpoint Slack pour récupérer le status d'une App Scalingo

## v1.1.3 (18/03/2021)




## v1.1.2 (18/03/2021)

