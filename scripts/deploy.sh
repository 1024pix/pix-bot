#!/bin/bash

set -euxo pipefail
REPOSITORY_NAME=pix

source "$(dirname $0)"/common.sh

RELEASE_TAG=$1

echo "Version number ${RELEASE_TAG}"

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

function update_production_branch {
    local annotated_version
    local annotated_tag_hash

    annotated_version="${RELEASE_TAG}^{}"
    annotated_tag_hash="$(git rev-parse --quiet "${annotated_version}")"
    git push -f origin "$annotated_tag_hash":prod

    echo "Pushed changes on branch origin/prod"
}

function finalize_release_on_sentry {
    npx sentry-cli releases -o pix finalize "${RELEASE_TAG}"
    echo "Finalized release on Sentry"
}

echo "Start deploying version ${RELEASE_TAG}…"

clone_repository_and_move_inside
configure_git_user_information
get_release_commit_hash
update_production_branch
finalize_release_on_sentry

echo -e "Release deployment ${GREEN}succeeded${RESET_COLOR}."
