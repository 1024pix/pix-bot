#!/bin/bash

set -euo pipefail


CWD_DIR=$(pwd)
GITHUB_OWNER=(${1})
GITHUB_REPOSITORY=(${2})
VERSION_TYPE=(${3-""})
BRANCH_NAME=(${4})

source "$(dirname $0)"/common.sh

echo "Version type ${VERSION_TYPE} for ${GITHUB_OWNER}/${GITHUB_REPOSITORY}"

function executeCommandRecursivelyInPackageJsonDir {
  find . -name package.json -type f ! -path '*/node_modules/*' -execdir ${1} \;
}

function install_required_packages {
  echo "Install packages"
  executeCommandRecursivelyInPackageJsonDir "npm ci --dev --no-optional"
}

function create_release {
  npm_arg="" && [[ -n "$VERSION_TYPE" ]]  && npm_arg="$VERSION_TYPE"
  executeCommandRecursivelyInPackageJsonDir "npm version ${npm_arg} --no-git-tag-version"
  NEW_PACKAGE_VERSION=$(get_package_version)
}

function create_a_release_commit {
  git add CHANGELOG.md
  executeCommandRecursivelyInPackageJsonDir "git add --update package*.json"

  git commit --message "[RELEASE] A ${VERSION_TYPE} is being released to ${NEW_PACKAGE_VERSION}."

  echo "Created the release commit"
}

echo "Start deploying version ${VERSION_TYPE}…"

clone_repository_and_move_inside
configure_git_user_information
install_required_packages
create_release
complete_change_log
create_a_release_commit
tag_release_commit
push_commit_and_tag_to_remote

echo -e "Release publication for ${GITHUB_OWNER}/${GITHUB_REPOSITORY} ${GREEN}succeeded${RESET_COLOR} (${VERSION_TYPE})."
