#!/bin/bash

cd "$1"

SED_OPTION="-r"
if [ "$(uname)" == "Darwin" ]; then
    SED_OPTION="-E"
fi

referenceFile=$(mktemp -t rigantestools.dtd)
grep -Eo "ENTITY [a-zA-Z\.]+ " en-US/rigantestools.dtd | sed $SED_OPTION "s/(ENTITY| )//g" > "$referenceFile"

ls -1 */rigantestools.dtd | while read file ; do
    tmpFile=$(mktemp -t rigantestools.dtd)
    grep -Eo "ENTITY [a-zA-Z\.]+ " "$file" | sed $SED_OPTION "s/(ENTITY| )//g" > "$tmpFile"
    echo "**** $file ****"
    diff "$referenceFile" "$tmpFile"
    rm "$tmpFile"
done

rm "$referenceFile"

echo " === "

referenceFile=$(mktemp -t rigantestools.dtd)
grep -Eo "^[a-zA-Z\.]+=" en-US/rigantestools.properties > "$referenceFile"

ls -1 */rigantestools.properties | while read file ; do 
    tmpFile=$(mktemp -t rigantestools.properties)
    grep -Eo "^[a-zA-Z\.]+=" "$file" > "$tmpFile"
    echo "**** $file ****"
    diff "$referenceFile" "$tmpFile"
    rm "$tmpFile"
done

rm "$referenceFile"
