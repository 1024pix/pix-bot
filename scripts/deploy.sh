#!/bin/bash

set -e

git --version

git config --global user.name "$GIT_USER_NAME"
git config --global user.email "$GIT_USER_EMAIL"
echo "Set Git global user information"

mkdir "$DIR_SCRIPTS"/tmp
cd "$DIR_SCRIPTS"/tmp
echo "Created and moved to dir $DIR_SCRIPTS/tmp"

git clone git@github.com:1024pix/test-deploy-from-slack.git
cd test-deploy-from-slack
echo "Cloned and moved into repository"

git commit --allow-empty -m 'TEST'
git push origin master
echo "pushed commit"
