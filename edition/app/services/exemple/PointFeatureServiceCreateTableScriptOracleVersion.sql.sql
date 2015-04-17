CREATE TABLE OPS$MICLAN02.POINT_FEATURE_SERVICE
(
  NO_SEQ_POINT_FEATURE_SERVICE   INTEGER,
  NO_SEQ_POINT_FEAT_SERVICE_REF  INTEGER,
  GEOM_P                         MDSYS.SDO_GEOMETRY,
  COMMENTAIRE                    VARCHAR2(200 BYTE),
  VALEUR_BOOL                    VARCHAR(5), -- Bool n'existe pas en Oracle, inscrire true/false
  VALEUR_DATE                    DATE,
  VALEUR_TIME                    TIMESTAMP(6),
  VALEUR_DATETIME                TIMESTAMP(9),
  VALEUR_INTEGER                 INTEGER,
  VALEUR_STRING                  VARCHAR2(10 BYTE),
  STATUT                         VARCHAR2(3 BYTE) DEFAULT 'V',
  JUSTIFICATION                  VARCHAR2(200 BYTE),
  IDENTIFIANT                    VARCHAR2(10 BYTE),
  DATE_MAJ                       TIMESTAMP(9)   DEFAULT systimestamp
);

CREATE SEQUENCE no_seq_pnt_feat_serv_seq MINVALUE 0;

ALTER TABLE point_feature_service modify (no_seq_point_feature_service integer  DEFAULT no_seq_pnt_feat_serv_seq.nextval);
ALTER TABLE point_feature_service modify (NO_SEQ_POINT_FEAT_SERVICE_REF integer DEFAULT no_seq_pnt_feat_serv_seq.currval);


/*
ALTER TABLE point_feature_service
  ADD CONSTRAINT enforce_srid_geom_p CHECK (st_srid(geom_p) = 32198);

ALTER TABLE point_feature_service
  ADD CONSTRAINT enforce_geotype_geom CHECK (geometrytype(geom_p) = 'POINT'::text OR geom_p IS NULL);
*/
CREATE OR REPLACE VIEW point_feature_service_v AS 
   SELECT 
    no_seq_point_feat_service_ref as no_seq_point_feature_service,
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
    
    
-- GRANT SELECT ON point_feature_service TO lecture_geo;

/*
SELECT populate_geometry_columns((SELECT oid FROM pg_class WHERE relname = 'point_feature_service_v'));
SELECT populate_geometry_columns((SELECT oid FROM pg_class WHERE relname = 'point_feature_service'));
*/


INSERT INTO USER_SDO_GEOM_METADATA(TABLE_NAME,
                                   COLUMN_NAME,
                                   DIMINFO,
                                   SRID)
                            VALUES('point_feature_service',
                                   'geom_p',
                                   MDSYS.SDO_DIM_ARRAY(MDSYS.SDO_DIM_ELEMENT('X',-83,-54,0.05),
                                   MDSYS.SDO_DIM_ELEMENT('Y',43,63,0.05)),
                                   4326);


INSERT INTO USER_SDO_GEOM_METADATA(TABLE_NAME,
                                   COLUMN_NAME,
                                   DIMINFO,
                                   SRID)
                            VALUES('point_feature_service_v',
                                   'geom_p',
                                   MDSYS.SDO_DIM_ARRAY(MDSYS.SDO_DIM_ELEMENT('X',-83,-54,0.05),
                                   MDSYS.SDO_DIM_ELEMENT('Y',43,63,0.05)),
                                   4326);




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


CREATE INDEX pnt_feat_service_pnt_geom_idx ON point_feature_service
       (geom_p)
        INDEXTYPE IS MDSYS.SPATIAL_INDEX
         PARAMETERS ('tablespace=TS_SAGA');


CREATE  INDEX pnt_feat_service_statut_idx ON point_feature_service (statut);

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
/*
SELECT *,st_astext(st_transform(geom_p,4326)) FROM point_feature_service where no_seq_point_feature_service_ref = 2 order by no_seq_point_feature_service;
SELECT ST_Distance(geom_p, ST_Transform(ST_SetSRID(ST_Point(-71.261569652704,46.872192570791), 4326), 32198)) < 2 as is_not_modif_geo from point_feature_service_v where no_seq_point_feature_service = '2'
SELECT (commentaire = 'parce que bon') as is_not_modif_descriptive FROM point_feature_service_v WHERE no_seq_point_feature_service = '2'
*/