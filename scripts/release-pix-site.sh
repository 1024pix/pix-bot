#!/bin/bash

set -euxo pipefail

source "$(dirname $0)"/common.sh

VERSION_TYPE=(${1-""})

echo "Version type ${VERSION_TYPE}"

function clone_repository_and_move_inside {
  REPOSITORY_FOLDER=$(mktemp -d)
  echo "Created temporary directory ${REPOSITORY_FOLDER}"

  git clone git@github.com:1024pix/pix-site.git "${REPOSITORY_FOLDER}"
  echo "Cloned repository to temporary directory"

  cd "${REPOSITORY_FOLDER}"
  echo "Moved to repository folder"
}

function configure_git_user_information {
  git config user.name "$GIT_USER_NAME"
  git config user.email "$GIT_USER_EMAIL"
  echo "Set Git user information"
}

function install_required_packages {
  npm install
  echo "Install packages"
}

function create_and_deploy_release {
  npm_arg="" && [[ -n "$VERSION_TYPE" ]]  && npm_arg=":$VERSION_TYPE"
  npm run release${npm_arg}
  echo "Deploy new release" ${VERSION_TYPE}
}

echo "Start deploying version ${VERSION_TYPE}…"

clone_repository_and_move_inside
configure_git_user_information
install_required_packages
create_and_deploy_release

echo -e "Release deployment ${GREEN}succeeded${RESET_COLOR}."
