#!/usr/bin/python
# -*- coding: utf-8 -*-

"""This script should fetch a complete list of links to sites from
afinabul.blog.cz - Juraj Smatana's list of conspiracy-theory webs

"""

import json
import requests
import string
import sys
from lxml import html
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
    source_tree = html.fromstring(source_page.text)

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
    if url.startswith('www.'):
        return 'http://' + url
    else:
        return url


def is_external(url):
    return True


def crawl_web(url, max_depth=1, max_breadth=250):
    """Crawls complete web and returns a ranked list of external references
    [{name: String, score: Int, visited: Bool, links: [{..}, ..]}, {..}, ..]
    """

    internal, external = [], []

    def in_array(url, array):
        for item in array:
            try:
                if item['name'] == url:
                    return array.index(item)
            except:
                continue

    def crawl_page(page):
        print('[parse_page]: ' + page)
        try:
            page_text = html.fromstring(requests.get(page).text)
            page_links = [
                urlparse(fix_netloc(i.attrib['href']))
                for i in page_text.xpath('//a[@href]')
            ]
            for src in page_links:
                if bool(src.netloc):
                    web = get_domain(src)
                    if web not in blacklist:
                        # wrong! url in this scope might be a local page!!!
                        if web != get_domain(url):
                            index = in_array(web, external)
                            if index is None:
                                external.append({
                                    'name': web,
                                    'score': 1,
                                    'visited': False,
                                    'links': [],
                                })
                            else:
                                external[index]['score'] += 1
                        else:
                            if src.path and in_array(
                                urljoin('http://'+web, src.path), internal
                            ) is None and len(internal) < max_breadth:
                                internal.append({
                                    'name': urljoin('http://'+web, src.path),
                                    'visited': False,
                                })
                elif src.path != '/' and src.path and \
                        len(internal) < max_breadth:
                    path = urljoin(url.netloc, src.path)
                    if in_array(path, internal) is None:
                        internal.append({'name': path, 'visited': False})
        except ValueError:
            print(u'ValueError: for url: {}'.format(url))
        except:
            print(
                u'error while fetching the page {0}, skipping. - {1}'
                .format(url, sys.exc_info()[0])
            )

    if not url.startswith('http://'):
        url = 'http://' + fix_netloc(url)
    url = urlparse(url)
    # print("crawl_page("'http://' + get_domain(url) + ")")
    crawl_page('http://' + get_domain(url))
    for link in internal:
        if link['visited'] is False:
            print(
                u'internal: {0}/{1} - {4}, external: {2} - {3}'
                .format(
                    len([i for i in internal if i['visited'] is False]),
                    len(internal),
                    len(external),
                    external[len(external)-1]['name'],
                    internal[len(internal)-1]['name'],
                )
            )
            link['visited'] = True
            # print("crawl_page(" + link['name'] + ")")
            crawl_page(link['name'])
    return external


def crawl_from_seed():
    webs = ['http://'+i for i in get_seed_list() if not i.startswith('http')]
    nets = []
    for web in webs:
        nets.append({
            'name': web,
            'visited': True,
            'score': 0,
            'links': crawl_web(web, 1, 250)
        })

    return json.dumps(nets)
