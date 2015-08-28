#!/usr/bin/python
import conspi
import time

seeds = [
    'http://www.svetkolemnas.info', 'http://www.zvedavec.org',
    'http://www.ac24.cz', 'http://www.rodinajezaklad.sk/',
    'http://www.stopautogenocide.sk', 'http://www.osud.cz',
    'http://zemejas.cz/', 'http://czech.ruvr.ru/', 'http://slovak.ruvr.ru',
    'http://www.zemavek.sk/', 'http://panobcan.sk/',
    'http://www.czechfreepress.cz', 'http://vaseforum.sk/blog/',
    'http://www.slobodnyvysielac.sk', 'http://www.hlavnespravy.sk',
    'http://www.badatel.sk', 'http://www.protiprudu.org', 'http://www.beo.sk',
    'http://obcianskytribunal.sk/blog/', 'http://www.sho.sk',
    'http://www.voxvictims.com/', 'http://freeglobe.parlamentnilisty.cz/',
    'http://www.magnificat.sk/', 'http://www.freepub.cz',
    'http://vkpatriarhat.org.ua/cz/', 'http://www.spolocnostsbm.com/',
    'http://svobodnenoviny.eu', 'http://www.auria.sk/blog/',
    'http://afinabul.blog.cz/', 'http://www.dolezite.sk',
    'http://www.inespravy.sk/', 'http://www.tvina.sk/',
    'http://www.nadhlad.com/', 'http://www.ze-sveta.cz', 'http://nwoo.org',
    'http://orgo-net.blogspot.sk', 'http://www.cez-okno.net',
    'http://www.vlastnihlavou.cz/', 'http://www.neskutocne.sk/',
    'http://www.bezpolitickekorektnosti.cz', 'http://www.eiaktivity.sk',
    'http://www.nazorobcana.sk', 'http://www.alternews.cz',
    'http://pravdive.eu/index.php', 'http://www.aeronet.cz',
    'http://www.slovenskeslovo.sk/', 'http://www.svobodny-vysilac.cz',
    'http://www.vedy.sk', 'http://leva-net.webnode.cz',
    'http://www.novarepublika.cz', 'http://www.extraplus.sk',
    'http://www.maat.sk', 'http://www.noveslovo.sk',
    'http://www.lifenews.sk', 'http://www.isstras.eu', 'http://www.borrea.eu',
    'http://rodobrana.wordpress.com', 'http://www.chelemendik.sk',
    'http://protiproud.parlamentnilisty.cz',
    'http://echo24.cz', 'http://www.kontroverznirealita.cz',
    'http://medzicas.sk'
]
external_nets = conspi.crawl_from_seed(seeds)
with open('data/output_' + time.strftime('%Y-%m-%d'), 'wb') as file:
    file.write(external_nets)
