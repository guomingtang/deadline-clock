WITH seed(name, field, deadline) AS (
  VALUES
    ('ICDCS', 'Distributed Systems', '2026-01-14'),
    ('e-Energy Spring', 'Energy Informatics', '2026-01-29'),
    ('BuildSys', 'Building Systems', '2026-01-29'),
    ('SIGCOMM 2026', 'Computer Networks', '2026-02-06'),
    ('SC', 'High Performance Computing', '2025-04-14'),
    ('ASPLOS Spring', 'Computer Architecture and Systems', '2026-04-15'),
    ('NSDI Spring', 'Networked Systems', '2026-04-24'),
    ('SmartGridComm', 'Smart Grid Communications', '2026-04-26'),
    ('NeurIPS', 'Machine Learning', '2026-05-06'),
    ('EuroSys Spring', 'Computer Systems', '2026-05-15'),
    ('HotCarbon', 'Sustainable Computing', '2026-05-18'),
    ('ATC', 'Computer Systems', '2026-06-10'),
    ('HotNets', 'Computer Networks', '2025-07-01'),
    ('SoCC', 'Cloud Computing', '2026-07-07'),
    ('INFOCOM 2027', 'Computer Networks', '2026-07-31'),
    ('HPCA', 'Computer Architecture', '2025-08-01'),
    ('ASPLOS Fall', 'Computer Architecture and Systems', '2026-09-09'),
    ('e-Energy Fall', 'Energy Informatics', '2025-09-18'),
    ('NSDI Fall', 'Networked Systems', '2026-09-18'),
    ('EuroSys Fall', 'Computer Systems', '2026-09-25'),
    ('MLSys', 'Machine Learning Systems', '2025-10-30'),
    ('ISCA', 'Computer Architecture', '2024-11-22')
)
INSERT INTO conferences (name, field, deadline, source_name, deadline_status, manually_overridden, last_checked_at)
SELECT seed.name, seed.field, seed.deadline, 'Supplied reference', 'sourced', 0, CURRENT_TIMESTAMP
FROM seed
WHERE NOT EXISTS (
  SELECT 1 FROM conferences existing WHERE lower(existing.name) = lower(seed.name)
);
