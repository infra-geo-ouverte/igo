<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gco="http://www.isotc211.org/2005/gco" xmlns:gmx="http://www.isotc211.org/2005/gmx" xmlns:srv="http://www.isotc211.org/2005/srv" xmlns:gml="http://www.opengis.net/gml" xmlns:gts="http://www.isotc211.org/2005/gts" xmlns:che="http://www.geocat.ch/2008/che" xmlns:geonet="http://www.fao.org/geonetwork" xmlns:exslt="http://exslt.org/common" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0">
  <!-- Load labels. Du site de l'université laval : ttp://geocatalog.bibl.ulaval.ca
  <xsl:variable name="label" select="document('http://geocatalog.bibl.ulaval.ca/geonetwork/xml/schemas/iso19139/loc/fr/labels.xml')"/>
  <xsl:variable name="value" select="document('http://geocatalog.bibl.ulaval.ca/geonetwork/xml/schemas/iso19139/loc/fr/codelists.xml')"/> -->
  <xsl:variable name="label" select="document('csw/labels.xml')"/>
  <xsl:variable name="value" select="document('csw/codelists.xml')"/>

  <xsl:template match="gmd:MD_Metadata">
    <xsl:call-template name="content"/>
  </xsl:template>
  <xsl:template name="content">
    <h1>
		<span class="contentImg">
			<img src="//localhost/pilotage/csw/icon_populaire.png" width="44" height="44"/>
		</span>
      <span>
        <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:title/gco:CharacterString"/>
      </span>
	  <!-- CONDITION ACRIGÉO POUR L'AFFICHAGE -->
		<xsl:choose>	
		<xsl:when test="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gco:CharacterString = 'ACRIGéo'">
			<div class="clear">
			  <br/>
			</div>
			<center>
			<img src="//localhost/pilotage/csw/acrigeo.JPG" width="95" height="50"/> 
			<br/><a href="../../../docs/metadonne_geonetwork/acrigeo_modalite/acrigeo.htm" target="_blank"><font size="3">Qu'est-ce que l'ACRIgéo ?</font></a>
			<br/><br/>
			<span><a href="mailto:ACRIGEONETWORK@msp.gouv.qc.ca?Subject=ACRIGeoNetwork"><img src="csw/icon_nous_joindre.png"/><font size="3">Joindre l'ACRIgéo</font></a></span>
			</center>
			
		</xsl:when>
		</xsl:choose>
	<!-- FIN DE LA CONDITION ACRIGÉO POUR L'AFFICHAGE -->
    </h1>
    <div class="clear">
      <br/>
      <br/>
    </div>
    <!-- Resume-->

    <h2>
      <xsl:value-of select="string($label/labels/element[@name='gmd:abstract']/label)"/>
    </h2>
    <p>
      <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:abstract/gco:CharacterString"/>
    </p>
    <xsl:if test="count(gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine[gmd:CI_OnlineResource/gmd:protocol/gco:CharacterString = 'WWW:LINK-1.0-http--samples']) &gt; 0"> 
	<h2>
		Aperçu
    </h2>
	<p>
		<ul>
			<xsl:for-each select="gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine[gmd:CI_OnlineResource/gmd:protocol/gco:CharacterString = 'WWW:LINK-1.0-http--samples']">
				  <li>
					<a href="{gmd:CI_OnlineResource/gmd:linkage/gmd:URL}" target="_new">
					  <xsl:value-of select="gmd:CI_OnlineResource/gmd:name/gco:CharacterString"/>
					<xsl:text disable-output-escaping="no">. </xsl:text>
					<xsl:value-of select="gmd:CI_OnlineResource/gmd:description/gco:CharacterString"/>
					</a>
				  </li>
			</xsl:for-each>
		</ul>
	</p>
	</xsl:if>
	
    <!-- But -->  
                  
  <xsl:for-each select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:purpose">
    <xsl:if test="gco:CharacterString != ''">
      <h2>
        <xsl:value-of select="string($label/labels/element[@name='gmd:purpose']/label)"/>
      </h2>
     </xsl:if>
  </xsl:for-each>
  <p>
    <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:purpose/gco:CharacterString"/>
  </p>
    
  <!--Raccourci-->  
    
	    <xsl:text disable-output-escaping="no"> </xsl:text>
    <ul class="listeOrange">
      <li>
        <a href="#meta_pointOfContact">
          <xsl:value-of select="string($label/labels/element[@name='gmd:pointOfContact']/label)"/>
        </a>
      </li>
      <li>
        <a href="#meta_identificationInfo">
          <xsl:value-of select="string($label/labels/element[@name='gmd:identificationInfo']/label)"/>
        </a>
      </li>
	  
		<!-- CONDITION ACRIGÉO POUR L'AFFICHAGE -->
		<xsl:choose>	
		<xsl:when test="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gco:CharacterString = 'ACRIGéo'">	 	  
	  <li>
        <a href="#meta_DQ_DataQualityContact">
          <xsl:value-of select="string($label/labels/element[@name='gmd:DQ_DataQuality']/label)"/>
        </a>
      </li>
	  </xsl:when>
		</xsl:choose>
		<!-- FIN DE LA CONDITION ACRIGÉO POUR L'AFFICHAGE -->
 
      <li>
        <a href="#meta_distributorContact">
          <xsl:value-of select="string($label/labels/element[@name='gmd:distributionInfo']/label)"/>
        </a>
      </li>
      <li>
        <a href="#meta_metadata">Informations sur la métadonnée</a>
      </li>
      <li>
        <a href="#meta_telechargement">Téléchargement</a>
      </li>	  
	<span></span>
    </ul>
    <xsl:text disable-output-escaping="no"> </xsl:text>
	
    <!-- Point de contact-->
    <h2 id="meta_pointOfContact">
      <xsl:value-of select="string($label/labels/element[@name='gmd:pointOfContact']/label)"/>
    </h2>
    <table border="1">
      <tr>
        <th scope="row">
          <xsl:call-template name="codelist">
            <xsl:with-param name="code" select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:role/gmd:CI_RoleCode/@codeListValue"/>
            <xsl:with-param name="path" select="string('gmd:CI_RoleCode')"/>
          </xsl:call-template>
        </th>
        <td>

          <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:organisationName/gco:CharacterString"/>
          <br/>
		  
		<!-- CONDITION ACRIGÉO POUR L'AFFICHAGE -->
		<xsl:choose>	
		<xsl:when test="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gco:CharacterString = 'ACRIGéo'">
			<xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:individualName/gco:CharacterString"/> (Coordonnateur)
			<br/>
			<xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:voice/gco:CharacterString"/>
			<br/>
		</xsl:when>
		</xsl:choose>
		<!-- FIN DE LA CONDITION ACRIGÉO POUR L'AFFICHAGE -->
		  
          <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:streetNumber/gco:CharacterString"/>
          <br/>
          <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:deliveryPoint/gco:CharacterString"/>
          <br/>
          <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:city/gco:CharacterString"/>
          <xsl:text disable-output-escaping="no"> </xsl:text>
          <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:postalCode/gco:CharacterString"/>
          <xsl:text disable-output-escaping="no"> </xsl:text>
          <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:city/gco:CharacterString"/>
          <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:phone/gmd:CI_Telephone/gmd:facsimile/gco:CharacterString"/>
          <br/>
          <a href="mailto:{gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString}">
            <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:address/gmd:CI_Address/gmd:electronicMailAddress/gco:CharacterString"/>
          </a>
          <br/>
          <a href="{gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:onlineResource/gmd:CI_OnlineResource/gmd:linkage/gmd:PT_FreeURL/gmd:URLGroup/gmd:LocalisedURL/text()}" target="_new">
            <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:onlineResource/gmd:CI_OnlineResource/gmd:linkage/gmd:PT_FreeURL/gmd:URLGroup/gmd:LocalisedURL/text()"/>
          </a>
          <br/>
          <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:pointOfContact/gmd:CI_ResponsibleParty/gmd:contactInfo/gmd:CI_Contact/gmd:hoursOfService/gco:CharacterString"/>
        </td>
      </tr>
    </table>
    <!-- Information de l'identification-->
    <h2 id="meta_identificationInfo">
      <xsl:value-of select="string($label/labels/element[@name='gmd:identificationInfo']/label)"/>
    </h2>
    <table border="1">
      <!-- date de la création de la donnée-->
      <tr>
        <th scope="row">
          <xsl:value-of select="string($label/labels/element[@name='gmd:CI_Date']/label)"/>
        </th>
        <td>
          <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:citation/gmd:CI_Citation/gmd:date/gmd:CI_Date/gmd:date/gco:DateTime"/>
        </td>
      </tr>
      <!-- Fréquence-->
      <tr>
        <th scope="row">
          <xsl:value-of select="string($label/labels/element[@name='gmd:maintenanceAndUpdateFrequency']/label)"/>
        </th>
        <td>
          <xsl:call-template name="codelist">
            <xsl:with-param name="code" select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:resourceMaintenance/gmd:MD_MaintenanceInformation/gmd:maintenanceAndUpdateFrequency/gmd:MD_MaintenanceFrequencyCode/@codeListValue"/>
            <xsl:with-param name="path" select="string('gmd:MD_MaintenanceFrequencyCode')"/>
          </xsl:call-template>
        </td>
      </tr>
      <!-- thématique-->
      <tr>
        <th scope="row">
          <xsl:value-of select="string($label/labels/element[@name='gmd:MD_TopicCategoryCode']/label)"/>
        </th>
        <td>
          <ul>
            <xsl:for-each select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:topicCategory">
              <li>
                <xsl:call-template name="codelist">
                  <xsl:with-param name="code" select="gmd:MD_TopicCategoryCode"/>
                  <xsl:with-param name="path" select="string('gmd:MD_TopicCategoryCode')"/>
                </xsl:call-template>
              </li>
            </xsl:for-each>
          </ul>
        </td>
      </tr>
      <!-- Mot clé ******désactivé par msp***** 
      <tr>
        <th scope="row">
          <xsl:value-of select="string($label/labels/element[@name='gmd:keyword']/label)"/>
        </th>
        <td>
          <ul>
            <xsl:for-each select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword">
              
              <li>
                <xsl:value-of select="gco:CharacterString"/>
              </li>
            </xsl:for-each>
          </ul>
        </td>
      </tr> -->
      <!-- Langue-->
      <tr>
        <th scope="row">
          <xsl:value-of select="string($label/labels/element[@name='gmd:language']/label)"/>
        </th>
        <xsl:for-each select="gmd:language/gmd:LanguageCode">
          <xsl:if test="@codeListValue = 'fre'">
            <td bgcolor="#ffffff" valign="TOP">
              <xsl:text disable-output-escaping="no">Français </xsl:text>
            </td>
          </xsl:if>
        </xsl:for-each>
      </tr>
      <!-- Jeu de caractère-->
      <tr>
        <th scope="row">
          <xsl:value-of select="string($label/labels/element[@name='gmd:characterSet']/label)"/>
        </th>
        <td>
          <xsl:call-template name="codelist">
            <xsl:with-param name="code" select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:characterSet/gmd:MD_CharacterSetCode/@codeListValue"/>
            <xsl:with-param name="path" select="string('gmd:MD_CharacterSetCode')"/>
          </xsl:call-template>
        </td>
      </tr>
	
	<!-- CONDITION ACRIGÉO POUR L'AFFICHAGE -->
	<xsl:choose>	
		<xsl:when test="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gco:CharacterString = 'ACRIGéo'">
		<!-- système de référence-->		
			<tr>
				<th scope="row">
						<xsl:value-of select="string($label/labels/element[@name='gmd:referenceSystemIdentifier']/label)"/>
				</th>
				<td>
					<xsl:value-of select="gmd:referenceSystemInfo/gmd:MD_ReferenceSystem/gmd:referenceSystemIdentifier/gmd:RS_Identifier/gmd:code/gco:CharacterString"/>
				</td>
			</tr>
		<!-- Échelle-->	
			<tr>
				<th scope="row">
						<xsl:value-of select="string($label/labels/element[@name='gmd:MD_RepresentativeFraction']/label)"/>
				</th>
				<xsl:choose>	
				<xsl:when test="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:spatialResolution/gmd:MD_Resolution/gmd:equivalentScale/gmd:MD_RepresentativeFraction/gmd:denominator/gco:Integer != '0'">
				<td>
					1 / <xsl:value-of select="format-number(gmd:identificationInfo/gmd:MD_DataIdentification/gmd:spatialResolution/gmd:MD_Resolution/gmd:equivalentScale/gmd:MD_RepresentativeFraction/gmd:denominator/gco:Integer, '#.###,##')"/>
				</td>
				</xsl:when>
				<xsl:otherwise>
				<td>
					Non-définie.
				</td>
			</xsl:otherwise>
			</xsl:choose>
		</tr>
		
		</xsl:when>
	</xsl:choose>	
		<!-- FIN DE LA CONDITION ACRIGÉO POUR L'AFFICHAGE -->	
		
    </table>
	
	<!-- CONDITION ACRIGÉO POUR L'AFFICHAGE -->
	<xsl:choose>	
		<xsl:when test="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gco:CharacterString = 'ACRIGéo'">
	<!--Informations sur la distribution -->
    <h2 id="meta_DQ_DataQualityContact">
      <xsl:value-of select="string($label/labels/element[@name='gmd:DQ_DataQuality']/label)"/>
    </h2>
    <table border="1">
	<!-- Étape du processus - ex. méthode de captage -->
		<tr>
				<th scope="row">
						<xsl:value-of select="string($label/labels/element[@name='gmd:sourceStep']/label)"/>
				</th>
				<td>
					<xsl:value-of select="gmd:dataQualityInfo/gmd:DQ_DataQuality/gmd:lineage/gmd:LI_Lineage/gmd:processStep/gmd:LI_ProcessStep/gmd:description/gco:CharacterString"/>
				</td>
			</tr>	
	</table>
		</xsl:when>
	</xsl:choose>
		<!-- FIN DE LA CONDITION ACRIGÉO POUR L'AFFICHAGE -->
	
    <!--Informations sur la distribution -->
    <h2 id="meta_distributorContact">
      <xsl:value-of select="string($label/labels/element[@name='gmd:distributionInfo']/label)"/>
    </h2>
    <table border="1">
      <!-- Ressources en lignes -->
      <tr>
        <th scope="row">
          <xsl:value-of select="string($label/labels/element[@name='gmd:CI_OnlineResource']/label)"/>
        </th>
        <td>
          <ul>
            <xsl:for-each select="gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine[gmd:CI_OnlineResource/gmd:protocol/gco:CharacterString != 'WWW:LINK-1.0-http--samples' and gmd:CI_OnlineResource/gmd:protocol/gco:CharacterString != 'WWW:DOWNLOAD-1.0-http--download' and gmd:CI_OnlineResource/gmd:protocol/gco:CharacterString != 'WWW:DOWNLOAD-1.0-ftp--download']">
              <li>
                <xsl:value-of select="gmd:CI_OnlineResource/gmd:name/gco:CharacterString"/>
                <xsl:text disable-output-escaping="no">. </xsl:text>
                <xsl:value-of select="gmd:CI_OnlineResource/gmd:description/gco:CharacterString"/>
                <br/>
                <a href="{gmd:CI_OnlineResource/gmd:linkage/gmd:URL}" target="_new">
                  <xsl:value-of select="/gmd:CI_OnlineResource/gmd:linkage/gmd:URL"/>
                  <xsl:value-of select="gmd:CI_OnlineResource/gmd:linkage/gmd:URL"/>
                </a>
              </li>
            </xsl:for-each>
          </ul>
        </td>
      </tr>
      <!--MSP Format de distribution -->
      <tr>
        <th scope="row">
          <xsl:value-of select="string($label/labels/element[@name='gmd:resourceFormat']/label)"/>
        </th>
        <td>
          <xsl:value-of select="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:resourceFormat/gmd:MD_Format/gmd:name/gco:CharacterString"/>
        </td>
      </tr>
	  

	  
    </table>
    <!--Metadonnées -->
    <h2 id="meta_metadata">
      <xsl:text disable-output-escaping="no">Informations sur la métadonnée</xsl:text>
    </h2>
    <table border="1">
      <!-- Identifiant du fichier -->
      <tr>
        <th scope="row">
          <xsl:value-of select="string($label/labels/element[@name='gmd:fileIdentifier']/label)"/>
        </th>
        <td>
          <xsl:value-of select="gmd:fileIdentifier/gco:CharacterString"/>
        </td>
      </tr>
      <!-- Date de création de la fiche -->
      <tr>
        <th scope="row">
          <xsl:value-of select="string($label/labels/element[@name='gmd:dateStamp']/label)"/>
        </th>
        <td>
          <xsl:value-of select="gmd:dateStamp/gco:DateTime"/>
        </td>
      </tr>
      <!--Contraintes d'utilisation  -->
      <tr>
        <th scope="row">Contraintes d'utilisation </th>
		<td>
		
		<!-- CONDITION ACRIGÉO POUR L'AFFICHAGE DE LA LICENCE ACRIGÉO -->
		<xsl:choose>	
		<xsl:when test="gmd:identificationInfo/gmd:MD_DataIdentification/gmd:descriptiveKeywords/gmd:MD_Keywords/gmd:keyword/gco:CharacterString = 'ACRIGéo'">
		L’utilisation des données géographiques partageables au sein de l’ACRIgéo est soumise à des <a href="../../../docs/metadonne_geonetwork/acrigeo_modalite/MD_Modalites_Partage_IGG_20131216_final.pdf" target="_new" ><font color="red"><b>modalités</b></font>
		</a> et des <a href="../../../docs/metadonne_geonetwork/acrigeo_modalite/CU_Conditions_utilisation_IGGP_ACRIGeo_20131211_final.pdf" target="_new"><font color="red"><b>conditions d’utilisation</b></font></a> différentes des données ouvertes gouvernementales.
		</xsl:when>
	  <!-- AFFICHAGE DE LA LICENCE PAR DÉFAUT - DONNÉES OUVERTES -->
		<xsl:otherwise>
          <a href="./?node=/licence">Licence sur l’utilisation des données ouvertes</a>
		</xsl:otherwise>
		</xsl:choose>
	<!-- FIN DE LA CONDITION ACRIGÉO POUR L'AFFICHAGE -->
		


        </td>
		
		
      </tr>
      <!-- Nom du standard de métadonnées -->
      <tr>
        <th scope="row">
          <xsl:value-of select="string($label/labels/element[@name='gmd:metadataStandardName']/label)"/>
        </th>
        <td>
          <xsl:value-of select="gmd:metadataStandardName/gco:CharacterString"/>
        </td>
      </tr>
    </table>
    <!-- Metadonnées FIN-->
	<!-- Téléchargement -->
	<xsl:if test="count(gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine[gmd:CI_OnlineResource/gmd:protocol/gco:CharacterString = 'WWW:DOWNLOAD-1.0-http--download' or gmd:CI_OnlineResource/gmd:protocol/gco:CharacterString = 'WWW:DOWNLOAD-1.0-ftp--download']) &gt; 0"> 
	<h2 id="meta_telechargement">
		Téléchargement
    </h2>

	<p>
	<ul>
	<!-- Clause seulement les liens de Téléchargement - MSP-MRN plus si un lien = metalien_dogouvqc, passer outre -->	
		<xsl:for-each select="gmd:distributionInfo/gmd:MD_Distribution/gmd:transferOptions/gmd:MD_DigitalTransferOptions/gmd:onLine[(gmd:CI_OnlineResource/gmd:protocol/gco:CharacterString = 'WWW:DOWNLOAD-1.0-http--download' or gmd:CI_OnlineResource/gmd:protocol/gco:CharacterString = 'WWW:DOWNLOAD-1.0-ftp--download' or gmd:CI_OnlineResource/gmd:name/gco:CharacterString = '') and (gmd:CI_OnlineResource/gmd:name/gco:CharacterString != 'metalien_dogouvqc' or not(gmd:CI_OnlineResource/gmd:name/gco:CharacterString)  )]">		
			<xsl:text disable-output-escaping="no"> </xsl:text>				
				<li>
				<xsl:choose>
					<xsl:when test="gmd:CI_OnlineResource/gmd:name/gco:CharacterString != ''">
						<a href="{gmd:CI_OnlineResource/gmd:linkage/gmd:URL}" target="_new">
						 <img alt="télécharger" src="//localhost/pilotage/csw/download.png"/> &#160; <xsl:value-of select="gmd:CI_OnlineResource/gmd:name/gco:CharacterString"/>			
						</a>	
					</xsl:when>
					<xsl:otherwise>
						<a href="{gmd:CI_OnlineResource/gmd:linkage/gmd:URL}" target="_new">
						 <img alt="télécharger" src="//localhost/pilotage/csw/download.png"/> &#160; Télécharger le fichier			
						</a>	
					</xsl:otherwise>
				</xsl:choose>
			<xsl:if test="gmd:CI_OnlineResource/gmd:description/gco:CharacterString != ''">				
			&#160;(<xsl:value-of select="gmd:CI_OnlineResource/gmd:description/gco:CharacterString"/>)
			</xsl:if>

			</li>
		</xsl:for-each>
	</ul>
	</p>
	</xsl:if>	
	<!-- Téléchargement FIN-->
  </xsl:template>
  <xsl:template name="codelist">
    <xsl:param name="code"/>
    <xsl:param name="path"/>
    <xsl:value-of select="string($value/codelists/codelist[@name= $path]/entry[code = $code]/label)"/>
  </xsl:template>
</xsl:stylesheet>