# --- Created by Ebean DDL
# To stop Ebean DDL generation, remove this comment and start using Evolutions

# --- !Ups

create table games (
  id                        integer auto_increment not null,
  host_user_id              integer,
  state                     integer,
  game_state_string         LONGTEXT,
  name                      varchar(255),
  constraint pk_games primary key (id))
;

create table Users (
  id                        integer auto_increment not null,
  name                      varchar(255),
  constraint uq_Users_name unique (name),
  constraint pk_Users primary key (id))
;


create table games_Users (
  games_id                       integer not null,
  Users_id                       integer not null,
  constraint pk_games_Users primary key (games_id, Users_id))
;



alter table games_Users add constraint fk_games_Users_games_01 foreign key (games_id) references games (id) on delete restrict on update restrict;

alter table games_Users add constraint fk_games_Users_Users_02 foreign key (Users_id) references Users (id) on delete restrict on update restrict;

# --- !Downs

SET FOREIGN_KEY_CHECKS=0;

drop table games;

drop table games_Users;

drop table Users;

SET FOREIGN_KEY_CHECKS=1;

