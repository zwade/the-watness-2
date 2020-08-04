FROM node:12

WORKDIR /solver
ADD package.json yarn.lock ./
RUN yarn install
ADD index.ts tsconfig.json ./

CMD ["bash", "-c", "yarn solve"]