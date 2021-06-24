FROM node:12 AS build
WORKDIR /signaling-server-build
COPY . .
RUN npm install
RUN npm run build

FROM node:12
WORKDIR /signaling-server
COPY --from=build /signaling-server-build/dist .
COPY package.json .
RUN npm install --production
EXPOSE 8000
CMD ["node", "bin.js"]