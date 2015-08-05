-- Si ces fonction n'existent pas dans votre schema, commentez les lignes suivantes.
/*
DROP AGGREGATE IF EXISTS first(anyelement);
DROP AGGREGATE IF EXISTS last(anyelement);
DROP FUNCTION IF EXISTS first_agg(anyelement, anyelement);
DROP FUNCTION IF EXISTS last_agg(anyelement, anyelement);
*/
-- Si ces fonction n'existent pas dans votre schema, commentez les lignes suivantes.

DROP TABLE IF EXISTS igo_classe cascade;
DROP TABLE IF EXISTS igo_connexion cascade;
DROP TABLE IF EXISTS igo_connexion_type cascade;
DROP TABLE IF EXISTS igo_contexte cascade;
DROP TABLE IF EXISTS igo_geometrie_type cascade;
DROP TABLE IF EXISTS igo_service cascade;
DROP TABLE IF EXISTS igo_service_profil cascade;
DROP TABLE IF EXISTS igo_valeur cascade;
DROP TABLE IF EXISTS igo_utilisateur cascade;
DROP TABLE IF EXISTS igo_utilisateur_profil cascade;
DROP TABLE IF EXISTS igo_classification cascade;
DROP TABLE IF EXISTS igo_classe_entite cascade;
DROP TABLE IF EXISTS igo_contact cascade;
DROP TABLE IF EXISTS igo_attribut cascade;
DROP TABLE IF EXISTS igo_groupe cascade;
DROP TABLE IF EXISTS igo_groupe_couche cascade; -- vérifier pour l'ordre
DROP TABLE IF EXISTS igo_groupe_groupe cascade;
DROP TABLE IF EXISTS igo_permission cascade;
DROP TABLE IF EXISTS igo_organisme_responsable cascade;
DROP TABLE IF EXISTS igo_profil cascade;
DROP TABLE IF EXISTS igo_source_entite cascade;
DROP TABLE IF EXISTS igo_liste_valeur cascade;
DROP TABLE IF EXISTS igo_couche_contexte cascade;
DROP TABLE IF EXISTS igo_couche cascade;
DROP TABLE IF EXISTS igo_geometrie cascade;
DROP TABLE IF EXISTS igo_catalogue_csw cascade;

/*
CREATE FUNCTION first_agg(anyelement, anyelement) RETURNS anyelement
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
        SELECT $1;
$_$;

CREATE FUNCTION last_agg(anyelement, anyelement) RETURNS anyelement
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
        SELECT $2;
$_$;

CREATE AGGREGATE first(anyelement) (
    SFUNC = first_agg,
    STYPE = anyelement
);

CREATE AGGREGATE last(anyelement) (
    SFUNC = last_agg,
    STYPE = anyelement
);
*/

CREATE TABLE igo_attribut (
    id integer NOT NULL,
    geometrie_id integer,
    colonne character varying(50) NOT NULL,
    alias character varying(50),
    description character varying(2000),
    est_cle boolean,
    est_nom boolean,
    est_description boolean,
    est_filtre boolean,
    est_geometrie boolean,
    est_inclu boolean,
    liste_valeur_id integer,
    date_modif timestamp without time zone
);

CREATE SEQUENCE igo_attribut_geometrie_def_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_attribut_geometrie_def_id_seq OWNED BY igo_attribut.geometrie_id;

CREATE SEQUENCE igo_attribut_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_attribut_id_seq OWNED BY igo_attribut.id;

CREATE TABLE igo_catalogue_csw (
    id integer NOT NULL,
    url character varying(500),
    date_modif timestamp without time zone
);

CREATE SEQUENCE igo_catalogue_csw_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_catalogue_csw_id_seq OWNED BY igo_catalogue_csw.id;

CREATE TABLE igo_classe (
    id integer NOT NULL,
    couche_id integer,
    mf_class_def character varying(2000),
    date_modif timestamp without time zone,
    mf_class_z_order integer
);

CREATE TABLE igo_classe_entite (
    id integer NOT NULL,
    nom character varying(200),
    description character varying(2000),
    source_entite_id integer,
    classification_id integer,
    organisme_responsable_id integer,
    contact_id integer,
    remarque character varying(2000),
    catalogue_csw_id integer,
    date_modif timestamp without time zone
);

CREATE SEQUENCE igo_classe_entite_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_classe_entite_id_seq OWNED BY igo_classe_entite.id;

CREATE SEQUENCE igo_classe_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_classe_id_seq OWNED BY igo_classe.id;

CREATE TABLE igo_classification (
    id integer NOT NULL,
    nom character varying(50),
    description character varying(2000),
    code_geonetwork character varying(50),
    date_modif timestamp without time zone
);

CREATE SEQUENCE igo_classification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_classification_id_seq OWNED BY igo_classification.id;

CREATE TABLE igo_connexion (
    id integer NOT NULL,
    nom character varying(50),
    connexion character varying(2000),
    date_modif timestamp without time zone,
    connexion_type_id integer
);

CREATE SEQUENCE igo_connexion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_connexion_id_seq OWNED BY igo_connexion.id;

CREATE TABLE igo_connexion_type (
    id integer NOT NULL,
    nom character varying(50),
    connexion_type character varying(50),
    date_modif timestamp without time zone,
    geometrie_type character varying(1)
);

CREATE SEQUENCE igo_connexion_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_connexion_type_id_seq OWNED BY igo_connexion_type.id;

CREATE TABLE igo_contact (
    id integer NOT NULL,
    organisme_responsable_id integer,
    prenom character varying(50),
    nom character varying(50),
    poste character varying(70),
    no_telephone character varying(30),
    courriel character varying(100),
    est_membre_acrigeo boolean,
    remarque character varying(2000),
    date_modif timestamp without time zone
);

CREATE SEQUENCE igo_contact_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_contact_id_seq OWNED BY igo_contact.id;

