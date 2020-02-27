FROM node:12-alpine

WORKDIR /opt

ENV PATH /opt/node_modules/.bin:$PATH

COPY package.json /opt/package.json
RUN npm install

COPY ./public /opt/public
COPY ./src /opt/src
COPY ./tsconfig.json /opt/tsconfig.json

# yolo - just run react in dev proxy mode so we don't have to host
RUN sed -i 's|"proxy": "http://localhost:9200/docuvision"|"proxy": "http://ds_elastic:9200/docuvision"|' package.json

CMD ["npm", "start"]
