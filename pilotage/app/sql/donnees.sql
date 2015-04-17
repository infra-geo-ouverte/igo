ALTER TABLE igo_contact DROP CONSTRAINT fk_contact_organisme_responsable;
ALTER TABLE igo_organisme_responsable DROP CONSTRAINT fk_organisme_responsable_contact;

INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (67,'RNCAN','Ressources Naturelles Canada',null,null,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (71,'CGQ','Centre de Géomatique du Québec',null,null,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (2,'MCC','Ministère de la Culture et des Communications','http://mcc.gouv.qc.ca',1,'','2014-03-19 16:33:39');
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (9,'MRNF','Ministère des Ressources Naturelles et de la Faune',null,null,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (10,'MAMR','Ministère des affaires municipales',null,null,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (19,'CEHQ','Centre d''Expertise Hydrique du Québec',null,null,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (86,'URGCONSULT','Urgence Consult',null,133,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (24,'ENVCAN','Environnement Canada',null,null,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (36,'HQ','Hydro Québec',null,42,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (32,'INRS-ETE','Institut National de la Recherche Scientifique - ETE',null,null,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (37,'CCS','Centre de communication santé',null,43,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (53,'UDES','Université de Sherbrooke',null,65,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (21,'ASC','Agence Spatiale Canadienne',null,null,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (55,'LRADAR','Logiciels Radar inc.',null,68,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (54,'THALES','THALES',null,null,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (38,'VQUE','Ville de Québec',null,44,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (66,'CPTAQ','Commission de protection du territoire agricole du Québec',null,null,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (39,'SPCAN','Sécurtié Publique Canada',null,47,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (87,'KOREM','Korem',null,134,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (77,'RDDC','Recherche et développement pour la défense Canada',null,null,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (1,'MSP','Ministère de la Sécurité Publique du Québec',null,103,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (4,'MTQ','Ministère des Transports du Québec',null,82,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (20,'MDDEP','Ministère Développement durable, de l''Environnement et Parcs',null,17,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (22,'CCT','Centre Canadien de télédétection',null,19,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (23,'ATGLOBAL','AthenaGlobal',null,20,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (25,'VILLEMTL','Ville de Montréal',null,22,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (26,'HYDROMETEO','Hydro Météo',null,24,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (27,'LIO','Land Information Ontario',null,25,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (28,'ALMA','Ville d''Alma',null,27,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (29,'MTL','Sécurité Publique Ville de Montréal',null,28,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (30,'GAZMETRO','GazMétro',null,71,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (31,'BELL','Bell-Canada',null,45,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (33,'CROIXROUGE','Croix-Rouge',null,34,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (34,'SOPFIM','SOPFIM',null,35,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (35,'CTQ','Commission de toponymie du Québec',null,37,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (40,'TELUS','TELUS',null,48,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (41,'ASSSGIM','Agence Santé services sociaux gaspésie îles-de-le-Madelaine',null,49,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (42,'VILLESHERB','Ville de Sherbrooke',null,107,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (43,'BNO','Bureau de Normalisation du Québec',null,53,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (44,'NSIMTECH','Nsim Technology',null,55,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (45,'CAUCA','CAUCA',null,56,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (46,'PCI','PCI Geomatics',null,57,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (47,'ECONOVA','ECONOVA',null,58,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (48,'MOTOROLA','Motorola Canada Limitée',null,60,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (49,'INFOGLOBE','Infoglobe',null,61,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (50,'CSPQ','Centre de Services partagés',null,117,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (51,'SPVM','Service de police de la Ville de Montréal',null,63,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (52,'SIM','Sécurité incendie Montréal',null,64,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (56,'RADAR911','Radar 911 Systems inc.',null,69,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (57,'VILLEALMA','Ville D''Alma',null,70,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (58,'SOPFEU','Société de protection des forêts contre le feu',null,72,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (59,'INTERCEL','Intercel',null,73,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (60,'GEOMAP','GEOMAP GIS America',null,75,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (61,'SEPAQ','Société des établissements de plein air du Québec',null,76,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (62,'URGSANTE','Urgence-Santé',null,77,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (63,'LEVIS','Centre 911 Lévis',null,78,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (64,'VELOQC','Vélo-Québec',null,80,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (65,'MAPAQ','Ministère de l''Agriculture, des Pêcheries et de l''Alimenta',null,86,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (68,'EMO','Emergency Management Ontario',null,95,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (69,'GEOID','Geoid - Via-Sat',null,101,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (70,'VIASAT','VIASAT GéoTechnologies Inc',null,104,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (72,'GEOPROJ','Geoprojection',null,106,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (73,'CONSORTECH','Consortech',null,108,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (74,'TGIS','Tgis technologies inc.',null,109,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (75,'ESRI','ESRI Canada',null,111,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (76,'SQ','Sûreté du Québec',null,112,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (78,'TECHNOPOLE','Technopôle',null,118,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (79,'SAAQ','Contrôle routier Québec',null,119,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (80,'MAPGEARS','MapGears',null,121,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (81,'ULAVAL','Université Laval',null,124,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (82,'MESONET','Mesonet-Québec',null,127,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (83,'ABRINORD','Abrinord',null,129,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (84,'INSPECSOL','INSPEC-SOL',null,130,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (85,'PREMLIGNE','Première Ligne',null,132,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (88,'VLAVAL','911 de la Ville de Laval',null,137,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (91,'INSPQ','Institut national de santé publique du Québec',null,156,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (92,'MFA','Ministère de la Famille',null,164,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (5,'MELS','Ministère de l''Éducation, du Loisir et du Sport',null,163,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (95,'MTO','Ministère du Tourisme',null,183,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (93,'MSG','Ministère des services gouvernementaux',null,174,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (94,'MSSS','Ministère de la Santé et des Services sociaux',null,182,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (96,'UQAR','Université du Québec à Rimouski',null,195,null,null);
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (89,'FCMQ','FCMQ','',150,'','2014-03-20 14:56:20');
INSERT INTO  igo_organisme_responsable (id, acronyme, nom, url, contact_id, remarque, date_modif) 
VALUES (90,'FQCQ','FQCQ','',162,'','2014-03-20 14:57:11');


INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (11,9,'Luc','Lapointe','Contact Ortho','(418)627-6283 poste 2089','Luc.Lapointe2@mrnf.gouv.qc.ca',null,'Contact pour la commande des orthos photos',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (12,19,'Stéphane','Comtois','Analyste en géomatique','(418)521-3825 poste 7348','stephane.comtois@mddep.gouv.qc.ca',null,'Zones inondables (Accès aux données et le format des données)',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (1,2,'François','Poulin','Chargé de projet','418-380-2322 poste 7288','francois.poulin@mcc.gouv.qc.ca',true,'','2014-03-19 16:32:49');
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (2,2,'Steve','Simard','Responsable Conservatoire','418-380-2362 poste 7420','steve.simard@mcc.gouv.qc.ca',true,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (3,10,'Sylvain','Goulet','Géomaticien','418-691-2015 poste 3818','Sylvain.Goulet@mamr.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (4,2,'Sabine','Mekki','Responsable des librairies','418-380-2322 poste 7035','sabine.mekki@mcc.gouv.qc.ca',false,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (5,2,'Stéphanie','Simard','Archéologie','418-380-2352 poste 7009','stephanie.simard@mcc.gouv.qc.ca',false,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (6,4,'Olivier','Bégin','Responsable prototype pour GOLOC','418-643-6890 poste 2204','Olivier.Begin@mtq.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (13,19,'Richard','Turcotte','Hydrologue - prévision','418-521-3825 poste 7145','richard.turcotte2@mddep.gouv.qc.ca',null,'Prévision hydrologique - Radarsat',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (14,19,'Yvon','Bernard','Pilote de système','418-521-3825 poste 7310','yvon.bernard@mddep.gouv.qc.ca',null,'Diffusion Internet et FTP des données hydrométriques',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (15,19,'Julie','Rousseau','Spécialiste des barrages','418 521-3945 poste 7531','julie.rousseau@mddep.gouv.qc.ca',null,'Direction de la sécurité des barrages',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (16,19,'Guillaume','Durand','Hydrologue','418-521-3993 poste 7333','guillaume.durand@mddep.gouv.qc.ca',null,'Direction de la surveillance des barrages et de l''hydrométrie',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (17,20,'France','Delisle','Chef de Service','418-521-3820 poste 4565','france.delisle@mddep.gouv.qc.ca',null,'Direction du suivi de l''état de l''Environnement - Météo',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (18,21,'Robert','Saint-Jean','Gestionnaire de données RSO','450-926-5121','robert.saint-jean@espace.gc.ca',null,'Responsable Charte / Agence Spatiale Canadienne',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (33,32,'Yves','Gauthier','Spécialiste en télédétection','(418)654-3753','gautyves@ete.inrs.ca',null,'Contact pour carte des glaces - Radarsat - FRAZIL',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (34,33,'Louise','Bélanger',null,'(800) 363-7305','Louise.Belanger@croixrouge.ca',null,'Client qui demande des petites applications pour la Croix-Rouge / Gestion des ressources',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (48,40,'Raymond','Lavigne','Premier directeur de comptes','418-688-2362','raymond.lavigne@telus.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (49,41,'Sylvain','Trudel','Directeur régional SPU et mesures d''urgence','418-368-2349 poste 247','sylvain.trudel.asssgim@ssss.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (10,9,'Réjean','Matte','Contact Ortho','(418)627-6283 poste 2098','rejean.matte@mrnf.gouv.qc.ca',null,'Contact pour la commande des orthos photos',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (19,22,'Vincent','Decker','Chercheur en environnement','613-995-1575','vincent.decker@ccrs.nrcan.gc.ca',null,'Contact Télédétection / Radarsat / Fédéral / Emergency Response Team',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (20,23,'Andrew','Eddy','Président','450-243-4278','andrew.eddy@athenaglobal.com',null,'Contact Disaster Information Satellite Service',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (35,34,'Paul','Brouillette','Chargé de Mesonet - Québec','(418) 681-3381','paul.brouillette@mesonet-quebec.org',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (36,9,'Maxime','Bélanger','Co-pilote d''Adresse Québec','418 627-6284 poste 2163','Maxime.Belanger@mrnf.gouv.qc.ca',null,'Responsable Adresse Québec et membre du sous-comité d''Adresse-Qc',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (37,35,'Danielle','Turcotte','Directrice de la commission de toponymie','418-644-2392',null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (38,35,'Benoît','Boivert','Infocentre','418-644-4423','bboisver@oqlf.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (39,10,'Sylvain','Goulet','Géomaticien','418-691-2015 poste 3818','Sylvain.Goulet@mamr.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (40,10,'Alexandra','Bastien','SIGAT','418-691-2015 poste 3811','alexandra.bastien@mamr.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (41,9,'Isabelle','Desrosier','Géomaticien','418-627-6284 poste 2118','isabelle.desrosiers@mrnf.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (42,36,'Serge','Lefebvre','Contact 911','866-833-2210 poste 2729','serge.lefebvre.2@hydro.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (43,37,'Robert','Ménard','Contact 911','418-641-6811',null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (44,38,'Jacques','Lachance','Contact 911','418-641-6411 poste 7105',null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (45,31,'Pierre','Scheffer','Contact 911','450-667-7985','pierre.scheffer@bell.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (46,20,'Caroline','Fleury','Conseillère en urgence environnementale','418-644-9777 poste 264','caroline.fleury@mddep.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (47,39,'Suzie','Malouin','Coordonnatrice fédérale aux opérations d''urgence','418 646-6777 poste 40071','suzie.malouin@sp.gc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (58,47,'Michel','Arès','Président-C.E.O.','418-380-5507 poste 3100','mares@econova.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (59,25,'Pierre-Antoine','Ferron','Conseiller en planification et édimestre','514-868-4017','pferron@ville.montreal.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (66,54,'Dany','Francis','Conseiller en développement de systèmes','418-844-3027','dany.francis@ca.thalesgroup.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (71,30,'Guy','Malboeuf','Directeur, mesures prévention et d''urgence','514-598-3837','gmalboeuf@gazmetro.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (73,59,'Gérald','Boivin','Vice-président','450-961-4115','gboivin@intercel.ca',null,'Intégration de solution sans fil évoluées',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (77,62,'François','Robitaille','Géomaticien','(514) 723-5627','francois.robitaille@urgences-santé.qc.ca',null,'Responsable géomatique Urgence-Santé Montréal',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (80,64,'Maryse','Trudeau','Géomatique, cartographie','514-521-8356 poste 410','mtrudeau@velo.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (81,24,'Martin','Deschênes','E2MS','514-283-2339',null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (84,24,'Jean-François','Voros','Gestionnaire','(514)283-1114','jean-francois.voros@ec.gc.ca',null,'Contact pour Météo - Environnement Canada - E2MS',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (86,65,'Cédric','Paré','Conseiller en sécurité civile','(418)380-2100 poste 3050','cedric.pare@mapaq.gouv.qc.ca',null,'Contact MAPAQ en SC',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (87,24,'André','Cantin','Météorologue','(418)649-6832','andre.cantin@ec.gc.ca',null,'Contact Météo - Environnement Canada - E2MS',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (93,66,'Karl','Gingras','Analyste en géomatique','1-800-361-2090','karl.gingras@cptaq.gouv.qc.ca',null,'Contact CPTAQ - développeur de l''application débit-niveau / MSP',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (95,68,'John','Galea','Mapping Programs Officer','1-866-517-0571','John.Galea@ontario.ca',null,'Contact Géo - Mesure d''urgence en Ontario',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (50,42,'Martin','Halley','Adjoint technique Centre d''urgence 911','819-821-1985','martin.halley@ville.sherbrooke.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (51,42,'Nancy','Dubois','Chef de Division','819-821-5450','nancy.dubois@ville.sherbrooke.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (52,42,'Luc','Robillard','Chef de Section Cartographie','819-821-5948','luc.robillard@ville.sherbrooke.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (53,43,'François','Lambert','Certification','418-652-2216','francois.lambert@bnq.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (54,21,'Stephen','Schaller','Planificateur d''acquisition de données','450-926-4415','stephen.schaller@espace.gc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (55,44,'Jimmy','Perron','President','418-806-9732','jimmy.perron@nsimtech.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (185,4,'Chantal','Bilodeau',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (56,45,'Daniel','Veilleux','Directeur Général Adjoint','418-228-8750','daniel.veilleux@cauca.ca',null,'Expert en appels d''urgence',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (57,46,'Martin','Croteau','QA Manager','819-770-0022 poste 312','croteau@pcigeomatics.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (60,48,'Michel','Denis','Directeur','418-650-0513','michel.denis@motorola.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (61,49,'Roger','Laberge','Président','418-681-2929','roger.laberge@infoglobe.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (64,52,'Michel','Legault','Chef de division intérimaire','514-872-4302','michellegault@ville.montreal.qc.ca',null,'Direction des opération et de la prévention',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (65,53,'Alain','Royer','Professeur titulaire chercheur Télédétection et géophysique','819-821-8000 poste 62286','alain.royer@usherbrooke.ca',null,'Directeur (Cartel)',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (67,54,'David','Belanger','Concepteur Logiciel','418-844-1744','david.belanger@ca.thalesgroup.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (68,55,'Luc','Drouin','Président','450-447-7047','ldrouin@logicielradar.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (69,56,'Alex','Moosz','Vice président','477-940-6911','amoosz@radar-911.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (70,57,'Steeve','Groleau','Chef des opérations','418-669-5001 poste 5057','steeve.groleau@ville.alma.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (72,58,'François','Lefebvre','Directeur de développement et des services spécialisés','418-871-3304 poste 5460','flefebvre@sopfeu.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (74,2,'Gilbert','Guérin','Conseiller en patrimoine','819-371-6001','gilbert.guerin@mcc.gouv.qc.ca',null,'Direction du patrimoine',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (75,60,'Danick','Venne','PDG','450-461-1158 poste 222','dvenne@geomapgis.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (78,63,'François','Bélanger','Contact 911 - Coordonnateur 911','418-835-8262','fbelanger@ville.levis.qc.ca',null,'Autre personne : Coordonnateur adjoint : Jimmy et Responsable géomatique - Lévis : Sébastien Roy',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (79,36,'Serge','Lefebvre','Contact 911 - Hydro-Québec','450-565-2210 poste 2729','lefebvre.serge.2@hydro.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (83,9,'Philippe','Raymond','Conseiller en Sécurité Civile','(418)627-6256 poste 3292','philippe.raymond@mrnf.gouv.qc.ca',null,'Contact OSCQ pour le MRNF - connait peu la géomatique',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (85,36,'Michel','Robert','Conseiller en géographie','(514)840-3000 poste 3902','robert.michel.3@hydro.qc.ca',null,'Contact Géomatique - Hydro-Québec - Urgence',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (88,24,'Alexandre','Leroux','Géomaticien',null,'alexandre.leroux@ec.gc.ca',null,'Contact géomatique - Environnement Canada - E2MS',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (89,24,'Martin','Rodrique','Chargé de projet','(514)496-8371','martin.rodrigue@ec.gc.ca',null,'Contact E2MS',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (90,21,'Sonya','Banal','Planificatrice de mission','(450)926-4640','Sonya.Banal@space.gc.ca',null,'Contact Agence spatiale pour la commande d''images Radarsat',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (91,21,'Guy','Aubé','Agent de projet','(450)926-6418','guy.aube@space.gc.ca',null,'Contact Agence spatiale pour des projets en OT',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (92,9,'Daniel','Rochefort','Chargé de projets','(418)627-6284 poste 2145','daniel.rochefort@mrnf.gouv.qc.ca',null,'Contact sécurité civile et télédétection pour le MRNF et Radarsat',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (94,67,'Michel','Gilbert','Agent principal de projet du CITS','819-564-5600 poste 261','mgilbert@RNCan.gc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (97,67,'Michael','Greskow','Manager, Web Services Development and Applications','(613)943-3452','mgreskow@nrcan-rncan.gc.ca',null,'Contact NRCAN - Earth Science - Géo',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (98,67,'James','Rupert','Data Management and Dissemination Branch','(613)992-6433','rupert@NRCan.gc.ca',null,'Contact NRCAN pour OGC, WMS et WFS',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (99,67,'Stephen','Halchuk','Seismologist','613-943-2015','shalchuk@nrcan.gc.ca',null,'Contact NRCAN - Earth Science',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (100,67,'Maurice','Lamontagne','Seismologist','613-947-1318','maurice.lamontagne@nrcan.gc.ca',null,'Contact NRCAN - Français - Earth Science',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (102,67,'Dominique','Langlois','Équipe Services Web','(819) 564-5600 poste 267','langlois@NRCan.gc.ca',null,'Responsable des données du fédéral et la diffusion OGC (Mapserver, cubewerx)',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (103,1,'Donald','Fortin','Conseiller aux opérations','(450)346-3615','donald.fortin@msp.gouv.qc.ca',null,'Responsable GéoConférence, intégration de l''OT dans les activités de SC',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (101,69,'Jean','LeTellier','Vice-président','(819)375-9841','jean.letellier@geoid.ca',null,'Contact ER Mapper et demande d''imagerie satellitaire',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (111,75,'Alain','Dombrowski','Directeur régional','514-875-8568','adombrowski@esricanada.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (114,67,'Annie','Laviolette','Conseillère en besoins des utilisateurs','613-995-4783','annie.laviolette@rncan.gc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (125,20,'Jean','Bissonnette','Conseiller en géomatique','418 521-3907 poste 4741','jean.bissonnette@mddep.gouv.qc.ca',null,'Contact MDDEP - Géomatique',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (126,20,'Suzanne','Lavoie',null,'418 521-3838 poste 4246','suzanne.lavoie@mddep.gouv.qc.ca',null,'Contact MDDEP - Géomatique - Imagerie',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (127,82,'Paul','Brouillette','Coordonnateur Mésonet-Québec','(418) 681-3381 poste 260','paul.brouillette@mesonet-quebec.org',null,'Coordonnateur Mésonet-Québec au MRNF (Paul.Brouillette@mrnf.gouv.qc.ca)',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (128,77,'Marc-André','Morin','R&D pour la Défense Canada','(418) 844-4000','Marc-Andre.Morin@drdc-rddc.gc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (133,86,'Mike','Savoy','Vice-Président','819-864-0603','mike@neptune4.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (136,4,'Ghislain','Lepage','Analyste en informatique','418-380-2005 poste 225','ghslain.lepage@mtq.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (137,88,'Nancy','Dorion','inspectrice','(450) 978-6888 poste 4241','n.doiron@ville.laval.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (21,24,'Jean-François','Cantin','Chef, Section Hydrologie','(418) 649-6565','jean-francois.cantin@ec.gc.ca',null,'Spécialiste du fleuve St-Laurent / Modélisation / Générer des scénarios d''inondation',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (22,25,'Valérie','Gagnon','Chef de division, Sécurité civile','514-280-4037','vgagnon@ville.montreal.qc.ca',null,'Sécurtié civile - Ville Mtl',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (23,1,'Dominique','Gauthier','Conseillère en SC','(418)643-2241','dominique.gauthier@msp.gouv.qc.ca',null,'Représentant régional qui demande des applications de géomatique pour le suivi',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (24,26,'Sophie','Latreille','Directrice Adjointe','(450) 755-4635','hmsophie@videotron.ca',null,'Spéclialiste privé dans la prévision des crues et glaces de rivières',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (25,27,'Catherine','Bickram','Ontario Ministry of Natural Resources','(705) 755-1878','lio@ontario.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (26,4,'Paul','Bergeron','Analyste en géomatique','418 643-6890 poste 2195','paul.bergeron@mtq.gouv.qc.ca',null,'Pilote des systèmes BGR et SIG (remplaçant de Marc Ferland)',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (27,28,'Bernard','Dallaire','Contact 911 - Directeur Incendie - Ville d''Alma','(418) 669-5059','bernard.dallaire@ville.alma.qc.ca',null,'Responsable d''Alma pour le projet pilote de 911',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (28,29,'Christian','Couture','Conseiller en systèmes de gestion','514-872-0702','christian.couture@ville.montreal.qc.ca',null,'Contact du sous-comité 9-1-1 géomatique',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (29,30,'Marc','Bélair','Chargé d''ingénierie - Cartographie et Arpentage','514-598-3013','mbelair@gazmetro.com',null,'Contact à Gaz Métro, Président de l''AGMQ, responsable pour Teldig dans le comité de partage à Mtl',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (30,31,'Pierre','Scheffer','Directeur - Service 9-1-1','450-667-7985','pierre.scheffer@bell.ca',null,'Contact pour Bell pour le 9-1-1',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (31,4,'Michel','Michaud','Géographe','(418)643-7828 poste 4161','michel.michaud@mtq.gouv.qc.ca',null,'Contact en érosion des berges au MTQ',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (32,32,'Karem','Chokmani','Géomaticien, Ph D.','(418)654-2570','karem.chokmani@ete.inrs.ca',null,'Contact en télédétection - hydrologie',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (62,50,'François','Bédard','Conseiller','418-544-1500 poste 2615','francois.bedard@cspq.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (63,51,'Richard','Lafond','Administrateur des systèmes et du SAGA','514-280-2259','richard.lafond@spvm.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (76,61,'Jean-Sébastien','Blais','Responsable de la Géomatique','418-686-4875','blais.jeansébastien@sepaq.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (82,4,'Pierre','Lessard','Chef du service de la Géomatique','(514) 873-6300 poste 2194','pierre.lessard@mtq.gouv.qc.ca',null,'Contact géomatique au MTQ',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (96,67,'Shane','Livingstone','Agent senior de Géomatiques','(613)991-5028','shane.livingstone@sp-ps.gc.ca',null,'Contact Géo - Sécurité Publique Canada - Charte Internationale Espace et Catastrophes',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (104,70,'Jean','LeTellier','Ancien co-président de GEOID','819.375.9841','JLeTellier@viasat-geo.com',null,'Responsable ERMapper, imagerie',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (105,71,'Patrice','Fradette','Analyste en géomatique','(418) 698-5995','pfradette@cgq.qc.ca',null,'Spécialiste géomatique du CGQ',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (106,72,'Martin','Fafard','Président et spécialiste en géomatique (OSGeo)','514-918-2536','martin.fafard@geoprojection.com',null,'Président de la compagnie Geoprojection (MapGuide OS)',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (107,42,'Michael','Howard','Chef de la Division de la géomatique','(819) 821-5949','Michael.Howard@ville.sherbrooke.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (108,73,'Louis','Robin','Représentant technique','418-527-6402','louisr@consortech.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (109,74,'Yves','Carbonneau','Président','819-827-5555','carbo@tgis.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (110,36,'Ginette','Morasse','Analyste','514-840-3000 poste 6059','morasse.ginette@hydro.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (112,76,'Claude','Danis','Inspecteur','514-598-4707','claude.danis@surete.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (113,77,'Claude','Roy','SDA','418-844-4000 poste 4479','claude.roy@drdc.gc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (115,54,'Martin','Rivest','Conseiller en développement de systèmes géomatiques','418-844-1953','martin.rivest@ca.thalesgroup.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (116,71,'Dave','Munger','Analyste en géomatique','418-698-5995','dmunger@cgq.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (117,50,'Simon','Pelletier','Oracle','418-644-3245',null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (118,78,'Sonia','Lebel','Directrice','418-844-2454','sonia.lebel@technopoleds.org',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (119,79,'Pierre-André','Cyr','Chef de division','418-528-3159','pierre-andre.cyr@saaq.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (121,80,'Julien-Samuel','Lacroix','Développeur logiciel - Chameleon','(418)696-5056','jlacroix@mapgears.com',null,'Contact Géomatique Open Source - Créateur de Chameleon',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (122,76,'Olivier','Bégin',null,null,'olivier.begin@surete.qc.ca',null,'Contact SQ - Géomatique',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (123,76,'Patrick','Tousignant',null,null,'patrick.tousignant@surete.qc.ca',null,'Contact SQ - Géomatique',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (124,81,'Chloé','Griot','Post-doctorante','418-656-2131 poste 8658','chloe.griot.1@ulaval.ca',null,'Contact ULAVAL - Géomatique - Sécurité Civile',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (129,83,'Benoit','Gravel','Directeur, Agence de bassin versant de la rivière du Nord','450-432-8490','direction@abrinord.qc.ca',null,'Contact en Open Source en géomatique - Abrinord et Conseil Régional des Élus',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (130,84,'Michelle','Fortin','Geophysicist','514-333-5151','mfortin@inspecsol.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (131,75,'Odette','Ruest','Directrice des comptes','418-654-9597','oruest@esricanada.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (132,85,'Dominic','Crousset','Président','1-886-996-1481 poste 211','dcrousset@PremiereLigne.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (134,87,'Pierre','Lavoie','Directeur','418-647-1555','plavoie@korem.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (135,9,'Carl','Pelletier','Analyste en Géomatique','418-627-6266 poste 3452','carl.pelletier@mrnf.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (120,66,'Renaud','Levesque','Analyste en géomatique','418 647-6756','renaud.levesque@cptaq.gouv.qc.ca',null,'Contact CPTAQ - développeur de l''application débit-niveau / MSP',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (139,1,'Serge','Légaré','Ingénieur 
','(418) 646-6777 poste 41016
','serge.legare@msp.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (140,4,'Marc','Ferland',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (141,67,'Philippe','Palmer',null,null,'Philippe.Palmer@tpsgc-pwgsc.gc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (143,67,'Yves','Jacques',null,null,'Yves.Jacques@dfo-mpo.gc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (142,67,'Vincent','Ouellet',null,null,'Vincent.Ouellet@dfo-mpo.gc.ca',null,'Contact à Steve B.',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (144,67,'Héryk','Julien',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (145,19,'Cameron','Bouchard',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (146,null,'Alain','Hotte',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (147,24,'Marie-Pierre','Raymond',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (148,1,'Félix','Bédard',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (149,1,'Jean-Denis','Bouchard',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (150,89,'Martin','Farfard',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (151,90,'Philippe','Lafrenière',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (152,1,'Catherine','Belley',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (153,30,'Lyne','Champagne',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (154,30,'Denis','Vanier',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (155,4,'Gaétan','Poulin',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (156,91,'Steve','Toutant',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (157,1,'Jean-Louis','Leblanc',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (158,65,'Laurent','Deraiche',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (159,2,'Caroline','Magnan','Immobilisation','418 380-2343 poste 7366','caroline.magnan@mcc.gouv.qc.ca',null,'Responsable des immobilisations du MCC',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (160,2,'Marie-Émilie','Garant','IAA','(418) 380-2323 poste 7057','Marie-Emilie.Garant@mcc.gouv.qc.ca',null,'Responsable de l''inventaire',null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (161,2,'France','Proulx','Organisme de formation Suppérieurs et Spécialisés','418 380-2304 poste 7147','france.proulx@mcc.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (162,20,'Isabelle','Falardeau',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (163,5,'Denis','Petitclerc',null,'418 643-3684 poste 2909',null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (164,92,'Claude','Métivier',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (165,9,'Alain','Landry',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (166,9,'Yves','Ricard',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (167,9,'Marc','Desgagnés',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (168,9,'Maxime','Drouin',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (169,9,'Ghislain','Roy',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (170,9,'Luc','Forest',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (171,9,'François','Bouchard',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (172,9,'Danny','Gagnon',null,null,'danny.gagnon@fqcq.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (173,9,'Michel','Breault',null,'514-252-3076 poste 3469','info@fcmq.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (174,93,'Alain','Cloutier',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (175,1,'Jean-François','Ducré-Bouchard',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (176,1,'Éric','Houde',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (177,1,'Mathieu','Boisvert',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (178,1,'Nicolas','Gignac',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (179,1,'Lyne','Marcotte',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (180,1,'Josée','Desgagné',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (181,1,'François','Gourdeau',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (182,94,'Guy','Raymond',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (183,95,'Pierre','Fortin',null,null,'Pierre.Fortin@tourisme.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (184,4,'Steev','Falardeau',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (186,4,'Yannick','Prémont',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (187,1,'Pierre','Béland',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (188,1,'Maude-Émilie','Lapointe',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (189,79,'Guy','Carbonneau',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (190,61,'Jean','Comtois',null,null,'comtois.jean@sepaq.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (191,79,'Hélène','Bédard',null,null,'Helene.Bedard@saaq.gouv.qc.ca',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (192,61,'Gilbert','Rioux',null,null,'rioux.gilbert@sepaq.com',null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (193,null,'Frédéric','Pons',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (194,64,'Marc','Jolicoeur',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (195,96,'Steeve','Dugas',null,null,null,null,null,null);
INSERT INTO  igo_contact (id, organisme_responsable_id, prenom, nom, poste, no_telephone, courriel, est_membre_acrigeo, remarque, date_modif) 
 VALUES (196,80,'Simon','Mercier','Vice-président','418-559-7139','smercier@mapgears.com',false,'','2014-03-20 14:15:21');

INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (63,'Infrastructures militaires','Bases militaires et infrastructures','intelligenceMilitary',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (62,'Société et culture','Caractéristiques des sociétés et des cultures Exemples :lois, anthropologie, éducation, données démographiques, archéologique, suivi des systèmes sociaux, croyances, us et coutumes, crimes et justices','society',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (61,'Sciences de la terre, géosciences','Informations relatives aux sciences de la terre. Exemples : composants et processus géophysiques, géologie, minéralogie, tectonique, risque sismique','geoscientificInformation',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (60,'Océans','Composants et caractéristiques du milieu maritime Exemples : littoral, récifs, marée, etc.','oceans',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (59,'Environnement','Ressources naturelles, protection, conservation des ressources naturelles Exemples : pollution, traitement et stockage des déchets, suivi de l''environnement, gestion du risque, réserves naturelles, paysage','environment',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (58,'Économie','Activités économiques Exemples : production, travail, revenu, commerce, industrie, tourisme et éco-tourisme, foresterie, pêche, chasse, exploration et exploitation des ressources minières, pétrole, gaz naturel','economy',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (57,'Altimétrie','Hauteurs au dessous et dessus du niveau de la mer. Exemples : altitude, bathymétrie, MNT, pentes et calculs dérivés de l’altitude','elevation',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (56,'Carte de référence de la couverture terrestre','Carte de référence Exemples : occupation des terres, imagerie aérienne et satellitale, carte thématiques, carte topographiques','imageryBaseMapsEarthCover',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (31,'Agriculture','Elevage et/ou cultures Exemples : agriculture, irrigation, aquaculture, plantations','farming',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (30,'Biologie, faune et flore','Flore et faune dans un écosystème naturel Exemples : habitat, écologie, faune sauvage, faune aquatique, sciences biologiques, zones humides, végétation, biodiversité','biota',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (20,'Sécurité publique','Incendie, 9-1-1, Police','structure',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (17,'Santé','Santé, services de santé, épidémiologie Exemples : maladies et épidémie, facteurs affectant la santé, santé mentale et physique, services de santé','health',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (15,'Réseaux de télécommunication, d''énergie','Systèmes de distribution de gestion ou de stockage de l''énergie, de l''eau, des déchets. Infrastructures et services de communication. Exemples : source d''énergie solaire, hydroélectrique, nucléaire, épuration et distribution des eaux, réseau de distribution électrique, de gaz, réseau de télécommunication, radio.','utilitiesCommunication',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (14,'Planification et gestion du territoire','Exemples : carte d''utilisation des terres, plan d''occupation des sols, planification pour la prévention des risques','planningCadastre',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (12,'Adresse, localisation et lotissement','Exemples : zones postales, adresses, points de contrôle, réseau géodésique','location',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (11,'Limites politiques et administratives','Exemples: limites de pays, de provinces, de départements, de communes','boundaries',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (9,'Infrastructures de transport','Moyens de transports des personnes et des biens Exemples : routes, aéroports, tunnels, viaducs, ponts, chemin de fer','transportation',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (8,'Eaux intérieures, Hydrographie','Exemples : fleuves, rivières, glaciers, lacs salés, systèmes hydrographiques, barrages, débits, qualité de l''eau','inlandWaters',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (4,'Climatologie, météorologie','Processus et phénomènes atmosphériques Exemples : climat, météorologie, conditions atmosphériques, changements climatiques, couverture nuageuse','climatologyMeteorologyAtmosphere',null);
INSERT INTO  igo_classification (id, nom, description, code_geonetwork, date_modif)
 VALUES (2,'Bâtiments et infrastructures urbaines','aménagements urbains Exemples : musée, église, usines, maisons, monuments, boutiques, immeubles','structure',null);

INSERT INTO igo_catalogue_csw (id, url, date_modif) VALUES (1,'http://www.donnees.gouv.qc.ca/geonetwork/srv/fre/csw', null);

INSERT INTO igo_connexion_type (id, nom, connexion_type, date_modif, geometrie_type, ind_vue, ind_data, ind_projection) VALUES (6, 'Blanc', 'Blanc', NULL, NULL, NULL, NULL, NULL);
INSERT INTO igo_connexion_type (id, nom, connexion_type, date_modif, geometrie_type, ind_vue, ind_data, ind_projection) VALUES (3, 'WMS', 'WMS', '2014-05-13 15:05:24', 'R', NULL, true, NULL);
INSERT INTO igo_connexion_type (id, nom, connexion_type, date_modif, geometrie_type, ind_vue, ind_data, ind_projection) VALUES (4, 'TMS', 'TMS', '2014-05-13 15:05:34', 'R', NULL, NULL, NULL);
INSERT INTO igo_connexion_type (id, nom, connexion_type, date_modif, geometrie_type, ind_vue, ind_data, ind_projection) VALUES (2, 'postgis', 'POSTGIS', '2014-05-15 08:30:13', 'P', true, true, true);
INSERT INTO igo_connexion_type (id, nom, connexion_type, date_modif, geometrie_type, ind_vue, ind_data, ind_projection) VALUES (1, 'oraclespatial', NULL, '2014-05-15 08:30:22', 'P', true, true, true);
INSERT INTO igo_connexion_type (id, nom, connexion_type, date_modif, geometrie_type, ind_vue, ind_data, ind_projection) VALUES (7, 'fichier local', NULL, '2014-05-15 15:24:39', 'R', NULL, true, true);
INSERT INTO igo_connexion_type (id, nom, connexion_type, date_modif, geometrie_type, ind_vue, ind_data, ind_projection) VALUES (5, 'Google', 'Google', '2014-06-03 11:08:34', 'R', false, false, false);
INSERT INTO igo_connexion_type (id, nom, connexion_type, date_modif, geometrie_type, ind_vue, ind_data, ind_projection) VALUES (8, 'OGR', 'OGR', '2015-02-20 11:00:00', 'R', NULL, NULL, NULL);
/*
INSERT INTO igo_connexion (id, nom, connexion, date_modif, connexion_type_id) VALUES (1, 'postgis 1', 'host=serveurpg dbname=pgsyst user=mapserver password=m99A66p87 port=5432 options=''-c client_encoding=LATIN1''', '2014-06-02 15:04:21', 2);
INSERT INTO igo_connexion (id, nom, connexion, date_modif, connexion_type_id) VALUES (2, 'WMS 2', 'http://spssogl97d.sso.msp.gouv.qc.ca/cgi-wms/mapcache.fcgi/?', '2014-06-02 15:04:24', 3);
INSERT INTO igo_connexion (id, nom, connexion, date_modif, connexion_type_id) VALUES (3, 'WMS 3', 'http://www.cptaq.gouv.qc.ca/mapserver/cgi-bin/cptaq?', '2014-06-02 15:04:24', 3);
INSERT INTO igo_connexion (id, nom, connexion, date_modif, connexion_type_id) VALUES (6, 'Blanc', '', '2014-06-03 13:11:16', 6);
INSERT INTO igo_connexion (id, nom, connexion, date_modif, connexion_type_id) VALUES (8, 'Google', 'https://maps.google.com/maps/api/js?v=3.6&sensor=false', '2014-06-03 14:41:46', 7);
INSERT INTO igo_connexion (id, nom, connexion, date_modif, connexion_type_id) VALUES (5, 'Vélo', '"http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
"http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
"http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"', '2014-06-03 14:49:09', 5);
*/

INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (2, 'Point', 'POINT', '2014-05-13 14:52:31', 3500, 'V');
INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (3, 'Polygone', 'POLYGON', '2014-05-13 14:52:39', 1500, 'V');
INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (4, 'Multi-Point', 'POINT', '2014-05-13 14:55:17', 3450, 'V');
INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (5, 'Multi-Lignes', 'LINE', '2014-05-13 14:55:23', 2450, 'V');
INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (6, 'Multi-Polygones', 'POLYGON', '2014-05-13 14:55:30', 1450, 'V');
INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (9, 'Cercle', 'CIRCLE', '2014-05-13 14:56:17', 1550, 'V');
INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (8, 'Chart', 'CHART', '2014-05-13 14:57:52', 5000, 'C');
INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (7, 'Raster', 'RASTER', '2014-05-13 14:58:01', 500, 'R');
INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (10, 'Query', 'QUERY', '2014-05-13 14:59:24', NULL, 'Q');
INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (1, 'Ligne', 'LINE', '2014-05-14 13:14:25', 2500, 'P');
INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (11, 'Annotation', 'ANNOTATION', '2014-05-14 13:15:35', 4500, 'R');
INSERT INTO igo_geometrie_type (id, nom, layer_type, date_modif, mf_layer_meta_z_order, geometrie_type) VALUES (12, 'TileIndex', 'TILEINDEX', '2014-05-14 13:15:45', 1400, 'R');

INSERT INTO igo_source_entite(id,url,organisme_responsable_id) VALUES (1,'http://Msp',1);
INSERT INTO igo_source_entite(id,url,organisme_responsable_id) VALUES (3,'http://mamr',10);
INSERT INTO igo_source_entite(id,url,organisme_responsable_id) VALUES (4,'http://mrnf',9);
INSERT INTO igo_source_entite(id,url,organisme_responsable_id) VALUES (2,'http://mcc',2);
INSERT INTO igo_source_entite(id,url,organisme_responsable_id) VALUES (6,'http://mtq',4);

--INSERT INTO igo_classification(id,nom,description,code_geonetwork) VALUES (56,'Carte de référence de la couverture terrestre','Carte de référence Exemples : occupation des terres, imagerie aérienne et satellitale, carte thématiques, carte topographiques','imageryBaseMapsEarthCover');

INSERT INTO igo_connexion(id,nom,connexion,connexion_type_id) VALUES (1,'mapcache','/cgi-wms/mapcache.fcgi/tms/',4);
INSERT INTO igo_connexion(id,nom,connexion,connexion_type_id) VALUES (2,'Google_97d','//maps.googleapis.com/maps/api/js?v=3.17',5);
INSERT INTO igo_connexion(id,nom,connexion,connexion_type_id) VALUES (3,'Connection vide','',6);

INSERT INTO igo_classe_entite(id,nom,description,source_entite_id,classification_id,organisme_responsable_id,contact_id) VALUES (1,'Geobase','Carte de base du gouvernement',1, 56, 1,178);
INSERT INTO igo_classe_entite(id,nom,description,classification_id,organisme_responsable_id,contact_id) VALUES (2,'Google','', 56, 87,178);
INSERT INTO igo_classe_entite(id,nom,description,classification_id,organisme_responsable_id,contact_id) VALUES (3,'Fond Blanc','Fond de carte blanc', 56, 1,178);

INSERT INTO igo_geometrie(id,classe_entite_id,geometrie_type_id,connexion_id, ind_inclusion, mf_layer_projection, acces) VALUES (1,1,7,1, 'T', '', 'D');
INSERT INTO igo_geometrie(id,classe_entite_id,geometrie_type_id,connexion_id, ind_inclusion, mf_layer_projection, acces) VALUES (2,2,7,2, 'T', '900913', 'D');
INSERT INTO igo_geometrie(id,classe_entite_id,geometrie_type_id,connexion_id, ind_inclusion, mf_layer_projection, acces) VALUES (3,3,7,3, 'T', '', 'D');

INSERT INTO igo_groupe (id,nom,est_exclu_arbre) VALUES (1,'Fond de carte', false);

INSERT INTO igo_couche(id,geometrie_id, mf_layer_name, est_fond_de_carte, mf_layer_meta_title) VALUES (1,1, 'carte_gouv_qc', true,'Carte du Gouvernement du Québec');
INSERT INTO igo_couche(id,geometrie_id, mf_layer_name, est_fond_de_carte, mf_layer_meta_title) VALUES (2,2, 'satellite', true,'Google Satellite');
INSERT INTO igo_couche(id,geometrie_id, mf_layer_name, est_fond_de_carte, mf_layer_meta_title) VALUES (3,3, 'fond_blanc', true,'');
INSERT INTO igo_couche(id,geometrie_id, mf_layer_name, est_fond_de_carte, mf_layer_meta_title) VALUES (4,2, 'route', true,'Google Carte');
INSERT INTO igo_couche(id,geometrie_id, mf_layer_name, est_fond_de_carte, mf_layer_meta_title) VALUES (5,2, 'hybride', true,'Google hybride');

INSERT INTO igo_groupe_couche(id, groupe_id, couche_id) VALUES (1,1,1);
INSERT INTO igo_groupe_couche(id, groupe_id, couche_id) VALUES (2,1,2);
INSERT INTO igo_groupe_couche(id, groupe_id, couche_id) VALUES (3,1,3);
INSERT INTO igo_groupe_couche(id, groupe_id, couche_id) VALUES (4,1,4);
INSERT INTO igo_groupe_couche(id, groupe_id, couche_id) VALUES (5,1,5);


ALTER TABLE igo_contact
  ADD CONSTRAINT fk_contact_organisme_responsable FOREIGN KEY (organisme_responsable_id)
      REFERENCES igo_organisme_responsable (id)  
      ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE igo_organisme_responsable
  ADD CONSTRAINT fk_organisme_responsable_contact FOREIGN KEY (contact_id)
      REFERENCES igo_contact (id)  
      ON UPDATE NO ACTION ON DELETE NO ACTION;

SELECT setval('igo_organisme_responsable_id_seq', (SELECT max(id) FROM igo_organisme_responsable));  
SELECT setval('igo_contact_id_seq', (SELECT max(id) FROM igo_contact));  
SELECT setval('igo_connexion_type_id_seq', (SELECT max(id) FROM igo_connexion_type));  
SELECT setval('igo_classification_id_seq', (SELECT max(id) FROM igo_classification));  
SELECT setval('igo_catalogue_csw_id_seq', (SELECT max(id) FROM igo_catalogue_csw));  
SELECT setval('igo_geometrie_type_id_seq', (SELECT max(id) FROM igo_geometrie_type));  
SELECT setval('igo_source_entite_id_seq', (SELECT max(id) FROM igo_source_entite)); 
SELECT setval('igo_connexion_id_seq', (SELECT max(id) FROM igo_connexion)); 
SELECT setval('igo_geometrie_id_seq', (SELECT max(id) FROM igo_geometrie)); 
SELECT setval('igo_couche_id_seq', (SELECT max(id) FROM igo_couche)); 
SELECT setval('igo_classe_entite_id_seq', (SELECT max(id) FROM igo_classe_entite)); 
SELECT setval('igo_groupe_id_seq', (SELECT max(id) FROM igo_groupe)); 
SELECT setval('igo_groupe_couche_id_seq', (SELECT max(id) FROM igo_groupe_couche)); 


INSERT INTO igo_profil (nom, libelle) VALUES('portaladmin','Administrateur Portail');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-VIG-MSP_ANONYME,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP','Anonyme');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-VIG-CONS_SC_SSO,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP','Conseiller en sécurité civile (DGSCSI)');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-GEO-OLIS,ou=GEO,ou=PROD,ou=APP,ou=SSO,o=MSP','DGAP-OLIS');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-GEO-EDITION_LIGNE,ou=GEO,ou=PROD,ou=APP,ou=SSO,o=MSP','Edition en Ligne');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-GEO-EXPERT_DGSCSI,ou=GEO,ou=PROD,ou=APP,ou=SSO,o=MSP','Expert en sécurité civile (DGSCSI)');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-VIG-COORD_911,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP','Groupe 9-1-1Coordonnateur');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-VIG-PIL_911,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP','Groupe 9-1-1Pilote MSP');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-VIG-REPARTITEUR_911,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP','Groupe 9-1-1Répartiteur');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-GEO-PILOTE_INCENDIE,ou=GEO,ou=PROD,ou=APP,ou=SSO,o=MSP','Incendie - Pilote incendie');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-GEO-SERVICE_INCENDIE,ou=GEO,ou=PROD,ou=APP,ou=SSO,o=MSP','Incendie - Service incendie');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-CCF-ARCHEOLOGUE_EXTERNE,ou=CCF,ou=PROD,ou=APP,ou=SSO,o=MSP','MCC Archéologue Externe');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-CCF-PILOTE,ou=CCF,ou=PROD,ou=APP,ou=SSO,o=MSP','MCC Pilote');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-CCF-PILOTE_ADJOINT,ou=CCF,ou=PROD,ou=APP,ou=SSO,o=MSP','MCC Pilote Adjoint');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-CCF-UTILISATEUR_EXTERNE,ou=CCF,ou=PROD,ou=APP,ou=SSO,o=MSP','MCC Utilisateur Externe');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-CCF-UTILISATEUR_INTERNE,ou=CCF,ou=PROD,ou=APP,ou=SSO,o=MSP','MCC Utilisateur Interne');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-MFA-PILOTE,ou=MFA,ou=PROD,ou=APP,ou=SSO,o=MSP','MFA Pilote');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-MFA-UTILISATEUR_INTERNE,ou=MFA,ou=PROD,ou=APP,ou=SSO,o=MSP','MFA Utilisateur Interne');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-MTQ-PILOTE,ou=MTQ,ou=PROD,ou=APP,ou=SSO,o=MSP','MTQ Pilote');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-VIG-OMSC_ANALYSTE,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP','OMSC Analyste');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-VIG-OMSC_EXPLORATEUR,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP','OMSC Explorateur');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-VIG-PARTENAIRE_MO,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP','Partenaire gouvernemental (M/O) en SC');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-VIG-PARTENAIRE_NON_GOUV,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP','Partenaire non-gouvernemental en SC');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-MRNDIF-PILOTE,ou=MRNDIF,ou=PROD,ou=APP,ou=SSO,o=MSP','Pilote de la Direction des inventaires forestiers');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-VIG-PILOTE_COG,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP','Pilote du COG (DGSCSI)');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-VIG-CONS_SC_REG,ou=VIG,ou=PROD,ou=APP,ou=SSO,o=MSP','Pilote régional (DGSCSI)');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-GEO-VIG-ROC_COG,ou=GEO,ou=PROD,ou=APP,ou=SSO,o=MSP','Responsable des opérations au COG (DGSCSI)');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-GEO-UPAC,ou=GEO,ou=PROD,ou=APP,ou=SSO,o=MSP','UPAC');
INSERT INTO igo_profil (nom, libelle) VALUES('cn=GRAPP-GEO-GOCOLLABORATION,ou=GEO,ou=PROD,ou=APP,ou=SSO,o=MSP','Usagers de GO-Collaboration (sans profil Vigilance)');

-- Création des utilisateurs MSP
insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('brin01', true, false);
insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('exbrin01', false, true);

insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('gign02', true, false);
insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('exgign02', false, true);

insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('trom05', true, false);
insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('extrom05', false, true);

insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('lesl01', true, false);
insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('exlesl01', false, true);

insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('gouf02', true, false);
insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('exgouf02', false, true);

insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('barm08', true, false);
insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('exbarm08', false, true);

insert into igo_utilisateur (nom, est_admin, est_pilote) VALUES ('morf07', true, false);