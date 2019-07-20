FROM ubuntu:18.04

ENV DEBIAN_FRONTEND noninteractive

WORKDIR /usr/src/app

RUN apt-get update
RUN apt-get install -y libcurl4 curl apt-utils libreadline7 libreadline-dev git make g++ build-essential
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
RUN apt-get install -y nodejs

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5666

CMD [ "node", "src/index.js" ]
