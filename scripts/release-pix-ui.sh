#!/bin/bash

GITHUB_OWNER=${GITHUB_OWNER:-1024pix}
GITHUB_REPOSITORY=${GITHUB_REPOSITORY:-pix-ui}
VERSION_TYPE=(${1:-minor})

echo "Version type ${VERSION_TYPE} for ${GITHUB_OWNER}/${GITHUB_REPOSITORY}"

function install_required_packages {
  echo "Install packages"
  npm ci --dev --no-optional
}

function complete_change_log() {
  node "${CWD_DIR}/scripts/get-pull-requests-to-release-in-prod.js" "${NEW_PACKAGE_VERSION}" "${GITHUB_OWNER}" "${GITHUB_REPOSITORY}"

  echo "Updated CHANGELOG.md"
}

function create_release {
  npm_arg="" && [[ -n "$VERSION_TYPE" ]]  && npm_arg=":$VERSION_TYPE"
  npm run release${npm_arg}
  NEW_PACKAGE_VERSION=$(get_package_version)
}

function create_a_release_commit() {
  git add  --update CHANGELOG.md
  git add  --update package*.json

  git commit --message "[RELEASE] A ${NEW_VERSION_TYPE} is being released to ${NEW_PACKAGE_VERSION}."

  echo "Created the release commit"
}

function checkout_master() {
  git checkout master >>/dev/null 2>&1

  echo "Checked out branch master"
}

function create_a_merge_commit_of_dev_into_master_and_tag_it() {
  git merge dev --no-edit
  git tag --annotate "v${NEW_PACKAGE_VERSION}" --message "v${NEW_PACKAGE_VERSION}"

  echo "Merged changes from dev into master and created annotated tag"
}

function push_commit_and_tag_to_remote_master() {
  git push origin master
  git push origin "v${NEW_PACKAGE_VERSION}"

  echo "Pushed changes on branch origin/master with tag"
}

function deploy_storybook_to_ghpages() {
  npm install
  npm run deploy-storybook
  echo "Deploying storybook on https://1024pix.github.io/pix-ui/"
}

echo "Start deploying version ${VERSION_TYPE}…"

echo "== Clone and move into Pix-ui repository =="
clone_repository_and_move_inside
configure_git_user_information

echo "== Package release =="
install_required_packages
complete_change_log
create_release
create_a_release_commit
push_commit_and_tag_to_remote_dev

echo "== Publish release =="
checkout_master
create_a_merge_commit_of_dev_into_master_and_tag_it
push_commit_and_tag_to_remote_master

echo "== Deploy Storybook to Github Pages =="
deploy_storybook_to_ghpages

echo -e "Release publication for ${GITHUB_OWNER}/${GITHUB_REPOSITORY} ${GREEN}succeeded${RESET_COLOR} (${VERSION_TYPE})."