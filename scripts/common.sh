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

  git clone "https://${GITHUB_USERNAME}:${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/${GITHUB_OWNER}/${GITHUB_REPOSITORY}.git" "${REPOSITORY_FOLDER}"
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

function push_commit_and_tag_to_remote_dev() {
  git push origin dev
  git push origin "v${NEW_PACKAGE_VERSION}"

  echo "Pushed release commit on branch origin/dev"
}

