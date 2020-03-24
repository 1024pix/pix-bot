#!/bin/bash

set -euxo pipefail

source "$(dirname $0)"/common.sh

VERSION_NUMBER=$1

echo "Version number ${VERSION_NUMBER}"

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
    local annotated_version
    local annotated_tag_hash

    annotated_version="${VERSION_NUMBER}^{}"
    annotated_tag_hash="$(git rev-parse --quiet "${annotated_version}")"
    git push origin "$annotated_tag_hash":prod

    echo "Pushed changes on branch origin/prod"
}

function finalize_release_on_sentry {
    npx sentry-cli releases -o pix finalize "${VERSION_ NUMBER}"
    echo "Finalized release on Sentry"
}

echo "Start deploying version ${VERSION_NUMBER}…"

install_ssh_key_for_git_operations
clone_repository_and_move_inside
configure_git_user_information
get_release_commit_hash
update_production_branch
finalize_release_on_sentry

echo -e "Release deployment ${GREEN}succeeded${RESET_COLOR}."
