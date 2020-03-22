#!/bin/bash

set -euxo pipefail

source "$(dirname $0)"/common.sh

function install_ssh_key_for_git_operations {
  mkdir -p ~/.ssh
  ssh-keyscan -H github.com > ~/.ssh/known_hosts
  echo "$SSH_KEY" | base64 -d > ~/.ssh/github_rsa
  chmod 400 ~/.ssh/id_rsa
}

function clone_repository_and_move_inside {
  REPOSITORY_FOLDER=$(mktemp -d)
  echo "Created temporary directory $REPOSITORY_FOLDER"

  git clone git@github.com:1024pix/pix.git "$REPOSITORY_FOLDER"
  echo "Cloned repository to temporary directory"

  cd "$REPOSITORY_FOLDER"
  echo "Moved to repository folder"
}

function configure_git_user_information {
  git config user.name "$GIT_USER_NAME"
  git config user.email "$GIT_USER_EMAIL"
  echo "Set Git user information"
}

function get_release_commit_hash {
    local commit_hash

    commit_hash="$(git rev-parse --verify --quiet "${VERSION_NUMBER}")"

    if [ -z "${commit_hash}" ];
    then
        echo -e "${RED}Version ${VERSION_NUMBER} does not exist!${RESET_COLOR}\n" >&2
        exit 1
    fi

    echo "Fetched release commit hash"
}

function update_production_branch {
    local annotated_version="${VERSION_NUMBER}^{}"
    local annotated_tag_hash="$(git rev-parse --quiet "${annotated_version}")"
    git push origin "$annotated_tag_hash":prod

    echo "Pushed changes on branch origin/prod"
}

function finalize_release_on_sentry {
    npx sentry-cli releases -o pix finalize "${VERSION_NUMBER}"
    echo "Finalized release on Sentry"
}

function delete_repository_folder {
  rm -rf "$REPOSITORY_FOLDER"
  echo "Deleted temporary folder"
}

echo "Start deploying version $version…"

install_ssh_key_for_git_operations
clone_repository_and_move_inside
configure_git_user_information
get_release_commit_hash
update_production_branch
finalize_release_on_sentry
delete_repository_folder

echo -e "Release deployment ${GREEN}succeeded${RESET_COLOR}."
