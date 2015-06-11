#!/usr/bin/python
# -*- coding: utf-8 -*-

"""This script should fetch a complete list of links to sites from
afinabul.blog.cz - Juraj Smatana's list of conspiracy-theory webs

"""

import requests
import string
from lxml import etree, html
from urlparse import urlparse, urljoin

blacklist = ['https://facebook.com', 'https://twitter.com', 'https://google.com', 'https://youtube.com']

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
    return link.replace('www.', '')

def crawl_web(url, max_depth=None, max_breadth=None):
    """Crawls complete web and returns a ranked list of external references
    [{name: String, score: Int, visited: Bool, links: [{..}, ..]}, {..}, ..]
    """
    
    # define man obj
    if max_depth == None:
        max_depth = 1
    if max_breadth == None:
        max_breadth = -1
    if not url.startswith('http://'):
        url = 'http://' + url
    url = urlparse(url)
    return crawl_page('http://' + get_domain(url), max_breadth)

internal = []
external = {}

def in_internal(url):
    for item in internal:
        try:
            item[url]
            return internal.index(item)
        except:
            continue
        # return internal.index(item)

def crawl_page(url, max_breadth):
    url_obj = urlparse(url)
    try:
        page = requests.get(url)
	try:
	    page_tree = html.fromstring(page.text) #, parser=parser)
	    page_links = page_tree.xpath('//a')
	    if max_breadth != 0:
	        for link in page_links:
		    if 'href' in link.attrib:
		        src = urlparse(link.attrib['href'])
		        if src.netloc != '':
		    	    web = src.scheme + '://' + get_domain(src)
			    if web not in blacklist:
			        if web != url:
				    if web not in external:
				        external[web] = {'score': 1, 'visited': False, 'links': []}
				    else:
				        external[web]['score'] += 1
			        else:
				    if in_internal(urljoin(web, src.path)) is None:
				        print(urljoin(web, src.path))
				        internal.append({urljoin(web, src.path): False})
		        else:
			    if src.path != '/' and src.path:
			        path = urljoin(url, src.path)
			        if in_internal(path) is None:
				    print(path)
				    internal.append({path: False})
        except ValueError:
	    print(u'ValueError: for url: {}'.format(url))
    except:
        print(u'error while fetching the page {}, skipping'.format(url))
    for link in internal:
        if link[link.keys()[0]] == False:
            try:
                print(u'internal: {0}/{1}, external: {2}'.format(len([i for i in internal if i[i.keys()[0]] == False]), len(internal), len(external)))
                link[link.keys()[0]] = True
                if max_breadth > 0:
                    crawl_page(link.keys()[0], max_breadth - 1)
                elif max_breadth == -1:
                    crawl_page(link.keys()[0], max_breadth)

            except ValueError:
                continue
    return external

def crawl_from_seed():
    seeds = get_seed_list()
    webs = []
    nets = []
    for seed in seeds:
        if not seed.startswith('http://'):
            seed = 'http://' + seed
        webs.append(get_domain(urlparse(seed)))
    for web in webs:
        nets.append(
                {web: {'visited': False, 'score': 0, 'links': [crawl_web(web)]}}
        )
    return nets
