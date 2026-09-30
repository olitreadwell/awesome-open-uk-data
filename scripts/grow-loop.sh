#!/bin/bash
# Thin entrypoint for the UK directory grow loop.
# Shared logic lives in code/open-data/usa-uk-data-stack/loops/loop-wrapper.sh.
exec "$HOME/code/open-data/usa-uk-data-stack/loops/loop-wrapper.sh" \
  "$HOME/code/open-data/awesome-open-uk-data" \
  "$HOME/code/open-data/awesome-open-uk-data/scripts/grow-loop-prompt.txt" \
  "$HOME/code/open-data/awesome-open-uk-data/scripts/heal-grow-loop-prompt.txt" \
  awesome-open-uk-data