CREATE TABLE igo_contexte (
    id integer NOT NULL,
    mode character(1),
    "position" character varying(50),
    zoom numeric(4,2),
    code character varying(100),
    nom character varying(100),
    description character varying(2000),
    mf_map_def character varying(2000),
    date_modif timestamp without time zone,
    json character varying(2000),
    mf_map_projection character varying(200),
    mf_map_meta_onlineresource character varying(1000) NOT NULL,
    ind_ordre_arbre character varying(1),
    profil_proprietaire_id integer
);

CREATE SEQUENCE igo_contexte_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_contexte_id_seq OWNED BY igo_contexte.id;

CREATE TABLE igo_couche (
    id integer NOT NULL,
    type character(1),
    description character varying(2000),
    geometrie_id integer,
--    groupe_id integer,
    vue_validation character varying(250),
    mf_layer_name character varying(150),
    mf_layer_group character varying(300),
    mf_layer_meta_name character varying(150),
    mf_layer_filtre character varying(1000),
    mf_layer_minscale bigint,
    mf_layer_maxscale bigint,
    mf_layer_labelminscale bigint,
    mf_layer_labelmaxscale bigint,
    mf_layer_def character varying(2000),
    mf_layer_meta_def character varying(2000),
    service_tuile character varying(500),
    fiche_csw_id character varying(50),
    mf_layer_meta_wfs_max_feature integer,
    est_fond_de_carte boolean,
    date_modif timestamp without time zone,
    mf_layer_opacity integer,
    mf_layer_meta_title character varying(150),
    mf_layer_meta_group_title character varying(200),
    mf_layer_labelitem character varying(50),
    mf_layer_meta_z_order integer,
    print_option_url character varying(200),
    print_option_layer_name character varying(100),
    max_zoom_level integer,
    min_zoom_level integer
);

CREATE TABLE igo_couche_contexte (
    contexte_id integer,
    couche_id integer,
    groupe_id integer,
    arbre_id character varying(50),
    est_visible boolean DEFAULT false,
    est_active boolean DEFAULT false,
    ind_fond_de_carte character(1),
    mf_layer_meta_name character varying(150),
    mf_layer_meta_title character varying(150),
    mf_layer_meta_group_title character varying(200),
    mf_layer_class_def character varying(500),
    date_modif timestamp without time zone,
    id integer NOT NULL,
    est_exclu boolean DEFAULT false,
    attribut_id integer,
    mf_layer_meta_z_order integer,
    mf_layer_filtre character varying(1000)
);

CREATE SEQUENCE igo_couche_contexte_contexte_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_couche_contexte_contexte_id_seq OWNED BY igo_couche_contexte.contexte_id;

CREATE SEQUENCE igo_couche_contexte_couche_def_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_couche_contexte_couche_def_id_seq OWNED BY igo_couche_contexte.couche_id;

CREATE SEQUENCE igo_couche_contexte_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_couche_contexte_id_seq OWNED BY igo_couche_contexte.id;

CREATE SEQUENCE igo_couche_geometrie_def_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_couche_geometrie_def_id_seq OWNED BY igo_couche.geometrie_id;
 
CREATE SEQUENCE igo_couche_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_couche_id_seq OWNED BY igo_couche.id;

CREATE TABLE igo_geometrie (
    id integer NOT NULL,
    classe_entite_id integer,
    geometrie_type_id integer NOT NULL,
    vue_defaut character varying(250),
    date_chargement timestamp without time zone,
    connexion_id integer,
    echelle_prod character varying(50),
    remarque character varying(2000),
    date_modif timestamp without time zone,
    ind_inclusion character varying(1),
    mf_layer_data character varying(500),
    mf_layer_projection character varying(200),
    mf_layer_meta_z_order integer
);

CREATE SEQUENCE igo_geometrie_classe_entite_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_geometrie_classe_entite_id_seq OWNED BY igo_geometrie.classe_entite_id;

CREATE SEQUENCE igo_geometrie_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_geometrie_id_seq OWNED BY igo_geometrie.id;

CREATE TABLE igo_geometrie_type (
    id integer NOT NULL,
    nom character varying(50),
    layer_type character varying(50),
    date_modif timestamp without time zone,
    mf_layer_meta_z_order integer
);

CREATE SEQUENCE igo_geometrie_type_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_geometrie_type_id_seq OWNED BY igo_geometrie_type.id;

CREATE TABLE igo_groupe (
    id integer NOT NULL,
    nom character varying(150),
    description character varying(200),
    date_modif timestamp without time zone,
    profil_proprietaire_id integer,
    mf_layer_meta_z_order integer,
    est_exclu_arbre boolean
);

CREATE TABLE igo_groupe_couche
(
  id integer NOT NULL ,
  groupe_id integer,
  couche_id integer
);

CREATE SEQUENCE igo_groupe_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_groupe_id_seq OWNED BY igo_groupe.id;

drop sequence IF EXISTS igo_groupe_couche_id_seq;
CREATE SEQUENCE igo_groupe_couche_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_groupe_couche_id_seq OWNED BY igo_groupe_couche.id;


CREATE TABLE igo_groupe_groupe
(
  id integer NOT NULL ,
  groupe_id integer,
  parent_groupe_id integer
);

drop sequence if exists igo_groupe_groupe_id_seq;
CREATE SEQUENCE igo_groupe_groupe_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_groupe_groupe_id_seq OWNED BY igo_groupe_groupe.id;


CREATE TABLE igo_liste_valeur (
    id integer NOT NULL,
    description character varying(2000),
    date_modif timestamp without time zone
);

CREATE SEQUENCE igo_liste_valeur_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_liste_valeur_id_seq OWNED BY igo_liste_valeur.id;

CREATE TABLE igo_organisme_responsable (
    id integer NOT NULL,
    acronyme character(10),
    nom character varying(100),
    url character varying(500),
    contact_id integer,
    remarque character varying(2000),
    date_modif timestamp without time zone
);

CREATE SEQUENCE igo_organisme_responsable_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_organisme_responsable_id_seq OWNED BY igo_organisme_responsable.id;

