CREATE SEQUENCE pub_serial START 1;
CREATE TABLE pubs (
    pid         integer PRIMARY KEY DEFAULT nextval('pub_serial'),
    name        varchar(100) NOT NULL,
    street      varchar(100),
    town        varchar(100),
    postcode    varchar(10),
    url         text,
    about       text,
    latitude    REAL NOT null,
    longitude   REAL NOT NULL,
    updated     date,
    the_geom    geography(POINT,4326),
    brewery     integer,
    rating      integer DEFAULT 0,
    CONSTRAINT uc_pubs UNIQUE (name, latitude, longitude)
);

CREATE TABLE pub_ratings (
    uid integer references users(id),
    pid integer references pubs(pid),
    rating integer,
    CONSTRAINT uc_user_rating UNIQUE ( uid, pid )
);

CREATE SEQUENCE brewery_serial START 1;
CREATE TABLE breweries (
    bid         integer PRIMARY KEY DEFAULT nextval('brewery_serial'),
    name        varchar(100) NOT NULL,
    street      varchar(100) NOT NULL,
    town        varchar(100) NOT NULL,
    postcode    varchar(10) NOT NULL,
    url         text,
    about       text,
    updated     date,
    the_geog    geography(POINT,4326)
);

CREATE SEQUENCE beer_serial START 1;
CREATE TABLE beers (
    bid         integer PRIMARY KEY DEFAULT nextval('beer_serial'),
    name        varchar(100) NOT NULL,
    about       text,
    updated     date,
    brewery     integer
);
