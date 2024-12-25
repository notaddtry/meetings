-- Создаем базу данных
-- CREATE DATABASE IF NOT EXISTS meetings;
-- \connect meetings;

-- Очищаем таблицу 'Worker' перед созданием новой структуры
DROP TABLE IF EXISTS worker CASCADE;

-- Создаем таблицу 'Worker'
CREATE TABLE worker (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE
);

-- Индексируем поле email для ускорения поиска по электронной почте
CREATE UNIQUE INDEX idx_worker_email ON worker(email);

-- Очищаем таблицу 'Leader' перед созданием новой структуры
DROP TABLE IF EXISTS leader CASCADE;

-- Создаем таблицу 'Leader'
CREATE TABLE leader (
    id SERIAL PRIMARY KEY,
    worker_id INT REFERENCES worker(id) ON DELETE CASCADE
);

-- Очищаем таблицу 'Team' перед созданием новой структуры
DROP TABLE IF EXISTS team CASCADE;

-- Создаем таблицу 'Team'
CREATE TABLE team (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    leader_id INT REFERENCES leader(id) ON DELETE SET NULL
);

-- Индексируем поле title для ускорения поиска по названию команды
CREATE INDEX idx_team_title ON team(title);

-- Очищаем таблицу 'Role' перед созданием новой структуры
DROP TABLE IF EXISTS role CASCADE;

-- Создаем таблицу 'Role'
CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);

-- Индексируем поле title для ускорения поиска по названию роли
CREATE INDEX idx_role_title ON role(title);

-- Очищаем таблицу 'Access_Rights' перед созданием новой структуры
DROP TABLE IF EXISTS access_rights CASCADE;

-- Создаем таблицу 'Access_Rights'
CREATE TABLE access_rights (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255)
);

-- Индексируем поле title для ускорения поиска по названию права доступа
CREATE INDEX idx_access_rights_title ON access_rights(title);

-- Очищаем таблицу 'Role_Access_Rights' перед созданием новой структуры
DROP TABLE IF EXISTS role_access_rights CASCADE;

-- Создаем таблицу 'Role_Access_Rights'
CREATE TABLE role_access_rights (
    id SERIAL PRIMARY KEY,
    role_id INT REFERENCES role(id) ON DELETE CASCADE,
    access_rights_id INT REFERENCES access_rights(id) ON DELETE CASCADE
);

-- Очищаем таблицу 'Worker_Team_Role' перед созданием новой структуры
DROP TABLE IF EXISTS worker_team_role CASCADE;

-- Создаем таблицу 'Worker_Team_Role'
CREATE TABLE worker_team_role (
    id SERIAL PRIMARY KEY,
    worker_id INT REFERENCES worker(id) ON DELETE CASCADE,
    team_id INT REFERENCES team(id) ON DELETE CASCADE,
    role_id INT REFERENCES role(id) ON DELETE RESTRICT
);

-- Очищаем таблицу 'Meeting' перед созданием новой структуры
DROP TABLE IF EXISTS meeting CASCADE;

-- Создаем таблицу 'Meeting'
CREATE TYPE Type_Meeting AS ENUM ('Online', 'Offline');
CREATE TYPE Status AS ENUM ('Close', 'Awaiting');

CREATE TABLE meeting (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP,
    type Type_Meeting,
    status Status
);

-- Индексируем поле date для ускорения поиска по дате встречи
CREATE INDEX idx_meeting_date ON meeting(date);

-- Очищаем таблицу 'Notification' перед созданием новой структуры
DROP TABLE IF EXISTS notification CASCADE;

-- Создаем таблицу 'Notification'
CREATE TYPE Status_Notification AS ENUM ('Readed', 'Not Readed');

CREATE TABLE notification (
    id SERIAL PRIMARY KEY,
    meeting_id INT REFERENCES meeting(id) ON DELETE CASCADE,
    status Status_Notification
);

-- Очищаем таблицу 'Mark' перед созданием новой структуры
DROP TABLE IF EXISTS mark CASCADE;

-- Создаем таблицу 'Mark'
CREATE TABLE mark (
    id SERIAL PRIMARY KEY,
    meeting_id INT REFERENCES meeting(id) ON DELETE CASCADE,
    worker_id INT REFERENCES worker(id) ON DELETE CASCADE,
    can_be_in_meeting BOOLEAN
);

-- Очищаем таблицу 'Meeting_Worker_Relationship' перед созданием новой структуры
DROP TABLE IF EXISTS meeting_worker_relationship CASCADE;

