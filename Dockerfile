FROM public-env-mirror-service-registry.cn-beijing.cr.aliyuncs.com/dockerhub/node:14.21

# test/prod
ARG NODE_ENV

RUN echo "--------NODE_ENV: ${NODE_ENV}"

ENV NODE_ENV=$NODE_ENV


USER root

WORKDIR /home/x-core

RUN npm i -g cross-env

RUN npm config set registry https://packages.aliyun.com/61e54b0e0bb300d827e1ae27/npm/npm-registry/:_authToken=93743886-a119-441a-985c-5c5b3aa75191

COPY . .

RUN npm install

EXPOSE 8066

CMD ["npm", "run", "start-x-core"]