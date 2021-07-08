FROM alpine:3.12
RUN apk add --update --no-cache \
  graphviz \
  ttf-freefont \
  nodejs \
  bash

WORKDIR /usr/src/app

ENV PUFFERFISH_OUTPUT_FORMAT png

COPY ./dist ./dist
COPY ./node_modules ./dist/node_modules/
COPY ./images ./images
COPY ./run.sh .

CMD ./run.sh ./templates ./images ./output ${PUFFERFISH_OUTPUT_FORMAT}
