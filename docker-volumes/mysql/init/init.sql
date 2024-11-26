CREATE DATABASE IF NOT EXISTS test;
-- CREATE DATABASE IF NOT EXISTS 'hhplus_concert_ticketing_service';

-- 기존 root 사용자 삭제
DELETE FROM mysql.user WHERE User='root' AND Host='%';
FLUSH PRIVILEGES;

-- root 사용자 재생성 및 권한 부여
CREATE USER 'root'@'%' IDENTIFIED BY 'root1234';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;