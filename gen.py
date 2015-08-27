#!/usr/bin/python
import conspi
import time

external_nets = conspi.crawl_from_seed()
with open('data/output_' + time.strftime('%Y-%m-%d'), 'wb') as file:
    file.write(external_nets)
