#!/bin/bash

set -euo pipefail

CWD_DIR=$(pwd)
GITHUB_OWNER=${GITHUB_OWNER:-1024pix}
GITHUB_REPOSITORY=${GITHUB_REPOSITORY:-pix}
echo "${CWD_DIR}"

NEW_VERSION_TYPE=$1
BRANCH_NAME=${2:-dev}

source "${CWD_DIR}/scripts/common.sh"

function ensure_no_uncommited_changes_are_present() {
  if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}You have uncommitted changes!${RESET_COLOR} Please commit or stash your changes first.\n"
    git status
    exit 1
  fi
  echo "Git changes status OK"
}

function ensure_new_version_is_either_minor_or_patch_or_major() {
  if [ "${NEW_VERSION_TYPE}" != "patch" -a "${NEW_VERSION_TYPE}" != "minor" -a "${NEW_VERSION_TYPE}" != "major" ]; then
    echo -e "${RED}Wrong argument!${RESET_COLOR} Only ${GREEN}patch${RESET_COLOR}, ${GREEN}minor${RESET_COLOR} or ${GREEN}major${RESET_COLOR} is allowed.\n"
    exit 1
  fi

  echo "Version type OK"
}

function checkout() {
  git checkout "${BRANCH_NAME}" >>/dev/null 2>&1
}

function fetch_and_rebase() {
  git fetch --tags
  git pull --rebase
}

function update_pix_module_version() {
  (cd "${1}" && npm version "${NEW_VERSION_TYPE}" --git-tag-version=false >>/dev/null)
}

function update_all_pix_modules_version() {
  # TODO: refacto using dynamic package.json update => find . -name package.json  ! -path '*/node_modules/*'
  update_pix_module_version "admin/"
  update_pix_module_version "api/"
  update_pix_module_version "certif/"
  update_pix_module_version "mon-pix/"
  update_pix_module_version "orga/"
  update_pix_module_version "high-level-tests/load-testing/"
  update_pix_module_version "high-level-tests/e2e/"

  npm version "${NEW_VERSION_TYPE}" --git-tag-version=false >>/dev/null
  NEW_PACKAGE_VERSION=$(get_package_version)

  echo "Bumped versions in package files"
}

# Update when adding a new app
function create_a_release_commit() {
  git add  --update \
          CHANGELOG.md \
          package*.json \
          api/package*json \
          mon-pix/package*.json \
          orga/package*.json \
          certif/package*.json \
          admin/package*.json \
          high-level-tests/load-testing/package*.json \
          high-level-tests/e2e/package*.json
  git commit --message "[RELEASE] A ${NEW_VERSION_TYPE} is being released to ${NEW_PACKAGE_VERSION}."

  echo "Created the release commit"
}

function publish_release_on_sentry() {
  npx sentry-cli releases -o pix new -p pix-api "v${NEW_PACKAGE_VERSION}"
  npx sentry-cli releases -o pix new -p pix-app "v${NEW_PACKAGE_VERSION}"
  npx sentry-cli releases -o pix set-commits --commit "${GITHUB_OWNER}/${GITHUB_REPOSITORY}@v${NEW_PACKAGE_VERSION}" "v${NEW_PACKAGE_VERSION}"
  npx sentry-cli releases -o pix finalize "v${NEW_PACKAGE_VERSION}"

  echo "Published release on Sentry"
}

echo -e "Preparing a new release.\n"

echo "== Clone and move into Pix repository =="
clone_repository_and_move_inside
echo "== Validate context =="
ensure_no_uncommited_changes_are_present
ensure_new_version_is_either_minor_or_patch_or_major
echo "== Package release =="
checkout
fetch_and_rebase
update_all_pix_modules_version
complete_change_log
configure_git_user_information
create_a_release_commit
tag_release_commit
push_commit_and_tag_to_remote
publish_release_on_sentry

echo -e "Release publication ${GREEN}succeeded${RESET_COLOR}."
echo "v${NEW_PACKAGE_VERSION}"
