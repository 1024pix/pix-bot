Choisir les applications à déployer :

- [ ] Fronts <!-- pix-front-review -->
- [ ] API <!-- pix-api-review -->
- [ ] API MaDDo <!-- pix-api-maddo-review -->
- [ ] Audit Logger <!-- pix-audit-logger-review -->

> [!IMPORTANT]
> N'oubliez pas de déployer l'API pour pouvoir accéder aux fronts et/ou à l’API MaDDo.

Une fois les applications déployées, elles seront accessibles via les liens suivants :

- [App (.fr)](https://app-pr{{pullRequestId}}.review.pix.fr)
- [App (.org)](https://app-pr{{pullRequestId}}.review.pix.org)
- [Orga (.fr)](https://orga-pr{{pullRequestId}}.review.pix.fr)
- [Orga (.org)](https://orga-pr{{pullRequestId}}.review.pix.org)
- [Certif (.fr)](https://certif-pr{{pullRequestId}}.review.pix.fr)
- [Certif (.org)](https://certif-pr{{pullRequestId}}.review.pix.org)
- [Junior](https://junior-pr{{pullRequestId}}.review.pix.fr)
- [Admin](https://admin-pr{{pullRequestId}}.review.pix.fr)
- [API](https://api-pr{{pullRequestId}}.review.pix.fr/api/)
- [API MaDDo](https://pix-api-maddo-review-pr{{pullRequestId}}.osc-fr1.scalingo.io/api/)
- [Audit Logger](https://pix-audit-logger-review-pr{{pullRequestId}}.osc-fr1.scalingo.io/api/)

Les variables d'environnement seront accessibles via les liens suivants :

- [scalingo front](https://dashboard.scalingo.com/apps/osc-fr1/pix-front-review-pr{{pullRequestId}}/environment)
- [scalingo api](https://dashboard.scalingo.com/apps/osc-fr1/pix-api-review-pr{{pullRequestId}}/environment)
- [scalingo api-maddo](https://dashboard.scalingo.com/apps/osc-fr1/pix-api-maddo-review-pr{{pullRequestId}}/environment)
- [scalingo audit-logger](https://dashboard.scalingo.com/apps/osc-fr1/pix-audit-logger-review-pr{{pullRequestId}}/environment)
