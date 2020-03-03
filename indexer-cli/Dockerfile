FROM node:12-alpine

WORKDIR /opt

ENV PATH /opt/node_modules/.bin:$PATH

COPY package.json /opt/package.json
RUN npm install

COPY ./config /opt/config
COPY ./.npm-scripts /opt/.npm-scripts
COPY ./src /opt/src
COPY ./tsconfig.build.json /opt/tsconfig.build.json
COPY ./tsconfig.json /opt/tsconfig.json
COPY ./tslint.json /opt/tslint.json

RUN npm run build
COPY ./.env.example /opt/dist/.env

WORKDIR /opt/dist
CMD node ./src/index.js index --watch /data
