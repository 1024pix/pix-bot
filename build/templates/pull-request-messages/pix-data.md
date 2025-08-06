Choisir les applications à déployer :

{{checkboxesForReviewAppsToBeDeployed}}

> [!TIP]
> Pour pouvoir lancer les traitements spark depuis la RA sans avoir modifié de DAG (`data-pipelines/`) ou de Scala (`data-processing/`) il est nécessaire de modifier manuellement la variable d'env `AIRFLOW_VAR_DATA_SPARK_IMAGE_VERSION` (par exemple par `latest`).

> [!TIP]
> Pour pouvoir lancer les traitements Python (`data-processing-py/`), GX (`data-quality/`) et les tâches Airflow nécessitant du sec-num il est nécessaire d'uitliser l'app **`pix-airflow-preprod`** plutôt que la RA.
