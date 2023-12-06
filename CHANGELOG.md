# pix-bot Changelog

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

