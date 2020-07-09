#!/bin/bash

set -euxo pipefail

source "$(dirname $0)"/common.sh

GITHUB_OWNER=(${1})
GITHUB_REPOSITORY=(${2})
VERSION_TYPE=(${3-""})

echo "Version type ${VERSION_TYPE} for ${GITHUB_OWNER}/${GITHUB_REPOSITORY}"

function install_required_packages {
  echo "Install packages"
  npm ci --dev --no-optional
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

echo -e "Release deployment for ${GITHUB_OWNER}/${GITHUB_REPOSITORY} ${GREEN}succeeded${RESET_COLOR}."
