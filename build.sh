#!/bin/sh
service nginx restart
pm2-docker start /home/www/x-core/server/process.json

