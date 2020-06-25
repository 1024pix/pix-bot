#!/bin/bash

set -euxo pipefail
REPOSITORY_NAME=1024pix/pix

source "$(dirname $0)"/common.sh

ENVIRONMENT=$1
RELEASE_TAG=${2:-$NEW_PACKAGE_VERSION}

echo "Version number ${RELEASE_TAG}"

function get_target_branch_name {
  case ${ENVIRONMENT} in
    recette)
      TARGET_BRANCH=master
      ;;
    production)
      TARGET_BRANCH=prod
      ;;
    *)
      echo -e "${RED} Environment shall be 'recette' or 'production'${RESET_COLOR}\n" >&2
      exit 1
      ;;
  esac

  echo "Get remote branch name: ${TARGET_BRANCH}"
}

function get_release_commit_hash {
  local commit_hash

  commit_hash="$(git rev-parse --verify --quiet "${RELEASE_TAG}")"

  if [ -z "${commit_hash}" ];
  then
      echo -e "${RED}Version ${RELEASE_TAG} does not exist!${RESET_COLOR}\n" >&2
      exit 1
  fi

  echo "Fetched release commit hash"
}

function update_remote_branch {
  local annotated_version
  local annotated_tag_hash

  annotated_version="${RELEASE_TAG}^{}"
  annotated_tag_hash="$(git rev-parse --quiet "${annotated_version}")"
  git push -f origin "$annotated_tag_hash":${TARGET_BRANCH}

  echo "Pushed release to branch origin/${TARGET_BRANCH}"
}

echo "Start deploying version ${RELEASE_TAG} to ${ENVIRONMENT}…"

get_target_branch_name
clone_repository_and_move_inside
configure_git_user_information
get_release_commit_hash
update_remote_branch

echo -e "Release deployment ${GREEN}succeeded${RESET_COLOR}."
