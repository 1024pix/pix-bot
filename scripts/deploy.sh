#!/bin/bash

set -e

version=$1
echo "Deploying version $version…"

git config --global user.name "$GIT_USER_NAME"
git config --global user.email "$GIT_USER_EMAIL"
echo "Set Git global user information"

mkdir -p ~/.ssh
ssh-keyscan -H github.com > ~/.ssh/known_hosts
echo "$SSH_KEY" | base64 -d > ~/.ssh/github_rsa
chmod 400 ~/.ssh/id_rsa

tmp_dir=$(mktemp -d)
echo "Created temporary directory $tmp_dir"

git clone git@github.com:1024pix/test-deploy-from-slack.git "$tmp_dir"
echo "Cloned repository to temporary directory"

cd "$tmp_dir"
echo "Moved to repository folder"

git commit --allow-empty -m 'TEST'
git push origin master
echo "Pushed empty commit"

rm -rf "$tmp_dir"
echo "Deleted temporary folder"