CREATE TABLE igo_permission (
    id integer NOT NULL,
    profil_id integer,
    couche_id integer,
    est_lecture boolean DEFAULT false,
    est_analyse boolean DEFAULT false,
    est_ecriture boolean DEFAULT false,
    est_export boolean DEFAULT false,
    est_association boolean DEFAULT false,
    date_modif timestamp without time zone,
    groupe_id integer,
    est_exclu boolean DEFAULT false,
    attribut_id integer,
    mf_layer_filtre character varying(200)
);

CREATE SEQUENCE igo_permission_couche_def_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_permission_couche_def_id_seq OWNED BY igo_permission.couche_id;

CREATE SEQUENCE igo_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_permission_id_seq OWNED BY igo_permission.id;

CREATE SEQUENCE igo_permission_profil_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_permission_profil_id_seq OWNED BY igo_permission.profil_id;

CREATE TABLE igo_profil (
    id integer NOT NULL,
    nom character varying(50) NOT NULL,
    profil_proprietaire_id integer,
    date_modif timestamp without time zone
);

CREATE SEQUENCE igo_profil_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_profil_id_seq OWNED BY igo_profil.id;

CREATE TABLE igo_service (
    id integer NOT NULL,
    nom character varying(50),
    description character varying(2000),
    wsdl character varying(500),
    date_modif timestamp without time zone
);

CREATE SEQUENCE igo_service_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_service_id_seq OWNED BY igo_service.id;

CREATE TABLE igo_service_profil (
    profil_id integer,
    service_id integer,
    date_modif timestamp without time zone,
    id integer NOT NULL
);

CREATE SEQUENCE igo_service_profil_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE igo_service_profil_id_seq OWNED BY igo_service_profil.id;

CREATE TABLE igo_source_entite (
    id integer NOT NULL,
    url character varying(500) NOT NULL,
    organisme_responsable_id integer,
    date_modif timestamp without time zone
);

CREATE SEQUENCE igo_source_entite_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_source_entite_id_seq OWNED BY igo_source_entite.id;

CREATE TABLE igo_utilisateur (
    id integer NOT NULL,
    nom character varying(50),
    est_admin boolean NOT NULL,
    est_pilote boolean NOT NULL,
    date_modif timestamp without time zone
);

CREATE SEQUENCE igo_utilisateur_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_utilisateur_id_seq OWNED BY igo_utilisateur.id;

CREATE TABLE igo_utilisateur_profil (
    profil_id integer NOT NULL,
    utilisateur_id integer NOT NULL,
    date_modif timestamp without time zone,
    id integer NOT NULL
);

CREATE SEQUENCE igo_utilisateur_profil_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_utilisateur_profil_id_seq OWNED BY igo_utilisateur_profil.id;

CREATE TABLE igo_valeur (
    id integer NOT NULL,
    description character varying(2000),
    liste_valeur_id integer,
    valeur character varying(200),
    date_modif timestamp without time zone
);

DROP SEQUENCE IF EXISTS igo_valeur_id_seq;
CREATE SEQUENCE igo_valeur_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE igo_valeur_id_seq OWNED BY igo_valeur.id;

ALTER TABLE ONLY igo_attribut ALTER COLUMN id SET DEFAULT nextval('igo_attribut_id_seq'::regclass);

ALTER TABLE ONLY igo_catalogue_csw ALTER COLUMN id SET DEFAULT nextval('igo_catalogue_csw_id_seq'::regclass);

ALTER TABLE ONLY igo_classe ALTER COLUMN id SET DEFAULT nextval('igo_classe_id_seq'::regclass);

ALTER TABLE ONLY igo_classe_entite ALTER COLUMN id SET DEFAULT nextval('igo_classe_entite_id_seq'::regclass);

ALTER TABLE ONLY igo_classification ALTER COLUMN id SET DEFAULT nextval('igo_classification_id_seq'::regclass);

ALTER TABLE ONLY igo_connexion ALTER COLUMN id SET DEFAULT nextval('igo_connexion_id_seq'::regclass);

ALTER TABLE ONLY igo_connexion_type ALTER COLUMN id SET DEFAULT nextval('igo_connexion_type_id_seq'::regclass);

ALTER TABLE ONLY igo_contact ALTER COLUMN id SET DEFAULT nextval('igo_contact_id_seq'::regclass);

ALTER TABLE ONLY igo_contexte ALTER COLUMN id SET DEFAULT nextval('igo_contexte_id_seq'::regclass);

ALTER TABLE ONLY igo_couche ALTER COLUMN id SET DEFAULT nextval('igo_couche_id_seq'::regclass);

ALTER TABLE ONLY igo_couche_contexte ALTER COLUMN id SET DEFAULT nextval('igo_couche_contexte_id_seq'::regclass);

ALTER TABLE ONLY igo_geometrie ALTER COLUMN id SET DEFAULT nextval('igo_geometrie_id_seq'::regclass);

ALTER TABLE ONLY igo_geometrie_type ALTER COLUMN id SET DEFAULT nextval('igo_geometrie_type_id_seq'::regclass);

ALTER TABLE ONLY igo_groupe ALTER COLUMN id SET DEFAULT nextval('igo_groupe_id_seq'::regclass);

ALTER TABLE ONLY igo_groupe_couche ALTER COLUMN id SET DEFAULT nextval('igo_groupe_couche_id_seq'::regclass);

ALTER TABLE ONLY igo_groupe_groupe ALTER COLUMN id SET DEFAULT nextval('igo_groupe_groupe_id_seq'::regclass);

ALTER TABLE ONLY igo_liste_valeur ALTER COLUMN id SET DEFAULT nextval('igo_liste_valeur_id_seq'::regclass);

ALTER TABLE ONLY igo_organisme_responsable ALTER COLUMN id SET DEFAULT nextval('igo_organisme_responsable_id_seq'::regclass);

ALTER TABLE ONLY igo_permission ALTER COLUMN id SET DEFAULT nextval('igo_permission_id_seq'::regclass);

ALTER TABLE ONLY igo_profil ALTER COLUMN id SET DEFAULT nextval('igo_profil_id_seq'::regclass);

ALTER TABLE ONLY igo_service ALTER COLUMN id SET DEFAULT nextval('igo_service_id_seq'::regclass);

