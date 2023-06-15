FROM node:18.10.0-alpine AS BUILD_IMAGE
WORKDIR /app
COPY . .
RUN npm install
RUN npx prisma generate
RUN npm run build

FROM node:18.10.0-alpine
WORKDIR /app
# copy from build image
COPY --from=BUILD_IMAGE /app/dist ./dist
COPY --from=BUILD_IMAGE /app/node_modules ./node_modules
COPY package.json ./
COPY package-lock.json ./
COPY ./prisma ./prisma
COPY *.env ./

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
  echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
  apk add doppler

CMD ["doppler", "run", "--", "npm", "run", "start:prod"]
