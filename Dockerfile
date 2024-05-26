FROM node:10.16.1-alpine

LABEL maintainer="cdchushig"

RUN apk update && apk add --no-cache git
RUN apk add --no-cache git openssh tor

RUN echo "SocksPort 0.0.0.0:9050" >> /etc/tor/torrc

WORKDIR /data
RUN git clone https://github.com/cdchushig/getsb3.git /data/app
WORKDIR /data/app

RUN npm install && npm install axios axios-socks5-agent && npm run build

EXPOSE 3030
# Tor ports exposer
EXPOSE 9050 


CMD ["tor","&","npm", "start"]