ALTER TABLE ONLY igo_service_profil ALTER COLUMN id SET DEFAULT nextval('igo_service_profil_id_seq'::regclass);

ALTER TABLE ONLY igo_source_entite ALTER COLUMN id SET DEFAULT nextval('igo_source_entite_id_seq'::regclass);

ALTER TABLE ONLY igo_utilisateur ALTER COLUMN id SET DEFAULT nextval('igo_utilisateur_id_seq'::regclass);

ALTER TABLE ONLY igo_utilisateur_profil ALTER COLUMN id SET DEFAULT nextval('igo_utilisateur_profil_id_seq'::regclass);

ALTER TABLE ONLY igo_valeur ALTER COLUMN id SET DEFAULT nextval('igo_valeur_id_seq'::regclass);

ALTER TABLE ONLY igo_connexion_type
    ADD CONSTRAINT "PK_connexion_type" PRIMARY KEY (id);

ALTER TABLE ONLY igo_attribut
    ADD CONSTRAINT pk_attribut PRIMARY KEY (id);

ALTER TABLE ONLY igo_source_entite
    ADD CONSTRAINT pk_catalogue PRIMARY KEY (id);

ALTER TABLE ONLY igo_catalogue_csw
    ADD CONSTRAINT pk_catalogue_csw PRIMARY KEY (id);

ALTER TABLE ONLY igo_classe
    ADD CONSTRAINT pk_classe PRIMARY KEY (id);

ALTER TABLE ONLY igo_classe_entite
    ADD CONSTRAINT pk_classe_entite PRIMARY KEY (id);

ALTER TABLE ONLY igo_classification
    ADD CONSTRAINT pk_classification PRIMARY KEY (id);

ALTER TABLE ONLY igo_connexion
    ADD CONSTRAINT pk_connexion PRIMARY KEY (id);

ALTER TABLE ONLY igo_contact
    ADD CONSTRAINT pk_contact PRIMARY KEY (id);

ALTER TABLE ONLY igo_contexte
    ADD CONSTRAINT pk_contexte PRIMARY KEY (id);

ALTER TABLE ONLY igo_couche
    ADD CONSTRAINT pk_couche PRIMARY KEY (id);

ALTER TABLE ONLY igo_couche_contexte
    ADD CONSTRAINT pk_couche_contexte PRIMARY KEY (id);

ALTER TABLE ONLY igo_geometrie
    ADD CONSTRAINT pk_geometrie PRIMARY KEY (id);

ALTER TABLE ONLY igo_geometrie_type
    ADD CONSTRAINT pk_geometrie_type PRIMARY KEY (id);

ALTER TABLE ONLY igo_groupe
    ADD CONSTRAINT pk_groupe PRIMARY KEY (id);

ALTER TABLE ONLY igo_groupe_couche
    ADD CONSTRAINT pk_groupe_couche PRIMARY KEY (id);

ALTER TABLE ONLY igo_groupe_groupe
    ADD CONSTRAINT pk_groupe_groupe PRIMARY KEY (id);

ALTER TABLE ONLY igo_liste_valeur
    ADD CONSTRAINT pk_liste_valeur PRIMARY KEY (id);

ALTER TABLE ONLY igo_organisme_responsable
    ADD CONSTRAINT pk_organisme_responsable PRIMARY KEY (id);

ALTER TABLE ONLY igo_permission
    ADD CONSTRAINT pk_permission PRIMARY KEY (id);

ALTER TABLE ONLY igo_profil
    ADD CONSTRAINT pk_profil PRIMARY KEY (id);

ALTER TABLE ONLY igo_service
    ADD CONSTRAINT pk_service_cartographique PRIMARY KEY (id);

ALTER TABLE ONLY igo_service_profil
    ADD CONSTRAINT pk_service_profil PRIMARY KEY (id);

ALTER TABLE ONLY igo_utilisateur
    ADD CONSTRAINT pk_utilisateur PRIMARY KEY (id);

ALTER TABLE ONLY igo_utilisateur_profil
    ADD CONSTRAINT pk_utilisateur_profil PRIMARY KEY (id);

ALTER TABLE ONLY igo_valeur
    ADD CONSTRAINT pk_valeur PRIMARY KEY (id);

ALTER TABLE ONLY igo_contexte
    ADD CONSTRAINT uq_contexte_code UNIQUE (code);

ALTER TABLE ONLY igo_couche
    ADD CONSTRAINT uq_couche_mf_layer_name UNIQUE (mf_layer_name);


CREATE INDEX igo_attribut_id_idx ON igo_attribut USING btree (geometrie_id);

CREATE INDEX igo_couche_contexte_contexte_id_idx ON igo_couche_contexte USING btree (contexte_id);

CREATE INDEX igo_couche_contexte_couche_id_contexte_id_est_exclu_idx ON igo_couche_contexte USING btree (couche_id, contexte_id, est_exclu);

CREATE INDEX igo_couche_contexte_couche_id_idx ON igo_couche_contexte USING btree (couche_id);

CREATE INDEX igo_couche_contexte_est_exclu_idx ON igo_couche_contexte USING btree (est_exclu);

CREATE INDEX igo_couche_contexte_groupe_id_idx ON igo_couche_contexte USING btree (groupe_id);

CREATE INDEX igo_permission_couche_id_idx ON igo_permission USING btree (couche_id);

CREATE INDEX igo_permission_couche_id_profil_id_est_exclu_idx ON igo_permission USING btree (couche_id, profil_id, est_exclu);

CREATE INDEX igo_permission_est_exclu_idx ON igo_permission USING btree (est_exclu);

CREATE INDEX igo_permission_profil_id_idx ON igo_permission USING btree (profil_id);

ALTER TABLE ONLY igo_connexion
    ADD CONSTRAINT "FK_connexion_connexion_type" FOREIGN KEY (connexion_type_id) REFERENCES igo_connexion_type(id);

ALTER TABLE ONLY igo_attribut
    ADD CONSTRAINT fk_attribut_geometrie FOREIGN KEY (geometrie_id) REFERENCES igo_geometrie(id);