-- Создаем таблицу 'Meeting_Worker_Relationship'
CREATE TABLE meeting_worker_relationship (
    id SERIAL PRIMARY KEY,
    meeting_id INT REFERENCES meeting(id) ON DELETE CASCADE,
    worker_id INT REFERENCES worker(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION create_team_function(
    in_title VARCHAR(255),
    in_leader_id INT
) RETURNS INT AS

$$
DECLARE
    new_team_id INT;
BEGIN
    -- Создаем новую команду
    INSERT INTO team(title, leader_id)
    VALUES(in_title, in_leader_id)
    RETURNING id INTO new_team_id;

    RETURN new_team_id;
END;

$$ LANGUAGE plpgsql;

-- Создаем функцию для создания собрания
CREATE OR REPLACE FUNCTION create_meeting_function(
    in_date TIMESTAMP,
    in_type Type_Meeting,
    in_status Status,
    in_participants INT[] -- Список участников
) RETURNS INT AS

$$
DECLARE
    new_meeting_id INT;
BEGIN
    -- Создаем новую встречу
    INSERT INTO meeting(date, type, status)
    VALUES(in_date, in_type, in_status)
    RETURNING id INTO new_meeting_id;

    -- Привязываем участников к встрече
    CALL add_workers_to_meeting(new_meeting_id, in_participants);

    RETURN new_meeting_id;
END;

$$ LANGUAGE plpgsql;

-- Добавляем работника в команду
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
        -- Связи нет, добавляем её
        INSERT INTO worker_team_role(team_id, worker_id, role_id)
        VALUES(in_team_id, in_worker_id, in_role_id);
    END IF;
END;

$$ LANGUAGE plpgsql;

-- Меняем роль у участника
CREATE OR REPLACE FUNCTION change_worker_role(
    in_team_id INT,
    in_worker_id INT,
    in_new_role_id INT
)
RETURNS VOID AS

$$
BEGIN
    -- Проверяем, существует ли связь в таблице `worker_team_role`
    IF EXISTS (SELECT 1 FROM worker_team_role WHERE team_id = in_team_id AND worker_id = in_worker_id) THEN
        -- Меняем роль участника
        UPDATE worker_team_role
           SET role_id = in_new_role_id
           WHERE team_id = in_team_id AND worker_id = in_worker_id;
    END IF;
END;

$$ LANGUAGE plpgsql;

-- Создаем процедуру для привязки участников к собранию
CREATE OR REPLACE PROCEDURE add_workers_to_meeting(
    in_meeting_id INT,
    in_worker_ids INT[]
)
LANGUAGE plpgsql
AS

$$
DECLARE
    w_id INT;
BEGIN
    FOREACH w_id IN ARRAY in_worker_ids LOOP
        -- Проверяем, существует ли связь в таблице meeting_worker_relationship
        IF NOT EXISTS (SELECT 1 FROM meeting_worker_relationship WHERE meeting_id = in_meeting_id AND worker_id = w_id) THEN
            -- Связи нет, добавляем её
            INSERT INTO meeting_worker_relationship(meeting_id, worker_id)
            VALUES(in_meeting_id, w_id);
        END IF;
    END LOOP;
END;

$$;


-- Данные для таблицы worker
INSERT INTO worker(username, email)
VALUES
('notaddtry', 'comatose.7777@mail.ru'),
('john doe', 'comatose.9999@mail.ru');

INSERT INTO leader(worker_id)
VALUES
((SELECT id FROM worker WHERE username = 'notaddtry'));

-- Данные для таблицы role
INSERT INTO role(title)
VALUES
('Leader'),
('Responsible'),
('Worker');

-- Данные для таблицы access_rights
INSERT INTO access_rights(title, description)
VALUES
('Create meeting', 'Право на создание встреч'),
('Create team', 'Право на создание команды'),
('Add member to team', 'Право на добавление участника в команду'),
('See meetings', 'Право на просмотр встреч'),
('See results', 'Право на просмотр отчетов');

-- Таблица role_access_rights
INSERT INTO role_access_rights(role_id, access_rights_id)
VALUES
((SELECT id FROM role WHERE title = 'Leader'), (SELECT id FROM access_rights WHERE title = 'Create meeting')),
((SELECT id FROM role WHERE title = 'Leader'), (SELECT id FROM access_rights WHERE title = 'Create team')),
((SELECT id FROM role WHERE title = 'Leader'), (SELECT id FROM access_rights WHERE title = 'Add member to team')),
((SELECT id FROM role WHERE title = 'Leader'), (SELECT id FROM access_rights WHERE title = 'See results')),
((SELECT id FROM role WHERE title = 'Responsible'), (SELECT id FROM access_rights WHERE title = 'Create meeting')),
((SELECT id FROM role WHERE title = 'Responsible'), (SELECT id FROM access_rights WHERE title = 'See meetings')),
((SELECT id FROM role WHERE title = 'Worker'), (SELECT id FROM access_rights WHERE title = 'See meetings'));

-- Создаём команду и назначаем руководителя в нее
SELECT create_team_function('Development Team', (SELECT id FROM leader WHERE worker_id = (SELECT id FROM worker WHERE username = 'notaddtry'))) AS team_id;

-- Добавляем участников в команду
SELECT add_worker_to_team((SELECT id FROM team WHERE title = 'Development Team'), (SELECT id FROM worker WHERE username = 'john doe'), (SELECT id FROM role WHERE title = 'Worker'));

-- Создаём три встречи и привязываем участников
SELECT create_meeting_function('2023-09-20 14:00:00', 'Online', 'Awaiting', ARRAY[(SELECT id FROM worker WHERE username = 'notaddtry'), (SELECT id FROM worker WHERE username = 'john doe')]) AS meeting_id;

-- Завершаем создание базы данных
-- COMMIT;

-- Закрываем подключение к базе данных
-- \disconnect team_meetings_db;