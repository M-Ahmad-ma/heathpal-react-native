#!/bin/bash
# Fix the generated ReactNativeApplicationEntryPoint.java file

ENTRY_POINT_FILE="app/build/generated/autolinking/src/main/java/com/facebook/react/ReactNativeApplicationEntryPoint.java"

if [ -f "$ENTRY_POINT_FILE" ]; then
  sed -i 's/com\.rnwithnativewind\.BuildConfig/com.healthpal.BuildConfig/g' "$ENTRY_POINT_FILE"
  echo "Fixed package name in $ENTRY_POINT_FILE"
fi
