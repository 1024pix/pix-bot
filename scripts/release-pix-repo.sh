#!/bin/bash

set -euxo pipefail

source "$(dirname $0)"/common.sh

REPOSITORY_NAME=(${1})
VERSION_TYPE=(${2-""})

echo "Version type ${VERSION_TYPE} for ${REPOSITORY_NAME}"

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

echo -e "Release deployment for ${REPOSITORY_NAME} ${GREEN}succeeded${RESET_COLOR}."
