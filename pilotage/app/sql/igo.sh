psql -h spssogl97d.sso.msp.gouv.qc.ca -d pgsyst -U $1 -f creation_de_tables.sql
psql -h spssogl97d.sso.msp.gouv.qc.ca -d pgsyst -U $1 -f donnees.sql
