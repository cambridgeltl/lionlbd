#!/bin/bash
# *************************************************
# *************************************************
# *** Process for creating auto-complete tables ***
# *************************************************
# *************************************************

# *************************************************
# ******************* IMPORTANT *******************
# *************************************************
# **** Wait until all other tables have been ******
# ****** created in both Postgres and Neo4J. ******
# *** This includes the Hallmark counts in Neo4j **
# *************************************************
# *************************************************


# Create core data for 'nodetext' database table and save as 'nodetext.csv'

python Step_1_Create_Core_Nodetext.py

#Remove hallmarks from CSV file, we'll add them again in at step 2. Also remove DNAMutation and ProteinMutation and NCBIGENE

grep -v '^HOC'  nodetext.vtejas.csv | grep -v '^DNAMutation' | grep -v '^ProteinMutation' | grep -v '^NCBIGENE' > nodetext.csv

# Recreate 'nodetext' database table and load 'nodetext.csv' and 'hallmarks.csv" nodes into it

#su postgres
#psql -U postgres lion-dev < Step_2_Load_Data.psql

#We have named peer login, so just need to be logged in as a super user
#su lion
psql lion-dev < Step_2_Load_Data.psql

# Update statistics for hallmark nodes within 'nodetext'
# This is necessary as we are unable to extract these stats during our aggregator stage

python Step_3_Update_Hallmark_Counts.py

# Rebuild autocomplete optimization tables

#psql -U postgres lion-dev < Step_4_Create_Nodetext_Optimization.psql
psql lion-dev < Step_4_Create_Nodetext_Optimization.psql

