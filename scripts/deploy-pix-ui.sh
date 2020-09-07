#!/bin/bash

CWD_DIR=$(pwd)
GITHUB_OWNER=(${1})
GITHUB_REPOSITORY=(${2})

source "${CWD_DIR}/scripts/common.sh"

function deploy_storybook_to_ghpages() {
  npm install
  npm run deploy-storybook
  echo "Deploying storybook on https://1024pix.github.io/pix-ui/"
}

echo "== Clone and move into Pix repository =="
clone_repository_and_move_inside

echo "== Deploy Storybook to Github Pages =="
deploy_storybook_to_ghpages

echo -e "Release publication for ${GITHUB_OWNER}/${GITHUB_REPOSITORY} ${GREEN}succeeded${RESET_COLOR} (${VERSION_TYPE})."
