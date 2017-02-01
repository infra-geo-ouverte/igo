2 méthodes pour faire le build de IGO:

1) Avec nodejs et uglify:
nodejs ../../../librairie/r.js/dist/r.js -o build.js


2) Avec java et closure compiler:
Si on utilise cette méthode, il faut décommenter la ligne - optimize: "closure", -

Pour Linux:
java -classpath ../../../librairie/r.js/lib/rhino/js.jar:../../../librairie/r.js/lib/closure/compiler.jar org.mozilla.javascript.tools.shell.Main ../../../librairie/r.js/dist/r.js -o build.js

Pour Windows:
java -classpath ../../../librairie/r.js/lib/rhino/js.jar;../../../librairie/r.js/lib/closure/compiler.jar org.mozilla.javascript.tools.shell.Main ../../../librairie/r.js/dist/r.js -o build.js


======================================================================

Pour faire le build de GeoExt et extensions:
python build_geoext.py
python build_geoext-debug.py

python build_LayerTreeBuilder.py

python build_WMSBrowser.py


Pour OpenLayers:
cd ../../../librairie/openlayers/build/
python buildUncompressed.py full ../OpenLayers.debug.js
python build.py full ../OpenLayers.js