ALTER TABLE ONLY igo_attribut
    ADD CONSTRAINT fk_attribut_liste_valeur FOREIGN KEY (liste_valeur_id) REFERENCES igo_liste_valeur(id);

ALTER TABLE ONLY igo_classe
    ADD CONSTRAINT fk_classe_couche FOREIGN KEY (couche_id) REFERENCES igo_couche(id);

ALTER TABLE ONLY igo_classe_entite
    ADD CONSTRAINT fk_classe_entite_catalogue_csw FOREIGN KEY (catalogue_csw_id) REFERENCES igo_catalogue_csw(id);

ALTER TABLE ONLY igo_classe_entite
    ADD CONSTRAINT fk_classe_entite_classification FOREIGN KEY (classification_id) REFERENCES igo_classification(id);

ALTER TABLE ONLY igo_classe_entite
    ADD CONSTRAINT fk_classe_entite_contact FOREIGN KEY (contact_id) REFERENCES igo_contact(id);

ALTER TABLE ONLY igo_classe_entite
    ADD CONSTRAINT fk_classe_entite_organisme_responsable FOREIGN KEY (organisme_responsable_id) REFERENCES igo_organisme_responsable(id);

ALTER TABLE ONLY igo_classe_entite
    ADD CONSTRAINT fk_classe_entite_source_entite FOREIGN KEY (source_entite_id) REFERENCES igo_source_entite(id);

ALTER TABLE ONLY igo_contact
    ADD CONSTRAINT fk_contact_organisme_responsable FOREIGN KEY (organisme_responsable_id) REFERENCES igo_organisme_responsable(id);

ALTER TABLE ONLY igo_contexte
    ADD CONSTRAINT fk_contexte_proprietaire_id FOREIGN KEY (profil_proprietaire_id) REFERENCES igo_profil(id);

ALTER TABLE ONLY igo_couche_contexte
    ADD CONSTRAINT fk_couche_contexte_contexte FOREIGN KEY (contexte_id) REFERENCES igo_contexte(id);

ALTER TABLE ONLY igo_couche_contexte
    ADD CONSTRAINT fk_couche_contexte_couche FOREIGN KEY (couche_id) REFERENCES igo_couche(id);

ALTER TABLE ONLY igo_couche_contexte
    ADD CONSTRAINT fk_couche_contexte_groupe FOREIGN KEY (groupe_id) REFERENCES igo_groupe(id);

ALTER TABLE ONLY igo_couche
    ADD CONSTRAINT fk_couche_geometrie FOREIGN KEY (geometrie_id) REFERENCES igo_geometrie(id);

ALTER TABLE ONLY igo_geometrie
    ADD CONSTRAINT fk_geometrie_classe_entite FOREIGN KEY (classe_entite_id) REFERENCES igo_classe_entite(id);

ALTER TABLE ONLY igo_geometrie
    ADD CONSTRAINT fk_geometrie_connexion FOREIGN KEY (connexion_id) REFERENCES igo_connexion(id);

ALTER TABLE ONLY igo_geometrie
    ADD CONSTRAINT fk_geometrie_geometrie_type FOREIGN KEY (geometrie_type_id) REFERENCES igo_geometrie_type(id);

ALTER TABLE ONLY igo_groupe
    ADD CONSTRAINT fk_groupe_proprietaire_id FOREIGN KEY (profil_proprietaire_id) REFERENCES igo_profil(id); 

ALTER TABLE ONLY igo_organisme_responsable
    ADD CONSTRAINT fk_organisme_responsable_contact FOREIGN KEY (contact_id) REFERENCES igo_contact(id);

ALTER TABLE ONLY igo_permission
    ADD CONSTRAINT fk_permission_attribut FOREIGN KEY (attribut_id) REFERENCES igo_attribut(id);

ALTER TABLE ONLY igo_permission
    ADD CONSTRAINT fk_permission_couche FOREIGN KEY (couche_id) REFERENCES igo_couche(id);

ALTER TABLE ONLY igo_permission
    ADD CONSTRAINT fk_permission_groupe FOREIGN KEY (groupe_id) REFERENCES igo_groupe(id);

ALTER TABLE ONLY igo_permission
    ADD CONSTRAINT fk_permission_profil FOREIGN KEY (profil_id) REFERENCES igo_profil(id);

ALTER TABLE ONLY igo_profil
    ADD CONSTRAINT fk_profil_proprietaire_id FOREIGN KEY (profil_proprietaire_id) REFERENCES igo_profil(id);

ALTER TABLE ONLY igo_service_profil
    ADD CONSTRAINT fk_service_profil_profil FOREIGN KEY (profil_id) REFERENCES igo_profil(id);

ALTER TABLE ONLY igo_service_profil
    ADD CONSTRAINT fk_service_profil_service_cartographique FOREIGN KEY (service_id) REFERENCES igo_service(id);

ALTER TABLE ONLY igo_source_entite
    ADD CONSTRAINT fk_source_entite_organisme_responsable FOREIGN KEY (organisme_responsable_id) REFERENCES igo_organisme_responsable(id);

ALTER TABLE ONLY igo_utilisateur_profil
    ADD CONSTRAINT fk_utilisateur_profil_profil FOREIGN KEY (profil_id) REFERENCES igo_profil(id);

ALTER TABLE ONLY igo_utilisateur_profil
    ADD CONSTRAINT fk_utilisateur_profil_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES igo_utilisateur(id);

ALTER TABLE ONLY igo_valeur
    ADD CONSTRAINT fk_valeur_liste_de_valeur FOREIGN KEY (liste_valeur_id) REFERENCES igo_liste_valeur(id);


ALTER TABLE ONLY igo_groupe_couche
    ADD CONSTRAINT "FK_groupe_couche_groupe" FOREIGN KEY (groupe_id) REFERENCES igo_groupe(id);
ALTER TABLE ONLY igo_groupe_couche
    ADD CONSTRAINT "FK_groupe_couche_couche" FOREIGN KEY (couche_id) REFERENCES igo_couche(id);



