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

function install_ssh_key_for_git_operations {
  mkdir -p ~/.ssh
  ssh-keyscan -H github.com > ~/.ssh/known_hosts
  echo "${SSH_KEY}" | base64 -d > ~/.ssh/id_rsa
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

