# FE
FROM node:erbium AS client
COPY client/package.json client/package-lock.json ./

RUN npm install

COPY client ./

RUN npm run build

# BE
FROM node:erbium AS dist
COPY server/package.json server/package-lock.json ./

RUN npm install

COPY server ./

RUN npm run build

# BE modules
FROM node:erbium AS node_modules
COPY server/package.json server/package-lock.json ./

RUN npm install --production

# server
FROM node:erbium

RUN mkdir -p /opt

WORKDIR /opt

COPY --from=dist dist /opt/dist
COPY --from=dist package.json /opt/package.json
COPY --from=client build /opt/dist/app
COPY --from=node_modules node_modules /opt/node_modules

CMD [ "npm", "start" ]
