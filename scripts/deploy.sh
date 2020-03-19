#!/usr/bin/env bash
git --version

cd /app/tmp
git init

git remote add git@github.com:1024pix/scalingo-app-manager.git
git commit --allow-empty -m 'TEST'
git push origin test-git-integration