-- commit 7bbe036f1fc49cea17179874ed73422b861f70d0 du projet metadonnees par Francois Gourdeau
ALTER TABLE igo_couche ADD COLUMN est_commune BOOLEAN;
ALTER TABLE igo_couche ADD COLUMN est_publique BOOLEAN;
ALTER TABLE igo_connexion_type ADD COLUMN ind_vue BOOLEAN;
ALTER TABLE igo_connexion_type ADD COLUMN ind_data BOOLEAN;
ALTER TABLE igo_connexion_type ADD COLUMN ind_projection BOOLEAN;
ALTER TABLE igo_geometrie_type ADD COLUMN geometrie_type CHARACTER VARYING(1);
ALTER TABLE igo_classe ALTER COLUMN mf_class_def TYPE CHARACTER VARYING(5000);

-- merge request #22 du projet metadonnees
ALTER TABLE igo_couche RENAME COLUMN mf_layer_minscale TO mf_layer_minscale_denom;
ALTER TABLE igo_couche RENAME COLUMN mf_layer_maxscale TO mf_layer_maxscale_denom;
ALTER TABLE igo_couche RENAME COLUMN mf_layer_labelminscale TO mf_layer_labelminscale_denom;
ALTER TABLE igo_couche RENAME COLUMN mf_layer_labelmaxscale TO mf_layer_labelmaxscale_denom;

-- merge request #30 du projet metadonnees

ALTER TABLE igo_geometrie ADD COLUMN acces CHARACTER VARYING(1);
ALTER TABLE igo_couche ADD COLUMN layer_a_order CHARACTER VARYING(1);
ALTER TABLE igo_couche_contexte ADD COLUMN layer_a_order CHARACTER VARYING(1);
ALTER TABLE igo_couche DROP COLUMN type;


ALTER TABLE igo_profil ADD COLUMN libelle character varying;
ALTER TABLE igo_profil ALTER COLUMN nom TYPE character varying(200);

drop view if exists igo_vue_permission_profil;
drop view if exists igo_vue_contexte_couche_navigateur;
drop view if exists igo_vue_groupes_recursif;

-- Aussi inclus dans migration-0.3-vers-0.4.sql pour ceux qui sont une maj
ALTER TABLE igo_couche_contexte ALTER COLUMN layer_a_order TYPE integer USING 0;
ALTER TABLE igo_couche ALTER COLUMN layer_a_order TYPE integer USING 0;


CREATE VIEW igo_vue_groupes_recursif AS 
 WITH RECURSIVE s(id, nom, groupe_id, grp) AS (
         SELECT g.id,
            g.nom,
            gg_1.parent_groupe_id AS groupe_id,
            g.id::text AS grp,
            g.nom::character varying(500) AS nom_complet,
            g.est_exclu_arbre
           FROM igo_groupe g
             LEFT JOIN igo_groupe_groupe gg_1 ON gg_1.groupe_id = g.id
        UNION
         SELECT igo_groupe.id,
            igo_groupe.nom,
            s_1.id AS groupe_id,
            (s_1.grp || '_'::text) || igo_groupe.id::character varying(10)::text AS grp,
                CASE igo_groupe.est_exclu_arbre
                    WHEN false THEN (((s_1.nom_complet::text || '/'::text) || igo_groupe.nom::character varying(500)::text))::character varying(500)
                    ELSE s_1.nom_complet
                END AS nom_complet,
            igo_groupe.est_exclu_arbre
           FROM igo_groupe,
            igo_groupe_groupe gg_1
             JOIN s s_1 ON s_1.id = gg_1.parent_groupe_id
          WHERE gg_1.groupe_id = igo_groupe.id
        )
 SELECT s.id AS groupe_id,
    s.nom,
    s.groupe_id AS parent_groupe_id,
    s.nom_complet,
    s.est_exclu_arbre,
    s.grp
   FROM s
  WHERE NOT (s.grp IN ( SELECT substr(s_1.grp, strpos(concat(s_1.grp, '_'), '_'::text) + 1) AS substr
           FROM s s_1))
  ORDER BY s.grp;

CREATE MATERIALIZED VIEW igo_vue_groupes_recursif_materialized AS 
    SELECT * FROM igo_vue_groupes_recursif
WITH DATA;

CREATE OR REPLACE VIEW igo_vue_couche AS 
 SELECT c.id,
    c.description,
    c.geometrie_id,
    c.vue_validation,
    c.mf_layer_name,
    c.mf_layer_group,
    c.mf_layer_meta_name,
    c.mf_layer_filtre,
    c.mf_layer_minscale_denom,
    c.mf_layer_maxscale_denom,
    c.mf_layer_labelminscale_denom,
    c.mf_layer_labelmaxscale_denom,
    c.mf_layer_def,
    c.mf_layer_meta_def,
    c.service_tuile,
    e.catalogue_csw_id,
    c.fiche_csw_id,
    c.mf_layer_meta_wfs_max_feature,
    c.est_fond_de_carte,
    c.mf_layer_opacity,
    c.mf_layer_meta_title,
    c.mf_layer_meta_group_title,
    c.mf_layer_labelitem,
    COALESCE(c.mf_layer_meta_z_order, g.mf_layer_meta_z_order, gt.mf_layer_meta_z_order) AS mf_layer_meta_z_order,
    c.print_option_url,
    c.print_option_layer_name,
    c.est_commune,
    c.est_publique,
    c.layer_a_order,
    c.max_zoom_level,
    c.min_zoom_level,
    g.classe_entite_id,
    g.geometrie_type_id,
    g.vue_defaut,
    g.date_chargement,
    g.connexion_id,
    g.echelle_prod,
    g.remarque AS remarque_geometrie,
    g.ind_inclusion,
    g.mf_layer_data,
    g.mf_layer_projection,
    g.acces,
    e.nom AS nom_classe_entite,
    e.description AS description_classe_entite,
    e.source_entite_id,
    e.classification_id,
    e.organisme_responsable_id,
    e.contact_id,
    e.remarque AS remarque_classe_entite,
    x.nom AS nom_connexion,
    x.connexion,
    x.connexion_type_id,
    t.nom AS nom_connexion_type,
    t.connexion_type,
    gt.nom AS nom_geometrie_type,
    gt.layer_type,
    gt.geometrie_type
   FROM igo_couche c,
    igo_classe_entite e,
    igo_geometrie g
   LEFT JOIN igo_connexion x ON g.connexion_id = x.id
   LEFT JOIN igo_connexion_type t ON x.connexion_type_id = t.id
   LEFT JOIN igo_geometrie_type gt ON g.geometrie_type_id = gt.id
  WHERE c.geometrie_id = g.id AND g.classe_entite_id = e.id;




