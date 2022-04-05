#!/usr/bin/env bash

# Set colors
RESET_COLOR="\033[0m"
BOLD="\033[1m"
OFFBOLD="\033[21m"

# Colors (bold)
RED="\033[1;31m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
BLUE="\033[1;34m"
CYAN="\033[1;36m"

function clone_repository_and_move_inside {
  REPOSITORY_FOLDER=$(mktemp -d)
  echo "Created temporary directory ${REPOSITORY_FOLDER}"
  git clone --depth 1 --branch "${BRANCH_NAME}" "${REPOSITORY_URL}" "${REPOSITORY_FOLDER}"
  echo "Cloned repository ${GITHUB_OWNER}/${GITHUB_REPOSITORY} to temporary directory"

  cd "${REPOSITORY_FOLDER}" || exit 1
  echo "Moved to repository folder"
}

function configure_git_user_information {
  git config user.name "${GIT_USER_NAME}"
  git config user.email "${GIT_USER_EMAIL}"
  echo "Set Git user information"
}

function get_package_version() {
  node -p -e "require('./package.json').version"
}

function push_commit_and_tag_to_remote() {
  git push --follow-tags origin

  echo "Pushed release commit to the origin"
}

function complete_change_log() {
  node "${CWD_DIR}/scripts/get-pull-requests-to-release-in-prod.js" "${NEW_PACKAGE_VERSION}" "${GITHUB_OWNER}" "${GITHUB_REPOSITORY}" "${BRANCH_NAME}"

  echo "Updated CHANGELOG.md"
}

function tag_release_commit() {
  git tag --annotate "v${NEW_PACKAGE_VERSION}" --message "See CHANGELOG file to see what's changed in new release."
  echo "Created annotated tag"
}
