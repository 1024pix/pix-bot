#!/usr/bin/env bash -e
git --version

mkdir /app/tmp
echo 'created dir /app/tmp'
cd /app/tmp
echo 'moved to dir /app/tmp'

git config --global user.name $GIT_USER_NAME
git config --global user.email $GIT_USER_EMAIL
echo 'set user.name: ' $(git config --global user.name)
echo 'set user.email: ' $(git config --global user.email)

git clone git@github.com:1024pix/test-deploy-from-slack.git
echo 'cloned repo'

cd test-deploy-from-slack
echo 'moved to dir /app/tmp/test-deploy-from-slack'

git commit --allow-empty -m 'TEST'
git push origin master
echo 'pushed commit'
