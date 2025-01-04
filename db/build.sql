DROP TABLE IF EXISTS worker CASCADE;

CREATE TABLE worker (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    chat_id BIGINT UNIQUE
);

CREATE UNIQUE INDEX idx_worker_username ON worker(username);

DROP TABLE IF EXISTS leader CASCADE;

CREATE TABLE leader (
    id SERIAL PRIMARY KEY,
    worker_id INT REFERENCES worker(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS team CASCADE;

CREATE TABLE team (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    leader_id INT REFERENCES leader(id) ON DELETE SET NULL
);

CREATE INDEX idx_team_title ON team(title);

DROP TABLE IF EXISTS role CASCADE;

CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

CREATE INDEX idx_role_title ON role(title);

DROP TABLE IF EXISTS access_rights CASCADE;

CREATE TABLE access_rights (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

CREATE INDEX idx_access_rights_title ON access_rights(title);

DROP TABLE IF EXISTS role_access_rights CASCADE;

CREATE TABLE role_access_rights (
    id SERIAL PRIMARY KEY,
    role_id INT REFERENCES role(id) ON DELETE CASCADE,
    access_rights_id INT REFERENCES access_rights(id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS worker_team_role CASCADE;

CREATE TABLE worker_team_role (
    id SERIAL PRIMARY KEY,
    worker_id INT REFERENCES worker(id) ON DELETE CASCADE,
    team_id INT REFERENCES team(id) ON DELETE CASCADE,
    role_id INT REFERENCES role(id) ON DELETE RESTRICT
);

DROP TABLE IF EXISTS meeting CASCADE;

CREATE TYPE Type_Meeting AS ENUM ('Online', 'Offline');

CREATE TABLE meeting (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP,
    type Type_Meeting,
    team_id INT REFERENCES team(id) ON DELETE CASCADE
);

CREATE INDEX idx_meeting_date ON meeting(date);

DROP TABLE IF EXISTS notification CASCADE;

CREATE TYPE Status_Notification AS ENUM ('Readed', 'Not Readed');

CREATE TABLE notification (
    id SERIAL PRIMARY KEY,
    meeting_id INT REFERENCES meeting(id) ON DELETE CASCADE,
    status Status_Notification
);

DROP TABLE IF EXISTS mark CASCADE;

CREATE TABLE mark (
    id SERIAL PRIMARY KEY,
    meeting_id INT REFERENCES meeting(id) ON DELETE CASCADE,
    worker_id INT REFERENCES worker(id) ON DELETE CASCADE,
    can_be_in_meeting BOOLEAN
);

DROP TABLE IF EXISTS meeting_worker_relationship CASCADE;

CREATE OR REPLACE FUNCTION create_team_function(
    in_title VARCHAR(255),
    in_leader_id INT
) RETURNS INT AS

$$
DECLARE
    new_team_id INT;
    leader_role_id INT;
BEGIN
    SELECT id INTO leader_role_id
    FROM role
    WHERE title = 'Leader';
    
    INSERT INTO team(title, leader_id)
    VALUES(in_title, in_leader_id)
    RETURNING id INTO new_team_id;

    INSERT INTO worker_team_role(worker_id, team_id, role_id)
    VALUES(in_leader_id, new_team_id, leader_role_id);

    RETURN new_team_id;
END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_meeting_function(
    in_date TIMESTAMP,
    in_type Type_Meeting,
    in_team_id INT
) RETURNS INT AS

$$
DECLARE
    new_meeting_id INT;
BEGIN
    INSERT INTO meeting(date, type, team_id)
    VALUES(in_date, in_type, in_team_id)
    RETURNING id INTO new_meeting_id;

    RETURN new_meeting_id;
END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_worker_to_team(
    in_team_id INT,
    in_worker_id INT,
    in_role_id INT
)
RETURNS VOID AS

$$
DECLARE
    w_id INT;
    r_id INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM worker_team_role WHERE team_id = in_team_id AND worker_id = in_worker_id) THEN
        INSERT INTO worker_team_role(team_id, worker_id, role_id)
        VALUES(in_team_id, in_worker_id, in_role_id);
    END IF;
END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION change_worker_role(
    in_team_id INT,
    in_worker_id INT,
    in_new_role_id INT
)
RETURNS VOID AS

$$
BEGIN
    IF EXISTS (SELECT 1 FROM worker_team_role WHERE team_id = in_team_id AND worker_id = in_worker_id) THEN
        UPDATE worker_team_role
           SET role_id = in_new_role_id
           WHERE team_id = in_team_id AND worker_id = in_worker_id;
    END IF;
END;

$$ LANGUAGE plpgsql;

INSERT INTO worker(username, email, chat_id)
VALUES
('notaddtry', 'comatose.7777@mail.ru', 229820673),
('meeting_test_1', 'comatose9999@proton.me', 7632038593);
 
INSERT INTO leader(worker_id)
VALUES
((SELECT id FROM worker WHERE username = 'notaddtry'));

INSERT INTO role(title)
VALUES
('Leader'),
('Responsible'),
('Worker');

INSERT INTO access_rights(title, description)
VALUES
('Create meeting', 'Право на создание встреч'),
('Create team', 'Право на создание команды'),
('Add member to team', 'Право на добавление участника в команду'),
('See meetings', 'Право на просмотр встреч'),
('See results', 'Право на просмотр отчетов');

INSERT INTO role_access_rights(role_id, access_rights_id)
VALUES
((SELECT id FROM role WHERE title = 'Leader'), (SELECT id FROM access_rights WHERE title = 'Create meeting')),
((SELECT id FROM role WHERE title = 'Leader'), (SELECT id FROM access_rights WHERE title = 'Create team')),
((SELECT id FROM role WHERE title = 'Leader'), (SELECT id FROM access_rights WHERE title = 'Add member to team')),
((SELECT id FROM role WHERE title = 'Leader'), (SELECT id FROM access_rights WHERE title = 'See results')),
((SELECT id FROM role WHERE title = 'Responsible'), (SELECT id FROM access_rights WHERE title = 'Create meeting')),
((SELECT id FROM role WHERE title = 'Responsible'), (SELECT id FROM access_rights WHERE title = 'See meetings')),
((SELECT id FROM role WHERE title = 'Worker'), (SELECT id FROM access_rights WHERE title = 'See meetings'));

SELECT create_team_function('Development Team', (SELECT id FROM leader WHERE worker_id = (SELECT id FROM worker WHERE username = 'notaddtry'))) AS team_id;

SELECT add_worker_to_team((SELECT id FROM team WHERE title = 'Development Team'), (SELECT id FROM worker WHERE username = 'meeting_test_1'), (SELECT id FROM role WHERE title = 'Worker'));

SELECT create_meeting_function('2023-09-20 14:00:00', 'Online', (SELECT id FROM team WHERE title = 'Development Team')) AS meeting_id;
SELECT create_meeting_function('2025-09-20 14:00:00', 'Offline', (SELECT id FROM team WHERE title = 'Development Team')) AS meeting_id;

INSERT INTO mark (meeting_id, worker_id, can_be_in_meeting)
VALUES
(1, 2, TRUE);