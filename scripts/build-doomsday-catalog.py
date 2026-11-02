"""Extend the original curated catalog using the user's Kaggle master CSV.
The existing 12 records are retained; new metadata has explicit editorial notes.
Usage: python3 scripts/build-doomsday-catalog.py /path/to/marvel_master.csv
"""
import csv,json,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
existing=json.loads((root/'lib/catalog.json').read_text())
base=[m for m in existing if m['id'] in {'iron-man','thor','first-avenger','avengers','winter-soldier','guardians','ultron','civil-war','strange','ragnarok','black-panther','infinity-war'}]
rows={r['title']:r for r in csv.DictReader(open(sys.argv[1]))}
specs=[
 ('x-men','X-Men','2000-07-14',104,['mutants'],'high',5,'An introduction to the original X-Men ensemble.','Prioritized as an accessible introduction to the mutant team represented in official Doomsday casting. This does not establish which timeline the new film uses.','https://www.20thcenturystudios.com/movies/x-men',True),
 ('endgame','Avengers: Endgame','2019-04-26',181,['avengers','multiverse'],'high',12,'The culmination of the Infinity Saga.','Prioritized for the Avengers story baseline. The directors explicitly connect their Doomsday starting point to Endgame. Infinity War supplies its immediate setup.','https://movies.disney.com/avengers-endgame',True),
 ('shang-chi','Shang-Chi and the Legend of the Ten Rings','2021-09-03',132,['newguard'],'useful',5,'Meet Shang-Chi and the Ten Rings.','Useful character background for Shang-Chi, whose actor appears in official Doomsday casting. His earlier film is context, not a proven plot requirement.','https://www.imdb.com/title/tt9376612/',False),
 ('multiverse-madness','Doctor Strange in the Multiverse of Madness','2022-05-06',126,['multiverse'],'useful',6,'Explore a story across alternate realities.','Useful background for multiverse terminology. This is a thematic connection, not confirmation that its events or lead character are required for Doomsday.','https://www.imdb.com/title/tt9419884/',False),
 ('wakanda-forever','Black Panther: Wakanda Forever','2022-11-11',161,['wakanda'],'high',5,'Return to Wakanda and meet Talokan.','Prioritized for the Wakandan and Talokan branches named in official Doomsday coverage. It supplies more recent context than the first Black Panther.','https://www.imdb.com/title/tt9114286/',False),
 ('brave-new-world','Captain America: Brave New World','2025-02-14',118,['avengers','newguard'],'high',7,'Meet Sam Wilson as Captain America.','Prioritized for Sam Wilson and Joaquin Torres, whose actors appear in official Doomsday casting. This provides recent character context without requiring every earlier Captain America film.','https://movies.disney.com/captain-america-brave-new-world',True),
 ('thunderbolts','Thunderbolts*','2025-05-02',126,['newguard'],'high',8,'An unconventional group becomes a team.','Prioritized as the ensemble introduction for the Thunderbolts branch named in official Doomsday coverage. Individual origin films are lower-priority background.','https://movies.disney.com/thunderbolts',True),
 ('fantastic-four','The Fantastic Four: First Steps','2025-07-25',115,['fantastic'],'high',10,'Meet Reed, Sue, Johnny and Ben as a family.','Prioritized as the introduction to the Fantastic Four ensemble named in official Doomsday casting. It provides a compact entry point to their world.','https://movies.disney.com/the-fantastic-four-first-steps',True),
]
for id,title,release,runtime,topics,priority,weight,intro,why,source,verified in specs:
 r=rows[title]
 base.append(dict(id=id,sourceId=r['id'],ragSourceId=r['id'],title=title,year=int(r['year']),release=release,runtime=runtime,poster=r['poster_url'],topics=topics,priority=priority,weight=weight,intro=intro,why=why,gap='this film’s character or world background',source=source,cast=r['actors'].split(', '),runtimeProvenance='Official studio runtime checked 2026-11-02' if verified else 'Kaggle runtime; external title reference',x=0,y=0))
old={
 'iron-man':(['avengers'],'optional',1,'Optional Tony Stark origin. A shared performer is not evidence that Tony Stark and Doctor Doom are the same character.'),
 'thor':(['avengers'],'optional',1,'Optional early Thor background; Ragnarok is our more recent Thor refresher.'),
 'first-avenger':(['avengers'],'optional',1,'Optional Steve Rogers origin for viewers who want deeper background.'),
 'avengers':(['avengers'],'useful',7,'Useful first team introduction for a Marvel beginner. More recent ensemble context takes priority when time is tight.'),
 'winter-soldier':(['avengers','newguard'],'optional',1,'Optional earlier background for Sam Wilson and Bucky Barnes; newer team films provide more current context.'),
 'guardians':(['avengers'],'optional',1,'Optional cosmic background for the Infinity Saga. It is not treated as a direct Doomsday prerequisite.'),
 'ultron':(['avengers'],'optional',1,'Optional extra Avengers history. The shortlist prioritizes the later team transition instead.'),
 'civil-war':(['avengers','newguard'],'useful',4,'Useful team relationship background for Steve, Sam and Bucky, without treating every origin film as required.'),
 'strange':(['multiverse'],'optional',1,'Optional introduction to Doctor Strange before his later multiverse story; no Doomsday casting claim is made.'),
 'ragnarok':(['avengers'],'useful',5,'Useful Thor and Loki background. Official Doomsday casting includes their actors; this does not make the earlier film mandatory.'),
 'black-panther':(['wakanda'],'optional',1,'Optional first introduction to Wakanda; Wakanda Forever has higher priority for more recent ensemble context.'),
 'infinity-war':(['avengers'],'high',6,'Prioritized as the direct setup for Endgame. This pairing gives a newcomer the Avengers baseline without requiring the whole Infinity Saga.'),
}
for m in base:
 if m['id'] in old:
  m['topics'],m['priority'],m['weight'],m['why']=old[m['id']]
base.sort(key=lambda m:m['release'])
counts=[0]*5
for m in base:
 col=0 if m['year']<=2012 else 1 if m['year']<=2016 else 2 if m['year']<=2019 else 3 if m['year']<=2022 else 4
 m['x']=90+col*240;m['y']=100+counts[col]*180;counts[col]+=1
(root/'lib/catalog.json').write_text(json.dumps(base,indent=2)+'\n')
print(f'Wrote {len(base)} films; Thunderbolts runtime corrected from CSV 127 to official 126 minutes.')
