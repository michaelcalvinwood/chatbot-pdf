#!/bin/bash

rsync -a --exclude "node_modules" . root@pdf.instantchatbot.net:/home/pdf/
