#!/usr/bin/python
# -*- coding: utf-8 -*-

"""This script should fetch a complete list of links to sites from
afinabul.blog.cz - Juraj Smatana's list of conspiracy-theory webs

"""

import json
import re
import requests
import string
import sys
from lxml import etree, html
from urlparse import urlparse, urljoin

blacklist = [
    'facebook.com',
    'twitter.com',
    'google.com',
    'youtube.com',
    'vimeo.com',
    'wordpress.com',
    'mojevideo.sk'
]


def get_seed_list():
    # load the contains of the webpage as a parsable object
    source_page = requests.get(
        'http://afinabul.blog.cz/1502/juraj-smatana-neuplny-ale-stale-'
        'aktualizovany-zoznam-webovych-stranok-ktorych-linkovanim-si-'
        'koledujete-o-moju-odbornu-starostlivost'
    )
    source_tree = html.fromstring(source_page.content)

    # parse the relevant divs, extract link src and append them to an Array
    article_elem = source_tree.xpath('//div[@class="articleText"]')[0]
    source_divs = article_elem.xpath('./div')[6:]

    delimiter_text = u'Články vysvetľujúce fungovanie propagandy:'
    web_list = []
    for div in source_divs:
        a = div.xpath('a')
        if(div.text == delimiter_text):
            break
        if len(a) > 0:
            web_list.append(a[0].text)

    return web_list


def get_domain(url):
    link = '.'.join(string.split(url.netloc, '.')[-2:])
    link = link.replace('http://', '')
    return link.replace('www.', '')


def fix_netloc(url):
    url = url.replace('www.', '')
    if not url.startswith('http://') and not url.startswith('https://'):
        return 'http://' + url
    else:
        return url


def crawl_web(url, max_depth=None, max_breadth=None):
    """Crawls complete web and returns a ranked list of external references
    [{name: String, score: Int, visited: Bool, links: [{..}, ..]}, {..}, ..]
    """

    if max_depth is None:
        max_depth = 1
    if max_breadth is None:
        max_breadth = 100

    internal = []
    external = []

    def in_array(url, array):
        for item in array:
            try:
                if item['name'] == url:
                    return array.index(item)
            except:
                continue

    def crawl_page(url):
        print('[parse_page]: ' + url)
        try:
            page = html.fromstring(requests.get(url).content)
            page_links = [
                urlparse(fix_netloc(i.attrib['href'])) for i in page.xpath('//a[@href]') if i.attrib['href'] != '#'
            ]
            # append links from JS code
            for i in page.xpath('//script'):
                if i.text is not None:
                    m = re.search('window.location = "([^"]+)', i.text)
                    if m is not None:
                        page_links.append(urlparse(fix_netloc(m.group(1))))
            for src in page_links:
                if bool(src.netloc) and 'javascript:' not in src.netloc:
                    web = get_domain(src)
                    if web not in blacklist:
                        if web != get_domain(urlparse(url)):
                            index = in_array(web, external)
                            if index is None:
                                external.append({'name': web, 'score': 1, 'visited': False, 'links': []})
                            else:
                                external[index]['score'] += 1
                        else:
                            if src.path and in_array(urljoin('http://' + web, src.path), internal) is None and len(internal) < max_breadth:
                                internal.append({'name': urljoin('http://' + web, src.path), 'visited': False})
                else:
                    if src.path != '/' and src.path and len(internal) < max_breadth:
                        path = urljoin(url, src.path)
                        if in_array(path, internal) is None:
                            internal.append({'name': path, 'visited': False})
        except ValueError:
            print(u'ValueError: for url: {0} - {1}'.format(url, sys.exc_info()))
        except:
            print(u'error while fetching the page {0}, skipping. - {1}'.format(url, sys.exc_info()))

    if not url.startswith('http://'):
        url = 'http://' + url
    url = urlparse(fix_netloc(url))
    crawl_page('http://' + get_domain(url))
    for link in internal:
        if link['visited'] is False:
            # print(u'internal: {0}/{1}, external: {2} - {3}'.format(len([i for i in internal if i['visited'] is False]), len(internal), len(external), external[len(external) - 1]['name']))
            link['visited'] = True
            crawl_page(link['name'])

    return external


def crawl_from_seed():
    seeds = get_seed_list()
    webs = []
    nets = []

    for seed in seeds:
        webs.append(urlparse(fix_netloc(seed)).netloc)
    for web in webs:
        if web not in blacklist:
            nets.append(
                {'name': web, 'visited': False, 'score': 0, 'links': crawl_web(web, 1, 250)}
            )
    return json.dumps(nets)
