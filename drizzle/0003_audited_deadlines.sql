-- Re-audited 2026 calendar. The primary date is always the full-paper deadline.
WITH audited(old_name,new_name,deadline,abstract_deadline,timezone,source_name,source_url,website_url,status) AS (
  VALUES
  ('icdcs','ICDCS 2026','2026-01-21','2026-01-21','AoE','Official CFP','https://icdcs2026.icdcs.org/calls/call-for-papers/','https://icdcs2026.icdcs.org/','sourced'),
  ('e-energy spring','e-Energy 2026 — Winter','2026-01-29','2026-01-22','AoE','Official CFP','https://energy.acm.org/conferences/eenergy/2026/pages/cfp.php','https://energy.acm.org/conferences/eenergy/2026/','sourced'),
  ('buildsys','BuildSys 2026','2026-01-29','2026-01-22','AoE','Official CFP','https://buildsys.acm.org/2026/cfp/','https://buildsys.acm.org/2026/','sourced'),
  ('sigcomm 2026','SIGCOMM 2026','2026-02-06','2026-01-30','AoE','Official CFP','https://conferences.sigcomm.org/sigcomm/2026/cfp/','https://conferences.sigcomm.org/sigcomm/2026/','sourced'),
  ('sc','SC26','2026-04-08','2026-04-01','AoE','Official CFP','https://sc26.supercomputing.org/program/papers/','https://sc26.supercomputing.org/','sourced'),
  ('asplos spring','ASPLOS 2027 — April','2026-04-15',NULL,'AoE','Official CFP','https://www.asplos-conference.org/asplos2027/cfp/','https://www.asplos-conference.org/asplos2027/','sourced'),
  ('nsdi spring','NSDI 2027 — Spring','2026-04-23','2026-04-16','US EDT','Official CFP','https://www.usenix.org/conference/nsdi27/call-for-papers','https://www.usenix.org/conference/nsdi27','sourced'),
  ('smartgridcomm','SmartGridComm 2026','2026-05-03',NULL,'AoE','Official conference site','https://sgc2026.ieee-smartgridcomm.org/','https://sgc2026.ieee-smartgridcomm.org/','sourced'),
  ('neurips','NeurIPS 2026','2026-05-06','2026-05-04','AoE','Official CFP','https://neurips.cc/Conferences/2026/CallForPapers','https://neurips.cc/Conferences/2026','sourced'),
  ('eurosys spring','EuroSys 2027 — Spring','2026-05-14','2026-05-07','AoE','Official CFP','https://2027.eurosys.org/cfp.html','https://2027.eurosys.org/','sourced'),
  ('hotcarbon','HotCarbon 2026','2026-05-18','2026-05-11','AoE','Official CFP','https://hotcarbon.org/cfp','https://hotcarbon.org/','sourced'),
  ('atc','ATC 2026','2026-06-10',NULL,'AoE','Official CFP','https://sigops.org/s/conferences/atc/2026/cfp.html','https://www.usenix.org/conference/atc26','sourced'),
  ('socc','SoCC 2026 — Round 2','2026-07-14','2026-07-07','AoE','Official CFP','https://acmsocc.org/2026/papers.html','https://acmsocc.org/2026/','sourced'),
  ('hotnets','HotNets 2026','2026-07-16',NULL,'AoE','Official CFP','https://conferences.sigcomm.org/hotnets/2026/','https://conferences.sigcomm.org/hotnets/2026/','sourced'),
  ('hpca','HPCA 2027','2026-07-31','2026-07-24','AoE','Conference CFP','https://conf.researchr.org/track/hpca-2027/hpca-2027-main-conference','https://conf.researchr.org/home/hpca-2027','sourced'),
  ('infocom 2027','INFOCOM 2027','2026-07-31','2026-07-24','AoE','Official CFP','https://infocom2027.ieee-infocom.org/call-papers','https://infocom2027.ieee-infocom.org/','sourced'),
  ('asplos fall','ASPLOS 2027 — September','2026-09-09',NULL,'AoE','Official CFP','https://www.asplos-conference.org/asplos2027/cfp/','https://www.asplos-conference.org/asplos2027/','sourced'),
  ('nsdi fall','NSDI 2027 — Fall','2026-09-17','2026-09-10','US EDT','Official CFP','https://www.usenix.org/conference/nsdi27/call-for-papers','https://www.usenix.org/conference/nsdi27','sourced'),
  ('e-energy fall','e-Energy 2027 — Fall','2026-09-18','2026-09-11','AoE','Previous official CFP (+1 year)','https://energy.acm.org/conferences/eenergy/2026/pages/cfp.php','https://energy.acm.org/conferences/eenergy/','estimated'),
  ('eurosys fall','EuroSys 2027 — Fall','2026-09-24','2026-09-17','AoE','Official CFP','https://2027.eurosys.org/cfp.html','https://2027.eurosys.org/','sourced'),
  ('mlsys','MLSys 2027','2026-10-30',NULL,'America/Los_Angeles','Official dates','https://mlsys.org/Conferences/2027/Dates','https://mlsys.org/','sourced'),
  ('isca','ISCA 2027','2026-11-17','2026-11-10','AoE','Previous official CFP (+1 year)','https://iscaconf.org/isca2026/submit/callforpapers.php','https://iscaconf.org/','estimated')
)
UPDATE conferences SET
  name=(SELECT new_name FROM audited WHERE old_name=lower(conferences.name)),
  deadline=(SELECT deadline FROM audited WHERE old_name=lower(conferences.name)),
  abstract_deadline=(SELECT abstract_deadline FROM audited WHERE old_name=lower(conferences.name)),
  timezone=(SELECT timezone FROM audited WHERE old_name=lower(conferences.name)),
  source_name=(SELECT source_name FROM audited WHERE old_name=lower(conferences.name)),
  source_url=(SELECT source_url FROM audited WHERE old_name=lower(conferences.name)),
  website_url=(SELECT website_url FROM audited WHERE old_name=lower(conferences.name)),
  deadline_status=(SELECT status FROM audited WHERE old_name=lower(conferences.name)),
  last_checked_at=CURRENT_TIMESTAMP
WHERE manually_overridden=0 AND lower(name) IN (SELECT old_name FROM audited);
