'''
sed -e 's/\r/\n/g' mobythes.aur | grep "^switch," | python -c "import sys; print \"\n\".join(map(lambda w: \"'%s',\" % w, sys.stdin.readlines()[0].strip().split(',')))"
'''


num_actions = 10
num_per_class = 1000

pool = [{} for i in range(num_actions)]

# 0 refresh
pool[0] = {
    "verbs" : ['refresh','activate','fresh up','freshen','freshen up','reanimate','recharge','recover','recreate','redo','refreshen','regenerate','renew','restore','resurrect','revive','set up','stimulate','ventilate'],
    "adjectives" : ['','current','active','open'],
    "objects" : ['','tab','page','site','website','screen'],
    "articles" : ['','the'],
    "suffixes" : ['','now','please','immediately']
}
# 1 open-tab
pool[1] = {
    "verbs" : ['open','activate','begin to','bring about','bring out','bring up','build','come up with','conceive','declare','display','enter','enter on','enter to','establish','expand','extend','form','get','get to','get up','give rise to','go to','head into','initiate','introduce','jump to','kick off','lay open','lay out','make','make up','manifest','present','pull out','release','reveal','set up','show','start','start in','start off','start up','switch on to','yield'],
    "adjectives" : ['','new','novel','fresh','another'],
    "objects" : ['','tab','page','site','website','screen'],
    "articles" : ['','a'],
    "suffixes" : ['','now','please','immediately']
}
# 2 close-tab
pool[2] = {
    "verbs" : ['close','abandon','abort','close down','close off','close up','conclude','discard','dispose','dump','end','finish off with','get done with','get rid of','kill','put away','shut','shut down','shut off','shut up','thrash','throw away','throw out'],
    "adjectives" : [],
    "objects" : [],
    "articles" : [],
    "suffixes" : []
}
# 3 switch-tab
pool[3] = {
    "verbs" : [],
    "adjectives" : [],
    "objects" : [],
    "articles" : [],
    "suffixes" : []
}
# 4 history
pool[4] = {
    "verbs" : [],
    "adjectives" : [],
    "objects" : [],
    "articles" : [],
    "suffixes" : []
}
# 5 go-to
pool[5] = {
    "verbs" : [],
    "adjectives" : [],
    "objects" : [],
    "articles" : [],
    "suffixes" : []
}
# 6 scroll
pool[6] = {
    "verbs" : [],
    "adjectives" : [],
    "objects" : [],
    "articles" : [],
    "suffixes" : []
}
# 7 click
pool[7] = {
    "verbs" : [],
    "adjectives" : [],
    "objects" : [],
    "articles" : [],
    "suffixes" : []
}
# 8 type
pool[8] = {
    "verbs" : [],
    "adjectives" : [],
    "objects" : [],
    "articles" : [],
    "suffixes" : []
}
# 9 read
pool[9] = {
    "verbs" : [],
    "adjectives" : [],
    "objects" : [],
    "articles" : [],
    "suffixes" : []
}

num_actions = 2 # for debug

import random
for c in range(num_actions):
    for i in range(num_per_class):
        vb = random.choice(pool[c]['verbs'])
        det = random.choice(pool[c]['articles'])
        adj = random.choice(pool[c]['adjectives'])
        np = random.choice(pool[c]['objects'])
        suf = random.choice(pool[c]['suffixes'])
        if len(np) == 0:
            det = ''
        elif len(adj) == 0:
            det = det if det != 'a' else 'a' if np[0] not in 'aeiou' else 'an'
        else:
            det = det if det != 'a' else 'a' if adj[0] not in 'aeiou' else 'an'

        print(" ".join(filter(lambda w: len(w),[vb,det,adj,np,suf])))