--ALTER TABLE igo_couche_contexte ADD COLUMN groupe_couche_id INTEGER;
--ALTER TABLE ONLY igo_couche_contexte
--    ADD CONSTRAINT "FK_couche_contexte_groupe_couche" FOREIGN KEY (groupe_couche_id) REFERENCES igo_groupe_couche(id);

--ALTER TABLE igo_permission ADD COLUMN groupe_couche_id INTEGER;
--ALTER TABLE ONLY igo_permission
 --   ADD CONSTRAINT "FK_permission_groupe_couche" FOREIGN KEY (groupe_couche_id) REFERENCES igo_groupe_couche(id);

-- Vieille vue inutile
DROP VIEW IF EXISTS igo_vue_profils_pour_groupes;


DROP VIEW if exists igo_vue_permissions_pour_groupes;

DROP VIEW IF EXISTS igo_vue_permissions_pour_couches;

CREATE OR REPLACE VIEW igo_vue_permissions_pour_couches AS 
 SELECT igo_couche.id AS couche_id,
    COALESCE(igo_permission.profil_id, 0) AS profil_id,
    COALESCE(igo_couche.est_publique, false) OR COALESCE(igo_permission.est_lecture, false) OR COALESCE(igo_permission.est_association, false) AS est_lecture,
    COALESCE(igo_permission.est_analyse, false) OR COALESCE(igo_permission.est_association, false) AS est_analyse,
    COALESCE(igo_permission.est_ecriture, false) OR COALESCE(igo_permission.est_association, false) AS est_ecriture,
    COALESCE(igo_permission.est_export, false) OR COALESCE(igo_permission.est_association, false) AS est_export,
    COALESCE(igo_permission.est_association, false) OR COALESCE(igo_permission.est_association, false) AS est_association
   FROM igo_couche
     LEFT JOIN igo_permission ON igo_couche.id = igo_permission.couche_id;

ALTER TABLE igo_utilisateur ADD CONSTRAINT igo_utilisateur_nom_unique UNIQUE  (nom);
ALTER TABLE igo_utilisateur ADD CONSTRAINT igo_profil_nom_unique UNIQUE (nom);


ALTER TABLE igo_couche ADD COLUMN mf_layer_meta_attribution_title CHARACTER VARYING(5000);


DROP VIEW IF EXISTS igo_vue_contexte_groupes_recursif;

CREATE VIEW igo_vue_contexte_groupes_recursif AS 
 WITH RECURSIVE s(id, nom, contexte_id, groupe_id, grp) AS (
         SELECT g.id,
            g.nom,
            cc.contexte_id,
            gg_1.parent_groupe_id AS groupe_id,
            g.id::text AS grp,
                CASE
                    WHEN COALESCE(cc.est_visible, false) AND NOT g.est_exclu_arbre THEN COALESCE(cc.mf_layer_meta_group_title, g.nom)::character varying(500)
                    ELSE ''::character varying(500)
                END AS nom_complet,
            g.est_exclu_arbre
           FROM igo_groupe g
             LEFT JOIN igo_groupe_groupe gg_1 ON gg_1.groupe_id = g.id
             LEFT JOIN igo_couche_contexte cc ON cc.arbre_id::text = g.id::text AND cc.couche_id IS NULL
        UNION
         SELECT igo_groupe.id,
            igo_groupe.nom,
            cc.contexte_id,
            s_1.id AS groupe_id,
            (s_1.grp || '_'::text) || igo_groupe.id::character varying(10)::text AS grp,
                CASE
                    WHEN COALESCE(cc.est_visible, false) AND NOT s_1.est_exclu_arbre THEN (((s_1.nom_complet::text || '/'::text) || COALESCE(cc.mf_layer_meta_group_title, igo_groupe.nom)::character varying(500)::text))::character varying(500)
                    ELSE ''::character varying(500)
                END AS nom_complet,
            igo_groupe.est_exclu_arbre
           FROM igo_groupe,
            igo_groupe_groupe gg_1
             JOIN s s_1 ON s_1.id = gg_1.parent_groupe_id
             LEFT JOIN igo_couche_contexte cc ON s_1.contexte_id = cc.contexte_id AND cc.arbre_id::text = concat(s_1.grp, '_', gg_1.groupe_id) AND cc.couche_id IS NULL
          WHERE gg_1.groupe_id = igo_groupe.id
        )
 SELECT s.id AS groupe_id,
    s.nom,
    s.contexte_id,
    s.groupe_id AS parent_groupe_id,
    btrim(s.nom_complet::text, '/'::text) AS nom_complet,
    s.est_exclu_arbre,
    s.grp
   FROM s
  WHERE NOT (concat(s.contexte_id, s.grp) IN ( SELECT concat(s_1.contexte_id, substr(s_1.grp, strpos(concat(s_1.grp, '_'), '_'::text) + 1)) AS substr
           FROM s s_1)) AND s.contexte_id IS NOT NULL AND NULLIF(s.nom_complet::text, ''::text) IS NOT NULL
  ORDER BY s.grp;

DROP VIEW IF EXISTS igo_vue_contexte_groupes_recursif_materialized;
CREATE MATERIALIZED VIEW igo_vue_contexte_groupes_recursif_materialized AS 
    SELECT * FROM igo_vue_contexte_groupes_recursif
WITH DATA;

