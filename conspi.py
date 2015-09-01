#!/usr/bin/python
# -*- coding: utf-8 -*-

"""This script should fetch a complete list of links to sites from
afinabul.blog.cz - Juraj Smatana's list of conspiracy-theory webs

"""

import json
import requests
import sys
from lxml import html
from urlparse import urlparse, urljoin

blacklist = [
    'blogger.com',
    'creativecommons.org',
    'disqus.com',
    'drupal.org',
    'facebook.com',
    'twitter.com',
    'gnu.org',
    'google.com',
    'youtube.com',
    'vimeo.com',
    'weebly.com',
    'wordpress.com',
    'messenger.com',
    'mojevideo.sk',
    'drupal.org',
    'linked.in',
    'linkedin'
]

skip_schemes = [
    'javascript',
    'mailto'
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


def fix_netloc(netloc):
    if netloc.startswith('www.'):
        netloc = netloc.replace('www.', '')
    return netloc


def is_external(link, web):
    # print('netlocs: ' + link + ', ' + web.netloc)
    if link.scheme is '' or fix_netloc(link.netloc) == web.netloc:
        return False
    else:
        return True


def crawl_web(url, max_breadth=250):
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
        print(u'         [parse_page]: ' + page)
        try:
            page_text = html.fromstring(requests.get(page).content)
            page_links = [
                urlparse(fix_netloc(i.attrib['href']))
                for i in page_text.xpath('//a[@href]')
            ]
            for src in page_links:
                netloc = fix_netloc(src.netloc)
                if ([i for i in blacklist if i in netloc] != [] or
                        [i for i in skip_schemes if i in src.scheme] != []):
                    print('[blacklist]: skipping ' + netloc)
                    continue
                if is_external(src, url):
                    print(src)
                    index = in_array(netloc, external)
                    if index is None:
                        external.append({
                            'name': netloc,
                            'score': 1,
                            'visited': False,
                            'links': [],
                        })
                    else:
                        external[index]['score'] += 1
                else:
                    link = urljoin(
                        src.scheme + '://' + netloc,
                        src.path
                    )
                    if (src.path and in_array(link, internal) is None
                            and len(internal) < max_breadth):
                        internal.append({
                            'name': link,
                            'visited': False,
                        })
        except:
            print "Unexpected error:", sys.exc_info()[0], sys.exc_info()[1]

    url = urlparse(url)
    crawl_page(url.scheme + '://' + url.netloc)
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
            crawl_page(
                urljoin(
                    url.scheme + '://' + fix_netloc(url.netloc),
                    link['name']
                )
            )
    return external


def crawl_from_seed(seeds):
    nets = []
    for web in seeds:
        web = urlparse(web)
        nets.append({
            'name': fix_netloc(web.netloc),
            'visited': True,
            'score': 0,
            'links': crawl_web(
                web.scheme + '://' + fix_netloc(web.netloc), 500
                )
        })
    return json.dumps(nets)
