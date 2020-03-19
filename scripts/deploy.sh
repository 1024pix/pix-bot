#!/usr/bin/env bash
git --version

mkdir /app/tmp
cd /app/tmp

git config --global user.name $GIT_USER_NAME
git config --global user.email $GIT_USER_EMAIL
git clone git@github.com:1024pix/test-deploy-from-slack.git

cd test-deploy-from-slack

git commit --allow-empty -m 'TEST'
git push origin master
