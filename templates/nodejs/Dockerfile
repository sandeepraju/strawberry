FROM node:0.10.40

RUN mkdir -p /code
WORKDIR /code

# ONBUILD COPY package.json /code
# RUN npm install
RUN npm install -g express-generator
ADD . /code/

CMD [ "npm", "start" ]
EXPOSE 8888
