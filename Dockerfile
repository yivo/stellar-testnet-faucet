FROM node:8-jessie

RUN mkdir /app
WORKDIR /app

RUN npm install stellar-sdk@0.15.0

COPY . /app
