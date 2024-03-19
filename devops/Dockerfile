FROM node:16.20.2
ARG BUILD_MODE

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH

COPY . /app
RUN npm install --prefix /app
RUN npm --prefix /app run build:$BUILD_MODE

COPY ./devops/docker-entrypoint.sh /usr/local/bin/front_boot
RUN chmod +x /usr/local/bin/front_boot
RUN mkdir /app_static

CMD /usr/local/bin/front_boot
