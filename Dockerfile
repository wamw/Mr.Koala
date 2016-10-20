FROM mhart/alpine-node:6.7

WORKDIR /src
ADD . .
RUN npm install

EXPOSE 9000
CMD ["npm", "run", "watch"]