--
DROP VIEW IF EXISTS igo_vue_contexte_couche_navigateur;
CREATE OR REPLACE VIEW igo_vue_contexte_couche_navigateur AS 
 WITH a AS (
         SELECT cc.contexte_id,
            cc.couche_id,
            cgr.groupe_id,
            cc.est_visible,
            cc.arbre_id,
            cgr.parent_groupe_id,
            cc.est_active,
            igo_couche.est_fond_de_carte,
                CASE
                    WHEN igo_couche.est_fond_de_carte THEN igo_couche.mf_layer_name::text
                    WHEN cgr.parent_groupe_id IS NULL THEN igo_couche.mf_layer_name::text
                    ELSE concat(igo_couche.mf_layer_name, '_', cgr.parent_groupe_id)
                END AS mf_layer_name,
            igo_couche.mf_layer_name AS mf_layer_name_igo,
            COALESCE(cc.mf_layer_meta_name, igo_couche.mf_layer_meta_name) AS mf_layer_meta_name2,
            igo_couche.mf_layer_meta_name,
            cc.mf_layer_meta_title AS mf_layer_meta_title2,
            COALESCE(NULLIF(cc.mf_layer_meta_group_title::text, ''::text), igo_couche.mf_layer_meta_title::text) AS mf_layer_meta_title,
            cgr.nom_complet AS mf_layer_meta_group_title,
            igo_couche.mf_layer_group,
            igo_couche.mf_layer_meta_def,
            igo_couche.mf_layer_meta_z_order,
            igo_couche.mf_layer_minscale_denom,
            igo_couche.mf_layer_maxscale_denom,
            igo_couche.mf_layer_labelminscale_denom,
            igo_couche.mf_layer_labelmaxscale_denom,
            igo_couche.print_option_url,
            igo_couche.print_option_layer_name,
            igo_couche.fiche_csw_id,
            igo_couche.mf_layer_opacity,
            igo_couche.mf_layer_meta_attribution_title,
            cc.layer_a_order,
            cgr.nom_complet AS nom_groupe,
            igo_couche.geometrie_id,
            cc.ind_fond_de_carte,
            cgr.est_exclu_arbre,
            cgr.grp,
            igo_couche.max_zoom_level,
            igo_couche.min_zoom_level
           FROM igo_couche_contexte cc
             JOIN igo_couche ON cc.couche_id = igo_couche.id
             JOIN igo_vue_contexte_groupes_recursif cgr ON cgr.contexte_id = cc.contexte_id AND cgr.grp = cc.arbre_id::text
          ORDER BY length(cc.arbre_id::text) - length(replace(cc.arbre_id::text, '_'::text, ''::text))
        )
 SELECT a.contexte_id,
    a.couche_id,
    a.groupe_id,
    last(a.est_visible) AS est_visible,
    last(a.est_active) AS est_active,
    last(a.est_fond_de_carte) AS est_fond_de_carte,
    last(a.mf_layer_name) AS mf_layer_name,
    a.mf_layer_name_igo,
    last(a.mf_layer_meta_name) AS mf_layer_meta_name,
    last(a.mf_layer_meta_title) AS mf_layer_meta_title,
    last(a.mf_layer_group) AS mf_layer_group,
    last(a.mf_layer_meta_def) AS mf_layer_meta_def,
    last(COALESCE(a.mf_layer_meta_z_order, igo_geometrie.mf_layer_meta_z_order, igo_geometrie_type.mf_layer_meta_z_order)) AS mf_layer_meta_z_order,
    last(a.mf_layer_minscale_denom) AS mf_layer_minscale_denom,
    last(a.mf_layer_maxscale_denom) AS mf_layer_maxscale_denom,
    last(a.mf_layer_labelminscale_denom) AS mf_layer_labelminscale_denom,
    last(a.mf_layer_labelmaxscale_denom) AS mf_layer_labelmaxscale_denom,
    last(a.print_option_url) AS print_option_url,
    last(a.print_option_layer_name) AS print_option_layer_name,
    last(a.fiche_csw_id) AS fiche_csw_id,
    last(a.mf_layer_opacity) AS mf_layer_opacity,
    last(a.mf_layer_meta_attribution_title) AS mf_layer_meta_attribution_title,
    last(a.layer_a_order) AS layer_a_order,
    last(a.mf_layer_meta_group_title) AS mf_layer_meta_group_title,
    last(igo_connexion_type.connexion_type) AS connexion_type,
    last(igo_catalogue_csw.url) AS catalogue_csw_url,
    last(igo_connexion.connexion) AS connexion,
    last(a.max_zoom_level) AS max_zoom_level,
    last(a.min_zoom_level) AS min_zoom_level,
    last(COALESCE(igo_connexion_type.ind_data, true)) AS ind_data
   FROM a
     JOIN igo_geometrie ON a.geometrie_id = igo_geometrie.id
     JOIN igo_geometrie_type ON igo_geometrie.geometrie_type_id = igo_geometrie_type.id
     LEFT JOIN igo_connexion ON igo_geometrie.connexion_id = igo_connexion.id
     LEFT JOIN igo_connexion_type ON igo_connexion.connexion_type_id = igo_connexion_type.id
     LEFT JOIN igo_classe_entite ON igo_geometrie.classe_entite_id = igo_classe_entite.id
     LEFT JOIN igo_catalogue_csw ON igo_classe_entite.catalogue_csw_id = igo_catalogue_csw.id
  WHERE a.est_visible OR a.est_active
  GROUP BY a.couche_id, a.groupe_id, a.contexte_id, a.arbre_id, a.mf_layer_name_igo
  ORDER BY last(a.layer_a_order);


alter table igo_contexte add column generer_onlineResource boolean;

ALTER TABLE ONLY igo_groupe_groupe
    ADD CONSTRAINT fk_groupe_groupe_groupe FOREIGN KEY (groupe_id) REFERENCES igo_groupe(id);

ALTER TABLE ONLY igo_groupe_groupe
    ADD CONSTRAINT fk_groupe_groupe_groupe_parent FOREIGN KEY (parent_groupe_id) REFERENCES igo_groupe(id);
