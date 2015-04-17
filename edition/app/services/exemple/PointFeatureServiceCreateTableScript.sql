
CREATE TABLE point_feature_service (
   no_seq_point_feature_service integer primary key,
   no_seq_point_feature_service_ref integer REFERENCES point_feature_service(no_seq_point_feature_service),
   geom_p geometry,
   commentaire text,
   valeur_bool boolean,
   valeur_date date,
   valeur_time time,
   valeur_datetime timestamp,
   valeur_integer integer,
   valeur_string varchar(10),
   statut character varying(3) default 'V',
   justification text,
   identifiant character varying(10),
   date_maj TIMESTAMP DEFAULT now()
);
--ALTER TABLE point_feature_service OWNER TO admgeo1;

GRANT SELECT, INSERT, UPDATE, DELETE ON room_edition_point TO ecriture_geo;


CREATE SEQUENCE no_seq_point_feature_service_sequence MINVALUE 0;
GRANT USAGE ON no_seq_point_feature_service_sequence TO ecriture_geo;

ALTER TABLE point_feature_service ALTER COLUMN no_seq_point_feature_service SET DEFAULT nextval('no_seq_point_feature_service_sequence');
ALTER TABLE point_feature_service ALTER COLUMN no_seq_point_feature_service_ref SET DEFAULT currval('no_seq_point_feature_service_sequence');



ALTER TABLE point_feature_service
  ADD CONSTRAINT enforce_srid_geom_p CHECK (st_srid(geom_p) = 32198);

ALTER TABLE point_feature_service
  ADD CONSTRAINT enforce_geotype_geom CHECK (geometrytype(geom_p) = 'POINT'::text OR geom_p IS NULL);

CREATE OR REPLACE VIEW point_feature_service_v AS 
   SELECT 
	no_seq_point_feature_service_ref as no_seq_point_feature_service,
	geom_p,
	commentaire,
	valeur_bool,
	valeur_integer,
	valeur_string,
	statut,	
	justification,
	identifiant,
	date_maj
   FROM 
	point_feature_service
   WHERE
	point_feature_service.statut <> 'I';
	
	
GRANT SELECT ON point_feature_service TO lecture_geo;


SELECT populate_geometry_columns((SELECT oid FROM pg_class WHERE relname = 'point_feature_service_v'));
SELECT populate_geometry_columns((SELECT oid FROM pg_class WHERE relname = 'point_feature_service'));




CREATE INDEX point_feature_service_point_geom_idx
  ON point_feature_service
  USING gist
  (geom_p);
  
CREATE INDEX point_feature_service_statut_idx
  ON point_feature_service
  USING btree
  (statut)
  WITH (FILLFACTOR=75)
TABLESPACE ts_index;


-- DROPS

--DROP VIEW point_feature_service_v;
--DROP TABLE point_feature_service;
--DROP SEQUENCE no_seq_point_feature_service_sequence;


-- TESTS

--Ajouter une données pour les tests:
--INSERT INTO point_feature_service(commentaire,justification,geom_p) VALUES('test','test',ST_Transform(ST_SetSRID(ST_Point(-7932801.6468684,5921237.5410775),900913),32198));
--select
--SELECT * FROM point_feature_service;
--SELECT * FROM point_feature_service_v;
--SELECT * FROM point_feature_service_v;
--Update point_feature_service set statut='A' where statut = 'D';

SELECT *,st_astext(st_transform(geom_p,4326)) FROM point_feature_service where no_seq_point_feature_service_ref = 2 order by no_seq_point_feature_service;
SELECT ST_Distance(geom_p, ST_Transform(ST_SetSRID(ST_Point(-71.261569652704,46.872192570791), 4326), 32198)) < 2 as is_not_modif_geo from point_feature_service_v where no_seq_point_feature_service = '2'
SELECT (commentaire = 'parce que bon') as is_not_modif_descriptive FROM point_feature_service_v WHERE no_seq_point_feature_service = '2'