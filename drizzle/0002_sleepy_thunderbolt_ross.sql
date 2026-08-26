ALTER TABLE `conferences` ADD `website_url` text;
--> statement-breakpoint
UPDATE conferences SET website_url = CASE lower(name)
  WHEN 'icdcs' THEN 'https://icdcs2026.icdcs.org/'
  WHEN 'e-energy spring' THEN 'https://energy.acm.org/conferences/eenergy/'
  WHEN 'e-energy fall' THEN 'https://energy.acm.org/conferences/eenergy/'
  WHEN 'buildsys' THEN 'https://buildsys.acm.org/2026/'
  WHEN 'sigcomm 2026' THEN 'https://conferences.sigcomm.org/sigcomm/2026/'
  WHEN 'sc' THEN 'https://supercomputing.org/'
  WHEN 'asplos spring' THEN 'https://www.asplos-conference.org/asplos2026/'
  WHEN 'asplos fall' THEN 'https://www.asplos-conference.org/asplos2026/'
  WHEN 'nsdi spring' THEN 'https://www.usenix.org/conference/nsdi26'
  WHEN 'nsdi fall' THEN 'https://www.usenix.org/conference/nsdi26'
  WHEN 'smartgridcomm' THEN 'https://www.comsoc.org/conferences-events/ieee-international-conference-communications-control-and-computing-7'
  WHEN 'neurips' THEN 'https://neurips.cc/'
  WHEN 'eurosys spring' THEN 'https://2026.eurosys.org/'
  WHEN 'eurosys fall' THEN 'https://2026.eurosys.org/'
  WHEN 'hotcarbon' THEN 'https://hotcarbon.org/'
  WHEN 'atc' THEN 'https://www.usenix.org/conference/atc26'
  WHEN 'hotnets' THEN 'https://conferences.sigcomm.org/hotnets/2025/'
  WHEN 'socc' THEN 'https://acmsocc.org/'
  WHEN 'infocom 2027' THEN 'https://infocom2027.ieee-infocom.org/'
  WHEN 'hpca' THEN 'https://hpca-conf.org/'
  WHEN 'mlsys' THEN 'https://mlsys.org/'
  WHEN 'isca' THEN 'https://iscaconf.org/'
  ELSE website_url
END;
