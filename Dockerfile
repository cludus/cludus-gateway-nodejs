FROM node:21

WORKDIR /usr/src/app

COPY . .
RUN npm install
RUN npm run build:docker

ENV PORT 8080
ENV NODE_ENV 'live'

EXPOSE 8080
CMD [ "node", "build/index.js" ]
