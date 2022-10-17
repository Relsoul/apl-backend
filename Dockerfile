
### build docs @see https://www.tomray.dev/nestjs-docker-production
### build multistage @see https://earthly.dev/blog/docker-multistage/
##### local test
### docker build >>> DOCKER_BUILDKIT=0 docker build -t eplus-node .
### docker run   >>> docker run -it -p3000:3000 eplus-node

###################
# BUILD FOR PRODUCTION
###################


FROM node:16 As production
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
# 设置阿里云npm加速
RUN npm config set registry  https://registry.npmmirror.com


EXPOSE 7790

WORKDIR /build-node

COPY . /build-node

RUN rm -rf .env

RUN mv .env.production .env

#RUN ls -alh

RUN npm install

# 设置NODE为ENV环境
ENV NODE_ENV production

RUN npm run build

RUN rm -rf /build-node/src

#RUN ls -alh

CMD ["npm run start:prod" ]
