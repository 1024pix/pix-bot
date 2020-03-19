#!/usr/bin/env bash -e

mkdir .ssh

ssh-keyscan -H github.com > ~/.ssh/known_hosts

echo $SSH_KEY | base64 -d > ~/.ssh/id_rsa
chmod 400 ~/.ssh/id_rsa

/app/scripts/deploy.sh
