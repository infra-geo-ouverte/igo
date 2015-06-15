2 méthodes pour faire le build de IGO:

Avec nodejs et uglify:
nodejs r/r.js -o build.js

Avec java et closure compiler:
Si on utilise cette méthode, il faut décommenter la ligne - optimize: "closure", -
java -classpath r/lib/rhino/js.jar:r/lib/closure/compiler.jar org.mozilla.javascript.tools.shell.Main r/r.js -o build.js





Pour faire le build de GeoExt et extensions:
python build_geoext.py
python build_geoext-debug.py

python build_LayerTreeBuilder.py

python build_WMSBrowser.py


Pour OpenLayers:
cd ../../../librairie/OpenLayers/OpenLayers-2.13.1/build/
python buildUncompressed.py full ../OpenLayers.debug.js
python build.py full ../OpenLayers.js
