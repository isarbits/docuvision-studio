# BE
FROM node:erbium AS dist
COPY server/package.json server/package-lock.json ./

RUN npm install

COPY server .

RUN npm run build

# FE
FROM node:erbium AS client
COPY client/package.json client/package-lock.json ./

RUN npm install

COPY client .
COPY --from=dist . server

RUN npm run build

# BE modules
FROM node:erbium AS node_modules
COPY server/package.json server/package-lock.json ./

RUN npm install --production

# server
FROM node:erbium

RUN npm i -g pm2
RUN pm2 install pm2-logrotate

WORKDIR /opt

COPY --from=dist dist /opt/dist
COPY --from=dist package.json /opt/package.json
COPY --from=dist config/pm2-config*.json /opt/pm2/
COPY --from=client build /opt/dist/app
COPY --from=node_modules node_modules /opt/node_modules

CMD "pm2-runtime /opt/pm2/pm2-config.json"
