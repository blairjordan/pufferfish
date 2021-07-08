#!/bin/bash
# Loops through files in templates directory and outputs diagram(s) in the specified format.
# See https://graphviz.org/doc/info/output.html for a list of formats.
# Usage: run.sh [input_dir] [image_dir] [output_dir] [format] 
export INPUT_DIRECTORY=${1:-templates} 
export IMPORT_IMAGES_DIRECTORY=${2:-images} 
export OUTPUT_DIRECTORY=${3:-output} 
export FORMAT=${4:-png} 
mkdir -p ${OUTPUT_DIRECTORY}
cp -r ${IMPORT_IMAGES_DIRECTORY} ${OUTPUT_DIRECTORY}
for TEMPLATE in ./templates/*.hbs
do
  export FNAME="${TEMPLATE##*/}"
  node ./dist/index.js --template "$TEMPLATE" --out "${FNAME%.*}.dot"
  dot "${FNAME%.*}.dot" -q -T${FORMAT} -o "${OUTPUT_DIRECTORY}/${FNAME%.*}.${FORMAT}"
done