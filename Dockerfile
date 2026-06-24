FROM node:20-alpine AS build
WORKDIR /build
COPY package.json yarn.lock tsconfig.json ./
COPY src ./src
COPY types ./types
COPY .eslintrc.json .eslintignore ./
RUN yarn install --frozen-lockfile --production=false \
 && yarn build-ts \
 && yarn install --frozen-lockfile --production --ignore-scripts

FROM alpine:3.20 AS icons
RUN apk add --no-cache bash unzip
WORKDIR /icons
COPY vendor ./vendor
COPY bin/fetch-icons.sh ./bin/fetch-icons.sh
RUN bash bin/fetch-icons.sh

FROM node:20-alpine
RUN apk add --no-cache graphviz ttf-freefont bash
WORKDIR /usr/src/app

COPY --from=build /build/dist ./dist
COPY --from=build /build/node_modules ./node_modules
COPY --from=icons /icons/aws-icons ./aws-icons
COPY --from=icons /icons/azure-icons ./azure-icons
COPY --from=icons /icons/gcp-icons ./gcp-icons
COPY pufferfish.config.json styles.json SYNTAX.md ./
COPY examples ./examples
COPY bin/pufferfish /usr/local/bin/pufferfish

ENV PUFFERFISH_HOME=/usr/src/app

ENTRYPOINT ["pufferfish"]
CMD ["help"]
